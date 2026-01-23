#ifndef FIREBASE_SERVICE_H
#define FIREBASE_SERVICE_H

#include <Firebase_ESP_Client.h>

extern FirebaseData firebaseData;
extern FirebaseAuth auth;
extern FirebaseConfig config;

class FirebaseService {
public:
    static void begin(const char* apiKey, const char* databaseURL);
    
    // État et mode
    static bool setLightingState(const String& state);
    static bool setLightingMode(const String& mode);
    static String getLightingState();
    static String getLightingMode();
    
    // ✅ Nouvelles fonctions pour lire les configurations depuis Firebase
    static String getSolarSubMode();
    static int getSolarDelay();
    static void getManualSchedule(String& startTime, String& endTime);
};

#endif