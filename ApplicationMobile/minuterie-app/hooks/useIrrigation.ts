// minuterie-app/hooks/useIrrigation.ts
import { onValue, push, ref, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { database } from '../firebase/config.js';

// Types pour les sub-modes solaires de l’irrigation
export type SolarSubModeIrrigation = 'BEFORE_SUNRISE' | 'AFTER_SUNSET';
type IrrigationMode = 'SUNSET_SUNRISE' | 'MANUAL';

export function useIrrigation() {
  const [state, setStateLocal] = useState<'on' | 'off'>('off');
  const [mode, setModeLocal] = useState<IrrigationMode>('SUNSET_SUNRISE');
  const [solarSubMode, setSolarSubModeLocal] = useState<SolarSubModeIrrigation>('BEFORE_SUNRISE');
  const [solarDelay, setSolarDelayLocal] = useState('0');
  const [manualStart, setManualStartLocal] = useState('06:00');
  const [manualEnd, setManualEndLocal] = useState('06:15');

  // Lecture initiale depuis Firebase
  useEffect(() => {
    const irrigationRef = ref(database, 'irrigation');

    const unsubscribe = onValue(irrigationRef, snapshot => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();

      // state
      if (data.state === 'on' || data.state === 'off') {
        setStateLocal(data.state);
      }

      // mode
      if (data.mode) {
        setModeLocal(data.mode === 'manual' ? 'MANUAL' : data.mode);
      }

      // schedules manuels
      if (data.schedules?.manual) {
        setManualStartLocal(data.schedules.manual.startTime);
        setManualEndLocal(data.schedules.manual.endTime);
      }

      // schedules solaires
      if (data.schedules?.sunset_to_sunrise) {
        setSolarDelayLocal(data.schedules.sunset_to_sunrise.delay?.toString() ?? '0');
        setSolarSubModeLocal(data.schedules.sunset_to_sunrise.subMode);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Fonctions pour écrire dans Firebase ---
  const setState = (newState: 'on' | 'off') => {
    setStateLocal(newState);
    set(ref(database, 'irrigation/state'), newState);
    push(ref(database, 'logs'), { time: new Date().toISOString(), event: `Irrigation ${newState}` });
  };

  const setMode = (newMode: IrrigationMode) => {
    setModeLocal(newMode);
    set(ref(database, 'irrigation/mode'), newMode);
    push(ref(database, 'logs'), { time: new Date().toISOString(), event: `Mode Irrigation changé: ${newMode}` });
  };

  const setManualSchedule = (start: string, end: string) => {
    setManualStartLocal(start);
    setManualEndLocal(end);
    set(ref(database, 'irrigation/schedules/manual'), { startTime: start, endTime: end });
    push(ref(database, 'logs'), { time: new Date().toISOString(), event: `Horaires manuels modifiés: ${start} → ${end}` });
  };

  const setSolarScheduleDelay = (delayMinutes: string) => {
    setSolarDelayLocal(delayMinutes);
    set(ref(database, 'irrigation/schedules/sunset_to_sunrise/delay'), Number(delayMinutes));
    push(ref(database, 'logs'), { time: new Date().toISOString(), event: `Delay solaire changé: ${delayMinutes} min` });
  };

  const setSolarSubMode = (subMode: SolarSubModeIrrigation) => {
    setSolarSubModeLocal(subMode);
    set(ref(database, 'irrigation/schedules/sunset_to_sunrise/subMode'), subMode);
    push(ref(database, 'logs'), { time: new Date().toISOString(), event: `SubMode solaire changé: ${subMode}` });
  };

  return {
    state,
    mode,
    solarSubMode,
    solarDelay,
    manualStart,
    manualEnd,
    setState,
    setMode,
    setManualSchedule,
    setSolarScheduleDelay,
    setSolarSubMode,
  };
}
