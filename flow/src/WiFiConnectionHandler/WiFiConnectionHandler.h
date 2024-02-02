#ifndef WIFI_CONNECTION_HANDLER_H
#define WIFI_CONNECTION_HANDLER_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

class WiFiConnectionHandler {
   private:
    // The SSID of the WiFi network.
    String ssid;
    // The password of the WiFi network.
    String password;
    // The last time the connection status was printed.
    unsigned long lastPrint = 0;
    // Whether device shoud be put to deep sleep after not being able to connect for 2 minutes.
    bool useDeepSleep;

    void establishConnection();

   public:
    WiFiConnectionHandler(String ssid, String password, bool useDeepSleep) {
        this->ssid = ssid;
        this->password = password;
        this->useDeepSleep = useDeepSleep;
    };

    // Connect to the WiFi network.
    void connect();
    // Check if the WiFi network is connected.
    bool isConnected();
    // Print the connection status every 30 seconds.
    void printConnectionStatus();
};

#endif