// minuterie-app/hooks/useIrrigation.ts
import { onValue, push, ref, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { auth, database } from '../firebase/config.js';

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

  // --- Lecture initiale depuis Firebase ---
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

  // --- Helpers pour écrire dans Firebase ---
  const safeSet = (path: string, value: any, logEvent: string) => {
    if (!auth.currentUser) {
      console.warn(`[Irrigation] Utilisateur non authentifié, écriture refusée: ${path}`);
      return;
    }
    set(ref(database, path), value)
      .then(() => {
        push(ref(database, 'logs'), { time: new Date().toISOString(), event: logEvent });
      })
      .catch(err => {
        console.error(`[Irrigation] Erreur lors de l'écriture ${path}:`, err.message);
      });
  };

  // --- Fonctions publiques ---
  const setState = (newState: 'on' | 'off') => {
    setStateLocal(newState);
    safeSet('irrigation/state', newState, `Irrigation ${newState}`);
  };

  const setMode = (newMode: IrrigationMode) => {
    setModeLocal(newMode);
    safeSet('irrigation/mode', newMode, `Mode Irrigation changé: ${newMode}`);
  };

  const setManualSchedule = (start: string, end: string) => {
    setManualStartLocal(start);
    setManualEndLocal(end);
    safeSet('irrigation/schedules/manual', { startTime: start, endTime: end }, `Horaires manuels modifiés: ${start} → ${end}`);
  };

  const setSolarScheduleDelay = (delayMinutes: string) => {
    setSolarDelayLocal(delayMinutes);
    safeSet('irrigation/schedules/sunset_to_sunrise/delay', Number(delayMinutes), `Delay solaire changé: ${delayMinutes} min`);
  };

  const setSolarSubMode = (subMode: SolarSubModeIrrigation) => {
    setSolarSubModeLocal(subMode);
    safeSet('irrigation/schedules/sunset_to_sunrise/subMode', subMode, `SubMode solaire changé: ${subMode}`);
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
