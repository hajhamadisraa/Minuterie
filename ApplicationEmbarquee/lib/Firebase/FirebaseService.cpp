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