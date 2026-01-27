#include "BellFirebaseAdapter.h"
#include <ArduinoJson.h>

// Conversion jour texte → numéro (0=Dimanche, 6=Samedi)
int dayNameToNumber(const String& dayName) {
    if (dayName == "Sun") return 0;
    if (dayName == "Mon") return 1;
    if (dayName == "Tue") return 2;
    if (dayName == "Wed") return 3;
    if (dayName == "Thu") return 4;
    if (dayName == "Fri") return 5;
    if (dayName == "Sat") return 6;
    return -1;
}

bool BellFirebaseAdapter::loadNormalSchedules(
    const String& json,
    BellNormalSchedule* schedules,
    int& count,
    int maxSchedules
) {
    count = 0;
    
    if (json.length() == 0 || json == "null") {
        Serial.println("[BellAdapter] JSON vide ou null");
        return false;
    }

    DynamicJsonDocument doc(4096);
    DeserializationError error = deserializeJson(doc, json);

    if (error) {
        Serial.printf("[BellAdapter] ❌ Erreur parsing JSON: %s\n", error.c_str());
        return false;
    }

    int outputIndex = 0;

    // Cas 1: JSON est un tableau
    if (doc.is<JsonArray>()) {
        JsonArray bells = doc.as<JsonArray>();
        Serial.printf("[BellAdapter] 📋 Traitement de %d sonneries Firebase (array)...\n", bells.size());

        for (JsonObject bell : bells) {
            if (outputIndex >= maxSchedules) break;

            bool enabled = bell["enabled"] | true;
            if (!enabled) continue;

            int hour = bell["hour"] | -1;
            int minute = bell["minute"] | 0;
            if (hour < 0 || hour > 23) continue;

            JsonArray days = bell["days"];
            if (days.isNull() || days.size() == 0) {
                schedules[outputIndex].start.hour = hour;
                schedules[outputIndex].start.minute = minute;
                schedules[outputIndex].dayOfWeek = -1;
                outputIndex++;
            } else {
                for (JsonVariant day : days) {
                    if (outputIndex >= maxSchedules) break;

                    int dayNum = dayNameToNumber(day.as<String>());
                    if (dayNum >= 0) {
                        schedules[outputIndex].start.hour = hour;
                        schedules[outputIndex].start.minute = minute;
                        schedules[outputIndex].dayOfWeek = dayNum;
                        outputIndex++;
                    }
                }
            }
        }
    }
    // Cas 2: JSON est un objet (clé = ID)
    else if (doc.is<JsonObject>()) {
        JsonObject bells = doc.as<JsonObject>();
        Serial.printf("[BellAdapter] 📋 Traitement de %d sonneries Firebase (object)...\n", bells.size());

        for (JsonPair kv : bells) {
            if (outputIndex >= maxSchedules) break;

            JsonObject bell = kv.value().as<JsonObject>();
            bool enabled = bell["enabled"] | true;
            if (!enabled) continue;

            int hour = bell["hour"] | -1;
            int minute = bell["minute"] | 0;
            if (hour < 0 || hour > 23) continue;

            JsonArray days = bell["days"];
            if (days.isNull() || days.size() == 0) {
                schedules[outputIndex].start.hour = hour;
                schedules[outputIndex].start.minute = minute;
                schedules[outputIndex].dayOfWeek = -1;
                outputIndex++;
            } else {
                for (JsonVariant day : days) {
                    if (outputIndex >= maxSchedules) break;

                    int dayNum = dayNameToNumber(day.as<String>());
                    if (dayNum >= 0) {
                        schedules[outputIndex].start.hour = hour;
                        schedules[outputIndex].start.minute = minute;
                        schedules[outputIndex].dayOfWeek = dayNum;
                        outputIndex++;
                    }
                }
            }
        }
    }
    else {
        Serial.println("[BellAdapter] ❌ Le JSON n'est ni un tableau ni un objet");
        return false;
    }

    count = outputIndex;
    Serial.printf("[BellAdapter] 📊 Résultat: %d sonneries chargées\n", count);
    return count > 0;
}

bool BellFirebaseAdapter::loadSpecialPeriods(
    const String& json,
    BellSpecialPeriod* periods,
    int& count,
    int maxPeriods
) {
    count = 0;
    if (json.length() == 0 || json == "null") return false;

    DynamicJsonDocument doc(4096);
    DeserializationError error = deserializeJson(doc, json);
    if (error) return false;

    if (!doc.is<JsonArray>()) return false;

    JsonArray specials = doc.as<JsonArray>();
    int idx = 0;

    for (JsonObject sp : specials) {
        if (idx >= maxPeriods) break;

        bool enabled = sp["enabled"] | true;
        if (!enabled) continue;

        String startDateStr = sp["startDate"] | "";
        String endDateStr = sp["endDate"] | "";
        if (startDateStr.length() < 10 || endDateStr.length() < 10) continue;

        periods[idx].startDate.annee = startDateStr.substring(0, 4).toInt();
        periods[idx].startDate.mois = startDateStr.substring(5, 7).toInt();
        periods[idx].startDate.jour = startDateStr.substring(8, 10).toInt();

        periods[idx].endDate.annee = endDateStr.substring(0, 4).toInt();
        periods[idx].endDate.mois = endDateStr.substring(5, 7).toInt();
        periods[idx].endDate.jour = endDateStr.substring(8, 10).toInt();

        int hour = sp["hour"] | 0;
        int minute = sp["minute"] | 0;

        for (int day = 0; day < 7; day++) {
            periods[idx].dailySchedule[day].start.hour = hour;
            periods[idx].dailySchedule[day].start.minute = minute;
        }

        idx++;
    }

    count = idx;
    return count > 0;
}
