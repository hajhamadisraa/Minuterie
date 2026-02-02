#define FB_TCP_CLIENT_RX_BUFFER_SIZE 4096
#define FB_TCP_CLIENT_TX_BUFFER_SIZE 1024

#include <WiFi.h>
#include <ArduinoJson.h>
#include "FirebaseService.h"
#include "Config.h"
#include "NTPUtils.h"
#include "SunCalculator.h"
#include "TimeHM.h"
#include "SunTimes.h"
#include "OperationMode.h"
#include "BellScheduler.h"
#include "BellFirebaseAdapter.h"

// =====================================================
// STRUCTURES POUR LES DISPOSITIFS
// =====================================================

struct LightingDevice {
    String id;
    String name;
    int pin;
    bool isActive;
    bool currentState;
};

struct IrrigationDevice {
    String id;
    String name;
    int pin;
    bool isActive;
    bool currentState;
};

// =====================================================
// DISPOSITIFS
// =====================================================

#define MAX_LIGHTING_DEVICES 10
#define MAX_IRRIGATION_DEVICES 10

LightingDevice lightingDevices[MAX_LIGHTING_DEVICES];
int lightingDeviceCount = 0;

IrrigationDevice irrigationDevices[MAX_IRRIGATION_DEVICES];
int irrigationDeviceCount = 0;

// =====================================================
// VARIABLES ÉCLAIRAGE (MODE GLOBAL)
// =====================================================

String currentMode = "MANUAL";
String currentSolarSubMode = "SUNSET_TO_SUNRISE";
int currentSolarDelay = 0;
String manualStartTime = "18:00";
String manualEndTime = "23:00";
bool lightingState = false;  // État global (calculé)

// =====================================================
// VARIABLES IRRIGATION (MODE GLOBAL)
// =====================================================

String irrigationMode = "MANUAL";
String irrigationSolarSubMode = "BEFORE_SUNRISE";
int irrigationSolarDelay = 0;
String irrigationManualStart = "06:00";
String irrigationManualEnd = "06:30";
bool irrigationState = false;  // État global (calculé)

// =====================================================
// VARIABLES SONNERIE
// =====================================================

#define BELL_PIN 18

BellNormalSchedule normalSchedule[20];
BellSpecialPeriod specialPeriods[10];
int normalCount = 0;
int specialCount = 0;

bool bellIsRinging = false;
unsigned long bellStartTime = 0;
const unsigned long BELL_DURATION = 10000; // 10 secondes
int lastCheckedMinute = -1;

SunTimes sunTimes;

// =====================================================
// CONSTANTE POUR MISE À JOUR FIREBASE
// =====================================================
const unsigned long STATE_UPDATE_INTERVAL = 10000; // 10 secondes

// =====================================================
// DÉCLARATIONS FORWARD
// =====================================================

void loadLightingDevices();
void loadIrrigationDevices();
void loadBellsFromFirebase();
void loadLightingConfigFromFirebase();
void loadIrrigationConfigFromFirebase();
void refreshNextBell();
void updateLighting();
void updateIrrigation();
void updateBell();

// =====================================================
// CALLBACKS FIREBASE
// =====================================================

void onLightingConfigChanged(String jsonData) {
    Serial.println("📡 Configuration ÉCLAIRAGE modifiée - Rechargement...");
    loadLightingConfigFromFirebase();
    loadLightingDevices();
}

void onIrrigationConfigChanged(String jsonData) {
    Serial.println("📡 Configuration IRRIGATION modifiée - Rechargement...");
    loadIrrigationConfigFromFirebase();
    loadIrrigationDevices();
}

void onBellsConfigChanged(String jsonData) {
    Serial.println("📡 Configuration SONNERIES modifiée - Rechargement...");
    loadBellsFromFirebase();
}

// =====================================================
// CHARGEMENT DISPOSITIFS ÉCLAIRAGE
// =====================================================

