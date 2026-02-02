#ifndef BELL_SCHEDULER_H
#define BELL_SCHEDULER_H

#include <Arduino.h>
#include "TimeHM.h"

// ==================== STRUCTURE : Schedule Quotidien (pour périodes spéciales) ====================
struct DailyBellSchedule {
    TimeHM start;           // Heure de déclenchement (-1,-1 = pas de sonnerie ce jour)
};

// ==================== STRUCTURE : Sonnerie Normale ====================
struct BellNormalSchedule {
    TimeHM start;           // Heure de déclenchement
    int dayOfWeek;          // 0=Dimanche, 1=Lundi, ..., 6=Samedi, -1=Tous les jours
};

// ==================== STRUCTURE : Période Spéciale ====================
struct BellSpecialPeriod {
    struct {
        int jour;           // 1-31
        int mois;           // 1-12
    } startDate, endDate;
    
    DailyBellSchedule dailySchedule[7];  // Horaire pour chaque jour de la semaine
};

// ==================== CLASSE : Logique de déclenchement ====================
class BellScheduler {
public:
    // Vérifie si une sonnerie doit se déclencher maintenant
    static bool shouldRing(const TimeHM& now, 
                          const BellNormalSchedule normalSchedules[], int normalCount,
                          const BellSpecialPeriod specialPeriods[], int specialCount);
    
    // Calcule la prochaine sonnerie
    static TimeHM getNextBell(const TimeHM& now,
                             const BellNormalSchedule normalSchedules[], int normalCount,
                             const BellSpecialPeriod specialPeriods[], int specialCount);

private:
    // Vérifie si une date est dans une période
    static bool isDateInPeriod(int day, int month, int year,
                              int startDay, int startMonth,
                              int endDay, int endMonth);
};

#endif // BELL_SCHEDULER_H