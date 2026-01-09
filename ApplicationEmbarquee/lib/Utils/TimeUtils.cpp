#include "TimeUtils.h"

unsigned long TimeUtils::startMillis = 0;

void TimeUtils::init(int startHour, int startMinute) {
    startMillis = millis() - ((startHour * 60 + startMinute) * 1000); // 1 sec = 1 min simulée
}

TimeHM TimeUtils::now() {
    unsigned long elapsed = (millis() - startMillis) / 1000;
    int totalMinutes = elapsed % (24 * 60);

    TimeHM t;
    t.hour = totalMinutes / 60;
    t.minute = totalMinutes % 60;
    return t;
}

bool TimeUtils::isAfter(const TimeHM& a, const TimeHM& b) {
    return (a.hour > b.hour) || (a.hour == b.hour && a.minute > b.minute);
}

bool TimeUtils::isBefore(const TimeHM& a, const TimeHM& b) {
    return (a.hour < b.hour) || (a.hour == b.hour && a.minute < b.minute);
}

bool TimeUtils::isInRange(const TimeHM& start, const TimeHM& end) {
    TimeHM current = now();
    if (isBefore(end, start)) {
        return isAfter(current, start) || isBefore(current, end);
    } else {
        return isAfter(current, start) && isBefore(current, end);
    }
}

String TimeUtils::toString(const TimeHM& t) {
    char buffer[6];
    sprintf(buffer, "%02d:%02d", t.hour, t.minute);
    return String(buffer);
}