void loadLightingDevices() {
    Serial.println("\n┌─────────────────────────────────────┐");
    Serial.println("│  💡 CHARGEMENT DISPOSITIFS ÉCLAIRAGE│");
    Serial.println("└─────────────────────────────────────┘");
    
    String devicesJson = FirebaseService::getLightingDevicesJson();
    
    if (devicesJson.length() < 5 || devicesJson == "null" || devicesJson == "{}") {
        Serial.println("⚠️  Aucun dispositif d'éclairage trouvé");
        lightingDeviceCount = 0;
        return;
    }
    
    DynamicJsonDocument doc(4096);
    DeserializationError error = deserializeJson(doc, devicesJson);
    
    if (error) {
        Serial.printf("❌ Erreur parsing devices JSON: %s\n", error.c_str());
        lightingDeviceCount = 0;
        return;
    }
    
    JsonObject root = doc.as<JsonObject>();
    lightingDeviceCount = 0;
    
    for (JsonPair kv : root) {
        if (lightingDeviceCount >= MAX_LIGHTING_DEVICES) {
            Serial.println("⚠️  Limite de dispositifs atteinte");
            break;
        }
        
        LightingDevice& device = lightingDevices[lightingDeviceCount];
        
        device.id = kv.key().c_str();
        device.name = kv.value()["name"] | "Inconnu";
        device.pin = kv.value()["pin"] | -1;
        device.isActive = kv.value()["isActive"] | false;
        device.currentState = false;
        
        // Valider le pin
        if (device.pin < 0 || device.pin > 39) {
            Serial.printf("⚠️  Pin invalide pour %s: %d\n", device.name.c_str(), device.pin);
            continue;
        }
        
        // Configurer le pin
        pinMode(device.pin, OUTPUT);
        digitalWrite(device.pin, LOW);
        
        Serial.printf("  ✅ [%s] %s (Pin %d) - %s\n", 
                     device.id.c_str(),
                     device.name.c_str(), 
                     device.pin, 
                     device.isActive ? "ACTIF" : "INACTIF");
        
        lightingDeviceCount++;
    }
    
    Serial.printf("📊 Total: %d dispositifs d'éclairage chargés\n\n", lightingDeviceCount);
}

// =====================================================
// CHARGEMENT DISPOSITIFS IRRIGATION
// =====================================================

void loadIrrigationDevices() {
    Serial.println("\n┌─────────────────────────────────────┐");
    Serial.println("│  💧 CHARGEMENT DISPOSITIFS IRRIGATION│");
    Serial.println("└─────────────────────────────────────┘");
    
    String devicesJson = FirebaseService::getIrrigationDevicesJson();
    
    if (devicesJson.length() < 5 || devicesJson == "null" || devicesJson == "{}") {
        Serial.println("⚠️  Aucun dispositif d'irrigation trouvé");
        irrigationDeviceCount = 0;
        return;
    }
    
    DynamicJsonDocument doc(4096);
    DeserializationError error = deserializeJson(doc, devicesJson);
    
    if (error) {
        Serial.printf("❌ Erreur parsing devices JSON: %s\n", error.c_str());
        irrigationDeviceCount = 0;
        return;
    }
    
    JsonObject root = doc.as<JsonObject>();
    irrigationDeviceCount = 0;
    
    for (JsonPair kv : root) {
        if (irrigationDeviceCount >= MAX_IRRIGATION_DEVICES) {
            Serial.println("⚠️  Limite de dispositifs atteinte");
            break;
        }
        
        IrrigationDevice& device = irrigationDevices[irrigationDeviceCount];
        
        device.id = kv.key().c_str();
        device.name = kv.value()["name"] | "Inconnu";
        device.pin = kv.value()["pin"] | -1;
        device.isActive = kv.value()["isActive"] | false;
        device.currentState = false;
        
        // Valider le pin
        if (device.pin < 0 || device.pin > 39) {
            Serial.printf("⚠️  Pin invalide pour %s: %d\n", device.name.c_str(), device.pin);
            continue;
        }
        
        // Configurer le pin
        pinMode(device.pin, OUTPUT);
        digitalWrite(device.pin, LOW);
        
        Serial.printf("  ✅ [%s] %s (Pin %d) - %s\n", 
                     device.id.c_str(),
                     device.name.c_str(), 
                     device.pin, 
                     device.isActive ? "ACTIF" : "INACTIF");
        
        irrigationDeviceCount++;
    }
    
    Serial.printf("📊 Total: %d dispositifs d'irrigation chargés\n\n", irrigationDeviceCount);
}

