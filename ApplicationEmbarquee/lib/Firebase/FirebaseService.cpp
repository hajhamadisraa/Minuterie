#include "FirebaseService.h"
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include <ArduinoJson.h>

// =====================================================
// OBJETS FIREBASE INTERNES
// =====================================================
FirebaseData fbData;
FirebaseData streamLighting, streamIrrigation, streamBells;
FirebaseAuth fbAuth;
FirebaseConfig fbConfig;

// =====================================================
// CALLBACKS INTERNES
// =====================================================
static std::function<void(String)> lightingCb = nullptr;
static std::function<void(String)> irrigationCb = nullptr;
static std::function<void(String)> bellsCb = nullptr;

// =====================================================
// VARIABLES INTERNES
// =====================================================
static String lastError = "";
static bool firebaseReady = false;

// =====================================================
// INITIALISATION
// =====================================================

void FirebaseService::begin(const char* apiKey, const char* databaseURL) {
    Serial.println("🔥 Initialisation FirebaseService...");
    
    fbConfig.api_key = apiKey;
    fbConfig.database_url = databaseURL;
    
    // Configuration timeouts et retry
    fbConfig.timeout.serverResponse = 10 * 1000; // 10 secondes
    fbConfig.timeout.socketConnection = 10 * 1000;
    
    Serial.println("🔐 Tentative d'authentification...");
    
    if (Firebase.signUp(&fbConfig, &fbAuth, "", "")) {
        Serial.println("✅ Firebase Auth OK");
        firebaseReady = true;
        
        Firebase.begin(&fbConfig, &fbAuth);
        Firebase.reconnectWiFi(true);
        
        // Configuration additionnelle
        fbConfig.signer.tokens.legacy_token = "";
        
        Serial.println("✅ Firebase configuré avec succès");
    } else {
        lastError = fbConfig.signer.signupError.message.c_str();
        Serial.printf("❌ Erreur Auth: %s\n", lastError.c_str());
        firebaseReady = false;
    }
}

// =====================================================
// GESTION DES FLUX (STREAMS)
// =====================================================

void FirebaseService::setLightingConfigCallback(std::function<void(String)> cb) { 
    lightingCb = cb; 
}

void FirebaseService::setIrrigationConfigCallback(std::function<void(String)> cb) { 
    irrigationCb = cb; 
}

void FirebaseService::setBellsConfigCallback(std::function<void(String)> cb) { 
    bellsCb = cb; 
}

void FirebaseService::startListeners() {
    if (!firebaseReady) {
        Serial.println("⚠️  Firebase non prêt - listeners non démarrés");
        return;
    }
    
    Serial.println("📡 Démarrage des écouteurs Firebase...");
    
    if (!Firebase.RTDB.beginStream(&streamLighting, "lighting")) {
        Serial.println("❌ Échec stream lighting");
        lastError = fbData.errorReason();
    } else {
        Serial.println("  ✓ Stream lighting OK");
    }
    
    if (!Firebase.RTDB.beginStream(&streamIrrigation, "irrigation")) {
        Serial.println("❌ Échec stream irrigation");
        lastError = fbData.errorReason();
    } else {
        Serial.println("  ✓ Stream irrigation OK");
    }
    
    if (!Firebase.RTDB.beginStream(&streamBells, "bells")) {
        Serial.println("❌ Échec stream bells");
        lastError = fbData.errorReason();
    } else {
        Serial.println("  ✓ Stream bells OK");
    }
    
    Serial.println("✅ Écouteurs Firebase démarrés");
}

void FirebaseService::handleStreams() {
    if (!firebaseReady) return;
    
    // Stream Éclairage
    if (Firebase.RTDB.readStream(&streamLighting)) {
        if (streamLighting.streamAvailable()) {
            if (lightingCb) {
                lightingCb(streamLighting.jsonString());
            }
        }
    }
    
    // Stream Irrigation
    if (Firebase.RTDB.readStream(&streamIrrigation)) {
        if (streamIrrigation.streamAvailable()) {
            if (irrigationCb) {
                irrigationCb(streamIrrigation.jsonString());
            }
        }
    }
    
    // Stream Sonneries
    if (Firebase.RTDB.readStream(&streamBells)) {
        if (streamBells.streamAvailable()) {
            if (bellsCb) {
                bellsCb(streamBells.jsonString());
            }
        }
    }
}

