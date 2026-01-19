// minuterie-app/hooks/useLighting.ts
import { onValue, push, ref, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { database } from '../firebase/config.js';

// Types pour mode solaire
type SolarSubMode =
  | 'SUNSET_TO_SUNRISE'
  | 'BEFORE_SUNSET'
  | 'AFTER_SUNSET'
  | 'BEFORE_SUNRISE'
  | 'AFTER_SUNRISE';

type LightingMode = 'SUNSET_SUNRISE' | 'MANUAL';

export function useLighting() {
  const [state, setStateLocal] = useState<'on' | 'off'>('off');
  const [mode, setModeLocal] = useState<LightingMode>('SUNSET_SUNRISE');
  const [solarSubMode, setSolarSubModeLocal] = useState<SolarSubMode>('SUNSET_TO_SUNRISE');
  const [solarDelay, setSolarDelayLocal] = useState('0');
  const [manualStart, setManualStartLocal] = useState('19:00');
  const [manualEnd, setManualEndLocal] = useState('06:30');

  // Lecture initiale depuis Firebase
  useEffect(() => {
    const lightingRef = ref(database, 'lighting');

    const unsubscribe = onValue(lightingRef, snapshot => {
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

      // horaires manuels
      if (data.schedules?.manual) {
        setManualStartLocal(data.schedules.manual.startTime);
        setManualEndLocal(data.schedules.manual.endTime);
      }

      // delay solaire
      if (data.schedules?.sunset_to_sunrise?.delay != null) {
        setSolarDelayLocal(String(data.schedules.sunset_to_sunrise.delay));
      }

      // subMode solaire
      if (data.schedules?.sunset_to_sunrise?.subMode) {
        setSolarSubModeLocal(data.schedules.sunset_to_sunrise.subMode);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Fonctions pour écrire dans Firebase ---
  const setState = (newState: 'on' | 'off') => {
    setStateLocal(newState);
    set(ref(database, 'lighting/state'), newState);
    push(ref(database, 'logs'), { time: new Date().toISOString(), event: `Éclairage ${newState}` });
  };

  const setMode = (newMode: LightingMode) => {
    setModeLocal(newMode);
    set(ref(database, 'lighting/mode'), newMode);
    push(ref(database, 'logs'), { time: new Date().toISOString(), event: `Mode Éclairage changé: ${newMode}` });
  };

  const setManualSchedule = (start: string, end: string) => {
    setManualStartLocal(start);
    setManualEndLocal(end);
    set(ref(database, 'lighting/schedules/manual'), { startTime: start, endTime: end });
    push(ref(database, 'logs'), { time: new Date().toISOString(), event: `Horaires manuels modifiés: ${start} → ${end}` });
  };

  const setSolarScheduleDelay = (delayMinutes: string) => {
    setSolarDelayLocal(delayMinutes);
    set(ref(database, 'lighting/schedules/sunset_to_sunrise/delay'), Number(delayMinutes));
    push(ref(database, 'logs'), { time: new Date().toISOString(), event: `Delay solaire changé: ${delayMinutes} min` });
  };

  const setSolarSubMode = (subMode: SolarSubMode) => {
    setSolarSubModeLocal(subMode);
    set(ref(database, 'lighting/schedules/sunset_to_sunrise/subMode'), subMode);
    push(ref(database, 'logs'), {
      time: new Date().toISOString(),
      event: `SubMode solaire changé: ${subMode}`,
    });
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
    setSolarSubMode
  };
}
