#pragma once
#include "TimeHM.h"
#include <OperationMode.h>
#include "LightingScheduler.h"
#include "IrrigationService.h"

class IrrigationScheduler {
public:
    // Détermine si l'irrigation doit être active
    // irrigationOffsetMinutes : combien de minutes avant ou après l'événement (paramétrable)
    static bool shouldBeActive(
        OperationMode mode,
        const TimeHM& now,
        const SunTimes& sun,
        int irrigationOffsetMinutes,          // paramétrable pour chaque mode
        const ManualIrrigationSchedule* manual = nullptr
    );
};
