#include "SunCalculator.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

float SunCalculator::latitude  = 0.0;
float SunCalculator::longitude = 0.0;
TimeHM SunCalculator::sunrise = {6, 0};
TimeHM SunCalculator::sunset  = {18, 0};

// Utilise une API gratuite pour récupérer latitude/longitude via IP
void SunCalculator::updateLocation() {
    if(WiFi.status() != WL_CONNECTED) return;

    HTTPClient http;
    http.begin("http://ip-api.com/json"); // API gratuite
    int httpCode = http.GET();

    if(httpCode == 200) {
        String payload = http.getString();

        const size_t capacity = JSON_OBJECT_SIZE(15) + 350;
        DynamicJsonDocument doc(capacity);
        deserializeJson(doc, payload);

        latitude  = doc["lat"];
        longitude = doc["lon"];

        Serial.print("Latitude : "); Serial.println(latitude, 6);
        Serial.print("Longitude: "); Serial.println(longitude, 6);
    } else {
        Serial.println("Erreur récupération géolocalisation !");
    }
    http.end();
}

// Formule simplifiée du lever/coucher du soleil
void SunCalculator::calculateSunriseSunset(int year, int month, int day) {
    if(latitude == 0 && longitude == 0) {
        sunrise = {6, 0};
        sunset  = {18, 0};
        return;
    }

    // Formule approximative de l'heure solaire
    float zenith = 90.833; // pour sunrise/sunset
    float D = 367 * year - (7 * (year + ((month + 9)/12))) / 4 + (275 * month) / 9 + day - 730530;
    float lngHour = longitude / 15.0;

    // Calcul sunrise
    float t_rise = D + ((6 - lngHour) / 24.0);
    float M_rise = (0.9856 * t_rise) - 3.289;
    float L_rise = M_rise + (1.916 * sin(M_rise * DEG_TO_RAD)) + (0.020 * sin(2 * M_rise * DEG_TO_RAD)) + 282.634;
    L_rise = fmod(L_rise, 360.0);
    float RA_rise = atan(0.91764 * tan(L_rise * DEG_TO_RAD)) * RAD_TO_DEG;
    RA_rise = fmod(RA_rise, 360.0);
    float cosH = (cos(zenith * DEG_TO_RAD) - sin(latitude * DEG_TO_RAD) * sin(L_rise * DEG_TO_RAD)) / (cos(latitude * DEG_TO_RAD) * cos(L_rise * DEG_TO_RAD));
    float H_rise = 360 - acos(cosH) * RAD_TO_DEG;
    float T_rise = H_rise / 15.0 + RA_rise - (0.06571 * t_rise) - 6.622;
    int hr_rise = int(T_rise);
    int min_rise = int((T_rise - hr_rise) * 60);
    sunrise.hour   = hr_rise % 24;
    sunrise.minute = min_rise;

    // Calcul sunset
    float t_set = D + ((18 - lngHour) / 24.0);
    float M_set = (0.9856 * t_set) - 3.289;
    float L_set = M_set + (1.916 * sin(M_set * DEG_TO_RAD)) + (0.020 * sin(2 * M_set * DEG_TO_RAD)) + 282.634;
    L_set = fmod(L_set, 360.0);
    float RA_set = atan(0.91764 * tan(L_set * DEG_TO_RAD)) * RAD_TO_DEG;
    RA_set = fmod(RA_set, 360.0);
    float cosH_set = (cos(zenith * DEG_TO_RAD) - sin(latitude * DEG_TO_RAD) * sin(L_set * DEG_TO_RAD)) / (cos(latitude * DEG_TO_RAD) * cos(L_set * DEG_TO_RAD));
    float H_set = acos(cosH_set) * RAD_TO_DEG;
    float T_set = H_set / 15.0 + RA_set - (0.06571 * t_set) - 6.622;
    int hr_set = int(T_set);
    int min_set = int((T_set - hr_set) * 60);
    sunset.hour   = hr_set % 24;
    sunset.minute = min_set;
}

TimeHM SunCalculator::getSunrise() {
    // Récupère date actuelle
    time_t nowTime = time(nullptr);
    struct tm* t = localtime(&nowTime);
    calculateSunriseSunset(t->tm_year + 1900, t->tm_mon + 1, t->tm_mday);
    return sunrise;
}

TimeHM SunCalculator::getSunset() {
    time_t nowTime = time(nullptr);
    struct tm* t = localtime(&nowTime);
    calculateSunriseSunset(t->tm_year + 1900, t->tm_mon + 1, t->tm_mday);
    return sunset;
}
