#include "BellScheduler.h"

// ==================== HELPER : Vérifier si une date est dans une période ====================
bool BellScheduler::isDateInPeriod(int day, int month, int year,
                                    int startDay, int startMonth,
                                    int endDay, int endMonth) {
    // Convertir en format comparable YYYYMMDD
    // Note: On ignore l'année car les périodes sont généralement sur la même année
    int currentDate = month * 100 + day;
    int startDate = startMonth * 100 + startDay;
    int endDate = endMonth * 100 + endDay;
    
    // Cas simple: période dans le même mois ou mois consécutifs
    if (startDate <= endDate) {
        return (currentDate >= startDate && currentDate <= endDate);
    } else {
        // Cas période à cheval sur l'année (ex: 20 déc → 5 jan)
        return (currentDate >= startDate || currentDate <= endDate);
    }
}

// ==================== VÉRIFIER SI SONNERIE DOIT SE DÉCLENCHER ====================
bool BellScheduler::shouldRing(const TimeHM& now, 
                               const BellNormalSchedule normalSchedules[], int normalCount,
                               const BellSpecialPeriod specialPeriods[], int specialCount) {
    
    // ============================================
    // 1️⃣ PRIORITÉ AUX PÉRIODES SPÉCIALES
    // ============================================
    for (int i = 0; i < specialCount; i++) {
        const BellSpecialPeriod& sp = specialPeriods[i];
        
        // Vérifier si on est dans la période
        if (isDateInPeriod(now.day, now.month, now.year,
                          sp.startDate.jour, sp.startDate.mois,
                          sp.endDate.jour, sp.endDate.mois)) {
            
            // Vérifier l'horaire du jour actuel
            int currentDayOfWeek = now.dayOfWeek;  // 0=Dimanche, 1=Lundi, etc.
            const DailyBellSchedule& todaySchedule = sp.dailySchedule[currentDayOfWeek];
            
            // Si ce jour a une sonnerie définie
            if (todaySchedule.start.hour >= 0 && todaySchedule.start.minute >= 0) {
                if (now.hour == todaySchedule.start.hour && 
                    now.minute == todaySchedule.start.minute) {
                    Serial.printf("🔔 DÉCLENCHEMENT - Période spéciale (jour %d)\n", currentDayOfWeek);
                    return true;
                }
            }
        }
    }
    
    // ============================================
    // 2️⃣ SONNERIES NORMALES
    // ============================================
    for (int i = 0; i < normalCount; i++) {
        const BellNormalSchedule& bell = normalSchedules[i];
        
        // Vérifier correspondance heure/minute
        if (now.hour == bell.start.hour && now.minute == bell.start.minute) {
            
            // Vérifier le jour
            if (bell.dayOfWeek == -1) {
                // Tous les jours
                Serial.printf("🔔 DÉCLENCHEMENT - Sonnerie normale (tous les jours)\n");
                return true;
            } else if (bell.dayOfWeek == now.dayOfWeek) {
                // Jour spécifique correspond
                Serial.printf("🔔 DÉCLENCHEMENT - Sonnerie normale (jour %d)\n", now.dayOfWeek);
                return true;
            }
        }
    }
    
    return false;
}

// ==================== CALCULER LA PROCHAINE SONNERIE ====================
TimeHM BellScheduler::getNextBell(const TimeHM& now,
                                  const BellNormalSchedule normalSchedules[], int normalCount,
                                  const BellSpecialPeriod specialPeriods[], int specialCount) {
    
    TimeHM nextBell;
    nextBell.hour = -1;
    nextBell.minute = -1;
    
    int currentMinutes = now.hour * 60 + now.minute;
    int minDiff = 24 * 60 * 7;  // 1 semaine en minutes
    
    // ============================================
    // 1️⃣ PÉRIODES SPÉCIALES
    // ============================================
    for (int i = 0; i < specialCount; i++) {
        const BellSpecialPeriod& sp = specialPeriods[i];
        
        // Vérifier si on est dans la période
        if (isDateInPeriod(now.day, now.month, now.year,
                          sp.startDate.jour, sp.startDate.mois,
                          sp.endDate.jour, sp.endDate.mois)) {
            
            // Chercher la prochaine sonnerie dans les 7 prochains jours
            for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
                int checkDay = (now.dayOfWeek + dayOffset) % 7;
                const DailyBellSchedule& schedule = sp.dailySchedule[checkDay];
                
                // Si ce jour a une sonnerie
                if (schedule.start.hour >= 0 && schedule.start.minute >= 0) {
                    int bellMinutes = schedule.start.hour * 60 + schedule.start.minute;
                    int diff;
                    
                    if (dayOffset == 0) {
                        // Aujourd'hui
                        diff = bellMinutes - currentMinutes;
                        if (diff <= 0) continue;  // Déjà passé
                    } else {
                        // Jours futurs
                        diff = dayOffset * 24 * 60 + (bellMinutes - currentMinutes);
                    }
                    
                    if (diff > 0 && diff < minDiff) {
                        minDiff = diff;
                        nextBell = schedule.start;
                    }
                }
            }
        }
    }
    
    // ============================================
    // 2️⃣ SONNERIES NORMALES
    // ============================================
    for (int i = 0; i < normalCount; i++) {
        const BellNormalSchedule& bell = normalSchedules[i];
        
        int bellMinutes = bell.start.hour * 60 + bell.start.minute;
        
        // Ignorer horaires invalides
        if (bell.start.hour < 0 || bell.start.hour >= 24 || 
            bell.start.minute < 0 || bell.start.minute >= 60) {
            continue;
        }
        
        int diff;
        
        if (bell.dayOfWeek == -1) {
            // Tous les jours - chercher la prochaine occurrence
            diff = bellMinutes - currentMinutes;
            if (diff <= 0) {
                diff += 24 * 60;  // Demain même heure
            }
        } else {
            // Jour spécifique
            int currentDay = now.dayOfWeek;
            int targetDay = bell.dayOfWeek;
            
            int dayDiff = targetDay - currentDay;
            if (dayDiff < 0) {
                dayDiff += 7;  // Semaine prochaine
            }
            
            if (dayDiff == 0) {
                // Aujourd'hui - vérifier si déjà passé
                diff = bellMinutes - currentMinutes;
                if (diff <= 0) {
                    dayDiff = 7;  // Semaine prochaine
                    diff = dayDiff * 24 * 60 + (bellMinutes - currentMinutes);
                }
            } else {
                diff = dayDiff * 24 * 60 + (bellMinutes - currentMinutes);
            }
        }
        
        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextBell = bell.start;
        }
    }
    
    return nextBell;
}