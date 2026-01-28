#ifndef FIREBASE_SERVICE_H
#define FIREBASE_SERVICE_H

#include <Arduino.h>
#include <Firebase_ESP_Client.h>

// Callback types pour les notifications de changement
typedef void (*ConfigChangeCallback)(void);

class FirebaseService {
public:
    // Initialisation
    static void begin(const char* apiKey, const char* databaseURL);
    
    // ==================== GESTION DES STREAMS ====================
    static void startListeners();
    static void stopListeners();
    static void handleStreams(); // À appeler dans loop()
    
    // ==================== CALLBACKS ====================
    static void setLightingConfigCallback(ConfigChangeCallback callback);
    static void setIrrigationConfigCallback(ConfigChangeCallback callback);
    static void setBellsConfigCallback(ConfigChangeCallback callback);
    
    // ==================== ÉCLAIRAGE ====================
    static bool setLightingState(const String& state);
    static bool setLightingMode(const String& mode);
    static String getLightingState();
    static String getLightingMode();
    static String getSolarSubMode();
    static int getSolarDelay();
    static void getManualSchedule(String& startTime, String& endTime);
    
    // ==================== IRRIGATION ====================
    static bool setIrrigationState(const String& state);
    static bool setIrrigationMode(const String& mode);
    static String getIrrigationState();
    static String getIrrigationMode();
    static String getIrrigationSolarSubMode();
    static int getIrrigationSolarDelay();
    static void getIrrigationManualSchedule(String& startTime, String& endTime);
    
    // ==================== SONNERIES (BELLS) ====================
    static String getNormalBells();
    static String getSpecialBells();

private:
    // Objets stream Firebase
    static FirebaseData streamLighting;
    static FirebaseData streamIrrigation;
    static FirebaseData streamBells;
    
    // Callbacks
    static ConfigChangeCallback onLightingChange;
    static ConfigChangeCallback onIrrigationChange;
    static ConfigChangeCallback onBellsChange;
    
    // Handlers de stream
    static void streamTimeoutCallback(bool timeout);
};

#endif