#include "NTPUtils.h"
#include <WiFi.h>
#include <time.h>

static long gmtOffset = 0;
static int daylightOffset = 0;

void NTPUtils::init(long gmtOffset_sec, int daylightOffset_sec) {
    gmtOffset = gmtOffset_sec;
    daylightOffset = daylightOffset_sec;
    configTime(gmtOffset, daylightOffset, "pool.ntp.org", "time.nist.gov");
}

TimeHM NTPUtils::now() {
    struct tm timeinfo;
    if(!getLocalTime(&timeinfo)) {
        return {0,0}; // si erreur
    }
    return {timeinfo.tm_hour, timeinfo.tm_min};
}
