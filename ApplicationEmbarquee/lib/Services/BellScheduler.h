#ifndef BELL_SCHEDULER_H
#define BELL_SCHEDULER_H

#include "TimeHM.h"

// Structure pour sonneries normales (avec jour de la semaine)
struct BellNormalSchedule {
    TimeHM start;
    int dayOfWeek; // 0=Dim, 1=Lun, ..., 6=Sam, -1=Tous les jours
};

// Date simple - utiliser les noms en français pour compatibilité
struct Date {
    int annee;  // année
    int mois;   // mois
    int jour;   // jour
};

// Horaire journalier
struct BellDailySchedule {
    TimeHM start;
};

// Période spéciale
struct BellSpecialPeriod {
    Date startDate;
    Date endDate;
    BellDailySchedule dailySchedule[7]; // Un horaire par jour de la semaine
};

class BellScheduler {
public:
    static bool shouldRing(
        const TimeHM& now,
        const BellNormalSchedule normal[], int normalCount,
        const BellSpecialPeriod special[], int specialCount
    );
};

#endif