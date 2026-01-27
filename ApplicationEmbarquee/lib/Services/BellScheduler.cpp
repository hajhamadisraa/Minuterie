#include "BellScheduler.h"

bool BellScheduler::shouldRing(
    const TimeHM& now,
    const BellNormalSchedule normal[], int normalCount,
    const BellSpecialPeriod special[], int specialCount
) {
    int currentMinutes = now.hour * 60 + now.minute;

    // Vérifier les périodes spéciales d'abord (prioritaires)
    for (int i = 0; i < specialCount; i++) {
        const BellSpecialPeriod& sp = special[i];
        
        // Vérifier si on est dans la période
        bool inPeriod = false;
        if ((now.month > sp.startDate.mois || 
            (now.month == sp.startDate.mois && now.day >= sp.startDate.jour)) &&
            (now.month < sp.endDate.mois || 
            (now.month == sp.endDate.mois && now.day <= sp.endDate.jour))) {
            inPeriod = true;
        }

        if (inPeriod) {
            int weekday = now.dayOfWeek; // 0=Dim, 1=Lun, etc.
            TimeHM bellTime = sp.dailySchedule[weekday].start;
            int bellMinutes = bellTime.hour * 60 + bellTime.minute;
            
            if (currentMinutes == bellMinutes) {
                return true;
            }
        }
    }

    // Vérifier les sonneries normales
    for (int i = 0; i < normalCount; i++) {
        const BellNormalSchedule& bell = normal[i];
        
        // Vérifier le jour de la semaine
        // Si dayOfWeek == -1, c'est tous les jours
        // Sinon, vérifier que le jour actuel correspond
        if (bell.dayOfWeek != -1 && bell.dayOfWeek != now.dayOfWeek) {
            continue; // Pas le bon jour
        }

        int bellMinutes = bell.start.hour * 60 + bell.start.minute;
        
        if (currentMinutes == bellMinutes) {
            return true;
        }
    }

    return false;
}