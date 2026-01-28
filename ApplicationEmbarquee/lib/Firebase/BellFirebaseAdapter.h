#ifndef BELL_FIREBASE_ADAPTER_H
#define BELL_FIREBASE_ADAPTER_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include "BellScheduler.h"

class BellFirebaseAdapter {
public:
    // Charger les sonneries normales depuis JSON
    static void loadNormalSchedules(const String& jsonStr, BellNormalSchedule* schedules, int& count);
    
    // Charger les périodes spéciales depuis JSON (DEUX FORMATS SUPPORTÉS)
    static void loadSpecialPeriods(const String& jsonStr, BellSpecialPeriod* periods, int& count);

private:
    // Parser une date ISO8601 (format: "2026-01-31T14:38:03.000Z")
    static void parseISODate(const String& isoDate, int& jour, int& mois);
    
    // Convertir le nom du jour en index (0=Dim, 1=Lun, etc.)
    static int dayNameToIndex(const String& dayName);
};

#endif