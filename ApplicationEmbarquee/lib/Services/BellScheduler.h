#pragma once
#include "TimeHM.h"
#include "BellTypes.h"

class BellScheduler {
public:
    static bool shouldRing(
        const TimeHM& now,
        const BellNormalSchedule normal[], int normalCount,
        const BellSpecialPeriod special[], int specialCount
    );

public:
    static bool isInSpecialPeriod(const TimeHM& now, const BellSpecialPeriod& sp);
    static bool isBetween(const TimeHM& now, const TimeHM& start, const TimeHM& end);
};
