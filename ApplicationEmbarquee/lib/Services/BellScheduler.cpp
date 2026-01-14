#include "BellScheduler.h"

bool BellScheduler::shouldRing(
    const TimeHM& now,
    const BellNormalSchedule normal[], int normalCount,
    const BellSpecialPeriod special[], int specialCount
) {
    // Vérifie les périodes spéciales
    for (int i = 0; i < specialCount; i++) {
        const auto& sp = special[i];
        if (isInSpecialPeriod(now, sp)) {
            int weekday = now.dayOfWeek;
            const auto& sched = sp.dailySchedule[weekday];
            // ✅ Vérifier seulement l'heure de début (minute exacte)
            return (now.hour == sched.start.hour && now.minute == sched.start.minute);
        }
    }

    // Mode normal
    int weekday = now.dayOfWeek;
    if (weekday >= normalCount) return false;
    const auto& sched = normal[weekday];
    
    // ✅ Vérifier seulement l'heure de début (minute exacte)
    return (now.hour == sched.start.hour && now.minute == sched.start.minute);
}

bool BellScheduler::isInSpecialPeriod(const TimeHM& now, const BellSpecialPeriod& sp) {
    int nowValue = now.month * 100 + now.day;
    int startValue = sp.startDate.month * 100 + sp.startDate.day;
    int endValue   = sp.endDate.month * 100 + sp.endDate.day;
    return nowValue >= startValue && nowValue <= endValue;
}

// ✅ Cette fonction n'est plus utilisée, mais on la garde pour compatibilité
bool BellScheduler::isBetween(const TimeHM& now, const TimeHM& start, const TimeHM& end) {
    return false;
}