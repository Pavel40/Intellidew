#include "PumpController.h"

void PumpController::startPump(int desiredPumpRunningTime) {
    Serial.println("Starting the pump.");
    Serial.print("desiredPumpRunningTime: ");
    Serial.println(desiredPumpRunningTime);
    Serial.print("Max watering duration: ");
    Serial.println(this->maxWateringDuration);

    this->desiredPumpRunningTime = desiredPumpRunningTime;
    digitalWrite(this->pinPump, HIGH);
    this->lastMillisWateringDuration = millis();
    this->pumpIsRunning = true;
    this->onPumpStart();
}

void PumpController::stopPump() {
    Serial.println("Stopping the pump.");

    digitalWrite(this->pinPump, LOW);
    this->pumpIsRunning = false;
    this->onPumpStop();
}

void PumpController::checkWateringDuration() {
    unsigned long currentMillis = millis();
    if (this->pumpIsRunning) {
        unsigned long desiredPumpRunningTimeMillis = this->desiredPumpRunningTime * 60 * 1000;
        if ((currentMillis - this->lastMillisWateringDuration) > desiredPumpRunningTimeMillis) {
            Serial.println("The pump has been running for the desired time.");
            Serial.print("Desired time in millis: ");
            Serial.println(desiredPumpRunningTimeMillis);
            this->stopPump();
        } else if ((currentMillis - this->lastMillisWateringDuration) > this->maxWateringDuration) {
            Serial.println("The pump has been running for the max watering duration.");
            Serial.print("Max watering duration: ");
            Serial.println(maxWateringDuration);
            this->stopPump();
        }
    }
}

void PumpController::loop() {
    checkWateringDuration();
}