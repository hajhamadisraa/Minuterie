#include <Arduino.h>
#include <WiFi.h>

// ================== Imports Sonnerie ==================
#include "TimeHM.h"
#include "BellTypes.h"
#include "BellScheduler.h"
#include "BellService.h"

// ================== Imports Éclairage & Irrigation ==================
#include "LightingService.h"
#include "LightingScheduler.h"
#include "IrrigationService.h"
#include "IrrigationScheduler.h"
#include "SunCalculator.h"
#include "LocationService.h"

// ================== Imports Communs ==================
#include "NTPUtils.h"
#include "TimeUtils.h"
#include "Config.h"
#include "WiFiModule.h"
#include "OperationMode.h"

// ================== INIT WiFi ==================
WiFiModule wifi(WIFI_SSID, WIFI_PASSWORD);

// ================== Configuration NTP ==================
#define GMT_OFFSET_SEC 3600        // GMT+1 (Tunisie)
#define DAYLIGHT_OFFSET_SEC 0      // Pas d'heure d'été

// ================== Configuration Sonnerie ==================
#define BELL_DURATION 10000   // Durée sonnerie : 10 secondes

unsigned long bellStartTime = 0;
bool bellIsRinging = false;

BellNormalSchedule normalSchedule[7] = {
    { {0, 0} },      // Dimanche - pas de sonnerie
    { {8, 0} },      // Lundi - 8:00
    { {8, 0} },      // Mardi - 8:00
    { {8, 0} },      // Mercredi - 8:00
    { {8, 0} },      // Jeudi - 8:00
    { {11, 30} },    // Vendredi - 11:30
    { {9, 0} }       // Samedi - 9:00
};

BellSpecialPeriod specialPeriods[] = {
    {
        {1, 3},    // 1er mars
        {31, 3},   // 31 mars (Ramadan)
        {
            { {0, 0} },     // Dimanche
            { {9, 0} },     // Lundi - 9:00
            { {9, 0} },     // Mardi - 9:00
            { {9, 0} },     // Mercredi - 9:00
            { {9, 0} },     // Jeudi - 9:00
            { {12, 0} },    // Vendredi - 12:00
            { {10, 0} }     // Samedi - 10:00
        }
    },
    {
        {1, 7},    // 1er juillet
        {31, 8},   // 31 août (Été)
        {
            { {0, 0} },     // Dimanche
            { {7, 0} },     // Lundi - 7:00
            { {7, 0} },     // Mardi - 7:00
            { {7, 0} },     // Mercredi - 7:00
            { {7, 0} },     // Jeudi - 7:00
            { {11, 0} },    // Vendredi - 11:00
            { {8, 0} }      // Samedi - 8:00
        }
    }
};

const int normalCount = 7;
const int specialCount = 2;

// ================== Configuration Éclairage ==================
OperationMode lightingMode = OperationMode::AFTER_SUNSET;

ManualSchedule manualLighting = {
    .start = {18, 0},  // 18:00
    .end   = {23, 0}   // 23:00
};

// ================== Configuration Irrigation ==================
OperationMode irrigationMode = OperationMode::BEFORE_SUNRISE;

ManualIrrigationSchedule manualIrrigation = {
    .start = {6, 0},   // 6:00
    .end   = {6, 30}   // 6:30
};

int irrigationOffsetMinutes = 30;

// ================== Variables globales ==================
bool wifiConnected = false;

// ================== Obtenir l'heure actuelle ==================
TimeHM getCurrentTime() {
    if (wifiConnected) {
        return NTPUtils::now();
    } else {
        return TimeUtils::now();
    }
}

// ================== Gestion de la sonnerie ==================
void handleBell(const TimeHM& now) {
    bool shouldRing = BellScheduler::shouldRing(
        now, 
        normalSchedule, 
        normalCount, 
        specialPeriods, 
        specialCount
    );
    
    if (shouldRing && !bellIsRinging) {
        BellService::start();
        bellStartTime = millis();
        bellIsRinging = true;
        
        Serial.println("\n🔔🔔🔔 SONNERIE DÉMARRÉE 🔔🔔🔔");
        Serial.printf("   Heure: %02d:%02d\n", now.hour, now.minute);
    }
    
    if (bellIsRinging && (millis() - bellStartTime >= BELL_DURATION)) {
        BellService::stop();
        bellIsRinging = false;
        Serial.println("🔕 SONNERIE ARRÊTÉE (10s écoulées)\n");
    }
}

