#ifndef NTPUTILS_H
#define NTPUTILS_H

#include <Arduino.h>
#include "TimeUtils.h"

class NTPUtils {
public:
    static void init(long gmtOffset_sec, int daylightOffset_sec);
    static TimeHM now();
};

#endif
