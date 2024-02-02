#include "Intellidew.h"

#include <Arduino.h>
#include <ArduinoJson.h>
#include <Hash.h>
#include <SocketIOclient.h>
#include <WebSocketsClient.h>

void Intellidew::connect() {
    this->socketIO.beginSSL(serverIP, serverPort, serverPath);
    this->socketIO.setExtraHeaders(authorizationHeader.c_str());
    this->socketIO.onEvent(std::bind(&Intellidew::handleSocketIOEvent, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3));  // bind the callback function to the event handler
}

bool Intellidew::isConnected() {
    return this->socketIO.isConnected();
}

int Intellidew::getUndeliveredMessagesCount() {
    return sentMessages.size();
}

void Intellidew::loop() {
    this->socketIO.loop();
    if ((millis() - lastSentMessagesMillis) > 5000) {
        int sentMessagesSize = sentMessages.size();
        if (sentMessagesSize > 0) {
            for (auto message : sentMessages) {
                Serial.print("Did not receive OK response to message with ID ");
                Serial.println(message.first);
                Serial.println(".");
                this->socketIO.sendEVENT(message.second);
                Serial.println("Sent again.");
            }
        } else {
            Serial.println("Did not find any unreceived messages. Yay!");
        }
        lastSentMessagesMillis = millis();
    }
    if ((millis() - lastStatusLogMillis) > 60000) {
        this->sendStatusLog();
        lastStatusLogMillis = millis();
    }
}

// Add an event handler for a Socket.io event. The callback will be called with the message as a parameter.
void Intellidew::on(String eventName, std::function<void(String)> handler) {
    this->eventHandlers[eventName] = handler;
}

String Intellidew::generateMessageID() {
    return sha1(String(millis()));
}

void Intellidew::handleSocketIOEvent(socketIOmessageType_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case sIOtype_DISCONNECT:
            Serial.printf("[IOc] Disconnected!\n");
            if (this->disconnectHandler != NULL)
                this->disconnectHandler(payload);
            break;
        case sIOtype_CONNECT:
            Serial.printf("[IOc] Connected to url: %s\n", payload);
            // join default namespace (no auto join in Socket.IO V3)
            socketIO.send(sIOtype_CONNECT, "/");
            if (this->connectHandler != NULL)
                this->connectHandler(payload);
            break;
        case sIOtype_EVENT: {
            Serial.printf("[IOc] get event: %s\n", payload);

            DynamicJsonDocument doc(1024);
            deserializeJson(doc, payload);
            JsonArray array = doc.as<JsonArray>();
            String eventName = array[0];
            String message = array[1];

            Serial.print("Event name: ");
            Serial.println(eventName);
            Serial.print("Message: ");
            Serial.println(message);

            // check if the event has a handler
            if (this->eventHandlers.find(eventName) != this->eventHandlers.end()) {
                // call the event handler with the message
                this->eventHandlers[eventName](message);
            } else if (eventName == "response") {
                // } else if (strcmp(eventName, "response")) {
                this->handleResponseEvent(message);
            }
            break;
        }
        case sIOtype_BINARY_EVENT:
            Serial.printf("[IOc] get binary: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_ACK:
            Serial.printf("[IOc] get ack: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_ERROR:
            Serial.printf("[IOc] get error: %u\n", length);
            hexdump(payload, length);
            if (this->errorHandler != NULL)
                this->errorHandler(payload);
            break;
    }
}

bool Intellidew::sendMessage(const char* eventName, const char* what, int value) {
    // creat JSON message for Socket.IO (event)
    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();

    // add event name
    // Hint: socket.on('event_name', ....
    array.add(eventName);

    // add payload (parameters) for the event
    JsonObject param1 = array.createNestedObject();
    param1[what] = value;
    param1["id_sensor"] = this->idSensor;

    String idMessage = this->generateMessageID();
    param1["id_message"] = idMessage;

    // JSON to String (serializion)
    String output;
    serializeJson(doc, output);

    Serial.println(output);
    bool status = this->socketIO.sendEVENT(output);
    Serial.println("Sent");

    this->sentMessages[idMessage] = output;
    this->lastSentMessagesMillis = millis();

    return status;
}

bool Intellidew::sendMessage(const char* eventName, const char* what, const char* value) {
    // creat JSON message for Socket.IO (event)
    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();

    // add event name
    // Hint: socket.on('event_name', ....
    array.add(eventName);

    // add payload (parameters) for the event
    JsonObject param1 = array.createNestedObject();
    param1[what] = value;
    param1["id_sensor"] = this->idSensor;

    String idMessage = this->generateMessageID();
    param1["id_message"] = idMessage;

    // JSON to String (serializion)
    String output;
    serializeJson(doc, output);

    Serial.println(output);
    bool status = this->socketIO.sendEVENT(output);
    Serial.println("Sent");

    this->sentMessages[idMessage] = output;
    this->lastSentMessagesMillis = millis();

    return status;
}

bool Intellidew::sendStatusLog() {
    // creat JSON message for Socket.IO (event)
    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();

    // add event name
    // Hint: socket.on('event_name', ....
    array.add("status_log");

    // add payload (parameters) for the event
    JsonObject param1 = array.createNestedObject();
    param1["id_sensor"] = this->idSensor;

    String idMessage = this->generateMessageID();
    param1["id_message"] = idMessage;

    // JSON to String (serializion)
    String output;
    serializeJson(doc, output);

    Serial.println(output);
    bool status = this->socketIO.sendEVENT(output);
    Serial.println("Sent");

    this->sentMessages[idMessage] = output;
    this->lastSentMessagesMillis = millis();

    return status;
}

void Intellidew::handleResponseEvent(String response) {
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    String idMessage = doc["id_message"];
    String responseContent = doc["response"];
    if (responseContent == "OK") {
        if (this->sentMessages.find(idMessage) != this->sentMessages.end()) {
            Serial.print("Received an OK response for message with ID ");
            Serial.print(idMessage);
            Serial.println(".");
            this->sentMessages.erase(idMessage);
        }
    } else {
        Serial.print("Message with ID ");
        Serial.print(idMessage);
        Serial.println(" got an ERROR response!");
    }
}

void Intellidew::onError(std::function<void(uint8_t*)> handler) {
    this->errorHandler = handler;
}

void Intellidew::onConnect(std::function<void(uint8_t*)> handler) {
    this->connectHandler = handler;
}

void Intellidew::onDisconnect(std::function<void(uint8_t*)> handler) {
    this->disconnectHandler = handler;
}