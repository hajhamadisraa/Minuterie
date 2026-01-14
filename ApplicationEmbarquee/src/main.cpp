#include <Arduino.h>
#include <WiFi.h>
#include "TimeHM.h"
#include "BellTypes.h"
#include "BellScheduler.h"
#include "BellService.h"
#include "NTPUtils.h"
#include "TimeUtils.h"
#include "Config.h"
#include "WiFiModule.h"

// ================== INIT ==================
WiFiModule wifi(WIFI_SSID, WIFI_PASSWORD);

// ================== Configuration Bell ==================

#define BELL_DURATION 10000   // Durée sonnerie : 10 secondes

// ================== Configuration NTP ==================
#define GMT_OFFSET_SEC 3600        // GMT+1 (Tunisie) : 1 heure = 3600 secondes
#define DAYLIGHT_OFFSET_SEC 0      // Pas d'heure d'été

// ================== Variables globales ==================
unsigned long bellStartTime = 0;
bool bellIsRinging = false;
bool wifiConnected = false;

// ================== MODE NORMAL ==================
// Horaires fixes pour chaque jour de la semaine
// Index : 0=Dimanche, 1=Lundi, 2=Mardi, 3=Mercredi, 4=Jeudi, 5=Vendredi, 6=Samedi
// ================== MODE NORMAL ==================
BellNormalSchedule normalSchedule[7] = {
    // Dimanche
    { {0, 0} },      // ✅ Pas de sonnerie (0:00 = désactivé)
    
    // Lundi
    { {8, 0} },      // ✅ Sonnerie à 8:00
    
    // Mardi
    { {8, 0} },      // ✅ Sonnerie à 8:00
    
    // Mercredi
    { {9, 42} },     // ✅ Sonnerie à 9:38 (pour test)
    
    // Jeudi
    { {8, 0} },      // ✅ Sonnerie à 8:00
    
    // Vendredi
    { {11, 30} },    // ✅ Sonnerie à 11:30
    
    // Samedi
    { {9, 0} }       // ✅ Sonnerie à 9:00
};

