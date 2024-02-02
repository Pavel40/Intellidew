# Flow meter

This is the program for the water flow meter device. It is an Arduino project.
It communicates with Cloud Intellidew using Wi-Fi. After it detects the water flow started, it starts periodically sending messages with the current flow to the server.

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
+ `PIN_FLOW_METER` - the pin the flow meter's output is connected to
+ `NOTIFICATION_INTERVAL` - how often should a message about the current water flow be sent to the server in milliseconds
