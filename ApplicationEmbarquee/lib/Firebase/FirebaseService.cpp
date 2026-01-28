#include "FirebaseService.h"

FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;

// Objets stream statiques
FirebaseData FirebaseService::streamLighting;
FirebaseData FirebaseService::streamIrrigation;
FirebaseData FirebaseService::streamBells;

// Callbacks statiques
ConfigChangeCallback FirebaseService::onLightingChange = nullptr;
ConfigChangeCallback FirebaseService::onIrrigationChange = nullptr;
ConfigChangeCallback FirebaseService::onBellsChange = nullptr;

void FirebaseService::begin(const char* apiKey, const char* databaseURL) {
    config.api_key = apiKey;
    config.database_url = databaseURL;
    
    // 🔹 CONFIGURATION DES TIMEOUTS SSL
    config.timeout.serverResponse = 15 * 1000;
    config.timeout.socketConnection = 15 * 1000;  
    config.timeout.sslHandshake = 60 * 1000;
    config.timeout.rtdbKeepAlive = 45 * 1000;
    config.timeout.rtdbStreamReconnect = 1 * 1000;
    config.timeout.rtdbStreamError = 3 * 1000;
    
    config.cert.data = nullptr;
    
    Serial.print("API Key: ");
    Serial.println(apiKey);
    Serial.print("Database URL: ");
    Serial.println(databaseURL);
    
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    
    Serial.println("Firebase initialisé - Attente du token...");
    delay(2000);
    
    Serial.println("Tentative de signup anonyme...");
    if (Firebase.signUp(&config, &auth, "", "")) {
        Serial.println("✓ Authentification anonyme réussie");
    } else {
        Serial.print("⚠ Erreur signup: ");
        Serial.println(config.signer.signupError.message.c_str());
    }
    
    Serial.println("Attente du token...");
    unsigned long timeout = millis();
    while (!Firebase.ready() && (millis() - timeout) < 30000) {
        delay(500);
        Serial.print(".");
    }
    
    if (Firebase.ready()) {
        Serial.println("\n✓ Firebase prêt!");
    } else {
        Serial.println("\n✗ Timeout - Firebase non prêt");
    }
}

// ==================== GESTION DES CALLBACKS ====================

void FirebaseService::setLightingConfigCallback(ConfigChangeCallback callback) {
    onLightingChange = callback;
}

void FirebaseService::setIrrigationConfigCallback(ConfigChangeCallback callback) {
    onIrrigationChange = callback;
}

void FirebaseService::setBellsConfigCallback(ConfigChangeCallback callback) {
    onBellsChange = callback;
}

// ==================== STREAM TIMEOUT CALLBACK ====================

void FirebaseService::streamTimeoutCallback(bool timeout) {
    if (timeout) {
        Serial.println("⚠ Stream timeout, reconnexion automatique...");
    }
}

// ==================== DÉMARRAGE DES LISTENERS ====================

void FirebaseService::startListeners() {
    if (!Firebase.ready()) {
        Serial.println("⚠ Firebase non prêt pour démarrer les listeners");
        return;
    }
    
    Serial.println("\n🎧 DÉMARRAGE DES LISTENERS EN TEMPS RÉEL");
    
    // 🔹 LISTENER ÉCLAIRAGE - Écoute TOUT le nœud lighting
    // Cela inclut: mode, state, schedules/manual, schedules/sunset_to_sunrise
    if (!Firebase.RTDB.beginStream(&streamLighting, "lighting")) {
        Serial.print("❌ Échec stream lighting: ");
        Serial.println(streamLighting.errorReason());
    } else {
        Serial.println("✅ Listener ÉCLAIRAGE démarré sur /lighting");
    }
    
    delay(300);
    
    // 🔹 LISTENER IRRIGATION - Écoute TOUT le nœud irrigation
    if (!Firebase.RTDB.beginStream(&streamIrrigation, "irrigation")) {
        Serial.print("❌ Échec stream irrigation: ");
        Serial.println(streamIrrigation.errorReason());
    } else {
        Serial.println("✅ Listener IRRIGATION démarré sur /irrigation");
    }
    
    delay(300);
    
    // 🔹 LISTENER SONNERIES - Écoute TOUT le nœud bells
    if (!Firebase.RTDB.beginStream(&streamBells, "bells")) {
        Serial.print("❌ Échec stream bells: ");
        Serial.println(streamBells.errorReason());
    } else {
        Serial.println("✅ Listener SONNERIES démarré sur /bells");
    }
    
    Serial.println("═══════════════════════════════════════\n");
}

// ==================== ARRÊT DES LISTENERS ====================

void FirebaseService::stopListeners() {
    Firebase.RTDB.endStream(&streamLighting);
    Firebase.RTDB.endStream(&streamIrrigation);
    Firebase.RTDB.endStream(&streamBells);
    Serial.println("🔇 Tous les listeners arrêtés");
}