// =====================================================
// CHARGEMENT CONFIG ÉCLAIRAGE
// =====================================================

void loadLightingConfigFromFirebase() {
    Serial.println("🔄 Chargement config ÉCLAIRAGE...");
    
    String mode = FirebaseService::getLightingMode();
    if(mode.length() > 0) currentMode = mode;
    delay(200);
    
    if(currentMode == "MANUAL") {
        FirebaseService::getManualSchedule(manualStartTime, manualEndTime);
        delay(200);
        Serial.printf("   Mode: MANUAL (%s → %s)\n", manualStartTime.c_str(), manualEndTime.c_str());
    } else if(currentMode == "SUNSET_SUNRISE") {
        String subMode = FirebaseService::getSolarSubMode();
        if(subMode.length() > 0) currentSolarSubMode = subMode;
        delay(200);
        
        int delay_val = FirebaseService::getSolarDelay();
        if(delay_val >= 0) currentSolarDelay = delay_val;
        delay(200);
        Serial.printf("   Mode: SUNSET_SUNRISE (SubMode: %s, Delay: %d min)\n", 
                     currentSolarSubMode.c_str(), currentSolarDelay);
    }
    
    Serial.println("✅ Config ÉCLAIRAGE chargée");
}

// =====================================================
// CHARGEMENT CONFIG IRRIGATION
// =====================================================

void loadIrrigationConfigFromFirebase() {
    Serial.println("🔄 Chargement config IRRIGATION...");
    
    String irrigMode = FirebaseService::getIrrigationMode();
    if(irrigMode.length() > 0) irrigationMode = irrigMode;
    delay(200);
    
    if(irrigationMode == "MANUAL") {
        FirebaseService::getIrrigationManualSchedule(irrigationManualStart, irrigationManualEnd);
        delay(200);
        Serial.printf("   Mode: MANUAL (%s → %s)\n", irrigationManualStart.c_str(), irrigationManualEnd.c_str());
    } else if(irrigationMode == "SUNSET_SUNRISE") {
        String subMode = FirebaseService::getIrrigationSolarSubMode();
        if(subMode.length() > 0) irrigationSolarSubMode = subMode;
        delay(200);
        
        int delay_val = FirebaseService::getIrrigationSolarDelay();
        if(delay_val >= 0) irrigationSolarDelay = delay_val;
        delay(200);
        Serial.printf("   Mode: SUNSET_SUNRISE (SubMode: %s, Delay: %d min)\n", 
                     irrigationSolarSubMode.c_str(), irrigationSolarDelay);
    }
    
    Serial.println("✅ Config IRRIGATION chargée");
}

// =====================================================
// CHARGEMENT SONNERIES
// =====================================================

void loadBellsFromFirebase() {
    Serial.println("\n╔════════════════════════════════════════╗");
    Serial.println("║  🔍 CHARGEMENT SONNERIES              ║");
    Serial.println("╚════════════════════════════════════════╝\n");
    
    String normalJson = FirebaseService::getNormalBells();
    delay(200);
    
    BellFirebaseAdapter::loadNormalSchedules(normalJson, normalSchedule, normalCount);

    String specialJson = FirebaseService::getSpecialBells();
    delay(200);
    
    BellFirebaseAdapter::loadSpecialPeriods(specialJson, specialPeriods, specialCount);

    refreshNextBell();
}

// =====================================================
// RAFRAÎCHIR PROCHAINE SONNERIE
// =====================================================

void refreshNextBell() {
    TimeHM now = NTPUtils::now();
    TimeHM next = BellScheduler::getNextBell(now, normalSchedule, normalCount, specialPeriods, specialCount);

    Serial.println("\n════════════════════════════════════════════");
    if(next.hour != -1 && !(next.hour == 0 && next.minute == 0)) {
        Serial.printf("   ⏭️  Prochaine sonnerie mise à jour : %02d:%02d\n", next.hour, next.minute);
    } else {
        Serial.println("   ⚠️  Aucune sonnerie programmée (vérifier Firebase)");
    }
    Serial.println("════════════════════════════════════════════\n");
}

