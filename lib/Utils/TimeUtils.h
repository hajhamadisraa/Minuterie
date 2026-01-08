#ifndef TIME_UTILS_H
#define TIME_UTILS_H

#include <Arduino.h>
#include "TimeHM.h"


class TimeUtils {
public:
    // Initialisation avec option de temps simulé
    static void init(int startHour = 0, int startMinute = 0);

    static TimeHM now();
    static bool isAfter(const TimeHM& a, const TimeHM& b);
    static bool isBefore(const TimeHM& a, const TimeHM& b);
    static bool isInRange(const TimeHM& start, const TimeHM& end);

    static String toString(const TimeHM& t);

private:
    static unsigned long startMillis;
};

#endif