// ==================== GESTION DES STREAMS (À APPELER DANS LOOP) ====================

void FirebaseService::handleStreams() {
    if (!Firebase.ready()) return;
    
    // 🔹 VÉRIFIER LE STREAM ÉCLAIRAGE
    if (Firebase.RTDB.readStream(&streamLighting)) {
        if (streamLighting.streamAvailable()) {
            // 🔍 DEBUG: Afficher le type de données reçues
            String dataType = streamLighting.dataType();
            String dataPath = streamLighting.dataPath();
            
            Serial.println("\n🔔 CHANGEMENT DÉTECTÉ : ÉCLAIRAGE");
            Serial.print("   Type de données: ");
            Serial.println(dataType);
            Serial.print("   Chemin: ");
            Serial.println(dataPath);
            
            // Déclencher le callback pour TOUS les types de changements
            // (json, string, int, bool, etc.)
            if (dataType.length() > 0) {
                if (onLightingChange != nullptr) {
                    onLightingChange();
                }
            }
        }
        
        if (streamLighting.streamTimeout()) {
            streamTimeoutCallback(true);
        }
    }
    
    // 🔹 VÉRIFIER LE STREAM IRRIGATION
    if (Firebase.RTDB.readStream(&streamIrrigation)) {
        if (streamIrrigation.streamAvailable()) {
            String dataType = streamIrrigation.dataType();
            String dataPath = streamIrrigation.dataPath();
            
            Serial.println("\n🔔 CHANGEMENT DÉTECTÉ : IRRIGATION");
            Serial.print("   Type de données: ");
            Serial.println(dataType);
            Serial.print("   Chemin: ");
            Serial.println(dataPath);
            
            if (dataType.length() > 0) {
                if (onIrrigationChange != nullptr) {
                    onIrrigationChange();
                }
            }
        }
        
        if (streamIrrigation.streamTimeout()) {
            streamTimeoutCallback(true);
        }
    }
    
    // 🔹 VÉRIFIER LE STREAM SONNERIES
    if (Firebase.RTDB.readStream(&streamBells)) {
        if (streamBells.streamAvailable()) {
            String dataType = streamBells.dataType();
            String dataPath = streamBells.dataPath();
            
            Serial.println("\n🔔 CHANGEMENT DÉTECTÉ : SONNERIES");
            Serial.print("   Type de données: ");
            Serial.println(dataType);
            Serial.print("   Chemin: ");
            Serial.println(dataPath);
            
            if (dataType.length() > 0) {
                if (onBellsChange != nullptr) {
                    onBellsChange();
                }
            }
        }
        
        if (streamBells.streamTimeout()) {
            streamTimeoutCallback(true);
        }
    }
}

// ==================== ÉCLAIRAGE (INCHANGÉ) ====================

bool FirebaseService::setLightingState(const String& state) {
    if (!Firebase.ready()) {
        Serial.println("⚠ Firebase non prêt");
        return false;
    }
    
    for(int i = 0; i < 2; i++) {
        bool success = Firebase.RTDB.setString(&firebaseData, "lighting/state", state);
        if (success) return true;
        
        if(i == 0) {
            Serial.print("⚠ Retry écriture state (");
            Serial.print(firebaseData.errorReason().c_str());
            Serial.println(")");
            delay(500);
        }
    }
    
    Serial.print("❌ Erreur écriture state: ");
    Serial.println(firebaseData.errorReason().c_str());
    return false;
}

bool FirebaseService::setLightingMode(const String& mode) {
    if (!Firebase.ready()) {
        Serial.println("⚠ Firebase non prêt");
        return false;
    }
    
    bool success = Firebase.RTDB.setString(&firebaseData, "lighting/mode", mode);
    if (!success) {
        Serial.print("Erreur écriture mode: ");
        Serial.println(firebaseData.errorReason().c_str());
    }
    return success;
}

String FirebaseService::getLightingState() {
    if (!Firebase.ready()) {
        Serial.println("⚠ Firebase non prêt");
        return "";
    }
    
    if (Firebase.RTDB.getString(&firebaseData, "lighting/state")) {
        return firebaseData.stringData();
    } else {
        Serial.print("Erreur lecture state: ");
        Serial.println(firebaseData.errorReason().c_str());
        return "";
    }
}

String FirebaseService::getLightingMode() {
    if (!Firebase.ready()) {
        Serial.println("⚠ Firebase non prêt");
        return "";
    }
    
    if (Firebase.RTDB.getString(&firebaseData, "lighting/mode")) {
        return firebaseData.stringData();
    } else {
        Serial.print("Erreur lecture mode: ");
        Serial.println(firebaseData.errorReason().c_str());
        return "";
    }
}

String FirebaseService::getSolarSubMode() {
    if (!Firebase.ready()) {
        return "";
    }
    
    if (Firebase.RTDB.getString(&firebaseData, "lighting/schedules/sunset_to_sunrise/subMode")) {
        return firebaseData.stringData();
    }
    return "";
}

