#include "TimeUtils.h"

unsigned long TimeUtils::startMillis = 0;
TimeHM TimeUtils::startTime = {0, 0};

void TimeUtils::init(int startHour,
                     int startMinute,
                     int startDay,
                     int startMonth,
                     int startDayOfWeek) {
    startTime.hour = startHour;
    startTime.minute = startMinute;
    startMillis = millis();
}

TimeHM TimeUtils::now() {
    unsigned long elapsedMinutes = (millis() - startMillis) / 60000;

    TimeHM current;
    current.hour = (startTime.hour + (startTime.minute + elapsedMinutes) / 60) % 24;
    current.minute = (startTime.minute + elapsedMinutes) % 60;

    return current;
}

String TimeUtils::toString(const TimeHM& time) {
    char buffer[6];  // HH:MM + '\0'
    snprintf(buffer, sizeof(buffer), "%02d:%02d", time.hour, time.minute);
    return String(buffer);
}
