#define FB_TCP_CLIENT_RX_BUFFER_SIZE 4096
#define FB_TCP_CLIENT_TX_BUFFER_SIZE 1024

#include <WiFi.h>
#include "FirebaseService.h"
#include "Config.h"
#include "NTPUtils.h"
#include "SunCalculator.h"
#include "TimeHM.h"
#include "SunTimes.h"
#include "OperationMode.h"
#include "BellScheduler.h"
#include "BellFirebaseAdapter.h"

#define LED_PIN 2
#define IRRIGATION_PIN 4
#define BELL_PIN 18

// ================= Variables ÉCLAIRAGE =================
String currentMode = "MANUAL";
String currentSolarSubMode = "SUNSET_TO_SUNRISE";
int currentSolarDelay = 0;
String manualStartTime = "18:00";
String manualEndTime = "23:00";
bool lightingState = false;

// ================= Variables IRRIGATION =================
String irrigationMode = "MANUAL";
String irrigationSolarSubMode = "BEFORE_SUNRISE";
int irrigationSolarDelay = 0;
String irrigationManualStart = "06:00";
String irrigationManualEnd = "06:30";
bool irrigationState = false;

// ================= Variables SONNERIE =================
BellNormalSchedule normalSchedule[20];
BellSpecialPeriod specialPeriods[10];
int normalCount = 0;
int specialCount = 0;

bool bellIsRinging = false;
unsigned long bellStartTime = 0;
const unsigned long BELL_DURATION = 10000; // 10 secondes
int lastCheckedMinute = -1;
bool bellJustFinished = false;
unsigned long bellFinishTime = 0;

SunTimes sunTimes;

// ================= Déclarations forward =================
TimeHM getNextBellLocal(
    const TimeHM& now,
    const BellNormalSchedule normal[], int normalCount,
    const BellSpecialPeriod special[], int specialCount
);

void loadBellsFromFirebase();
void loadLightingConfigFromFirebase();
void loadIrrigationConfigFromFirebase();
void refreshNextBell();
void addNormalBellLocal(const BellNormalSchedule& newBell);
void addSpecialPeriodLocal(const BellSpecialPeriod& newPeriod);
void updateLighting();
void updateIrrigation();
void updateBell();
OperationMode parseOperationMode(const String& mode);

// ================= CALLBACKS POUR LES CHANGEMENTS FIREBASE =================

void onLightingConfigChanged() {
    Serial.println("📡 Configuration ÉCLAIRAGE modifiée - Rechargement...");
    loadLightingConfigFromFirebase();
}

void onIrrigationConfigChanged() {
    Serial.println("📡 Configuration IRRIGATION modifiée - Rechargement...");
    loadIrrigationConfigFromFirebase();
}

void onBellsConfigChanged() {
    Serial.println("📡 Configuration SONNERIES modifiée - Rechargement...");
    loadBellsFromFirebase();
}

// ================= Recalcul et affichage du prochain bell =================
void refreshNextBell() {
    TimeHM now = NTPUtils::now();
    TimeHM next = getNextBellLocal(now, normalSchedule, normalCount, specialPeriods, specialCount);

    Serial.println("\n════════════════════════════════════════════");
    if(next.hour != -1 && !(next.hour == 0 && next.minute == 0)) {
        Serial.printf("   ⏭️  Prochaine sonnerie mise à jour : %02d:%02d\n", next.hour, next.minute);
    } else {
        Serial.println("   ⚠️  Aucune sonnerie programmée (vérifier Firebase)");
    }
    Serial.println("════════════════════════════════════════════\n");
}

// ================= Ajout local =================
void addNormalBellLocal(const BellNormalSchedule& newBell) {
    if(normalCount < 20) {
        normalSchedule[normalCount++] = newBell;
        Serial.println("✅ Nouvelle sonnerie normale ajoutée");
        refreshNextBell();
    } else {
        Serial.println("⚠️ Impossible d'ajouter plus de 20 sonneries normales");
    }
}

void addSpecialPeriodLocal(const BellSpecialPeriod& newPeriod) {
    if(specialCount < 10) {
        specialPeriods[specialCount++] = newPeriod;
        Serial.println("✅ Nouvelle période spéciale ajoutée");
        refreshNextBell();
    } else {
        Serial.println("⚠️ Impossible d'ajouter plus de 10 périodes spéciales");
    }
}

