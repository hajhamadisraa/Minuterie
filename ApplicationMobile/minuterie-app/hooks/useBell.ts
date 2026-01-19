import { onValue, ref, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { database } from '../firebase/config.js';

export type NormalBell = {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  days: string[];
};

export type SpecialBell = {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  startDate: string; // ISO string
  endDate: string;   // ISO string
};

export type NextBell = {
  label: string;
  time: string;
  type: 'normal' | 'special';
};

export const useBell = () => {
  const [normalBells, setNormalBellsState] = useState<NormalBell[]>([]);
  const [specialBells, setSpecialBellsState] = useState<SpecialBell[]>([]);
  const [nextBell, setNextBell] = useState<NextBell | null>(null);

  // --- Helpers ---
  const formatTime = (hour: number, minute: number) =>
    `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;

  const calculateNextBell = () => {
    const now = new Date();
    const upcoming: {time: Date, label: string, type: 'normal'|'special'}[] = [];

    normalBells.forEach(b => {
      if(!b.enabled) return;
      b.days.forEach(d => {
        const dayIndex = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(d);
        if(dayIndex===-1) return;
        const nextDate = new Date();
        nextDate.setHours(b.hour,b.minute,0,0);
        nextDate.setDate(nextDate.getDate() + ((7 + dayIndex - nextDate.getDay()) % 7));
        if(nextDate > now) upcoming.push({time: nextDate,label:b.label,type:'normal'});
      });
    });

    specialBells.forEach(b => {
      if(!b.enabled) return;
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      const bellTime = new Date();
      bellTime.setHours(b.hour,b.minute,0,0);
      if(bellTime>=start && bellTime<=end && bellTime>now) {
        upcoming.push({time: bellTime,label:b.label,type:'special'});
      }
    });

    if(upcoming.length===0) { setNextBell(null); return; }

    upcoming.sort((a,b)=>a.time.getTime()-b.time.getTime());
    const next = upcoming[0];
    setNextBell({label:next.label,time:formatTime(next.time.getHours(),next.time.getMinutes()),type:next.type});
  };

  // --- Firebase refs ---
  const normalRef = ref(database,'bells/normal');
  const specialRef = ref(database,'bells/special');

  // --- Load initial data ---
  useEffect(() => {
    const unsubNormal = onValue(normalRef,snapshot=>{
      const data = snapshot.val() || [];
      setNormalBellsState(data);
    });
    const unsubSpecial = onValue(specialRef,snapshot=>{
      const data = snapshot.val() || [];
      setSpecialBellsState(data);
    });
    return ()=>{ unsubNormal(); unsubSpecial(); };
  }, []);

  // --- Update nextBell whenever bells change ---
  useEffect(()=>{ calculateNextBell(); },[normalBells,specialBells]);

  // --- Wrappers pour setState + write Firebase ---
  const setNormalBells = (bells: NormalBell[]) => {
    setNormalBellsState(bells);
    set(normalRef,bells);
  };

  const setSpecialBells = (bells: SpecialBell[]) => {
  const isoBells = bells.map(b => ({
    ...b,
    startDate: typeof b.startDate === 'string' ? b.startDate : (b.startDate as Date).toISOString(),
    endDate: typeof b.endDate === 'string' ? b.endDate : (b.endDate as Date).toISOString(),
  }));
  setSpecialBellsState(isoBells);
  set(specialRef, isoBells);
};

  return {
    normalBells,
    specialBells,
    nextBell,
    setNormalBells,
    setSpecialBells
  };
};
