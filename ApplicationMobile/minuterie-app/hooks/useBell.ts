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

/* ===================== HOOK ===================== */

export function useBell() {
  const [normalBells, setNormalBells] = useState<NormalBell[]>([]);
  const [specialBells, setSpecialBells] = useState<SpecialBell[]>([]);
  const [nextBell, setNextBell] = useState<NextBell | null>(null);

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
    const now = new Date();

    // 🔹 Fonction utilitaire pour obtenir prochaine alarme la plus proche
    const getNext = () => {
      const upcomingNormals = normalBells
        .filter(b => b.enabled)
        .map(b => {
          const t = new Date();
          t.setHours(b.hour, b.minute, 0, 0);
          return { ...b, time: t };
        })
        .filter(b => b.time > now)
        .sort((a, b) => a.time.getTime() - b.time.getTime());

      const upcomingSpecials = specialBells
        .filter(b => b.enabled)
        .map(b => ({ ...b, time: new Date(b.startDate) }))
        .filter(b => b.time > now)
        .sort((a, b) => a.time.getTime() - b.time.getTime());

      let next: NextBell | null = null;

      const nextNormal = upcomingNormals[0];
      const nextSpecial = upcomingSpecials[0];

      if (nextNormal && (!nextSpecial || nextNormal.time < nextSpecial.time)) {
        next = {
          label: nextNormal.label,
          time: `${String(nextNormal.hour).padStart(2, '0')}:${String(nextNormal.minute).padStart(2, '0')}`,
          type: 'normal',
        };
      } else if (nextSpecial) {
        next = {
          label: nextSpecial.label,
          time: `${String(nextSpecial.hour).padStart(2, '0')}:${String(nextSpecial.minute).padStart(2, '0')}`,
          type: 'special',
        };
      }

      return next;
    };

    setNextBell(getNext());
  }, [normalBells, specialBells]);

  return {
    normalBells,
    specialBells,
    nextBell,
    syncNormalBells,
    syncSpecialBells,
    addNormalBell,
    addSpecialBell,
    deleteNormalBell,
    deleteSpecialBell,
  };
}
