#pragma once
struct TimeHM {
    int hour;
    int minute;

    bool operator>=(const TimeHM& other) const {
        return (hour > other.hour) || 
               (hour == other.hour && minute >= other.minute);
    }

    bool operator<=(const TimeHM& other) const {
        return (hour < other.hour) || 
               (hour == other.hour && minute <= other.minute);
    }
};
