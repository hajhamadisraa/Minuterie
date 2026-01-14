#include "BellService.h"

bool BellService::state = false;
uint8_t BellService::bellPin = 0;

void BellService::init(uint8_t pin) {
    bellPin = pin;
    pinMode(bellPin, OUTPUT);
    stop();
}

void BellService::start() {
    digitalWrite(bellPin, HIGH);
    state = true;
}

void BellService::stop() {
    digitalWrite(bellPin, LOW);
    state = false;
}

bool BellService::getState() {
    return state;
}