// =====================================================
// MISE À JOUR ÉCLAIRAGE
// =====================================================

void updateLighting() {
    TimeHM now = NTPUtils::now();
    int currentMinutes = now.hour * 60 + now.minute;
    
    // ============================================
    // CALCUL DE L'ÉTAT GLOBAL
    // ============================================
    
    bool shouldBeOn = false;
    
    if(currentMode == "MANUAL") {
        int startMinutes = manualStartTime.substring(0,2).toInt()*60 + manualStartTime.substring(3,5).toInt();
        int endMinutes = manualEndTime.substring(0,2).toInt()*60 + manualEndTime.substring(3,5).toInt();
        
        shouldBeOn = (startMinutes <= endMinutes) ?
            (currentMinutes >= startMinutes && currentMinutes < endMinutes) :
            (currentMinutes >= startMinutes || currentMinutes < endMinutes);
            
    } else if(currentMode == "SUNSET_SUNRISE") {
        sunTimes.sunset = SunCalculator::getSunset();
        sunTimes.sunrise = SunCalculator::getSunrise();

        int sunsetMinutes = sunTimes.sunset.hour*60 + sunTimes.sunset.minute;
        int sunriseMinutes = sunTimes.sunrise.hour*60 + sunTimes.sunrise.minute;
        int beforeSunset = sunsetMinutes - currentSolarDelay;
        int afterSunset  = sunsetMinutes + currentSolarDelay;
        int beforeSunrise= sunriseMinutes - currentSolarDelay;
        int afterSunrise = sunriseMinutes + currentSolarDelay;

        if(currentSolarSubMode == "SUNSET_TO_SUNRISE") {
            shouldBeOn = (currentMinutes >= beforeSunset || currentMinutes < sunriseMinutes);
        } else if(currentSolarSubMode == "BEFORE_SUNSET") {
            shouldBeOn = (currentMinutes >= beforeSunset && currentMinutes < sunsetMinutes);
        } else if(currentSolarSubMode == "AFTER_SUNSET") {
            shouldBeOn = (currentMinutes >= afterSunset || currentMinutes < sunriseMinutes);
        } else if(currentSolarSubMode == "BEFORE_SUNRISE") {
            shouldBeOn = (currentMinutes >= sunsetMinutes && currentMinutes < beforeSunrise);
        } else if(currentSolarSubMode == "AFTER_SUNRISE") {
            shouldBeOn = (currentMinutes >= sunsetMinutes || currentMinutes < afterSunrise);
        }
    }
    
    // ============================================
    // APPLIQUER L'ÉTAT À TOUS LES DISPOSITIFS ACTIFS
    // ============================================
    
    for (int i = 0; i < lightingDeviceCount; i++) {
        if (lightingDevices[i].isActive) {
            // Dispositif actif → appliquer l'état calculé
            digitalWrite(lightingDevices[i].pin, shouldBeOn ? HIGH : LOW);
            lightingDevices[i].currentState = shouldBeOn;
        } else {
            // Dispositif inactif → toujours éteint
            digitalWrite(lightingDevices[i].pin, LOW);
            lightingDevices[i].currentState = false;
        }
    }
    
    // Mettre à jour l'état global
    lightingState = shouldBeOn;
}

// =====================================================
// MISE À JOUR IRRIGATION
// =====================================================