// ================= Calcul local du prochain bell =================
TimeHM getNextBellLocal(
    const TimeHM& now,
    const BellNormalSchedule normal[], int normalCount,
    const BellSpecialPeriod special[], int specialCount
) {
    TimeHM nextBell;
    nextBell.hour = -1;
    nextBell.minute = -1;
    int currentMinutes = now.hour*60 + now.minute;
    int minDiff = 24*60*7;

    // Périodes spéciales
    for(int i=0; i<specialCount; i++){
        const BellSpecialPeriod &sp = special[i];
        bool inPeriod = false;
        if ((now.month > sp.startDate.mois || (now.month == sp.startDate.mois && now.day >= sp.startDate.jour)) &&
            (now.month < sp.endDate.mois   || (now.month == sp.endDate.mois   && now.day <= sp.endDate.jour))) {
            inPeriod = true;
        }
        if(inPeriod){
            int weekday = now.dayOfWeek;
            TimeHM bellTime = sp.dailySchedule[weekday].start;
            if(bellTime.hour >= 0 && bellTime.minute >= 0) {
                int bellMinutes = bellTime.hour*60 + bellTime.minute;
                int diff = bellMinutes - currentMinutes;
                if(diff <= 0) diff += 24*60;
                if(diff > 0 && diff < minDiff){
                    minDiff = diff;
                    nextBell = bellTime;
                }
            }
        }
    }

    // Sonneries normales
    for(int i=0; i<normalCount; i++){
        const BellNormalSchedule &bell = normal[i];
        TimeHM bellTime = bell.start;
        if(bellTime.hour == 0 && bellTime.minute == 0) continue;

        if(bellTime.hour >= 0 && bellTime.hour < 24 && bellTime.minute >= 0 && bellTime.minute < 60){
            int bellMinutes = bellTime.hour*60 + bellTime.minute;
            int diff;
            if(bell.dayOfWeek == -1){
                diff = bellMinutes - currentMinutes;
                if(diff <= 0) diff += 24*60;
            } else {
                int currentDay = now.dayOfWeek;
                int targetDay = bell.dayOfWeek;
                int dayDiff = targetDay - currentDay;
                if(dayDiff < 0) dayDiff += 7;
                if(dayDiff == 0 && bellMinutes <= currentMinutes) dayDiff = 7;
                diff = dayDiff*24*60 + (bellMinutes - currentMinutes);
            }
            if(diff > 0 && diff < minDiff){
                minDiff = diff;
                nextBell = bellTime;
            }
        }
    }
    return nextBell;
}

// ================= Charger la config ÉCLAIRAGE depuis Firebase =================
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

// ================= Charger la config IRRIGATION depuis Firebase =================
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

// ================= Charger les bells depuis Firebase =================
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

// ================= SONNERIE =================
void updateBell() {
    TimeHM now = NTPUtils::now();
    unsigned long currentMillis = millis();

    // Arrêt de la sonnerie après durée
    if(bellIsRinging && (currentMillis - bellStartTime) >= BELL_DURATION){
        digitalWrite(BELL_PIN, LOW);
        bellIsRinging = false;
        bellJustFinished = true;
        bellFinishTime = currentMillis;
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
            bellJustFinished = false;
            Serial.printf("\n🔔 SONNERIE DÉCLENCHÉE à %02d:%02d\n", now.hour, now.minute);
        }
    }
}

