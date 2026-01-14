#include "NTPUtils.h"
#include <WiFi.h>
#include <time.h>

// Décalages pour le fuseau horaire
static long gmtOffset = 0;
static int daylightOffset = 0;

void NTPUtils::init(long gmtOffset_sec, int daylightOffset_sec) {
    gmtOffset = gmtOffset_sec;
    daylightOffset = daylightOffset_sec;
    configTime(gmtOffset, daylightOffset, "pool.ntp.org", "time.nist.gov");
}

TimeHM NTPUtils::now() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        // fallback si la récupération échoue
        return TimeHM(0, 0, 1, 1, 0, 2026);  // ✅ Ajout de l'année par défaut
    }

    // Retourner l'heure actuelle avec l'année
    return TimeHM(
        timeinfo.tm_hour,
        timeinfo.tm_min,
        timeinfo.tm_mday,
        timeinfo.tm_mon + 1,      // tm_mon = 0..11
        timeinfo.tm_wday,         // tm_wday = 0..6
        timeinfo.tm_year + 1900   // ✅ tm_year = années depuis 1900
    );
}