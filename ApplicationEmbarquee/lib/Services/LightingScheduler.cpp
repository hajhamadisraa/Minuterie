#include "LightingScheduler.h"

bool LightingScheduler::shouldBeActive(
    OperationMode mode,
    const TimeHM& now,
    const SunTimes& sun,
    const ManualSchedule* manual
) {
    switch (mode) {

        case OperationMode::AFTER_SUNSET:
            return now >= sun.sunset;

        case OperationMode::BEFORE_SUNSET:
            return now <= sun.sunset;

        case OperationMode::AFTER_SUNRISE:
            return now >= sun.sunrise;

        case OperationMode::BEFORE_SUNRISE:
            return now <= sun.sunrise;

        case OperationMode::MANUAL:
            if (manual == nullptr) return false;
            return now >= manual->start && now <= manual->end;

        default:
            return false;
    }
}