// ================= ÉCLAIRAGE =================
void updateLighting() {
    TimeHM now = NTPUtils::now();
    int currentMinutes = now.hour*60 + now.minute;

    if(currentMode=="MANUAL"){
        int startMinutes = manualStartTime.substring(0,2).toInt()*60 + manualStartTime.substring(3,5).toInt();
        int endMinutes = manualEndTime.substring(0,2).toInt()*60 + manualEndTime.substring(3,5).toInt();
        lightingState = (startMinutes <= endMinutes) ?
            (currentMinutes >= startMinutes && currentMinutes < endMinutes) :
            (currentMinutes >= startMinutes || currentMinutes < endMinutes);
    } else if(currentMode=="SUNSET_SUNRISE"){
        sunTimes.sunset = SunCalculator::getSunset();
        sunTimes.sunrise = SunCalculator::getSunrise();

        int sunsetMinutes = sunTimes.sunset.hour*60 + sunTimes.sunset.minute;
        int sunriseMinutes = sunTimes.sunrise.hour*60 + sunTimes.sunrise.minute;
        int beforeSunset = sunsetMinutes - currentSolarDelay;
        int afterSunset  = sunsetMinutes + currentSolarDelay;
        int beforeSunrise= sunriseMinutes - currentSolarDelay;
        int afterSunrise = sunriseMinutes + currentSolarDelay;

        if(currentSolarSubMode=="SUNSET_TO_SUNRISE") lightingState = (currentMinutes>=beforeSunset || currentMinutes<sunriseMinutes);
        else if(currentSolarSubMode=="BEFORE_SUNSET") lightingState = (currentMinutes>=beforeSunset && currentMinutes<sunsetMinutes);
        else if(currentSolarSubMode=="AFTER_SUNSET") lightingState = (currentMinutes>=afterSunset || currentMinutes<sunriseMinutes);
        else if(currentSolarSubMode=="BEFORE_SUNRISE") lightingState = (currentMinutes>=sunsetMinutes && currentMinutes<beforeSunrise);
        else if(currentSolarSubMode=="AFTER_SUNRISE") lightingState = (currentMinutes>=sunsetMinutes || currentMinutes<afterSunrise);
    }
    digitalWrite(LED_PIN, lightingState ? HIGH : LOW);
}

// ================= IRRIGATION =================
void updateIrrigation() {
    TimeHM now = NTPUtils::now();
    int currentMinutes = now.hour*60 + now.minute;

    if(irrigationMode=="MANUAL"){
        int startMinutes = irrigationManualStart.substring(0,2).toInt()*60 + irrigationManualStart.substring(3,5).toInt();
        int endMinutes = irrigationManualEnd.substring(0,2).toInt()*60 + irrigationManualEnd.substring(3,5).toInt();
        irrigationState = (startMinutes <= endMinutes) ?
            (currentMinutes >= startMinutes && currentMinutes < endMinutes) :
            (currentMinutes >= startMinutes || currentMinutes < endMinutes);
    } else if(irrigationMode=="SUNSET_SUNRISE"){
        sunTimes.sunset = SunCalculator::getSunset();
        sunTimes.sunrise = SunCalculator::getSunrise();

        int sunsetMinutes = sunTimes.sunset.hour*60 + sunTimes.sunset.minute;
        int sunriseMinutes = sunTimes.sunrise.hour*60 + sunTimes.sunrise.minute;
        int beforeSunset = sunsetMinutes - irrigationSolarDelay;
        int afterSunset  = sunsetMinutes + irrigationSolarDelay;
        int beforeSunrise= sunriseMinutes - irrigationSolarDelay;
        int afterSunrise = sunriseMinutes + irrigationSolarDelay;

        if(irrigationSolarSubMode=="SUNSET_TO_SUNRISE") irrigationState = (currentMinutes>=beforeSunset || currentMinutes<sunriseMinutes);
        else if(irrigationSolarSubMode=="BEFORE_SUNSET") irrigationState = (currentMinutes>=beforeSunset && currentMinutes<sunsetMinutes);
        else if(irrigationSolarSubMode=="AFTER_SUNSET") irrigationState = (currentMinutes>=afterSunset || currentMinutes<sunriseMinutes);
        else if(irrigationSolarSubMode=="BEFORE_SUNRISE") irrigationState = (currentMinutes>=sunsetMinutes && currentMinutes<beforeSunrise);
        else if(irrigationSolarSubMode=="AFTER_SUNRISE") irrigationState = (currentMinutes>=sunsetMinutes || currentMinutes<afterSunrise);
    }

    digitalWrite(IRRIGATION_PIN, irrigationState ? HIGH : LOW);
}

