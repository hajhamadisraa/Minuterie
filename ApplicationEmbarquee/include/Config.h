#ifndef CONFIG_H
#define CONFIG_H

// ================== WIFI ==================
#define WIFI_SSID     "@TSC_GUEST"
#define WIFI_PASSWORD "1T2s3C45678"

// ================== LED ==================
#define LED_PIN 2   // adapte si besoin
#define IRRIGATION_PIN 5   // ou la broche que tu utilises pour le relais pompe
#define BELL_PIN        18   // <-- pin pour la sonnerie

// ================== NTP ==================
#define GMT_OFFSET_SEC        3600   // UTC+1 (Tunisie)
#define DAYLIGHT_OFFSET_SEC  0

// ================== MODE ÉCLAIRAGE ==================
#define LIGHT_MODE AFTER_SUNSET

// ================== MODE MANUEL ==================
#define MANUAL_START_HOUR   8
#define MANUAL_START_MINUTE 0
#define MANUAL_END_HOUR     18
#define MANUAL_END_MINUTE   0


#endif
