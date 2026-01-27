#include "FirebaseService.h"

FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;

void FirebaseService::begin(const char* apiKey, const char* databaseURL) {
    config.api_key = apiKey;
    config.database_url = databaseURL;
    
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
    while (!Firebase.ready() && (millis() - timeout) < 10000) {
        delay(500);
        Serial.print(".");
    }
    
    if (Firebase.ready()) {
        Serial.println("\n✓ Firebase prêt!");
    } else {
        Serial.println("\n✗ Timeout - Firebase non prêt");
    }
}

// ✅ CORRECTION : Utiliser "lighting/" au lieu de "esp32/lighting/"
bool FirebaseService::setLightingState(const String& state) {
    if (!Firebase.ready()) {
        Serial.println("⚠ Firebase non prêt");
        return false;
    }
    
    bool success = Firebase.RTDB.setString(&firebaseData, "lighting/state", state);
    if (!success) {
        Serial.print("Erreur écriture state: ");
        Serial.println(firebaseData.errorReason().c_str());
    }
    return success;
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

// ✅ NOUVELLE FONCTION : Lire le sous-mode solaire depuis Firebase
String FirebaseService::getSolarSubMode() {
    if (!Firebase.ready()) {
        return "";
    }
    
    if (Firebase.RTDB.getString(&firebaseData, "lighting/schedules/sunset_to_sunrise/subMode")) {
        return firebaseData.stringData();
    }
    return "";
}

// ✅ NOUVELLE FONCTION : Lire le délai solaire depuis Firebase
int FirebaseService::getSolarDelay() {
    if (!Firebase.ready()) {
        return 0;
    }
    
    if (Firebase.RTDB.getInt(&firebaseData, "lighting/schedules/sunset_to_sunrise/delay")) {
        return firebaseData.intData();
    }
    return 0;
}

// ✅ NOUVELLE FONCTION : Lire les horaires manuels depuis Firebase
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

// ==================== IRRIGATION (NOUVEAU) ====================

bool FirebaseService::setIrrigationState(const String& state) {
    if (!Firebase.ready()) return false;
    return Firebase.RTDB.setString(&firebaseData, "irrigation/state", state);
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

// ==================== SONNERIES (BELLS) - CORRECTION MAJEURE ====================

String FirebaseService::getNormalBells() {
    if (!Firebase.ready()) {
        Serial.println("⚠ Firebase non prêt");
        return "[]";
    }
    
    // ✅ CORRECTION : Utiliser getArray() ou vérifier le type de données
    if (Firebase.RTDB.getJSON(&firebaseData, "bells/normal")) {
        String jsonStr = firebaseData.jsonString();
        
        // Debug amélioré
        Serial.println("─────────────────────────────────────────");
        Serial.print("Longueur JSON: ");
        Serial.print(jsonStr.length());
        Serial.println(" caractères");
        Serial.print("Contenu JSON: ");
        Serial.println(jsonStr);
        Serial.println("─────────────────────────────────────────");
        
        // Vérifier si le JSON est vide ou null
        if (jsonStr.length() == 0 || jsonStr == "null" || jsonStr == "") {
            Serial.println("❌ PROBLÈME: Firebase retourne un JSON vide/null!");
            Serial.println("Vérifiez:");
            Serial.println("  1. Le chemin Firebase dans getNormalBells()");
            Serial.println("  2. Les permissions de lecture dans Firebase");
            Serial.println("  3. Que les données existent dans /bells/normal/");
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