// ================= SETUP =================
void setup() {
    Serial.begin(115200);
    delay(1000);

    pinMode(LED_PIN, OUTPUT);
    pinMode(IRRIGATION_PIN, OUTPUT);
    pinMode(BELL_PIN, OUTPUT);

    digitalWrite(LED_PIN, LOW);
    digitalWrite(IRRIGATION_PIN, LOW);
    digitalWrite(BELL_PIN, LOW);

    // 🔹 CONNEXION WIFI
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while(WiFi.status()!=WL_CONNECTED){
        delay(500); 
        Serial.print(".");
    }
    Serial.println("\nWiFi connecté");
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
    loadIrrigationConfigFromFirebase();
    delay(500);
    loadBellsFromFirebase();
    
    // 🔹 DÉMARRAGE DES LISTENERS EN TEMPS RÉEL
    Serial.println("\n🎧 Configuration des callbacks...");
    FirebaseService::setLightingConfigCallback(onLightingConfigChanged);
    FirebaseService::setIrrigationConfigCallback(onIrrigationConfigChanged);
    FirebaseService::setBellsConfigCallback(onBellsConfigChanged);
    
    delay(500);
    FirebaseService::startListeners();
    
    Serial.println("\n✅ SYSTÈME INITIALISÉ - MODE TEMPS RÉEL ACTIF\n");
}

// ================= LOOP =================
unsigned long lastStateUpdate = 0;
const unsigned long STATE_UPDATE_INTERVAL = 10000; // 10 secondes

void loop() {
    // 🔹 GESTION DES STREAMS EN TEMPS RÉEL (PRIORITAIRE)
    FirebaseService::handleStreams();
    
    // 🔹 Mise à jour des systèmes
    updateLighting();
    updateIrrigation();
    updateBell();

    unsigned long nowMillis = millis();
    
    // 🔹 Envoyer l'état à Firebase
    if(nowMillis - lastStateUpdate > STATE_UPDATE_INTERVAL) {
        lastStateUpdate = nowMillis;
        FirebaseService::setLightingState(lightingState?"on":"off");
        delay(200);
        FirebaseService::setIrrigationState(irrigationState?"on":"off");
        delay(200);
    }

    // 🔹 Affichage état global toutes les secondes pendant la sonnerie, sinon toutes les 5 secondes
    static unsigned long lastDisplay = 0;
    unsigned long displayInterval = bellIsRinging ? 1000 : 5000; // 1s pendant sonnerie, 5s sinon
    
    if(millis() - lastDisplay < displayInterval) {
        delay(100);
        return;
    }
    lastDisplay = millis();

    TimeHM now = NTPUtils::now();

    Serial.println("\n╔═══════════════════════════════════════╗");
    Serial.println("║   SYSTÈME - MODE TEMPS RÉEL          ║");
    Serial.println("╚═══════════════════════════════════════╝");

    // ÉCLAIRAGE
    Serial.println("\n💡 ÉCLAIRAGE");
    Serial.printf("   État : %s | Mode : %s\n", lightingState?"ON 💡":"OFF 🌑", currentMode.c_str());
    if(currentMode=="MANUAL") Serial.printf("   Horaires: %s → %s\n", manualStartTime.c_str(), manualEndTime.c_str());
    else Serial.printf("   ☀️ Horaires solaires\n   Lever : %02d:%02d | Coucher : %02d:%02d\n   SubMode : %s | Delay : %d min\n",
        sunTimes.sunrise.hour, sunTimes.sunrise.minute, sunTimes.sunset.hour, sunTimes.sunset.minute, currentSolarSubMode.c_str(), currentSolarDelay);

    // IRRIGATION
    Serial.println("\n💧 IRRIGATION");
    Serial.printf("   État : %s | Mode : %s\n", irrigationState?"ON 💧":"OFF 🚫", irrigationMode.c_str());
    if(irrigationMode=="MANUAL") Serial.printf("   Horaires: %s → %s\n", irrigationManualStart.c_str(), irrigationManualEnd.c_str());

    // SONNERIE
    Serial.println("\n🔔 SONNERIE");
    if(bellIsRinging) {
        unsigned long elapsedSeconds = (millis() - bellStartTime) / 1000;
        Serial.printf("   🔊 EN COURS (depuis %lu sec)\n", elapsedSeconds);
    }
    
    TimeHM nextBell = getNextBellLocal(now, normalSchedule, normalCount, specialPeriods, specialCount);
    if(nextBell.hour != -1 && !(nextBell.hour == 0 && nextBell.minute == 0)) {
        Serial.printf("   ⏭️  Prochaine sonnerie : %02d:%02d\n", nextBell.hour, nextBell.minute);
    } else {
        Serial.println("   ⚠️  Aucune sonnerie programmée");
    }

    Serial.println("\n═══════════════════════════════════════\n");
}
