#ifndef CONFIG_H
#define CONFIG_H

// ===== WIFI =====
#define WIFI_SSID     "@TSC_GUEST"
#define WIFI_PASSWORD "1T2s3C45678"

// ===== Fuseau horaire =====
#define GMT_OFFSET_SEC      3600     // GMT+1
#define DAYLIGHT_OFFSET_SEC 3600     // DST +1h

// ===== LED =====
#define LED_PIN 2

// ===== Mode initial =====
#include "LightingModes.h"
const LightingMode LIGHT_MODE = AFTER_SUNSET;

// ===== Plage horaire manuelle =====
const int MANUAL_START_HOUR = 20;
const int MANUAL_START_MINUTE = 0;
const int MANUAL_END_HOUR   = 23;
const int MANUAL_END_MINUTE = 0;

#endif
