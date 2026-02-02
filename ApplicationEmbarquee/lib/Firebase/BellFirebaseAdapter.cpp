#include "BellFirebaseAdapter.h"

// ==================== HELPER : Convertir nom de jour en index ====================
// ⚠️ IMPORTANT: Alignement avec la convention ESP32 (0=Dimanche dans time.h)
int BellFirebaseAdapter::dayNameToIndex(const String& dayName) {
    if (dayName == "Sun") return 0;  // Dimanche
    if (dayName == "Mon") return 1;  // Lundi
    if (dayName == "Tue") return 2;  // Mardi
    if (dayName == "Wed") return 3;  // Mercredi
    if (dayName == "Thu") return 4;  // Jeudi
    if (dayName == "Fri") return 5;  // Vendredi
    if (dayName == "Sat") return 6;  // Samedi
    return -1;
}

// ==================== HELPER : Parser date ISO8601 ====================
void BellFirebaseAdapter::parseISODate(const String& isoDate, int& jour, int& mois) {
    // Format: "2026-01-31T14:38:03.000Z"
    // Extraire: YYYY-MM-DD
    
    if (isoDate.length() < 10) {
        jour = 1;
        mois = 1;
        return;
    }
    
    // Extraire le mois (position 5-6)
    String moisStr = isoDate.substring(5, 7);
    mois = moisStr.toInt();
    
    // Extraire le jour (position 8-9)
    String jourStr = isoDate.substring(8, 10);
    jour = jourStr.toInt();
    
    Serial.printf("   📅 Date parsée: %02d/%02d (depuis: %s)\n", jour, mois, isoDate.c_str());
}

// ==================== CHARGER SONNERIES NORMALES ====================
void BellFirebaseAdapter::loadNormalSchedules(const String& jsonStr, BellNormalSchedule* schedules, int& count) {
    count = 0;
    
    Serial.println("\n┌─────────────────────────────────────┐");
    Serial.println("│  📥 CHARGEMENT SONNERIES NORMALES   │");
    Serial.println("└─────────────────────────────────────┘");
    
    if (jsonStr.length() == 0 || jsonStr == "[]" || jsonStr == "null" || jsonStr == "{}") {
        Serial.println("⚠ Aucune sonnerie normale trouvée");
        return;
    }
    
    DynamicJsonDocument doc(8192);
    DeserializationError error = deserializeJson(doc, jsonStr);
    
    if (error) {
        Serial.print("❌ Erreur parsing JSON normal: ");
        Serial.println(error.c_str());
        return;
    }
    
    JsonObject root = doc.as<JsonObject>();
    
    for (JsonPair kv : root) {
        if (count >= 20) {
            Serial.println("⚠ Limite de 20 sonneries atteinte");
            break;
        }
        
        JsonObject bell = kv.value().as<JsonObject>();
        
        // Vérifier si enabled
        bool enabled = bell["enabled"] | false;
        if (!enabled) {
            Serial.printf("⏭ Sonnerie %s ignorée (disabled)\n", kv.key().c_str());
            continue;
        }
        
        // Récupérer l'heure et la minute
        int hour = bell["hour"] | 0;
        int minute = bell["minute"] | 0;
        
        // Parser les jours
        JsonArray days = bell["days"].as<JsonArray>();
        String label = bell["label"] | "Sans nom";
        
        if (days.size() == 0) {
            // ==================== CAS 1: AUCUN JOUR = TOUS LES JOURS ====================
            BellNormalSchedule& schedule = schedules[count];
            schedule.start.hour = hour;
            schedule.start.minute = minute;
            schedule.dayOfWeek = -1;  // -1 = tous les jours
            
            Serial.printf("✅ [%02d:%02d] Tous les jours - %s\n", hour, minute, label.c_str());
            count++;
            
        } else {
            // ==================== CAS 2: JOURS SPÉCIFIQUES ====================
            // ✅ OPTIMISATION: Utiliser un masque de bits au lieu de créer plusieurs entrées
            
            // Compter les jours pour voir s'il faut optimiser
            if (days.size() == 7) {
                // Si tous les jours sont cochés, traiter comme "tous les jours"
                BellNormalSchedule& schedule = schedules[count];
                schedule.start.hour = hour;
                schedule.start.minute = minute;
                schedule.dayOfWeek = -1;
                
                Serial.printf("✅ [%02d:%02d] Tous les jours (7/7) - %s\n", hour, minute, label.c_str());
                count++;
            } else {
                // Créer une entrée par jour (approche simple mais efficace)
                for (JsonVariant dayVariant : days) {
                    if (count >= 20) {
                        Serial.println("⚠ Limite atteinte lors de l'expansion multi-jours");
                        break;
                    }
                    
                    String dayName = dayVariant.as<String>();
                    int dayIndex = dayNameToIndex(dayName);
                    
                    if (dayIndex == -1) {
                        Serial.printf("⚠ Jour invalide: %s\n", dayName.c_str());
                        continue;
                    }
                    
                    BellNormalSchedule& schedule = schedules[count];
                    schedule.start.hour = hour;
                    schedule.start.minute = minute;
                    schedule.dayOfWeek = dayIndex;
                    
                    Serial.printf("✅ [%02d:%02d] %s - %s\n", hour, minute, dayName.c_str(), label.c_str());
                    count++;
                }
            }
        }
    }
    
    Serial.printf("\n📊 Total: %d sonneries normales chargées\n\n", count);
}

