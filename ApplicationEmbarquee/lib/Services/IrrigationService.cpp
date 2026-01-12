#include "IrrigationService.h"

bool IrrigationService::state = false;
static uint8_t irrigationPin;

void IrrigationService::init(uint8_t pin) {
    irrigationPin = pin;
    pinMode(irrigationPin, OUTPUT);
    stop();
}

void IrrigationService::start() {
    digitalWrite(irrigationPin, HIGH);
    state = true;
}

void IrrigationService::stop() {
    digitalWrite(irrigationPin, LOW);
    state = false;
}

bool IrrigationService::getState() {
    return state;
}
