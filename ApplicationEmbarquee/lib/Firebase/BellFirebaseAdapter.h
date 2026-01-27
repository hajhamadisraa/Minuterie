#ifndef BELL_FIREBASE_ADAPTER_H
#define BELL_FIREBASE_ADAPTER_H

#include <Arduino.h>
#include "BellScheduler.h"

class BellFirebaseAdapter {
public:
    // Retourne bool pour compatibilité avec l'ancien code
    static bool loadNormalSchedules(const String& jsonStr, BellNormalSchedule* schedules, int& count, int maxSchedules = 20);
static bool loadSpecialPeriods(const String& jsonStr, BellSpecialPeriod* periods, int& count, int maxPeriods = 10);

};

#endif