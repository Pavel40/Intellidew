#include <Adafruit_Sensor.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Intellidew/Intellidew.h>
#include <WiFiConnectionHandler/WiFiConnectionHandler.h>

#define WIFI_SSID ""
#define WIFI_PASSWORD ""

#define SOCKET_IO_SERVER ""
#define SOCKET_IO_PORT 443
#define SOCKET_IO_AUTH "Authorization: [password]"
#define ID_SENSOR "thermometer_1"

#define PIN_THERMOMETER 12  // D6

#define MAX_MEASUREMENT_ATTEMPT 12  // how many times to attempt the measurement

WiFiConnectionHandler wifiConnectionHandler(WIFI_SSID, WIFI_PASSWORD, true);
Intellidew intellidew(SOCKET_IO_SERVER, SOCKET_IO_PORT, SOCKET_IO_AUTH, ID_SENSOR);
DHT dht(PIN_THERMOMETER, DHT22);

unsigned long lastMillis = 0;
bool dhtMeasurementSuccessful = false;
int attempt = 0;

void measureDHT() {
    float airTemperature = dht.readTemperature();
    float airHumidity = dht.readHumidity();

    if (isnan(airTemperature) || isnan(airHumidity)) {
        Serial.println("DHT measurement failed.");
        Serial.print("Temperature: ");
        Serial.println(airTemperature);
        Serial.print("Humidity: ");
        Serial.println(airHumidity);
        return;
    }

    Serial.print("Temperature: ");
    Serial.println(airTemperature);
    Serial.print("Humidity: ");
    Serial.println(airHumidity);

    if (!wifiConnectionHandler.isConnected()) return;
    if (!intellidew.isConnected()) return;

    intellidew.sendMessage("temperature", "temperature", airTemperature);
    intellidew.sendMessage("air_humidity", "air_humidity", airHumidity);
    dhtMeasurementSuccessful = true;
}

void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
    pinMode(PIN_THERMOMETER, INPUT);

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

    dht.begin();
    delay(3000);
    Serial.println("Setup done!");
}

void loop() {
    intellidew.loop();

    if (dhtMeasurementSuccessful) {
        Serial.println("Measurement successful.");
        if (intellidew.getUndeliveredMessagesCount() > 0) return;
        Serial.println("There are no undelivered messages. Going to sleep.");
        ESP.deepSleep(15 * 60 * 1000000);  // 15 minutes
    }

    if (millis() - lastMillis > 3000) {
        if (attempt >= 12) {
            ESP.deepSleep(15 * 60 * 1000000);  // 15 minutes
        }
        lastMillis = millis();
        measureDHT();

        attempt++;
    }
}