#include <WiFiConnectionHandler/WiFiConnectionHandler.h>

void WiFiConnectionHandler::establishConnection() {
    digitalWrite(LED_BUILTIN, LOW);
    Serial.println("Connecting to WiFi.");
    WiFi.begin(this->ssid, this->password);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        attempts++;
        if (attempts == 120) {
            Serial.println("Cannot connect to WiFi for 60 seconds, starting over.");
            WiFi.disconnect();
            WiFi.begin(this->ssid, this->password);
            if (!this->useDeepSleep) {
                attempts = 0;
            }
        } else if (attempts > 240 && this->useDeepSleep) {
            Serial.println("Cannot connect to WiFi for 120 seconds, going to deep sleep for 10 minutes.");
            ESP.deepSleep(10 * 60 * 1000000);
        }
    }
    Serial.println();
    Serial.println("Connected to WiFi.");
    digitalWrite(LED_BUILTIN, HIGH);
}

void WiFiConnectionHandler::connect() {
    WiFi.mode(WIFI_STA);
    this->establishConnection();
    WiFi.setAutoReconnect(true);
    WiFi.persistent(true);
}

bool WiFiConnectionHandler::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

void WiFiConnectionHandler::printConnectionStatus() {
    unsigned long currentMillis = millis();
    if (currentMillis - this->lastPrint > 30000) {
        this->lastPrint = currentMillis;
        Serial.print("WiFi status: ");
        switch (WiFi.status()) {
            case WL_CONNECTED:
                Serial.println("Connected");
                break;
            case WL_NO_SSID_AVAIL:
                Serial.println("No SSID available");
                break;
            case WL_CONNECT_FAILED:
                Serial.println("Connection failed");
                break;
            case WL_IDLE_STATUS:
                Serial.println("Idle status");
                break;
            case WL_DISCONNECTED:
                Serial.println("Disconnected");
                break;
            default:
                Serial.println("Unknown status");
                break;
        }
    }
}