// ================== Gestion de l'éclairage ==================
void handleLighting(const TimeHM& now, const SunTimes& sun) {
    bool lightingActive = LightingScheduler::shouldBeActive(
        lightingMode,
        now,
        sun,
        (lightingMode == OperationMode::MANUAL) ? &manualLighting : nullptr
    );

    if (lightingActive) {
        LightingService::turnOn();
    } else {
        LightingService::turnOff();
    }
}

// ================== Gestion de l'irrigation ==================
void handleIrrigation(const TimeHM& now, const SunTimes& sun) {
    bool irrigationActive = IrrigationScheduler::shouldBeActive(
        irrigationMode,
        now,
        sun,
        irrigationOffsetMinutes,
        (irrigationMode == OperationMode::MANUAL) ? &manualIrrigation : nullptr
    );

    if (irrigationActive) {
        IrrigationService::start();
    } else {
        IrrigationService::stop();
    }
}

// ================== Affichage du statut complet ==================
void displayStatus(const TimeHM& now, const SunTimes& sun) {
    static unsigned long lastDisplay = 0;
    
    if (millis() - lastDisplay >= 10000) { // Toutes les 10 secondes
        lastDisplay = millis();
        
        Serial.println("\n╔════════════════════════════════════════════════════════╗");
        Serial.println("║        SYSTÈME INTELLIGENT - ÉTAT GLOBAL              ║");
        Serial.println("╚════════════════════════════════════════════════════════╝");
        
        // ========== Date et Heure ==========
        Serial.println("\n📅 DATE ET HEURE");
        Serial.printf("   Date : %02d/%02d/%04d\n", now.day, now.month, now.year);
        Serial.printf("   Heure : %02d:%02d:%02d\n", now.hour, now.minute, 0);
        
        const char* dayNames[] = {"Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"};
        Serial.printf("   Jour : %s\n", dayNames[now.dayOfWeek]);
        
        // ========== Informations Solaires ==========
        Serial.println("\n☀️ INFORMATIONS SOLAIRES");
        Serial.printf("   Lever du soleil : %02d:%02d\n", sun.sunrise.hour, sun.sunrise.minute);
        Serial.printf("   Coucher du soleil : %02d:%02d\n", sun.sunset.hour, sun.sunset.minute);
        
        // ========== Sonnerie ==========
        Serial.println("\n🔔 SONNERIE");
        
        bool inSpecial = false;
        int nowValue = now.month * 100 + now.day;
        
        for (int i = 0; i < specialCount; i++) {
            int startValue = specialPeriods[i].startDate.month * 100 + specialPeriods[i].startDate.day;
            int endValue = specialPeriods[i].endDate.month * 100 + specialPeriods[i].endDate.day;
            
            if (nowValue >= startValue && nowValue <= endValue) {
                inSpecial = true;
                Serial.println("   Mode : SPÉCIAL");
                Serial.printf("   Période : %02d/%02d → %02d/%02d\n", 
                    specialPeriods[i].startDate.day, 
                    specialPeriods[i].startDate.month,
                    specialPeriods[i].endDate.day,
                    specialPeriods[i].endDate.month);
                
                const auto& todaySchedule = specialPeriods[i].dailySchedule[now.dayOfWeek];
                if (todaySchedule.start.hour != 0 || todaySchedule.start.minute != 0) {
                    Serial.printf("   Sonnerie aujourd'hui : %02d:%02d\n", 
                        todaySchedule.start.hour, 
                        todaySchedule.start.minute);
                } else {
                    Serial.println("   Pas de sonnerie aujourd'hui");
                }
                break;
            }
        }
        
        if (!inSpecial) {
            Serial.println("   Mode : NORMAL");
            const auto& todaySchedule = normalSchedule[now.dayOfWeek];
            if (todaySchedule.start.hour != 0 || todaySchedule.start.minute != 0) {
                Serial.printf("   Sonnerie aujourd'hui : %02d:%02d\n", 
                    todaySchedule.start.hour, 
                    todaySchedule.start.minute);
            } else {
                Serial.println("   Pas de sonnerie aujourd'hui");
            }
        }
        
        Serial.printf("   État : %s\n", BellService::getState() ? "ON 🔊" : "OFF 🔇");
        
        // ========== Éclairage ==========
        Serial.println("\n💡 ÉCLAIRAGE");
        Serial.print("   Mode : ");
        switch (lightingMode) {
            case OperationMode::BEFORE_SUNSET:  Serial.println("BEFORE_SUNSET"); break;
            case OperationMode::AFTER_SUNSET:   Serial.println("AFTER_SUNSET"); break;
            case OperationMode::BEFORE_SUNRISE: Serial.println("BEFORE_SUNRISE"); break;
            case OperationMode::AFTER_SUNRISE:  Serial.println("AFTER_SUNRISE"); break;
            case OperationMode::MANUAL:         
                Serial.println("MANUAL");
                Serial.printf("   Horaire : %02d:%02d → %02d:%02d\n",
                    manualLighting.start.hour, manualLighting.start.minute,
                    manualLighting.end.hour, manualLighting.end.minute);
                break;
        }
        Serial.printf("   État : %s\n", LightingService::getState() ? "ON 💡" : "OFF 🌑");
        
        // ========== Irrigation ==========
        Serial.println("\n💧 IRRIGATION");
        Serial.print("   Mode : ");
        switch (irrigationMode) {
            case OperationMode::BEFORE_SUNSET:  Serial.println("BEFORE_SUNSET"); break;
            case OperationMode::AFTER_SUNSET:   Serial.println("AFTER_SUNSET"); break;
            case OperationMode::BEFORE_SUNRISE: Serial.println("BEFORE_SUNRISE"); break;
            case OperationMode::AFTER_SUNRISE:  Serial.println("AFTER_SUNRISE"); break;
            case OperationMode::MANUAL:         
                Serial.println("MANUAL");
                Serial.printf("   Horaire : %02d:%02d → %02d:%02d\n",
                    manualIrrigation.start.hour, manualIrrigation.start.minute,
                    manualIrrigation.end.hour, manualIrrigation.end.minute);
                break;
        }
        Serial.printf("   État : %s\n", IrrigationService::getState() ? "ON 💧" : "OFF 🚫");
        
        // ========== Réseau ==========
        Serial.println("\n📡 RÉSEAU");
        Serial.printf("   WiFi : %s\n", wifiConnected ? "Connecté ✅" : "Déconnecté ❌");
        Serial.printf("   Source heure : %s\n", wifiConnected ? "NTP (Internet)" : "Horloge interne");
        
        Serial.println("\n════════════════════════════════════════════════════════\n");
    }
}