// =====================================================
// GETTERS ÉCLAIRAGE
// =====================================================

String FirebaseService::getLightingMode() {
    if (!firebaseReady) return "MANUAL";
    
    if (Firebase.RTDB.getString(&fbData, "lighting/mode")) {
        return fbData.stringData();
    }
    
    lastError = fbData.errorReason();
    return "MANUAL";
}

String FirebaseService::getLightingDevicesJson() {
    if (!firebaseReady) return "{}";
    
    if (Firebase.RTDB.getJSON(&fbData, "lighting/devices")) {
        String json = fbData.jsonString();
        
        // Vérifier que ce n'est pas vide ou null
        if (json.length() > 5 && json != "null") {
            return json;
        }
    }
    
    lastError = fbData.errorReason();
    return "{}";
}

String FirebaseService::getSolarSubMode() {
    if (!firebaseReady) return "SUNSET_TO_SUNRISE";
    
    if (Firebase.RTDB.getString(&fbData, "lighting/schedules/sunset_to_sunrise/subMode")) {
        return fbData.stringData();
    }
    
    return "SUNSET_TO_SUNRISE";
}

int FirebaseService::getSolarDelay() {
    if (!firebaseReady) return 0;
    
    if (Firebase.RTDB.getInt(&fbData, "lighting/schedules/sunset_to_sunrise/delay")) {
        return fbData.intData();
    }
    
    return 0;
}

String FirebaseService::getManualStartTime() {
    if (!firebaseReady) return "18:30";
    
    if (Firebase.RTDB.getString(&fbData, "lighting/schedules/manual/startTime")) {
        return fbData.stringData();
    }
    
    return "18:30";
}

String FirebaseService::getManualEndTime() {
    if (!firebaseReady) return "06:30";
    
    if (Firebase.RTDB.getString(&fbData, "lighting/schedules/manual/endTime")) {
        return fbData.stringData();
    }
    
    return "06:30";
}

void FirebaseService::getManualSchedule(String& startTime, String& endTime) {
    if (!firebaseReady) {
        startTime = "18:30";
        endTime = "06:30";
        return;
    }
    
    startTime = getManualStartTime();
    endTime = getManualEndTime();
}

String FirebaseService::getLightingDevice(const String& deviceId) {
    if (!firebaseReady) return "{}";
    
    // CLEAN APPROACH: Build string step by step
    String path = "lighting/devices/";
    path += deviceId;
    
    if (Firebase.RTDB.getJSON(&fbData, path.c_str())) {
        return fbData.jsonString();
    }
    
    lastError = fbData.errorReason();
    return "{}";
}

bool FirebaseService::setLightingDeviceActive(const String& deviceId, bool isActive) {
    if (!firebaseReady) return false;
    
    // CLEAN APPROACH: Build string step by step
    String path = "lighting/devices/";
    path += deviceId;
    path += "/isActive";
    
    if (Firebase.RTDB.setBool(&fbData, path.c_str(), isActive)) {
        return true;
    }
    
    lastError = fbData.errorReason();
    return false;
}

bool FirebaseService::addLightingDevice(const String& deviceId, const String& name, 
                                        int pin, bool isActive) {
    if (!firebaseReady) return false;
    
    // CLEAN APPROACH: Build string step by step
    String path = "lighting/devices/";
    path += deviceId;
    
    // Créer JSON pour le nouveau dispositif
    DynamicJsonDocument doc(512);
    doc["name"] = name;
    doc["pin"] = pin;
    doc["isActive"] = isActive;
    
    String jsonStr;
    serializeJson(doc, jsonStr);
    
    // Use FirebaseJson object
    FirebaseJson json;
    json.setJsonData(jsonStr);
    
    if (Firebase.RTDB.setJSON(&fbData, path.c_str(), &json)) {
        Serial.printf("✅ Dispositif ajouté: %s\n", name.c_str());
        return true;
    }
    
    lastError = fbData.errorReason();
    Serial.printf("❌ Échec ajout dispositif: %s\n", lastError.c_str());
    return false;
}

