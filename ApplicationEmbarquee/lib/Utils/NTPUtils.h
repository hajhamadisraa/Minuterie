#pragma once
#include "TimeHM.h"

class NTPUtils {
public:
    static void init(long gmtOffset_sec, int daylightOffset_sec);
    static TimeHM now();
};
