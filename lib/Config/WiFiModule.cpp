#include "WiFiModule.h"

WiFiModule::WiFiModule(const char* ssid, const char* password, unsigned long interval) {
    this->ssid = ssid;
    this->password = password;
    this->lastReconnectTime = 0;
    this->reconnectInterval = interval;
}

bool WiFiModule::connect() {
    Serial.print("Connexion au Wi-Fi ");
    Serial.println(ssid);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    unsigned long startTime = millis();
    while(WiFi.status() != WL_CONNECTED && (millis() - startTime) < 20000) {
        Serial.print(".");
        delay(500);
    }

    if(WiFi.status() == WL_CONNECTED) {
        Serial.println("");
        Serial.print("Connecté ! IP : ");
        Serial.println(WiFi.localIP());
        return true;
    } else {
        Serial.println("");
        Serial.println("Échec de la connexion Wi-Fi.");
        return false;
    }
}

bool WiFiModule::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

void WiFiModule::disconnect() {
    WiFi.disconnect();
    Serial.println("Wi-Fi déconnecté.");
}

void WiFiModule::autoReconnect() {
    if(!isConnected() && (millis() - lastReconnectTime >= reconnectInterval)) {
        Serial.println("Tentative de reconnexion Wi-Fi...");
        connect();
        lastReconnectTime = millis();
    }
}

String WiFiModule::getIP() {
    return WiFi.localIP().toString();
}

int WiFiModule::getSignalStrength() {
    if(isConnected()) return WiFi.RSSI();
    return 0;
}

void WiFiModule::printStatus() {
    if(isConnected()) {
        Serial.print("Wi-Fi connecté, IP: ");
        Serial.print(getIP());
        Serial.print(", RSSI: ");
        Serial.println(getSignalStrength());
    } else {
        Serial.println("Wi-Fi non connecté.");
    }
}