void updateIrrigation() {
    TimeHM now = NTPUtils::now();
    int currentMinutes = now.hour * 60 + now.minute;
    
    // ============================================
    // CALCUL DE L'ÉTAT GLOBAL
    // ============================================
    
    bool shouldBeOn = false;
    
    if(irrigationMode == "MANUAL") {
        int startMinutes = irrigationManualStart.substring(0,2).toInt()*60 + irrigationManualStart.substring(3,5).toInt();
        int endMinutes = irrigationManualEnd.substring(0,2).toInt()*60 + irrigationManualEnd.substring(3,5).toInt();
        
        shouldBeOn = (startMinutes <= endMinutes) ?
            (currentMinutes >= startMinutes && currentMinutes < endMinutes) :
            (currentMinutes >= startMinutes || currentMinutes < endMinutes);
            
    } else if(irrigationMode == "SUNSET_SUNRISE") {
        sunTimes.sunset = SunCalculator::getSunset();
        sunTimes.sunrise = SunCalculator::getSunrise();

        int sunsetMinutes = sunTimes.sunset.hour*60 + sunTimes.sunset.minute;
        int sunriseMinutes = sunTimes.sunrise.hour*60 + sunTimes.sunrise.minute;
        int beforeSunset = sunsetMinutes - irrigationSolarDelay;
        int afterSunset  = sunsetMinutes + irrigationSolarDelay;
        int beforeSunrise= sunriseMinutes - irrigationSolarDelay;
        int afterSunrise = sunriseMinutes + irrigationSolarDelay;

        if(irrigationSolarSubMode == "SUNSET_TO_SUNRISE") {
            shouldBeOn = (currentMinutes >= beforeSunset || currentMinutes < sunriseMinutes);
        } else if(irrigationSolarSubMode == "BEFORE_SUNSET") {
            shouldBeOn = (currentMinutes >= beforeSunset && currentMinutes < sunsetMinutes);
        } else if(irrigationSolarSubMode == "AFTER_SUNSET") {
            shouldBeOn = (currentMinutes >= afterSunset || currentMinutes < sunriseMinutes);
        } else if(irrigationSolarSubMode == "BEFORE_SUNRISE") {
            shouldBeOn = (currentMinutes >= sunsetMinutes && currentMinutes < beforeSunrise);
        } else if(irrigationSolarSubMode == "AFTER_SUNRISE") {
            shouldBeOn = (currentMinutes >= sunsetMinutes || currentMinutes < afterSunrise);
        }
    }
    
    // ============================================
    // APPLIQUER L'ÉTAT À TOUS LES DISPOSITIFS ACTIFS
    // ============================================
    
    for (int i = 0; i < irrigationDeviceCount; i++) {
        if (irrigationDevices[i].isActive) {
            // Dispositif actif → appliquer l'état calculé
            digitalWrite(irrigationDevices[i].pin, shouldBeOn ? HIGH : LOW);
            irrigationDevices[i].currentState = shouldBeOn;
        } else {
            // Dispositif inactif → toujours éteint
            digitalWrite(irrigationDevices[i].pin, LOW);
            irrigationDevices[i].currentState = false;
        }
    }
    
    // Mettre à jour l'état global
    irrigationState = shouldBeOn;
}

// =====================================================
// MISE À JOUR SONNERIE
// =====================================================

void updateBell() {
    TimeHM now = NTPUtils::now();
    unsigned long currentMillis = millis();

    // Arrêt de la sonnerie après durée
    if(bellIsRinging && (currentMillis - bellStartTime) >= BELL_DURATION){
        digitalWrite(BELL_PIN, LOW);
        bellIsRinging = false;
        Serial.printf("\n🔕 SONNERIE TERMINÉE à %02d:%02d\n", now.hour, now.minute);
        refreshNextBell();
    }

    // Vérification déclenchement
    if(now.minute != lastCheckedMinute && !bellIsRinging){
        lastCheckedMinute = now.minute;
        bool shouldRing = BellScheduler::shouldRing(now, normalSchedule, normalCount, specialPeriods, specialCount);
        if(shouldRing){
            digitalWrite(BELL_PIN, HIGH);
            bellIsRinging = true;
            bellStartTime = currentMillis;
            Serial.printf("\n🔔 SONNERIE DÉCLENCHÉE à %02d:%02d\n", now.hour, now.minute);
        }
    }
}

// =====================================================
// SETUP
// =====================================================

