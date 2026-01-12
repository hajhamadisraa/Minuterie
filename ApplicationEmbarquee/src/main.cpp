#include <Arduino.h>

#include "WiFiModule.h"
#include "NTPUtils.h"
#include "TimeUtils.h"
#include "LocationService.h"
#include "SunCalculator.h"

#include "LightingService.h"
#include "LightingScheduler.h"

#include "IrrigationService.h"
#include "IrrigationScheduler.h"

#include "Config.h"
#include "OperationMode.h"

// ================== INIT ==================
WiFiModule wifi(WIFI_SSID, WIFI_PASSWORD);

// ----------------- Modes indépendants -----------------
// Mode à tester pour l'éclairage
OperationMode lightingMode   = OperationMode::MANUAL;

// Mode à tester pour l'irrigation
OperationMode irrigationMode = OperationMode::MANUAL;

// ----------------- Schedules manuels -----------------
ManualSchedule manualLighting = {
    .start = {MANUAL_START_HOUR, MANUAL_START_MINUTE},
    .end   = {MANUAL_END_HOUR,   MANUAL_END_MINUTE}
};

ManualIrrigationSchedule manualIrrigation = {
    .start = {12, 37},
    .end   = {13, 0}
};

// Offset irrigation pour BEFORE/AFTER SUNRISE/SUNSET
int irrigationOffsetMinutes = 30;

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("=== TEST ÉCLAIRAGE ET IRRIGATION (SCHEDULER) ===");

    // ================== LED ==================
    LightingService::init(LED_PIN);

    // ================== Irrigation ==================
    IrrigationService::init(IRRIGATION_PIN);

    // ================== Wi-Fi ==================
    wifi.connect();

    // ================== NTP ==================
    if (wifi.isConnected()) {
        NTPUtils::init(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC);
    }

    // ================== Localisation auto ==================
    if (wifi.isConnected() && LocationService::update()) {
        double lat = LocationService::getLatitude();
        double lon = LocationService::getLongitude();

        Serial.print("Latitude : ");
        Serial.println(lat, 6);
        Serial.print("Longitude: ");
        Serial.println(lon, 6);

        SunCalculator::init(lat, lon);
    } else {
        Serial.println("⚠️ Localisation non disponible");
    }

    // ================== Fallback temps ==================
    TimeUtils::init();
}

void loop() {

    // ================== Heure actuelle ==================
    TimeHM now;
    if (wifi.isConnected()) {
        now = NTPUtils::now();
    } else {
        now = TimeUtils::now();
    }

    // ================== Sunrise / Sunset ==================
    SunTimes sun = {
        .sunrise = SunCalculator::getSunrise(),
        .sunset  = SunCalculator::getSunset()
    };

    // ================== Scheduler Lighting ==================
    bool lightingActive = LightingScheduler::shouldBeActive(
        lightingMode,
        now,
        sun,
        (lightingMode == OperationMode::MANUAL) ? &manualLighting : nullptr
    );

    if (lightingActive) LightingService::turnOn();
    else LightingService::turnOff();

    // ================== Scheduler Irrigation ==================
    bool irrigationActive = IrrigationScheduler::shouldBeActive(
        irrigationMode,
        now,
        sun,
        irrigationOffsetMinutes,
        (irrigationMode == OperationMode::MANUAL) ? &manualIrrigation : nullptr
    );

    if (irrigationActive) IrrigationService::start();
    else IrrigationService::stop();

    // ================== LOG ==================
    Serial.println("----------------------");
    Serial.print("Heure actuelle : ");
    Serial.println(TimeUtils::toString(now));

    Serial.print("Sunrise : ");
    Serial.println(TimeUtils::toString(sun.sunrise));

    Serial.print("Sunset  : ");
    Serial.println(TimeUtils::toString(sun.sunset));

    Serial.print("Mode Lighting   : ");
    switch (lightingMode) {
        case OperationMode::BEFORE_SUNSET:  Serial.println("BEFORE_SUNSET"); break;
        case OperationMode::AFTER_SUNSET:   Serial.println("AFTER_SUNSET"); break;
        case OperationMode::BEFORE_SUNRISE: Serial.println("BEFORE_SUNRISE"); break;
        case OperationMode::AFTER_SUNRISE:  Serial.println("AFTER_SUNRISE"); break;
        case OperationMode::MANUAL:          Serial.println("MANUAL"); break;
    }

    Serial.print("Mode Irrigation: ");
    switch (irrigationMode) {
        case OperationMode::BEFORE_SUNSET:  Serial.println("BEFORE_SUNSET"); break;
        case OperationMode::AFTER_SUNSET:   Serial.println("AFTER_SUNSET"); break;
        case OperationMode::BEFORE_SUNRISE: Serial.println("BEFORE_SUNRISE"); break;
        case OperationMode::AFTER_SUNRISE:  Serial.println("AFTER_SUNRISE"); break;
        case OperationMode::MANUAL:          Serial.println("MANUAL"); break;
    }

    Serial.print("État LED       : ");
    Serial.println(LightingService::getState() ? "ON" : "OFF");

    Serial.print("État Irrigation: ");
    Serial.println(IrrigationService::getState() ? "ON" : "OFF");

    delay(1000);
}
