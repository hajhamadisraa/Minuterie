#ifndef SUN_CALCULATOR_H
#define SUN_CALCULATOR_H

#include <Arduino.h>
#include "TimeUtils.h"

class SunCalculator {
private:
    static float latitude;
    static float longitude;
    static TimeHM sunrise;
    static TimeHM sunset;

    static void calculateSunriseSunset(int year, int month, int day);

public:
    static void updateLocation();        // Récupère latitude/longitude via IP
    static TimeHM getSunrise();
    static TimeHM getSunset();
};

#endif