void setup() {
    Serial.begin(115200);
    delay(1000);

    // Configuration pin sonnerie
    pinMode(BELL_PIN, OUTPUT);
    digitalWrite(BELL_PIN, LOW);

    // 🔹 CONNEXION WIFI
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("🌐 Connexion WiFi");
    while(WiFi.status() != WL_CONNECTED){
        delay(500); 
        Serial.print(".");
    }
    Serial.println("\n✅ WiFi connecté");
    Serial.print("🧠 Mémoire libre : ");
    Serial.print(ESP.getFreeHeap());
    Serial.println(" bytes");

    // 🔹 SYNCHRONISATION NTP
    Serial.println("⏰ Synchronisation NTP...");
    configTime(3600, 3600, "fr.pool.ntp.org", "pool.ntp.org");
    
    time_t maintenant = time(nullptr);
    int tentatives = 0;
    while (maintenant < 8 * 3600 * 2 && tentatives < 20) {
        delay(500);
        Serial.print(".");
        maintenant = time(nullptr);
        tentatives++;
    }
    
    if(maintenant < 8 * 3600 * 2) {
        Serial.println("\n⚠️ Échec synchronisation NTP");
    } else {
        struct tm infoTemps;
        gmtime_r(&maintenant, &infoTemps);
        Serial.print("\n✅ Heure synchronisée : ");
        Serial.println(asctime(&infoTemps));
    }

    // 🔹 Initialiser NTPUtils et SunCalculator
    NTPUtils::init(3600, 0);
    SunCalculator::init(36.81897, 10.16579);
    
    // 🔹 Initialisation Firebase
    Serial.println("🔥 Initialisation Firebase...");
    FirebaseService::begin(FIREBASE_API_KEY, FIREBASE_DATABASE_URL);

    // 🔹 Chargement initial de la configuration
    delay(1000);
    
    loadLightingConfigFromFirebase();
    delay(500);
    loadLightingDevices();
    delay(500);
    
    loadIrrigationConfigFromFirebase();
    delay(500);
    loadIrrigationDevices();
    delay(500);
    
    loadBellsFromFirebase();
    
    // 🔹 Configuration des callbacks
    Serial.println("\n🎧 Configuration des callbacks...");
    FirebaseService::setLightingConfigCallback(onLightingConfigChanged);
    FirebaseService::setIrrigationConfigCallback(onIrrigationConfigChanged);
    FirebaseService::setBellsConfigCallback(onBellsConfigChanged);
    
    delay(500);
    FirebaseService::startListeners();
    
    Serial.println("\n✅ SYSTÈME INITIALISÉ - MODE TEMPS RÉEL ACTIF\n");
    Serial.print("🧠 Mémoire libre après init : ");
    Serial.print(ESP.getFreeHeap());
    Serial.println(" bytes");
}

// =====================================================
// LOOP
// =====================================================

