#include "LightingService.h"

/* Définition des variables statiques */
int LightingService::pin = -1;
bool LightingService::ledState = false;

void LightingService::init(int ledPin) {
    pin = ledPin;
    pinMode(pin, OUTPUT);
    turnOff();
}

void LightingService::turnOn() {
    digitalWrite(pin, HIGH);
    ledState = true;
}

void LightingService::turnOff() {
    digitalWrite(pin, LOW);
    ledState = false;
}

bool LightingService::getState() {
    return ledState;
}
