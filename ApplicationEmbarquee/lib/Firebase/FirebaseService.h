#ifndef FIREBASE_SERVICE_H
#define FIREBASE_SERVICE_H

#include <Arduino.h>
#include <Firebase_ESP_Client.h>

class FirebaseService {
public:
    // Initialisation
    static void begin(const char* apiKey, const char* databaseURL);
    
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
};

#endif