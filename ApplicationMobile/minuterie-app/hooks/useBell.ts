import { onValue, push, ref, remove, update } from 'firebase/database';
import { useEffect, useState } from 'react';
import { database } from '../firebase/config.js';


/* ===================== TYPES ===================== */


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
  startDate: string;
  endDate: string;
};


export type NextBell = {
  label: string;
  time: string;
  type: 'normal' | 'special';
};


export type BellTrigger = {
  bellId: string;
  triggeredAt: string; // ISO timestamp
  type: 'normal' | 'special';
};


/* ===================== HOOK ===================== */


export function useBell() {
  const [normalBells, setNormalBells] = useState<NormalBell[]>([]);
  const [specialBells, setSpecialBells] = useState<SpecialBell[]>([]);
  const [nextBell, setNextBell] = useState<NextBell | null>(null);
  const [lastTriggered, setLastTriggered] = useState<BellTrigger | null>(null);


  /* 🔹 READ NORMAL BELLS */
  useEffect(() => {
    const normalRef = ref(database, 'bells/normal');
    return onValue(normalRef, snap => {
      if (!snap.exists()) {
        setNormalBells([]);
        return;
      }
      const data = snap.val();
      const list: NormalBell[] = Object.keys(data).map(id => ({
        id,
        ...data[id],
      }));
      setNormalBells(list);
    });
  }, []);


  /* 🔹 READ SPECIAL BELLS */
  useEffect(() => {
    const specialRef = ref(database, 'bells/special');
    return onValue(specialRef, snap => {
      if (!snap.exists()) {
        setSpecialBells([]);
        return;
      }
      const data = snap.val();
      const list: SpecialBell[] = Object.keys(data).map(id => ({
        id,
        ...data[id],
      }));
      setSpecialBells(list);
    });
  }, []);


  /* 🔹 READ LAST TRIGGERED BELL (écouté en temps réel) */
  useEffect(() => {
    const triggerRef = ref(database, 'bells/lastTriggered');
    return onValue(triggerRef, snap => {
      if (!snap.exists()) {
        setLastTriggered(null);
        return;
      }
      const data = snap.val();
      setLastTriggered(data);
    });
  }, []);


  /* 🔹 SYNC NORMAL BELLS */
  const syncNormalBells = (bells: NormalBell[]) => {
    const updates: any = {};
    bells.forEach(b => {
      updates[b.id] = {
        hour: b.hour,
        minute: b.minute,
        label: b.label,
        enabled: b.enabled,
        days: b.days,
      };
    });
    update(ref(database, 'bells/normal'), updates);
    setNormalBells(bells);
  };


  /* 🔹 SYNC SPECIAL BELLS */
  const syncSpecialBells = (bells: SpecialBell[]) => {
    const updates: any = {};
    bells.forEach(b => {
      updates[b.id] = {
        hour: b.hour,
        minute: b.minute,
        label: b.label,
        enabled: b.enabled,
        startDate: b.startDate,
        endDate: b.endDate,
      };
    });
    update(ref(database, 'bells/special'), updates);
    setSpecialBells(bells);
  };


  /* 🔹 ADD / DELETE */
  const addNormalBell = async (bell: Omit<NormalBell, 'id'>) => {
    const newRef = push(ref(database, 'bells/normal'), bell);
    return newRef.key as string;
  };


  const addSpecialBell = async (bell: Omit<SpecialBell, 'id'>) => {
    const newRef = push(ref(database, 'bells/special'), bell);
    return newRef.key as string;
  };


  const deleteNormalBell = (id: string) => remove(ref(database, `bells/normal/${id}`));
  const deleteSpecialBell = (id: string) => remove(ref(database, `bells/special/${id}`));


  /* 🔹 CALCULATE NEXT BELL */
  useEffect(() => {
    const DAYS_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const calculateNext = () => {
      const now = new Date();
      const currentDay = DAYS_MAP[now.getDay()];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let candidates: Array<{ time: Date; label: string; type: 'normal' | 'special' }> = [];

      // 🔹 NORMAL BELLS - Chercher aujourd'hui et les 7 prochains jours
      normalBells
        .filter(b => b.enabled)
        .forEach(bell => {
          for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
            const checkDate = new Date(now);
            checkDate.setDate(checkDate.getDate() + dayOffset);
            const checkDay = DAYS_MAP[checkDate.getDay()];

            if (bell.days.includes(checkDay)) {
              const bellTime = new Date(checkDate);
              bellTime.setHours(bell.hour, bell.minute, 0, 0);

              // Si c'est aujourd'hui, vérifier que l'heure n'est pas passée
              if (dayOffset === 0 && bell.hour * 60 + bell.minute <= currentMinutes) {
                continue;
              }

              candidates.push({
                time: bellTime,
                label: bell.label,
                type: 'normal',
              });
              break; // On prend la première occurrence
            }
          }
        });

      // 🔹 SPECIAL BELLS - Vérifier si dans la période et heure future
      specialBells
        .filter(b => b.enabled)
        .forEach(bell => {
          const start = new Date(bell.startDate);
          const end = new Date(bell.endDate);
          
          // Chercher tous les jours dans la période
          let checkDate = new Date(Math.max(now.getTime(), start.getTime()));
          checkDate.setHours(0, 0, 0, 0);
          
          while (checkDate <= end) {
            const bellTime = new Date(checkDate);
            bellTime.setHours(bell.hour, bell.minute, 0, 0);
            
            // Si c'est dans le futur
            if (bellTime > now) {
              candidates.push({
                time: bellTime,
                label: bell.label,
                type: 'special',
              });
              break; // On prend la première occurrence
            }
            
            checkDate.setDate(checkDate.getDate() + 1);
          }
        });

      // Trier et prendre la plus proche
      if (candidates.length === 0) {
        return null;
      }

      candidates.sort((a, b) => a.time.getTime() - b.time.getTime());
      const next = candidates[0];

      return {
        label: next.label,
        time: `${String(next.time.getHours()).padStart(2, '0')}:${String(next.time.getMinutes()).padStart(2, '0')}`,
        type: next.type,
      };
    };

    setNextBell(calculateNext());

    // 🔹 Rafraîchir toutes les 5 secondes pour une mise à jour quasi-instantanée
    const interval = setInterval(() => {
      setNextBell(calculateNext());
    }, 5000); // Toutes les 5 secondes (au lieu de 60)

    return () => clearInterval(interval);
  }, [normalBells, specialBells, lastTriggered]); // 🔹 Ajout de lastTriggered pour recalculer automatiquement


  return {
    normalBells,
    specialBells,
    nextBell,
    lastTriggered, // 🔹 Exposer pour affichage si besoin
    syncNormalBells,
    syncSpecialBells,
    addNormalBell,
    addSpecialBell,
    deleteNormalBell,
    deleteSpecialBell,
  };
}