#pragma once

#include <Arduino.h>
#include "../Utils/TimeHM.h"
#include "OperationMode.h"

struct ManualIrrigationSchedule {
    TimeHM start;
    TimeHM end;
};

class IrrigationService {
private:
    static bool state;
public:
    static void init(uint8_t pin);

    static void start();
    static void stop();
    static bool getState();
};
