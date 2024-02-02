#include <Arduino.h>
#include <ArduinoJson.h>
#include <Intellidew/Intellidew.h>
#include <PumpController/PumpController.h>
#include <WiFiConnectionHandler/WiFiConnectionHandler.h>

#define WIFI_SSID ""
#define WIFI_PASSWORD ""

#define SOCKET_IO_SERVER ""
#define SOCKET_IO_PORT 443
#define SOCKET_IO_AUTH "Authorization: [password]"
#define ID_SENSOR "pump_controller_1"

#define PIN_PUMP 12                    // D6
#define MAX_WATERING_DURATION 5400000  // 1.5 hours in millis

WiFiConnectionHandler wifiConnectionHandler(WIFI_SSID, WIFI_PASSWORD, true);
Intellidew intellidew(SOCKET_IO_SERVER, SOCKET_IO_PORT, SOCKET_IO_AUTH, ID_SENSOR);

void onPumpStartedCallback() {
    intellidew.sendMessage("watering_status", "watering_status", "Čerpadlo zapnuto.");
}

void onPumpStoppedCallback() {
    intellidew.sendMessage("watering_status", "watering_status", "Čerpadlo vypnuto.");
}

PumpController pumpController(PIN_PUMP, MAX_WATERING_DURATION, onPumpStartedCallback, onPumpStoppedCallback);

void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
    pinMode(PIN_PUMP, OUTPUT);
    digitalWrite(PIN_PUMP, LOW);

    Serial.begin(9600);
    Serial.println();
    Serial.println("Booted up!");

    intellidew.onConnect([](uint8_t* payload) {
        Serial.println("Connected to intellidew server.");
        intellidew.sendStatusLog();
    });
    intellidew.onDisconnect([](uint8_t* payload) {
        Serial.println("Disconnected from intellidew server.");
    });
    intellidew.on("command", [](String payload) {
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, payload);
        String action = doc["action"];
        Serial.print("Command: ");
        Serial.println(action);

        if (action == "turn_on") {
            int duration = doc["duration"];
            Serial.print("Duration: ");
            Serial.println(duration);

            pumpController.startPump(duration);
        } else if (action == "turn_off") {
            pumpController.stopPump();
        }
    });

    wifiConnectionHandler.connect();
    intellidew.connect();

    delay(100);

    Serial.println("Setup done!");
}

void loop() {
    intellidew.loop();
    pumpController.loop();
}
