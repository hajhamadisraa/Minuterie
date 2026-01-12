#pragma once
#include <OperationMode.h>
#include "TimeHM.h"

struct SunTimes {
    TimeHM sunrise;
    TimeHM sunset;
};

struct ManualSchedule {
    TimeHM start;
    TimeHM end;
};

class LightingScheduler {
public:
    static bool shouldBeActive(
        OperationMode mode,
        const TimeHM& now,
        const SunTimes& sun,
        const ManualSchedule* manual = nullptr
    );
};
