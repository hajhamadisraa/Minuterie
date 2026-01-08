#include "LightingService.h"
int LightingService::pin = 2;
bool LightingService::ledState = false;

void LightingService::init(int ledPin){
    pin = ledPin;
    pinMode(pin, OUTPUT);
    ledState = false;
    digitalWrite(pin, LOW);
}

void LightingService::turnOn(){
    ledState = true;
    digitalWrite(pin, HIGH);
}

void LightingService::turnOff(){
    ledState = false;
    digitalWrite(pin, LOW);
}