bool FirebaseService::removeLightingDevice(const String& deviceId) {
    if (!firebaseReady) return false;
    
    // CLEAN APPROACH: Build string step by step
    String path = "lighting/devices/";
    path += deviceId;
    
    if (Firebase.RTDB.deleteNode(&fbData, path.c_str())) {
        Serial.printf("✅ Dispositif supprimé: %s\n", deviceId.c_str());
        return true;
    }
    
    lastError = fbData.errorReason();
    return false;
}

// =====================================================
// GETTERS IRRIGATION
// =====================================================

String FirebaseService::getIrrigationMode() {
    if (!firebaseReady) return "MANUAL";
    
    if (Firebase.RTDB.getString(&fbData, "irrigation/mode")) {
        return fbData.stringData();
    }
    
    return "MANUAL";
}

String FirebaseService::getIrrigationDevicesJson() {
    if (!firebaseReady) return "{}";
    
    if (Firebase.RTDB.getJSON(&fbData, "irrigation/devices")) {
        String json = fbData.jsonString();
        
        if (json.length() > 5 && json != "null") {
            return json;
        }
    }
    
    lastError = fbData.errorReason();
    return "{}";
}

String FirebaseService::getIrrigationSolarSubMode() {
    if (!firebaseReady) return "BEFORE_SUNRISE";
    
    if (Firebase.RTDB.getString(&fbData, "irrigation/schedules/sunset_to_sunrise/subMode")) {
        return fbData.stringData();
    }
    
    return "BEFORE_SUNRISE";
}

int FirebaseService::getIrrigationSolarDelay() {
    if (!firebaseReady) return 0;
    
    if (Firebase.RTDB.getInt(&fbData, "irrigation/schedules/sunset_to_sunrise/delay")) {
        return fbData.intData();
    }
    
    return 0;
}

String FirebaseService::getIrrigationManualStartTime() {
    if (!firebaseReady) return "06:00";
    
    if (Firebase.RTDB.getString(&fbData, "irrigation/schedules/manual/startTime")) {
        return fbData.stringData();
    }
    
    return "06:00";
}

String FirebaseService::getIrrigationManualEndTime() {
    if (!firebaseReady) return "06:30";
    
    if (Firebase.RTDB.getString(&fbData, "irrigation/schedules/manual/endTime")) {
        return fbData.stringData();
    }
    
    return "06:30";
}

void FirebaseService::getIrrigationManualSchedule(String& startTime, String& endTime) {
    if (!firebaseReady) {
        startTime = "06:00";
        endTime = "06:30";
        return;
    }
    
    startTime = getIrrigationManualStartTime();
    endTime = getIrrigationManualEndTime();
}

String FirebaseService::getIrrigationDevice(const String& deviceId) {
    if (!firebaseReady) return "{}";
    
    // CLEAN APPROACH: Build string step by step
    String path = "irrigation/devices/";
    path += deviceId;
    
    if (Firebase.RTDB.getJSON(&fbData, path.c_str())) {
        return fbData.jsonString();
    }
    
    lastError = fbData.errorReason();
    return "{}";
}

bool FirebaseService::setIrrigationDeviceActive(const String& deviceId, bool isActive) {
    if (!firebaseReady) return false;
    
    // CLEAN APPROACH: Build string step by step
    String path = "irrigation/devices/";
    path += deviceId;
    path += "/isActive";
    
    if (Firebase.RTDB.setBool(&fbData, path.c_str(), isActive)) {
        return true;
    }
    
    lastError = fbData.errorReason();
    return false;
}