int FirebaseService::getSolarDelay() {
    if (!Firebase.ready()) {
        return 0;
    }
    
    if (Firebase.RTDB.getInt(&firebaseData, "lighting/schedules/sunset_to_sunrise/delay")) {
        return firebaseData.intData();
    }
    return 0;
}

void FirebaseService::getManualSchedule(String& startTime, String& endTime) {
    if (!Firebase.ready()) {
        return;
    }
    
    if (Firebase.RTDB.getString(&firebaseData, "lighting/schedules/manual/startTime")) {
        startTime = firebaseData.stringData();
    }
    
    if (Firebase.RTDB.getString(&firebaseData, "lighting/schedules/manual/endTime")) {
        endTime = firebaseData.stringData();
    }
}

// ==================== IRRIGATION (INCHANGÉ) ====================

bool FirebaseService::setIrrigationState(const String& state) {
    if (!Firebase.ready()) return false;
    
    for(int i = 0; i < 2; i++) {
        bool success = Firebase.RTDB.setString(&firebaseData, "irrigation/state", state);
        if (success) return true;
        if(i == 0) delay(500);
    }
    return false;
}

bool FirebaseService::setIrrigationMode(const String& mode) {
    if (!Firebase.ready()) return false;
    return Firebase.RTDB.setString(&firebaseData, "irrigation/mode", mode);
}

String FirebaseService::getIrrigationState() {
    if (!Firebase.ready()) return "";
    if (Firebase.RTDB.getString(&firebaseData, "irrigation/state")) {
        return firebaseData.stringData();
    }
    return "";
}

String FirebaseService::getIrrigationMode() {
    if (!Firebase.ready()) return "";
    if (Firebase.RTDB.getString(&firebaseData, "irrigation/mode")) {
        return firebaseData.stringData();
    }
    return "";
}

String FirebaseService::getIrrigationSolarSubMode() {
    if (!Firebase.ready()) return "";
    if (Firebase.RTDB.getString(&firebaseData, "irrigation/schedules/sunset_to_sunrise/subMode")) {
        return firebaseData.stringData();
    }
    return "";
}

int FirebaseService::getIrrigationSolarDelay() {
    if (!Firebase.ready()) return 0;
    if (Firebase.RTDB.getInt(&firebaseData, "irrigation/schedules/sunset_to_sunrise/delay")) {
        return firebaseData.intData();
    }
    return 0;
}

void FirebaseService::getIrrigationManualSchedule(String& startTime, String& endTime) {
    if (!Firebase.ready()) return;
    
    if (Firebase.RTDB.getString(&firebaseData, "irrigation/schedules/manual/startTime")) {
        startTime = firebaseData.stringData();
    }
    
    if (Firebase.RTDB.getString(&firebaseData, "irrigation/schedules/manual/endTime")) {
        endTime = firebaseData.stringData();
    }
}

// ==================== SONNERIES (BELLS) - INCHANGÉ ====================

String FirebaseService::getNormalBells() {
    if (!Firebase.ready()) {
        Serial.println("⚠ Firebase non prêt");
        return "[]";
    }
    
    if (Firebase.RTDB.getJSON(&firebaseData, "bells/normal")) {
        String jsonStr = firebaseData.jsonString();
        
        Serial.println("─────────────────────────────────────────");
        Serial.print("Longueur JSON: ");
        Serial.print(jsonStr.length());
        Serial.println(" caractères");
        Serial.print("Contenu JSON: ");
        Serial.println(jsonStr);
        Serial.println("─────────────────────────────────────────");
        
        if (jsonStr.length() == 0 || jsonStr == "null" || jsonStr == "") {
            Serial.println("❌ PROBLÈME: Firebase retourne un JSON vide/null!");
            return "[]";
        }
        
        return jsonStr;
    } else {
        Serial.print("❌ Erreur Firebase getNormalBells: ");
        Serial.println(firebaseData.errorReason().c_str());
        return "[]";
    }
}

String FirebaseService::getSpecialBells() {
    if (!Firebase.ready()) {
        Serial.println("⚠ Firebase non prêt");
        return "[]";
    }
    
    if (Firebase.RTDB.getJSON(&firebaseData, "bells/special")) {
        String jsonStr = firebaseData.jsonString();
        
        Serial.print("Longueur JSON: ");
        Serial.print(jsonStr.length());
        Serial.println(" caractères");
        
        if (jsonStr.length() == 0 || jsonStr == "null" || jsonStr == "") {
            Serial.println("⚠ Aucune période spéciale trouvée");
            return "[]";
        }
        
        return jsonStr;
    } else {
        Serial.print("❌ Erreur Firebase getSpecialBells: ");
        Serial.println(firebaseData.errorReason().c_str());
        return "[]";
    }
}