void loop() {
    // 🔹 GESTION DES STREAMS EN TEMPS RÉEL (PRIORITAIRE)
    FirebaseService::handleStreams();
    
    // 🔹 Mise à jour des systèmes
    updateLighting();
    updateIrrigation();
    updateBell();

    unsigned long nowMillis = millis();
    
    // ✅ CORRECTION : Variable static pour éviter la réinitialisation
    static unsigned long lastStateUpdate = 0;
    
    // 🔹 Envoyer l'état à Firebase toutes les 10 secondes
    if(nowMillis - lastStateUpdate > STATE_UPDATE_INTERVAL) {
        lastStateUpdate = nowMillis;
        
        String lightingStateStr = lightingState ? "on" : "off";
        String irrigationStateStr = irrigationState ? "on" : "off";
        
        Serial.printf("\n📤 Envoi état à Firebase : Éclairage=%s, Irrigation=%s\n", 
                     lightingStateStr.c_str(), irrigationStateStr.c_str());
        
        FirebaseService::setLightingState(lightingStateStr);
        delay(200);
        FirebaseService::setIrrigationState(irrigationStateStr);
        delay(200);
        
        Serial.println("✅ État synchronisé avec Firebase");
    }

    // 🔹 Affichage état global
    static unsigned long lastDisplay = 0;
    unsigned long displayInterval = bellIsRinging ? 1000 : 5000;
    
    if(millis() - lastDisplay < displayInterval) {
        delay(100);
        return;
    }
    lastDisplay = millis();

    TimeHM now = NTPUtils::now();

    Serial.println("\n╔═══════════════════════════════════════╗");
    Serial.println("║   SYSTÈME - MODE TEMPS RÉEL          ║");
    Serial.println("╚═══════════════════════════════════════╝");

    // ============================================
    // ÉCLAIRAGE
    // ============================================
    Serial.println("\n💡 ÉCLAIRAGE");
    Serial.printf("   État global : %s | Mode : %s\n", 
                 lightingState ? "ON 💡" : "OFF 🌑", currentMode.c_str());
    
    if(currentMode == "MANUAL") {
        Serial.printf("   Horaires: %s → %s\n", manualStartTime.c_str(), manualEndTime.c_str());
    } else {
        Serial.printf("   ☀️ Horaires solaires\n");
        Serial.printf("   Lever : %02d:%02d | Coucher : %02d:%02d\n",
                     sunTimes.sunrise.hour, sunTimes.sunrise.minute, 
                     sunTimes.sunset.hour, sunTimes.sunset.minute);
        Serial.printf("   SubMode : %s | Delay : %d min\n", 
                     currentSolarSubMode.c_str(), currentSolarDelay);
    }
    
    // Afficher état de chaque dispositif
    Serial.printf("   📋 Dispositifs (%d):\n", lightingDeviceCount);
    for(int i = 0; i < lightingDeviceCount; i++) {
        Serial.printf("      %s %s (Pin %d) - %s %s\n",
                     lightingDevices[i].isActive ? "✅" : "⏸️ ",
                     lightingDevices[i].name.c_str(),
                     lightingDevices[i].pin,
                     lightingDevices[i].isActive ? (lightingDevices[i].currentState ? "ON" : "OFF") : "INACTIF",
                     lightingDevices[i].currentState ? "💡" : "");
    }

    // ============================================
    // IRRIGATION
    // ============================================
    Serial.println("\n💧 IRRIGATION");
    Serial.printf("   État global : %s | Mode : %s\n", 
                 irrigationState ? "ON 💧" : "OFF 🚫", irrigationMode.c_str());
    
    if(irrigationMode == "MANUAL") {
        Serial.printf("   Horaires: %s → %s\n", 
                     irrigationManualStart.c_str(), irrigationManualEnd.c_str());
    } else {
        Serial.printf("   ☀️ Horaires solaires\n");
        Serial.printf("   SubMode : %s | Delay : %d min\n", 
                     irrigationSolarSubMode.c_str(), irrigationSolarDelay);
    }
    
    // Afficher état de chaque dispositif
    Serial.printf("   📋 Dispositifs (%d):\n", irrigationDeviceCount);
    for(int i = 0; i < irrigationDeviceCount; i++) {
        Serial.printf("      %s %s (Pin %d) - %s %s\n",
                     irrigationDevices[i].isActive ? "✅" : "⏸️ ",
                     irrigationDevices[i].name.c_str(),
                     irrigationDevices[i].pin,
                     irrigationDevices[i].isActive ? (irrigationDevices[i].currentState ? "ON" : "OFF") : "INACTIF",
                     irrigationDevices[i].currentState ? "💧" : "");
    }

    // ============================================
    // SONNERIE
    // ============================================
    Serial.println("\n🔔 SONNERIE");
    if(bellIsRinging) {
        unsigned long elapsedSeconds = (millis() - bellStartTime) / 1000;
        Serial.printf("   🔊 EN COURS (depuis %lu sec)\n", elapsedSeconds);
    }
    
    TimeHM nextBell = BellScheduler::getNextBell(now, normalSchedule, normalCount, specialPeriods, specialCount);
    if(nextBell.hour != -1 && !(nextBell.hour == 0 && nextBell.minute == 0)) {
        Serial.printf("   ⏭️  Prochaine sonnerie : %02d:%02d\n", nextBell.hour, nextBell.minute);
    } else {
        Serial.println("   ⚠️  Aucune sonnerie programmée");
    }

    Serial.println("\n═══════════════════════════════════════\n");
}
