#include <Arduino.h>
#include <ArduinoJson.h>
#include <Intellidew/Intellidew.h>
#include <WiFiConnectionHandler/WiFiConnectionHandler.h>

#define WIFI_SSID ""
#define WIFI_PASSWORD ""

#define SOCKET_IO_SERVER ""
#define SOCKET_IO_PORT 443
#define SOCKET_IO_AUTH "Authorization: [password]"
#define ID_SENSOR "soil_moisture_sensor_1"

#define PIN_SOIL_MOISTURE_SENSOR A0
#define MAX_MEASUREMENT_ATTEMPT 12  // how many times to attempt the measurement

WiFiConnectionHandler wifiConnectionHandler(WIFI_SSID, WIFI_PASSWORD, true);
Intellidew intellidew(SOCKET_IO_SERVER, SOCKET_IO_PORT, SOCKET_IO_AUTH, ID_SENSOR);

unsigned long lastMillis = 0;
bool soilMoistureMeasurementSuccessful = false;
int attempt = 0;

void measureSoilMoisture() {
    int soilMoisture = -1;
    soilMoisture = analogRead(PIN_SOIL_MOISTURE_SENSOR);
    if (soilMoisture < 0) {
        Serial.print("Soil moisture measurement failed. Value: ");
        Serial.println(soilMoisture);
        return;
    };

    Serial.print("Soil moisture: ");
    Serial.println(soilMoisture);

    if (!wifiConnectionHandler.isConnected()) return;
    if (!intellidew.isConnected()) return;

    intellidew.sendMessage("soil_moisture", "soil_moisture", soilMoisture);
    soilMoistureMeasurementSuccessful = true;
};

void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
    pinMode(PIN_SOIL_MOISTURE_SENSOR, INPUT);

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

    delay(100);
    Serial.println("Setup done!");
}

void loop() {
    intellidew.loop();

    if (soilMoistureMeasurementSuccessful) {
        Serial.println("Measurement successful.");
        if (intellidew.getUndeliveredMessagesCount() > 0) return;
        Serial.println("There are no undelivered messages. Going to sleep.");
        ESP.deepSleep(15 * 60 * 1000000);  // 15 minutes
    }

    if (millis() - lastMillis > 3000) {
        if (attempt >= 12)
            ESP.deepSleep(15 * 60 * 1000000);  // 15 minutes
        lastMillis = millis();
        measureSoilMoisture();

        attempt++;
    }
}
