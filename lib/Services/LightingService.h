#ifndef LIGHTING_SERVICE_H
#define LIGHTING_SERVICE_H

#include <Arduino.h>

class LightingService {
private:
    static int pin;
    static bool ledState;

public:
    static void init(int ledPin);
    static void turnOn();
    static void turnOff();
    static bool getState() { return ledState; }  
};


#endif
