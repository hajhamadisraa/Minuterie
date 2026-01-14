#pragma once
#include "TimeHM.h"

struct BellNormalSchedule {
    TimeHM start;
   
};

struct BellSpecialPeriod {
    struct Date {
        int day;
        int month;
    };

    Date startDate;
    Date endDate;

    BellNormalSchedule dailySchedule[7]; // 0 = dimanche ... 6 = samedi
};
