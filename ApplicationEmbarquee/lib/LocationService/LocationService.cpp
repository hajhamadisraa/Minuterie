#include "LocationService.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

double LocationService::latitude  = 0.0;
double LocationService::longitude = 0.0;

bool LocationService::update() {
    if (WiFi.status() != WL_CONNECTED) return false;

    HTTPClient http;
    http.begin("http://ip-api.com/json");
    int code = http.GET();

    if (code != 200) {
        http.end();
        return false;
    }

    DynamicJsonDocument doc(512);
    deserializeJson(doc, http.getString());

    latitude  = doc["lat"].as<double>();
    longitude = doc["lon"].as<double>();

    http.end();
    return true;
}

double LocationService::getLatitude() {
    return latitude;
}

double LocationService::getLongitude() {
    return longitude;
}
