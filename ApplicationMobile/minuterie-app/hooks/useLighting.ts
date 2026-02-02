// minuterie-app/hooks/useLighting.ts
// ✅ VERSION FINALE QUI GÈRE LES STRINGS "on"/"off" ET LES BOOLÉENS

import { onValue, push, ref, remove, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { database } from '../firebase/config.js';

export type SolarSubMode =
  | 'SUNSET_TO_SUNRISE'
  | 'BEFORE_SUNSET'
  | 'AFTER_SUNSET'
  | 'BEFORE_SUNRISE'
  | 'AFTER_SUNRISE';

export type LightingMode = 'SUNSET_SUNRISE' | 'MANUAL';

export interface Device {
  id: string;
  name: string;
  isActive: boolean;
  pin: number;
}

export function useLighting() {
  const [state, setStateLocal] = useState<boolean>(false);
  const [mode, setModeLocal] = useState<LightingMode>('SUNSET_SUNRISE');
  const [solarSubMode, setSolarSubModeLocal] = useState<SolarSubMode>('SUNSET_TO_SUNRISE');
  const [solarDelay, setSolarDelayLocal] = useState('0');
  const [manualStart, setManualStartLocal] = useState('19:00');
  const [manualEnd, setManualEndLocal] = useState('06:30');
  const [devices, setDevicesLocal] = useState<Device[]>([]);

  useEffect(() => {
    console.log('🔥 [useLighting] Initialisation du listener Firebase');
    
    const lightingRef = ref(database, 'lighting');

    const unsubscribe = onValue(lightingRef, snapshot => {
      console.log('📡 [useLighting] Données Firebase reçues');
      
      if (!snapshot.exists()) {
        console.log('⚠️  [useLighting] Aucune donnée lighting dans Firebase');
        return;
      }
      
      const data = snapshot.val();
      console.log('📦 [useLighting] État brut:', data.state, 'Type:', typeof data.state);

      // ✅ GESTION UNIVERSELLE : STRING OU BOOLÉEN
      let newState = false;
      
      if (typeof data.state === 'boolean') {
        // Cas 1: Booléen natif (true/false)
        newState = data.state;
        console.log('✅ [useLighting] État booléen:', newState);
      } else if (typeof data.state === 'string') {
        // Cas 2: String "on"/"off" ou "true"/"false"
        const stateStr = data.state.toLowerCase();
        newState = (stateStr === 'on' || stateStr === 'true' || stateStr === '1');
        console.log('✅ [useLighting] État string converti:', data.state, '→', newState);
      } else if (typeof data.state === 'number') {
        // Cas 3: Nombre (1 = on, 0 = off)
        newState = data.state === 1;
        console.log('✅ [useLighting] État nombre converti:', data.state, '→', newState);
      }
      
      setStateLocal(newState);

      // Mode
      if (data.mode) {
        setModeLocal(data.mode);
      }

      // Horaires manuels
      if (data.schedules?.manual) {
        setManualStartLocal(data.schedules.manual.startTime);
        setManualEndLocal(data.schedules.manual.endTime);
      }

      // Solaire
      if (data.schedules?.sunset_to_sunrise) {
        setSolarDelayLocal(String(data.schedules.sunset_to_sunrise.delay || 0));
        setSolarSubModeLocal(data.schedules.sunset_to_sunrise.subMode || 'SUNSET_TO_SUNRISE');
      }

      // Devices
      if (data.devices) {
        const devicesList: Device[] = Object.entries(data.devices).map(([id, device]: [string, any]) => ({
          id,
          name: device.name,
          isActive: device.isActive,
          pin: device.pin || 0,
        }));
        setDevicesLocal(devicesList);
      } else {
        setDevicesLocal([]);
      }
    }, (error) => {
      console.error('❌ [useLighting] Erreur Firebase:', error);
    });

    return () => unsubscribe();
  }, []);

  // Log à chaque changement d'état
  useEffect(() => {
    console.log('🎯 [useLighting] État UI:', state ? '🟢 ALLUMÉ' : '🔴 ÉTEINT');
  }, [state]);

  // --- ACTIONS ---

  const updateMode = (newMode: LightingMode) => {
    set(ref(database, 'lighting/mode'), newMode);
    push(ref(database, 'logs'), { 
      time: new Date().toISOString(), 
      event: `Mode Éclairage changé: ${newMode}` 
    });
  };

  const updateManualSchedule = (start: string, end: string) => {
    set(ref(database, 'lighting/schedules/manual'), { startTime: start, endTime: end });
    push(ref(database, 'logs'), { 
      time: new Date().toISOString(), 
      event: `Horaires manuels modifiés: ${start} → ${end}` 
    });
  };

  const updateSolarConfig = (subMode: SolarSubMode, delay: number) => {
    set(ref(database, 'lighting/schedules/sunset_to_sunrise'), { subMode, delay });
    push(ref(database, 'logs'), { 
      time: new Date().toISOString(), 
      event: `SubMode solaire changé: ${subMode}, Delay: ${delay} min` 
    });
  };

  const addDevice = async (name: string, pin: number) => {
    const id = `device_${Date.now()}`;
    await set(ref(database, `lighting/devices/${id}`), {
      name,
      pin,
      isActive: true
    });
    push(ref(database, 'logs'), { 
      time: new Date().toISOString(), 
      event: `Ajout appareil: ${name} (Pin ${pin})` 
    });
  };

  const toggleDeviceActive = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await set(ref(database, `lighting/devices/${id}/isActive`), newStatus);
    
    const deviceName = devices.find(d => d.id === id)?.name || 'Appareil';
    push(ref(database, 'logs'), { 
      time: new Date().toISOString(), 
      event: `Appareil ${deviceName} ${newStatus ? 'activé' : 'désactivé'}` 
    });
  };

  const deleteDevice = async (id: string) => {
    const deviceName = devices.find(d => d.id === id)?.name || 'Appareil';
    await remove(ref(database, `lighting/devices/${id}`));
    push(ref(database, 'logs'), { 
      time: new Date().toISOString(), 
      event: `Suppression appareil: ${deviceName}` 
    });
  };

  return {
    state,
    mode,
    solarSubMode,
    solarDelay,
    manualStart,
    manualEnd,
    devices,
    updateMode,
    updateManualSchedule,
    updateSolarConfig,
    addDevice,
    toggleDeviceActive,
    deleteDevice
  };
}