#include <Arduino.h>
#include "WiFiModule.h"
#include "NTPUtils.h"
#include "TimeUtils.h"
#include "SunCalculator.h"
#include "LightingService.h"
#include "Config.h"
#include "LightingModes.h"

// ================== INIT ==================
WiFiModule wifi(WIFI_SSID, WIFI_PASSWORD);

// Temps manuel pour mode MANUAL
TimeHM manualStart = {MANUAL_START_HOUR, MANUAL_START_MINUTE};
TimeHM manualEnd   = {MANUAL_END_HOUR,   MANUAL_END_MINUTE};

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("=== TEST MINUTERIE ÉCLAIRAGE ===");

    // Init LED
    LightingService::init(LED_PIN);

    // Connexion Wi-Fi
    wifi.connect();

    // Init NTP si connecté
    if(wifi.isConnected()) {
        NTPUtils::init(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC);
    }

    // Récupération automatique latitude/longitude pour SunCalculator
    SunCalculator::updateLocation();

    // Init TimeUtils pour simulation si besoin
    TimeUtils::init();
}

void loop() {
    // ================== Heure actuelle ==================
    TimeHM current;
    if(wifi.isConnected()) {
        current = NTPUtils::now();
    } else {
        current = TimeUtils::now();
    }

    // ================== Lever / coucher ==================
    TimeHM sunrise = SunCalculator::getSunrise();
    TimeHM sunset  = SunCalculator::getSunset();

    // ================== Logging ==================
    Serial.print("Heure actuelle : ");
    Serial.println(TimeUtils::toString(current));
    Serial.print("Sunrise : ");
    Serial.println(TimeUtils::toString(sunrise));
    Serial.print("Sunset  : ");
    Serial.println(TimeUtils::toString(sunset));

    // ================== Logique LED selon mode ==================
    switch(LIGHT_MODE) {
        case BEFORE_SUNSET:
            // LED éteinte avant le coucher, allumée après
            if(TimeUtils::isBefore(current, sunset))
                LightingService::turnOff();
            else
                LightingService::turnOn();
            break;

        case AFTER_SUNSET:
            // LED allumée après le coucher, éteinte avant
            if(TimeUtils::isAfter(current, sunset))
                LightingService::turnOn();
            else
                LightingService::turnOff();
            break;

        case BEFORE_SUNRISE:
            // LED allumée avant le lever, éteinte après
            if(TimeUtils::isBefore(current, sunrise))
                LightingService::turnOn();
            else
                LightingService::turnOff();
            break;

        case AFTER_SUNRISE:
            // LED éteinte après le lever, allumée avant
            if(TimeUtils::isAfter(current, sunrise))
                LightingService::turnOff();
            else
                LightingService::turnOn();
            break;

        case MANUAL:
            // LED allumée uniquement dans la plage définie
            if(TimeUtils::isInRange(manualStart, manualEnd))
                LightingService::turnOn();
            else
                LightingService::turnOff();
            break;
    }

    // ================== Affichage état LED ==================
    Serial.print("État LED : ");
    Serial.println(LightingService::getState() ? "ON" : "OFF");
    Serial.println("----------------------");

    delay(1000);
}
