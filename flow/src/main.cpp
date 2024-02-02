#include <Arduino.h>
#include <ArduinoJson.h>
#include <Intellidew/Intellidew.h>
#include <WiFiConnectionHandler/WiFiConnectionHandler.h>

#define WIFI_SSID ""
#define WIFI_PASSWORD ""

#define SOCKET_IO_SERVER ""
#define SOCKET_IO_PORT 443 
#define SOCKET_IO_AUTH "Authorization: [password]"
#define ID_SENSOR "flow_meter_1"

#define PIN_FLOW_METER 13                // D7
#define NOTIFICATION_INTERVAL 60 * 1000  // 60 seconds

WiFiConnectionHandler wifiConnectionHandler(WIFI_SSID, WIFI_PASSWORD, false);
Intellidew intellidew(SOCKET_IO_SERVER, SOCKET_IO_PORT, SOCKET_IO_AUTH, ID_SENSOR);

// https://navody.dratek.cz/navody-k-produktum/arduino-prutokomer-1-30-l-min.html
const float pulsesPerSecondForOneLiterPerMinute = 6.7; 
volatile byte pulsesCount = 0;
float currentFlow = 0.0;
unsigned long flowSumML = 0;
unsigned long lastMillisFlowCheck = 0;
unsigned long lastMillisNotification = 0;
short wateringStatusChangingSeconds = 0;
bool wateringIsRunning = false;

// https://arduino-esp8266.readthedocs.io/en/latest/reference.html#digital-io
IRAM_ATTR void addPuls() {
    pulsesCount++;
}

void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
    pinMode(PIN_FLOW_METER, INPUT);

    Serial.begin(9600);
    Serial.println();
    Serial.println("Booted up!");

    intellidew.onConnect([](uint8_t* payload) {
        Serial.println("Connected to Intellidew server.");
        intellidew.sendStatusLog();
    });
    intellidew.onDisconnect([](uint8_t* payload) {
        Serial.println("Disconnected from Intellidew server.");
    });

    wifiConnectionHandler.connect();
    intellidew.connect();

    attachInterrupt(digitalPinToInterrupt(PIN_FLOW_METER), addPuls, FALLING);

    delay(100);

    Serial.println("Setup done!");
}

void loop() {
    intellidew.loop();
    if ((millis() - lastMillisFlowCheck) > 1000) {
        // check the pulses count every second

        detachInterrupt(digitalPinToInterrupt(PIN_FLOW_METER));

        Serial.print("Pulses count: ");
        Serial.println(pulsesCount);

        currentFlow = ((1000.0 / (millis() - lastMillisFlowCheck)) * pulsesCount) / pulsesPerSecondForOneLiterPerMinute;
        unsigned int currentFlowML = (currentFlow / 60) * 1000;
        unsigned long newSumML = flowSumML + currentFlowML;

        if (newSumML > flowSumML && !wateringIsRunning) {
            // check whether the water has been flowing for at least 5 seconds, if yes, send notification
            wateringStatusChangingSeconds++;
            if (wateringStatusChangingSeconds > 5) {
                wateringIsRunning = true;
                Serial.println("Watering started.");
                wateringStatusChangingSeconds = 0;

                // WATERING STARTED
                intellidew.sendMessage("flow", "flow", currentFlow);
            }
        }
        if (newSumML == flowSumML && wateringIsRunning) {
            // check whether the water has not been flowing for at least 15 seconds, if yes, send notifications
            wateringStatusChangingSeconds++;
            if (wateringStatusChangingSeconds > 15) {
                wateringIsRunning = false;
                Serial.println("Watering ended.");
                wateringStatusChangingSeconds = 0;

                // WATERING ENDED
                intellidew.sendMessage("flow", "flow", currentFlow);
                intellidew.sendMessage("flow_sum", "flow_sum", flowSumML);
                newSumML = 0;
            }
        }
        flowSumML = newSumML;

        Serial.print("Flow: ");
        Serial.print(currentFlow);
        Serial.print(" l/min");
        Serial.print("  Current flow: ");
        Serial.print(currentFlowML);
        Serial.print(" ml/sec");
        Serial.print("  Flow sum: ");
        Serial.print(flowSumML);
        Serial.println(" ml");

        pulsesCount = 0;
        lastMillisFlowCheck = millis();
        attachInterrupt(digitalPinToInterrupt(PIN_FLOW_METER), addPuls, FALLING);
    }

    if (!wifiConnectionHandler.isConnected()) return;

    // if connected to wifi and watering is running, send a notification about the current flow every NOTIFICATION_INTERVAL seconds
    if ((millis() - lastMillisNotification) > NOTIFICATION_INTERVAL && wateringIsRunning) {
        intellidew.sendMessage("flow", "flow", currentFlow);
        lastMillisNotification = millis();
    }
}
