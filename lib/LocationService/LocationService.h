#ifndef LOCATION_SERVICE_H
#define LOCATION_SERVICE_H

#include <Arduino.h>

class LocationService {
public:
    static bool update();
    static double getLatitude();
    static double getLongitude();

private:
    static double latitude;
    static double longitude;
};

#endif