// ================== MODE SPÉCIAL ==================
BellSpecialPeriod specialPeriods[] = {
    {
        {1, 3},    // 1er mars
        {31, 3},   // 31 mars
        {
            { {0, 0} },     // Dimanche - pas de sonnerie
            { {9, 0} },     // Lundi - 9:00
            { {9, 0} },     // Mardi - 9:00
            { {9, 0} },     // Mercredi - 9:00
            { {9, 0} },     // Jeudi - 9:00
            { {12, 0} },    // Vendredi - 12:00
            { {10, 0} }     // Samedi - 10:00
        }
    },
    {
        {1, 7},    // Période d'été
        {31, 8},
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

// ================== Connexion WiFi ==================
void connectWiFi() {
    Serial.println("\n🌐 Connexion WiFi...");
    Serial.print("SSID: ");
    Serial.println(WIFI_SSID);
    
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        wifiConnected = true;
        Serial.println("\n✅ WiFi connecté !");
        Serial.print("📶 IP: ");
        Serial.println(WiFi.localIP());
    } else {
        wifiConnected = false;
        Serial.println("\n❌ Échec connexion WiFi");
        Serial.println("⚠️ Vérifiez SSID et mot de passe");
    }
}

// ================== Obtenir l'heure actuelle via NTP ==================
TimeHM getCurrentTime() {
    if (wifiConnected) {
        return NTPUtils::now();
    } else {
        // Fallback si WiFi non connecté
        return TimeUtils::now();
    }
}

// ================== Gestion de la sonnerie avec timer ==================
void handleBell(const TimeHM& now) {
    bool shouldRing = BellScheduler::shouldRing(
        now, 
        normalSchedule, 
        normalCount, 
        specialPeriods, 
        specialCount
    );
    
    if (shouldRing && !bellIsRinging) {
        // Début de la sonnerie
        BellService::start();
        bellStartTime = millis();
        bellIsRinging = true;
        
        Serial.println("\n🔔🔔🔔 SONNERIE DÉMARRÉE 🔔🔔🔔");
        Serial.printf("   Heure: %02d:%02d\n", now.hour, now.minute);
    }
    
    // Arrêt automatique après 10 secondes
    if (bellIsRinging && (millis() - bellStartTime >= BELL_DURATION)) {
        BellService::stop();
        bellIsRinging = false;
        Serial.println("🔕 SONNERIE ARRÊTÉE (10s écoulées)\n");
    }
}

// ================== Affichage des informations ==================
void displayStatus(const TimeHM& now) {
    static unsigned long lastDisplay = 0;
    
    if (millis() - lastDisplay >= 10000) { // Affichage toutes les 10 secondes
        lastDisplay = millis();
        
        Serial.println("\n========================================");
        Serial.printf("📅 Date : %02d/%02d/%04d\n", now.day, now.month, now.year);
        Serial.printf("🕐 Heure : %02d:%02d:%02d\n", now.hour, now.minute, 0);
        
        // Nom du jour
        const char* dayNames[] = {"Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"};
        Serial.printf("📆 Jour : %s\n", dayNames[now.dayOfWeek]);
        
        // Détection du mode actif
        bool inSpecial = false;
        int nowValue = now.month * 100 + now.day;
        
        for (int i = 0; i < specialCount; i++) {
            int startValue = specialPeriods[i].startDate.month * 100 + specialPeriods[i].startDate.day;
            int endValue = specialPeriods[i].endDate.month * 100 + specialPeriods[i].endDate.day;
            
            if (nowValue >= startValue && nowValue <= endValue) {
                inSpecial = true;
                Serial.println("🎯 Mode : SPÉCIAL");
                Serial.printf("   Période : %02d/%02d → %02d/%02d\n", 
                    specialPeriods[i].startDate.day, 
                    specialPeriods[i].startDate.month,
                    specialPeriods[i].endDate.day,
                    specialPeriods[i].endDate.month);
                
                // Afficher l'horaire de sonnerie du jour
                const auto& todaySchedule = specialPeriods[i].dailySchedule[now.dayOfWeek];
                if (todaySchedule.start.hour != 0 || todaySchedule.start.minute != 0) {
                    Serial.printf("   ⏰ Sonnerie aujourd'hui : %02d:%02d\n", 
                        todaySchedule.start.hour, 
                        todaySchedule.start.minute);
                } else {
                    Serial.println("   ⏰ Pas de sonnerie aujourd'hui");
                }
                break;
            }
        }
        
        if (!inSpecial) {
            Serial.println("📋 Mode : NORMAL");
            const auto& todaySchedule = normalSchedule[now.dayOfWeek];
            if (todaySchedule.start.hour != 0 || todaySchedule.start.minute != 0) {
                Serial.printf("   ⏰ Sonnerie aujourd'hui : %02d:%02d\n", 
                    todaySchedule.start.hour, 
                    todaySchedule.start.minute);
            } else {
                Serial.println("   ⏰ Pas de sonnerie aujourd'hui");
            }
        }
        
        Serial.printf("🔔 État sonnerie : %s\n", 
            BellService::getState() ? "ON 🔊" : "OFF 🔇");
        
        Serial.printf("📡 WiFi : %s\n", wifiConnected ? "Connecté ✅" : "Déconnecté ❌");
        Serial.printf("🕐 Source heure : %s\n", wifiConnected ? "NTP (Internet)" : "Horloge interne");
        
        Serial.println("========================================\n");
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
    Serial.println("╔════════════════════════════════════════╗");
    Serial.println("║   SYSTÈME DE SONNERIE INTELLIGENTE    ║");
    Serial.println("║         Mode NTP - Temps Réel         ║");
    Serial.println("╚════════════════════════════════════════╝");
    Serial.println();
    
    // Initialisation de la sonnerie
    BellService::init(BELL_PIN);
    Serial.println("✅ Service sonnerie initialisé");
    Serial.printf("   Pin : %d\n", BELL_PIN);
    Serial.printf("   Durée : %d secondes\n\n", BELL_DURATION / 1000);
    
    // Connexion WiFi
    connectWiFi();
    
    // Initialisation NTP
    if (wifiConnected) {
        Serial.println("\n🕐 Initialisation NTP...");
        NTPUtils::init(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC);
        delay(2000); // Attendre la synchronisation NTP
        
        TimeHM now = NTPUtils::now();
        Serial.println("✅ NTP synchronisé !");
        Serial.printf("   Heure actuelle : %02d:%02d\n", now.hour, now.minute);
        Serial.printf("📅 Date : %02d/%02d/%04d\n", now.day, now.month, now.year);
    } else {
        Serial.println("\n⚠️ NTP non disponible (pas de WiFi)");
        Serial.println("   Utilisation de l'horloge interne\n");
    }
    
    Serial.println("🚀 Système démarré et opérationnel !");
    Serial.println("📋 Horaires configurés :");
    Serial.println("   • Mode NORMAL : Lundi-Jeudi 8:00, Vendredi 11:30, Samedi 9:00");
    Serial.println("   • Mode SPÉCIAL : Ramadan (mars), Été (juillet-août)");
    Serial.println();
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
    
    // Afficher le changement de minute
    displayMinuteChange(now);
    
    // Gérer la sonnerie
    handleBell(now);
    
    // Afficher le statut complet
    displayStatus(now);
    
    delay(1000); // Vérification chaque seconde
}

// ================== NOTES D'UTILISATION ==================
/*
 * 📝 CONFIGURATION REQUISE :
 * 
 * 1. Modifiez les constantes WiFi :
 *    - WIFI_SSID : nom de votre réseau WiFi
 *    - WIFI_PASSWORD : mot de passe WiFi
 * 
 * 2. Ajustez le fuseau horaire (GMT_OFFSET_SEC) :
 *    - Tunisie (GMT+1) : 3600
 *    - France (GMT+1) : 3600
 *    - Maroc (GMT+0) : 0
 *    - Algérie (GMT+1) : 3600
 * 
 * 3. Connectez la sonnerie sur le pin GPIO défini (BELL_PIN = 25)
 * 
 * 4. Adaptez les horaires dans normalSchedule[] et specialPeriods[]
 * 
 * 🔧 CÂBLAGE SONNERIE :
 * 
 * ESP32 GPIO25 → Relais IN
 * Relais COM → Sonnerie +
 * Relais NO → Alimentation +
 * Sonnerie - → Alimentation -
 * 
 * ⚠️ IMPORTANT :
 * - Utilisez un relais adapté à votre sonnerie (5V, 12V, 220V)
 * - Respectez les polarités
 * - Isolez correctement les connexions 220V si nécessaire
 * 
 * 🧪 TEST :
 * - Modifiez les horaires pour qu'ils correspondent à l'heure actuelle + 1 minute
 * - Vérifiez que la sonnerie démarre et s'arrête après 10 secondes
 * - Testez avec et sans WiFi
 */