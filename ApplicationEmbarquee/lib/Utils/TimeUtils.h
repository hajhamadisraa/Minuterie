#pragma once
#include "TimeHM.h" // inclure la version complète de TimeHM
#include <Arduino.h>

class TimeUtils {
public:
    static void init(int startHour,
                     int startMinute,
                     int startDay = 1,
                     int startMonth = 1,
                     int startDayOfWeek = 0);

    static TimeHM now();
    static String toString(const TimeHM& time);

private:
    static unsigned long startMillis;
    static TimeHM startTime;
};
