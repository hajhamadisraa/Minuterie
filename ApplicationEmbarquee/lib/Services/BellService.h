#pragma once
#include <Arduino.h>

class BellService {
private:
    static bool state;
    static uint8_t bellPin;

public:
    static void init(uint8_t pin);

    static void start();   // sonnerie ON
    static void stop();    // sonnerie OFF
    static bool getState();
};
