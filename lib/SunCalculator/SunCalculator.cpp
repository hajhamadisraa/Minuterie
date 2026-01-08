#include "SunCalculator.h"
#include <math.h>
#include <time.h>

double SunCalculator::latitude  = 0.0;
double SunCalculator::longitude = 0.0;

void SunCalculator::init(double lat, double lon) {
    latitude = lat;
    longitude = lon;
}

TimeHM SunCalculator::getSunrise() {
    return compute(true);
}

TimeHM SunCalculator::getSunset() {
    return compute(false);
}

static double degToRad(double d) { return d * M_PI / 180.0; }
static double radToDeg(double r) { return r * 180.0 / M_PI; }

TimeHM SunCalculator::compute(bool sunrise) {
    struct tm timeinfo;
    getLocalTime(&timeinfo);

    int N = timeinfo.tm_yday + 1;
    double lngHour = longitude / 15.0;

    double t = sunrise
        ? N + ((6  - lngHour) / 24)
        : N + ((18 - lngHour) / 24);

    double M = (0.9856 * t) - 3.289;

    double L = M + (1.916 * sin(degToRad(M)))
                  + (0.020 * sin(2 * degToRad(M)))
                  + 282.634;
    if (L > 360) L -= 360;

    double RA = radToDeg(atan(0.91764 * tan(degToRad(L))));
    RA = fmod(RA + 360, 360);

    double Lquadrant  = floor(L / 90) * 90;
    double RAquadrant = floor(RA / 90) * 90;
    RA = (RA + (Lquadrant - RAquadrant)) / 15;

    double sinDec = 0.39782 * sin(degToRad(L));
    double cosDec = cos(asin(sinDec));

    double cosH = (cos(degToRad(90.833)) -
                  (sinDec * sin(degToRad(latitude))))
                  / (cosDec * cos(degToRad(latitude)));

    if (cosH > 1 || cosH < -1) return {0, 0};

    double H = sunrise
        ? 360 - radToDeg(acos(cosH))
        : radToDeg(acos(cosH));
    H /= 15;

    double T = H + RA - (0.06571 * t) - 6.622;
    double UT = fmod(T - lngHour + 24, 24);

    int hour = (int)UT;
    int minute = (int)((UT - hour) * 60);

    return {hour, minute};
}
