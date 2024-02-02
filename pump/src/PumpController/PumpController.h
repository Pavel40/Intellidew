#ifndef PUMP_CONTROLLER_H
#define PUMP_CONTROLLER_H

#include <Arduino.h>

class PumpController {
   public:
    PumpController(int pinPump, unsigned long maxWateringDuration, std::function<void()> onPumpStart, std::function<void()> onPumpStop) {
        this->pinPump = pinPump;
        this->maxWateringDuration = maxWateringDuration;
        this->onPumpStart = onPumpStart;
        this->onPumpStop = onPumpStop;
    };
    void startPump(int desiredPumpRunningTime);
    void stopPump();
    void loop();


   private:
    bool pumpIsRunning;
    int desiredPumpRunningTime;
    unsigned long maxWateringDuration;
    unsigned long lastMillisWateringDuration;
    int pinPump;
    std::function<void()> onPumpStart;
    std::function<void()> onPumpStop;

    void checkWateringDuration();
};

#endif  // PUMP_CONTROLLER_H