bool FirebaseService::addIrrigationDevice(const String& deviceId, const String& name,
                                          int pin, bool isActive) {
    if (!firebaseReady) return false;
    
    // CLEAN APPROACH: Build string step by step
    String path = "irrigation/devices/";
    path += deviceId;
    
    DynamicJsonDocument doc(512);
    doc["name"] = name;
    doc["pin"] = pin;
    doc["isActive"] = isActive;
    
    String jsonStr;
    serializeJson(doc, jsonStr);
    
    // Use FirebaseJson object
    FirebaseJson json;
    json.setJsonData(jsonStr);
    
    if (Firebase.RTDB.setJSON(&fbData, path.c_str(), &json)) {
        Serial.printf("✅ Dispositif irrigation ajouté: %s\n", name.c_str());
        return true;
    }
    
    lastError = fbData.errorReason();
    Serial.printf("❌ Échec ajout dispositif irrigation: %s\n", lastError.c_str());
    return false;
}

bool FirebaseService::removeIrrigationDevice(const String& deviceId) {
    if (!firebaseReady) return false;
    
    // CLEAN APPROACH: Build string step by step
    String path = "irrigation/devices/";
    path += deviceId;
    
    if (Firebase.RTDB.deleteNode(&fbData, path.c_str())) {
        Serial.printf("✅ Dispositif irrigation supprimé: %s\n", deviceId.c_str());
        return true;
    }
    
    lastError = fbData.errorReason();
    return false;
}

// =====================================================
// GETTERS SONNERIE
// =====================================================

String FirebaseService::getNormalBells() {
    if (!firebaseReady) return "{}";
    
    if (Firebase.RTDB.getJSON(&fbData, "bells/normal")) {
        String json = fbData.jsonString();
        
        if (json.length() > 5 && json != "null") {
            return json;
        }
    }
    
    return "{}";
}

String FirebaseService::getSpecialBells() {
    if (!firebaseReady) return "{}";
    
    if (Firebase.RTDB.getJSON(&fbData, "bells/special")) {
        String json = fbData.jsonString();
        
        if (json.length() > 5 && json != "null") {
            return json;
        }
    }
    
    return "{}";
}

// =====================================================
// SETTERS (RETOUR D'ÉTAT VERS APP)
// =====================================================

void FirebaseService::setLightingState(bool state) {
    if (!firebaseReady) return;
    
    if (!Firebase.RTDB.setBool(&fbData, "lighting/state", state)) {
        lastError = fbData.errorReason();
        Serial.printf("⚠️  Erreur setLightingState: %s\n", lastError.c_str());
    }
}

void FirebaseService::setLightingState(const String& state) {
    if (!firebaseReady) return;
    
    if (!Firebase.RTDB.setString(&fbData, "lighting/state", state)) {
        lastError = fbData.errorReason();
        Serial.printf("⚠️  Erreur setLightingState: %s\n", lastError.c_str());
    }
}

void FirebaseService::setIrrigationState(bool state) {
    if (!firebaseReady) return;
    
    if (!Firebase.RTDB.setBool(&fbData, "irrigation/state", state)) {
        lastError = fbData.errorReason();
        Serial.printf("⚠️  Erreur setIrrigationState: %s\n", lastError.c_str());
    }
}

void FirebaseService::setIrrigationState(const String& state) {
    if (!firebaseReady) return;
    
    if (!Firebase.RTDB.setString(&fbData, "irrigation/state", state)) {
        lastError = fbData.errorReason();
        Serial.printf("⚠️  Erreur setIrrigationState: %s\n", lastError.c_str());
    }
}

void FirebaseService::setNextBellTime(const String& time) {
    if (!firebaseReady) return;
    
    if (!Firebase.RTDB.setString(&fbData, "status/nextBell", time)) {
        lastError = fbData.errorReason();
    }
}

bool FirebaseService::setDeviceState(const String& category, const String& deviceId, bool state) {
    if (!firebaseReady) return false;
    
    // CLEAN APPROACH: Build string step by step
    String path = category;
    path += "/devices/";
    path += deviceId;
    path += "/currentState";
    
    if (Firebase.RTDB.setBool(&fbData, path.c_str(), state)) {
        return true;
    }
    
    lastError = fbData.errorReason();
    return false;
}

// =====================================================
// UTILITAIRES
// =====================================================

bool FirebaseService::isReady() {
    return firebaseReady && Firebase.ready();
}

String FirebaseService::getLastError() {
    return lastError;
}