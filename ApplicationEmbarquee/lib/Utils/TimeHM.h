#pragma once

struct TimeHM {
    int hour = 0;
    int minute = 0;
    int day = 1;
    int month = 1;
    int year = 2026;  
    int dayOfWeek = 0;

    TimeHM() = default;
    // ✅ Ajout du paramètre year dans le constructeur
    TimeHM(int h, int m, int d = 1, int mo = 1, int dow = 0, int y = 2026)
        : hour(h), minute(m), day(d), month(mo), dayOfWeek(dow), year(y) {}

    int toMinutes() const { return hour * 60 + minute; }

    bool operator>=(const TimeHM& other) const { return toMinutes() >= other.toMinutes(); }
    bool operator<=(const TimeHM& other) const { return toMinutes() <= other.toMinutes(); }
    bool operator==(const TimeHM& other) const { return hour == other.hour && minute == other.minute; }
};