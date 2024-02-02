#ifndef INTELLIDEW_H
#define INTELLIDEW_H

#include <Arduino.h>
#include <SocketIOclient.h>

#include <map>

// A class for communicating with the Intellidew server.
class Intellidew {
   public:
    Intellidew(const char* serverIP, int serverPort, const char* authorizationHeader, const char* idSensor) {
        this->serverIP = serverIP;
        this->serverPort = serverPort;
        this->authorizationHeader = authorizationHeader;
        this->idSensor = idSensor;
    };
    // Connects to the Intellidew server.
    void connect();
    // Checks if the Intellidew server is connected.
    bool isConnected();
    // Keeps the connection to the Intellidew server alive.
    void loop();
    // Send a message to the Intellidew server. Returns `true` if the message was sent successfully, `false` otherwise.
    bool sendMessage(const char* eventName, const char* what, int value);
    bool sendMessage(const char* eventName, const char* what, const char* value);
    // Send a status log to the Intellidew server. Returns `true` if the message was sent successfully, `false` otherwise.
    bool sendStatusLog();
    // Adds an event handler for a Socket.io event. The callback will be called with the message as a parameter.
    void on(String eventName, std::function<void(String)> handler);
    // Adds an error handler
    void onError(std::function<void(uint8_t*)> handler);
    // Adds a disconnect handler
    void onDisconnect(std::function<void(uint8_t*)> handler);
    // Adds a connect handler
    void onConnect(std::function<void(uint8_t*)> handler);
    // Returns number of messages with unconfirmed delivery
    int getUndeliveredMessagesCount();

   private:
    // The IP address of the Socket.io server for Intellidew.
    String serverIP;
    // The port of the Socket.io server for Intellidew.
    int serverPort;
    // The authorization header for the Socket.io server for Intellidew. 
    String authorizationHeader;
    // The Socket.io client.
    SocketIOclient socketIO;
    // Server path for Socket.io.
    String serverPath = "/socket.io/?EIO=4";
    // Sent with every message
    String idSensor;
    // Stores the event handlers for Socket.io events.
    std::map<String, std::function<void(String)>> eventHandlers;
    // Stores the error handler.
    std::function<void(uint8_t*)> errorHandler;
    // Stores the disconnect handler.
    std::function<void(uint8_t*)> disconnectHandler;
    // Stores the connect handler.
    std::function<void(uint8_t*)> connectHandler;
    /**
     * Stores sent messages that do not have confirmed deliver in JSON format.
     * Message id (String) is the key, message in json format (String) is the value.
     */
    std::map<String, String> sentMessages;
    // Used to periodically check the sentMessages for unconfirmed messages.
    unsigned long lastSentMessagesMillis;
    // Used to periodically send a message that the device is online.
    unsigned long lastStatusLogMillis;
    // Determines the type of Socket.io event and calls the appropriate handler.
    void handleSocketIOEvent(socketIOmessageType_t type, uint8_t* payload, size_t length);
    /**
     * Generates a random message ID.
     */
    String generateMessageID();
    // Used to handle the Socket.io `response` event.
    void handleResponseEvent(String response);
};

#endif
