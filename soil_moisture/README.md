# Soil moisture sensor

This is the program for the soil moisture sensor device. It is an Arduino project.
It communicates with Cloud Intellidew using Wi-Fi. It periodically measures the soil moisture and sends the raw measured value to the server. The device then goes to deep sleep.

## Project structure

The required libraries are defined in the platformio.ini file.

All of the source code is in the /src directory. Contents of the directory:

+ Intellidew/ - the `Intellidew` class used for communication with the server
+ WiFiConnectionHandler/ - the `WiFiConnectionHandler` class used to establish Wi-Fi connection
+ main.cpp - the main file

## Required #define directives

The following are the required #define directives at the top of the main.cpp file. These directives are used for configuration.

+ `WIFI_SSID` - the name of the Wi-Fi the device should connect to
+ `WIFI_PASSWORD` - the password of the Wi-Fi the device should connect to
+ `SOCKET_IO_SERVER` - the address of the Cloud Intellidew's Socket.IO server
+ `SOCKET_IO_PORT` - the port of the Cloud Intellidew's Socket.IO server
+ `SOCKET_IO_AUTH` - the authorization header sent to the Cloud Intellidew's Socket.IO server on connection
+ `ID_SENSOR` - ID of the device that is sent in the messages sent to the server
+ `PIN_SOIL_MOISTURE_SENSOR` - what pin is the analog output of the sensor connected to
+ `MAX_MEASUREMENT_ATTEMPT` - how many times to attempt the measurement before giving up and going to deep sleep
