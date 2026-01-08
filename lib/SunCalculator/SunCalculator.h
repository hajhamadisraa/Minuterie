#ifndef SUN_CALCULATOR_H
#define SUN_CALCULATOR_H

#include "TimeUtils.h"

class SunCalculator {
public:
    static void init(double lat, double lon);
    static TimeHM getSunrise();
    static TimeHM getSunset();

private:
    static double latitude;
    static double longitude;

    static TimeHM compute(bool sunrise);
};

#endif