// ================== Affichage minute par minute ==================
void displayMinuteChange(const TimeHM& now) {
    static int lastMinute = -1;
    
    if (now.minute != lastMinute) {
        lastMinute = now.minute;
        Serial.printf("⏰ %02d:%02d\n", now.hour, now.minute);
    }
}

// ================== SETUP ==================
void setup() {
    Serial.begin(115200);
    delay(2000);
    
    Serial.println("\n\n");
    Serial.println("╔════════════════════════════════════════════════════════╗");
    Serial.println("║    SYSTÈME INTELLIGENT MULTI-FONCTIONS                ║");
    Serial.println("║    • Sonnerie automatique                             ║");
    Serial.println("║    • Éclairage intelligent                            ║");
    Serial.println("║    • Irrigation programmée                            ║");
    Serial.println("╚════════════════════════════════════════════════════════╝");
    Serial.println();
    
    // ========== Initialisation Sonnerie ==========
    Serial.println("🔔 Initialisation de la sonnerie...");
    BellService::init(BELL_PIN);
    Serial.printf("   ✅ Pin : %d\n", BELL_PIN);
    Serial.printf("   ✅ Durée : %d secondes\n\n", BELL_DURATION / 1000);
    
    // ========== Initialisation Éclairage ==========
    Serial.println("💡 Initialisation de l'éclairage...");
    LightingService::init(LED_PIN);
    Serial.printf("   ✅ Pin : %d\n\n", LED_PIN);
    
    // ========== Initialisation Irrigation ==========
    Serial.println("💧 Initialisation de l'irrigation...");
    IrrigationService::init(IRRIGATION_PIN);
    Serial.printf("   ✅ Pin : %d\n\n", IRRIGATION_PIN);
    
    // ========== Connexion WiFi ==========
    Serial.println("🌐 Connexion WiFi...");
    Serial.printf("   SSID: %s\n", WIFI_SSID);
    
    wifi.connect();
    
    if (WiFi.status() == WL_CONNECTED) {
        wifiConnected = true;
        Serial.println("   ✅ WiFi connecté !");
        Serial.printf("   📶 IP: %s\n\n", WiFi.localIP().toString().c_str());
    } else {
        wifiConnected = false;
        Serial.println("   ❌ Échec connexion WiFi\n");
    }
    
    // ========== Initialisation NTP ==========
    if (wifiConnected) {
        Serial.println("🕐 Initialisation NTP...");
        NTPUtils::init(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC);
        delay(2000);
        
        TimeHM now = NTPUtils::now();
        Serial.println("   ✅ NTP synchronisé !");
        Serial.printf("   Heure actuelle : %02d:%02d\n", now.hour, now.minute);
        Serial.printf("   Date : %02d/%02d/%04d\n\n", now.day, now.month, now.year);
    } else {
        Serial.println("⚠️ NTP non disponible (pas de WiFi)");
        Serial.println("   Utilisation de l'horloge interne\n");
    }
    
    // ========== Initialisation Localisation ==========
    if (wifiConnected && LocationService::update()) {
        double lat = LocationService::getLatitude();
        double lon = LocationService::getLongitude();
        
        Serial.println("📍 Localisation détectée");
        Serial.printf("   Latitude : %.6f\n", lat);
        Serial.printf("   Longitude : %.6f\n\n", lon);
        
        SunCalculator::init(lat, lon);
        Serial.println("   ✅ Calcul solaire initialisé\n");
    } else {
        Serial.println("⚠️ Localisation non disponible\n");
    }
    
    // ========== Initialisation Fallback Temps ==========
    TimeUtils::init(8, 0);  // Démarrer à 08:00 si pas de WiFi

    
    Serial.println("🚀 SYSTÈME DÉMARRÉ ET OPÉRATIONNEL !\n");
    Serial.println("════════════════════════════════════════════════════════\n");
}

