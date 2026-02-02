#ifndef FIREBASE_SERVICE_H
#define FIREBASE_SERVICE_H

#include <Firebase_ESP_Client.h>
#include <functional>

class FirebaseService {
public:
    // =====================================================
    // INITIALISATION ET FLUX
    // =====================================================
    static void begin(const char* apiKey, const char* databaseURL);
    static void startListeners();
    static void handleStreams();
    
    // =====================================================
    // CALLBACKS POUR LE TEMPS RÉEL
    // =====================================================
    static void setLightingConfigCallback(std::function<void(String)> cb);
    static void setIrrigationConfigCallback(std::function<void(String)> cb);
    static void setBellsConfigCallback(std::function<void(String)> cb);
    
    // =====================================================
    // GETTERS ÉCLAIRAGE
    // =====================================================
    static String getLightingMode();
    static String getLightingDevicesJson();      // 🆕 Retourne tous les dispositifs
    static String getSolarSubMode();
    static int getSolarDelay();
    static String getManualStartTime();
    static String getManualEndTime();
    
    // 🆕 Méthodes spécifiques dispositifs éclairage
    static String getLightingDevice(const String& deviceId);
    static bool setLightingDeviceActive(const String& deviceId, bool isActive);
    static bool addLightingDevice(const String& deviceId, const String& name, int pin, bool isActive);
    static bool removeLightingDevice(const String& deviceId);

    // =====================================================
    // GETTERS IRRIGATION
    // =====================================================
    static String getIrrigationMode();
    static String getIrrigationDevicesJson();    // 🆕 Retourne tous les dispositifs
    static String getIrrigationSolarSubMode();   // 🆕 SubMode irrigation
    static int getIrrigationSolarDelay();        // 🆕 Delay irrigation
    static String getIrrigationManualStartTime(); // 🆕 Horaire manuel start
    static String getIrrigationManualEndTime();   // 🆕 Horaire manuel end
    
    // 🆕 Méthodes spécifiques dispositifs irrigation
    static String getIrrigationDevice(const String& deviceId);
    static bool setIrrigationDeviceActive(const String& deviceId, bool isActive);
    static bool addIrrigationDevice(const String& deviceId, const String& name, int pin, bool isActive);
    static bool removeIrrigationDevice(const String& deviceId);
    
    // =====================================================
    // GETTERS SONNERIE
    // =====================================================
    static String getNormalBells();
    static String getSpecialBells();
    
    // =====================================================
    // SETTERS (ENVOI D'ÉTATS VERS FIREBASE)
    // =====================================================
    static void setLightingState(bool state);
    static void setLightingState(const String& state);  // 🆕 Overload avec String
    static void setIrrigationState(bool state);
    static void setIrrigationState(const String& state); // 🆕 Overload avec String
    static void setNextBellTime(const String& time);
    
    // 🆕 Mise à jour état dispositif individuel (optionnel - pour feedback app)
    static bool setDeviceState(const String& category, const String& deviceId, bool state);
    
    // =====================================================
    // UTILITAIRES
    // =====================================================
    static bool isReady();  // 🆕 Vérifier si Firebase est prêt
    static String getLastError(); // 🆕 Récupérer dernière erreur
    
    // 🆕 Helper pour récupérer schedules sous forme JSON
    static void getManualSchedule(String& startTime, String& endTime);
    static void getIrrigationManualSchedule(String& startTime, String& endTime);
};

#endif // FIREBASE_SERVICE_H