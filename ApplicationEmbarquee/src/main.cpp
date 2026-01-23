#include <WiFi.h>
#include <WiFiClientSecure.h>
#include "FirebaseService.h"
#include "Config.h"
#include "NTPUtils.h"
#include "SunCalculator.h"
#include "TimeHM.h"
#include "SunTimes.h"

#define LED_PIN 2

String currentMode = "MANUAL";
String currentSolarSubMode = "SUNSET_TO_SUNRISE";
int currentSolarDelay = 0;
String manualStartTime = "18:00";
String manualEndTime = "23:00";
bool lightingState = false;
SunTimes sunTimes;

void updateLighting() {
    // ---- Lire le mode depuis Firebase ----
    String modeFromFirebase = FirebaseService::getLightingMode();
    if (modeFromFirebase.length() > 0 && modeFromFirebase != currentMode) {
        currentMode = modeFromFirebase;
        Serial.print("🔄 Mode changé depuis Firebase : ");
        Serial.println(currentMode);
    }

    // ---- Obtenir l'heure actuelle ----
    TimeHM now = NTPUtils::now();
    int currentHour = now.hour;
    int currentMinute = now.minute;

    // ---- Calculer l'état de la LED ----
    if (currentMode == "MANUAL") {
        // ✅ Lire les horaires manuels depuis Firebase
        FirebaseService::getManualSchedule(manualStartTime, manualEndTime);
        
        // Parser les heures
        int startHour = manualStartTime.substring(0, 2).toInt();
        int startMinute = manualStartTime.substring(3, 5).toInt();
        int endHour = manualEndTime.substring(0, 2).toInt();
        int endMinute = manualEndTime.substring(3, 5).toInt();
        
        int currentMinutes = currentHour * 60 + currentMinute;
        int startMinutes = startHour * 60 + startMinute;
        int endMinutes = endHour * 60 + endMinute;
        
        if (startMinutes <= endMinutes) {
            // Cas normal: 18:00 → 23:00
            lightingState = (currentMinutes >= startMinutes && currentMinutes < endMinutes);
        } else {
            // Cas qui traverse minuit: 22:00 → 06:00
            lightingState = (currentMinutes >= startMinutes || currentMinutes < endMinutes);
        }
    } 
    else if (currentMode == "SUNSET_SUNRISE") {
        // ✅ Lire le sous-mode et le délai depuis Firebase
        String subMode = FirebaseService::getSolarSubMode();
        if (subMode.length() > 0) {
            currentSolarSubMode = subMode;
        }
        
        int delay = FirebaseService::getSolarDelay();
        if (delay >= 0) {
            currentSolarDelay = delay;
        }
        
        sunTimes.sunset = SunCalculator::getSunset();
        sunTimes.sunrise = SunCalculator::getSunrise();
        
        // Appliquer le délai
        int sunsetMinutes = sunTimes.sunset.hour * 60 + sunTimes.sunset.minute + currentSolarDelay;
        int sunriseMinutes = sunTimes.sunrise.hour * 60 + sunTimes.sunrise.minute + currentSolarDelay;
        int currentMinutes = currentHour * 60 + currentMinute;
        
        // Calculer selon le sous-mode
        if (currentSolarSubMode == "SUNSET_TO_SUNRISE") {
            lightingState = (currentMinutes >= sunsetMinutes || currentMinutes < sunriseMinutes);
        }
        else if (currentSolarSubMode == "BEFORE_SUNSET") {
            lightingState = (currentMinutes < sunsetMinutes);
        }
        else if (currentSolarSubMode == "AFTER_SUNSET") {
            lightingState = (currentMinutes >= sunsetMinutes);
        }
        else if (currentSolarSubMode == "BEFORE_SUNRISE") {
            lightingState = (currentMinutes < sunriseMinutes);
        }
        else if (currentSolarSubMode == "AFTER_SUNRISE") {
            lightingState = (currentMinutes >= sunriseMinutes);
        }
    }

    // ---- Mettre à jour la LED physique ----
    digitalWrite(LED_PIN, lightingState ? HIGH : LOW);

    // ---- Écrire l'état dans Firebase ----
    FirebaseService::setLightingState(lightingState ? "on" : "off");
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);

    // WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connexion WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connecté");
    Serial.print("Adresse IP: ");
    Serial.println(WiFi.localIP());

    // NTP
    Serial.println("Synchronisation NTP...");
    NTPUtils::init(3600, 0);
    TimeHM now;
    do {
        now = NTPUtils::now();
        delay(500);
    } while (now.year < 2026);
    Serial.println("NTP synchronisé ✅");

    // SunCalculator
    SunCalculator::init(36.81897, 10.16579);

    // Firebase
    Serial.println("\n=== Initialisation Firebase ===");
    FirebaseService::begin(FIREBASE_API_KEY, FIREBASE_DATABASE_URL);
    delay(2000);
}

void loop() {
    Serial.println("\n--- Lecture & Mise à jour périodique ---");
    
    updateLighting();

    Serial.print("État actuel : ");
    Serial.print(lightingState ? "ON 💡" : "OFF 🌑");
    Serial.print(" | Mode actuel : ");
    Serial.println(currentMode);

    if (currentMode == "SUNSET_SUNRISE") {
        Serial.print("☀️ SubMode: ");
        Serial.print(currentSolarSubMode);
        Serial.print(" | Delay: ");
        Serial.print(currentSolarDelay);
        Serial.println(" min");
        
        Serial.printf("☀️ Lever : %02d:%02d | Coucher : %02d:%02d\n",
            sunTimes.sunrise.hour, sunTimes.sunrise.minute,
            sunTimes.sunset.hour, sunTimes.sunset.minute);
    } else {
        Serial.print("🕐 Horaires: ");
        Serial.print(manualStartTime);
        Serial.print(" → ");
        Serial.println(manualEndTime);
    }

    delay(5000);
}
