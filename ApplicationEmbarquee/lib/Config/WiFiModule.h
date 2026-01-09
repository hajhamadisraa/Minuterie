#ifndef WIFI_MODULE_H
#define WIFI_MODULE_H

#include <Arduino.h>
#include <WiFi.h>

class WiFiModule {
private:
    const char* ssid;
    const char* password;
    unsigned long lastReconnectTime;
    unsigned long reconnectInterval;

public:
    // Constructeur
    WiFiModule(const char* ssid, const char* password, unsigned long interval = 5000);

    // Méthodes publiques
    bool connect();                     // Connexion initiale au Wi-Fi
    bool isConnected();                 // Vérifie si Wi-Fi connecté
    void disconnect();                  // Déconnecte
    void autoReconnect();               // Reconnexion automatique selon intervalle
    String getIP();                      // Retourne l'adresse IP
    int getSignalStrength();             // Retourne le RSSI (dBm)
    void printStatus();                  // Affiche le statut dans le Serial
};

#endif