// ==================== CHARGER PÉRIODES SPÉCIALES (DEUX FORMATS) ====================
void BellFirebaseAdapter::loadSpecialPeriods(const String& jsonStr, BellSpecialPeriod* periods, int& count) {
    count = 0;
    
    Serial.println("\n┌─────────────────────────────────────┐");
    Serial.println("│  📥 CHARGEMENT PÉRIODES SPÉCIALES   │");
    Serial.println("└─────────────────────────────────────┘");
    
    if (jsonStr.length() == 0 || jsonStr == "[]" || jsonStr == "null" || jsonStr == "{}") {
        Serial.println("⚠ Aucune période spéciale trouvée");
        return;
    }
    
    DynamicJsonDocument doc(8192);
    DeserializationError error = deserializeJson(doc, jsonStr);
    
    if (error) {
        Serial.print("❌ Erreur parsing JSON special: ");
        Serial.println(error.c_str());
        return;
    }
    
    JsonObject root = doc.as<JsonObject>();
    
    for (JsonPair kv : root) {
        if (count >= 10) {
            Serial.println("⚠ Limite de 10 périodes spéciales atteinte");
            break;
        }
        
        JsonObject period = kv.value().as<JsonObject>();
        
        // Vérifier si enabled
        bool enabled = period["enabled"] | false;
        if (!enabled) {
            Serial.printf("⏭ Période %s ignorée (disabled)\n", kv.key().c_str());
            continue;
        }
        
        BellSpecialPeriod& specialPeriod = periods[count];
        
        // 🔹 DÉTECTION DU FORMAT
        bool hasSimpleFormat = period.containsKey("hour") && period.containsKey("minute");
        bool hasComplexFormat = period.containsKey("dailySchedule");
        
        if (hasSimpleFormat) {
            // ==================== FORMAT SIMPLE (DONNÉES ACTUELLES) ====================
            Serial.println("📌 Format SIMPLE détecté (hour/minute unique)");
            
            // Parser les dates ISO8601
            String startDateStr = period["startDate"] | "";
            String endDateStr = period["endDate"] | "";
            
            parseISODate(startDateStr, specialPeriod.startDate.jour, specialPeriod.startDate.mois);
            parseISODate(endDateStr, specialPeriod.endDate.jour, specialPeriod.endDate.mois);
            
            // Une seule heure pour TOUS les jours
            int hour = period["hour"] | 0;
            int minute = period["minute"] | 0;
            
            // ✅ CORRECTION: Appliquer cette heure à TOUS les jours de la semaine
            for (int day = 0; day < 7; day++) {
                specialPeriod.dailySchedule[day].start.hour = hour;
                specialPeriod.dailySchedule[day].start.minute = minute;
            }
            
            String label = period["label"] | "Sans nom";
            
            Serial.printf("✅ Période spéciale: %02d/%02d → %02d/%02d\n", 
                         specialPeriod.startDate.jour, specialPeriod.startDate.mois,
                         specialPeriod.endDate.jour, specialPeriod.endDate.mois);
            Serial.printf("   ⏰ Sonnerie à %02d:%02d TOUS LES JOURS\n", hour, minute);
            Serial.printf("   🏷️  Label: %s\n", label.c_str());
            
        } else if (hasComplexFormat) {
            // ==================== FORMAT COMPLEXE (HORAIRE PAR JOUR) ====================
            Serial.println("📌 Format COMPLEXE détecté (dailySchedule)");
            
            // Parser les dates
            JsonObject startDate = period["startDate"];
            JsonObject endDate = period["endDate"];
            
            specialPeriod.startDate.jour = startDate["jour"] | 1;
            specialPeriod.startDate.mois = startDate["mois"] | 1;
            specialPeriod.endDate.jour = endDate["jour"] | 1;
            specialPeriod.endDate.mois = endDate["mois"] | 1;
            
            // Parser dailySchedule
            JsonObject dailySchedule = period["dailySchedule"];
            
            for (int day = 0; day < 7; day++) {
                String dayKey = String(day);
                if (dailySchedule.containsKey(dayKey)) {
                    JsonObject daySchedule = dailySchedule[dayKey];
                    JsonObject startTime = daySchedule["start"];
                    specialPeriod.dailySchedule[day].start.hour = startTime["hour"] | -1;
                    specialPeriod.dailySchedule[day].start.minute = startTime["minute"] | -1;
                    
                    if (specialPeriod.dailySchedule[day].start.hour >= 0) {
                        Serial.printf("   📅 Jour %d: %02d:%02d\n", day, 
                                     specialPeriod.dailySchedule[day].start.hour,
                                     specialPeriod.dailySchedule[day].start.minute);
                    }
                } else {
                    // Pas de sonnerie ce jour-là
                    specialPeriod.dailySchedule[day].start.hour = -1;
                    specialPeriod.dailySchedule[day].start.minute = -1;
                }
            }
            
            Serial.printf("✅ Période spéciale: %02d/%02d → %02d/%02d\n", 
                         specialPeriod.startDate.jour, specialPeriod.startDate.mois,
                         specialPeriod.endDate.jour, specialPeriod.endDate.mois);
            Serial.println("   ⏰ Horaires par jour définis");
            
        } else {
            Serial.println("❌ Format de période spéciale non reconnu - ignoré");
            continue;
        }
        
        count++;
    }
    
    Serial.printf("\n📊 Total: %d périodes spéciales chargées\n\n", count);
}