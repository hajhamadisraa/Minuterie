#include "IrrigationScheduler.h"

// Convertit une TimeHM en minutes depuis minuit
static int timeToMinutes(const TimeHM& t) {
    return t.hour * 60 + t.minute;
}

// Vérifie si now est dans l'intervalle [start, end)
static bool isBetween(const TimeHM& now, const TimeHM& start, const TimeHM& end) {
    int n = timeToMinutes(now);
    int s = timeToMinutes(start);
    int e = timeToMinutes(end);
    return (n >= s) && (n < e);
}

// Scheduler générique pour irrigation
bool IrrigationScheduler::shouldBeActive(
    OperationMode mode,
    const TimeHM& now,
    const SunTimes& sun,
    int irrigationOffsetMinutes,
    const ManualIrrigationSchedule* manual
) {
    TimeHM start, end;

    switch (mode) {
        case OperationMode::BEFORE_SUNSET:
            end = sun.sunset;
            start = TimeHM(sun.sunset.hour, sun.sunset.minute - irrigationOffsetMinutes);
            if (start.minute < 0) {
                start.hour -= 1;
                start.minute += 60;
            }
            break;

        case OperationMode::AFTER_SUNSET:
            start = sun.sunset;
            end = TimeHM(sun.sunset.hour, sun.sunset.minute + irrigationOffsetMinutes);
            if (end.minute >= 60) {
                end.hour += 1;
                end.minute -= 60;
            }
            break;

        case OperationMode::BEFORE_SUNRISE:
            end = sun.sunrise;
            start = TimeHM(sun.sunrise.hour, sun.sunrise.minute - irrigationOffsetMinutes);
            if (start.minute < 0) {
                start.hour -= 1;
                start.minute += 60;
            }
            break;

        case OperationMode::AFTER_SUNRISE:
            start = sun.sunrise;
            end = TimeHM(sun.sunrise.hour, sun.sunrise.minute + irrigationOffsetMinutes);
            if (end.minute >= 60) {
                end.hour += 1;
                end.minute -= 60;
            }
            break;

        case OperationMode::MANUAL:
            if (manual) {
                start = manual->start;
                end   = manual->end;
            } else {
                return false; // Pas de plage définie
            }
            break;
    }

    return isBetween(now, start, end);
}