// ================== LOOP ==================
void loop() {
    // Vérifier la connexion WiFi
    if (WiFi.status() != WL_CONNECTED && wifiConnected) {
        wifiConnected = false;
        Serial.println("\n⚠️ WiFi déconnecté !");
    } else if (WiFi.status() == WL_CONNECTED && !wifiConnected) {
        wifiConnected = true;
        Serial.println("\n✅ WiFi reconnecté !");
        NTPUtils::init(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC);
    }
    
    // Obtenir l'heure actuelle
    TimeHM now = getCurrentTime();
    
    // Obtenir les horaires solaires
    SunTimes sun = {
        .sunrise = SunCalculator::getSunrise(),
        .sunset  = SunCalculator::getSunset()
    };
    
    // Afficher le changement de minute
    displayMinuteChange(now);
    
    // Gérer les 3 systèmes
    handleBell(now);
    handleLighting(now, sun);
    handleIrrigation(now, sun);
    
    // Afficher le statut complet
    displayStatus(now, sun);
    
    delay(1000); // Vérification chaque seconde
}

// ================== NOTES D'UTILISATION ==================
/*
 * 📝 SYSTÈME MULTI-FONCTIONS
 * 
 * Ce programme combine 3 fonctionnalités :
 * 
 * 1. 🔔 SONNERIE AUTOMATIQUE
 *    - Mode NORMAL : horaires fixes par jour de semaine
 *    - Mode SPÉCIAL : périodes personnalisées (Ramadan, Été, etc.)
 *    - Sonnerie de 10 secondes
 * 
 * 2. 💡 ÉCLAIRAGE INTELLIGENT
 *    - Modes : BEFORE_SUNSET, AFTER_SUNSET, BEFORE_SUNRISE, AFTER_SUNRISE, MANUAL
 *    - Basé sur le lever/coucher du soleil
 *    - Localisation automatique via WiFi
 * 
 * 3. 💧 IRRIGATION PROGRAMMÉE
 *    - Mêmes modes que l'éclairage
 *    - Offset configurable pour les modes BEFORE/AFTER
 *    - Programmation flexible
 * 
 * 🔧 CONFIGURATION :
 * 
 * Dans Config.h, définissez :
 * - WIFI_SSID et WIFI_PASSWORD
 * - BELL_PIN (GPIO pour sonnerie)
 * - LED_PIN (GPIO pour éclairage)
 * - IRRIGATION_PIN (GPIO pour pompe/vanne)
 * 
 * 🎯 MODES DISPONIBLES :
 * 
 * - MANUAL : horaires fixes définis manuellement
 * - BEFORE_SUNSET : activation X minutes avant le coucher du soleil
 * - AFTER_SUNSET : activation après le coucher du soleil
 * - BEFORE_SUNRISE : activation X minutes avant le lever du soleil
 * - AFTER_SUNRISE : activation après le lever du soleil
 * 
 * 📊 AFFICHAGE :
 * 
 * Le système affiche toutes les 10 secondes :
 * - Date et heure actuelles
 * - Horaires solaires (lever/coucher)
 * - État de chaque système (ON/OFF)
 * - Mode actif pour chaque système
 * - État du WiFi et source de l'heure
 * 
 * 🧪 TEST :
 * 
 * 1. Modifiez les modes et horaires dans les variables globales
 * 2. Vérifiez la sortie série pour voir l'état de chaque système
 * 3. Testez avec et sans WiFi
 * 4. Vérifiez que chaque système fonctionne indépendamment
 */