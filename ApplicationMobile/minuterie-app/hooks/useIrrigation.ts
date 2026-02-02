// minuterie-app/hooks/useIrrigation.ts
// ✅ VERSION FINALE avec gestion strings + booléens + logs détaillés

import { onValue, push, ref, remove, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { database } from '../firebase/config.js';

export type SolarSubModeIrrigation = 'BEFORE_SUNRISE' | 'AFTER_SUNSET';
export type IrrigationMode = 'SUNSET_SUNRISE' | 'MANUAL';

export interface IrrigationDevice {
  id: string;
  name: string;
  isActive: boolean;
  pin: number;
}

export function useIrrigation() {
  const [state, setStateLocal] = useState<boolean>(false);
  const [mode, setModeLocal] = useState<IrrigationMode>('SUNSET_SUNRISE');
  const [solarSubMode, setSolarSubModeLocal] = useState<SolarSubModeIrrigation>('BEFORE_SUNRISE');
  const [solarDelay, setSolarDelayLocal] = useState('0');
  const [manualStart, setManualStartLocal] = useState('06:00');
  const [manualEnd, setManualEndLocal] = useState('06:15');
  const [devices, setDevicesLocal] = useState<IrrigationDevice[]>([]);

  useEffect(() => {
    console.log('🔥 [useIrrigation] Initialisation du listener Firebase');
    
    const irrigationRef = ref(database, 'irrigation');

    const unsubscribe = onValue(irrigationRef, snapshot => {
      console.log('📡 [useIrrigation] Données Firebase reçues');
      
      if (!snapshot.exists()) {
        console.log('⚠️  [useIrrigation] Aucune donnée irrigation dans Firebase');
        return;
      }

      const data = snapshot.val();
      console.log('📦 [useIrrigation] État brut:', data.state, 'Type:', typeof data.state);

      // ✅ GESTION UNIVERSELLE : STRING OU BOOLÉEN
      let newState = false;
      
      if (typeof data.state === 'boolean') {
        // Cas 1: Booléen natif (true/false)
        newState = data.state;
        console.log('✅ [useIrrigation] État booléen:', newState);
      } else if (typeof data.state === 'string') {
        // Cas 2: String "on"/"off" ou "true"/"false"
        const stateStr = data.state.toLowerCase();
        newState = (stateStr === 'on' || stateStr === 'true' || stateStr === '1');
        console.log('✅ [useIrrigation] État string converti:', data.state, '→', newState);
      } else if (typeof data.state === 'number') {
        // Cas 3: Nombre (1 = on, 0 = off)
        newState = data.state === 1;
        console.log('✅ [useIrrigation] État nombre converti:', data.state, '→', newState);
      }
      
      setStateLocal(newState);

      // Mode
      if (data.mode) {
        setModeLocal(data.mode === 'manual' ? 'MANUAL' : data.mode);
        console.log('📝 [useIrrigation] Mode:', data.mode);
      }

      // Horaires manuels
      if (data.schedules?.manual) {
        setManualStartLocal(data.schedules.manual.startTime || '06:00');
        setManualEndLocal(data.schedules.manual.endTime || '06:15');
        console.log('⏰ [useIrrigation] Horaires manuels:', data.schedules.manual);
      }

      // Solaire
      if (data.schedules?.sunset_to_sunrise) {
        setSolarDelayLocal(String(data.schedules.sunset_to_sunrise.delay || 0));
        setSolarSubModeLocal(data.schedules.sunset_to_sunrise.subMode || 'BEFORE_SUNRISE');
        console.log('☀️  [useIrrigation] Config solaire:', data.schedules.sunset_to_sunrise);
      }

      // Devices
      if (data.devices) {
        const devicesList: IrrigationDevice[] = Object.entries(data.devices).map(([id, device]: [string, any]) => ({
          id,
          name: device.name || 'Device',
          isActive: device.isActive ?? true,
          pin: device.pin || 0,
        }));
        console.log('📋 [useIrrigation] Devices chargés:', devicesList.length, 'appareils');
        setDevicesLocal(devicesList);
      } else {
        console.log('📋 [useIrrigation] Aucun appareil');
        setDevicesLocal([]);
      }
    }, (error) => {
      console.error('❌ [useIrrigation] Erreur Firebase:', error);
    });

    return () => {
      console.log('🔌 [useIrrigation] Désinscription du listener');
      unsubscribe();
    };
  }, []);

  // ✅ Log à chaque changement d'état
  useEffect(() => {
    console.log('🎯 [useIrrigation] État UI:', state ? '💧 ACTIF' : '🚫 INACTIF');
  }, [state]);

  // --- ACTIONS ---

  const updateMode = (newMode: IrrigationMode) => {
    console.log('🔄 [useIrrigation] Changement de mode vers:', newMode);
    set(ref(database, 'irrigation/mode'), newMode);
    push(ref(database, 'logs'), { 
      time: new Date().toISOString(), 
      event: `Mode Irrigation changé: ${newMode}` 
    });
  };

  const updateManualSchedule = (start: string, end: string) => {
    console.log('🔄 [useIrrigation] Mise à jour horaires manuels:', start, '→', end);
    set(ref(database, 'irrigation/schedules/manual'), { startTime: start, endTime: end });
    push(ref(database, 'logs'), { 
      time: new Date().toISOString(), 
      event: `Horaires irrigation modifiés: ${start} → ${end}` 
    });
  };

  const updateSolarConfig = (subMode: SolarSubModeIrrigation, delay: number) => {
    console.log('🔄 [useIrrigation] Mise à jour config solaire:', subMode, delay, 'min');
    set(ref(database, 'irrigation/schedules/sunset_to_sunrise'), { subMode, delay });
    push(ref(database, 'logs'), { 
      time: new Date().toISOString(), 
      event: `Config solaire irrigation: ${subMode}, délai ${delay}min` 
    });
  };

  const addDevice = async (name: string, pin: number) => {
    const id = `device_${Date.now()}`;
    console.log('➕ [useIrrigation] Ajout appareil:', name, 'Pin', pin);
    await set(ref(database, `irrigation/devices/${id}`), {
      name,
      pin,
      isActive: true
    });
    push(ref(database, 'logs'), { 
      time: new Date().toISOString(), 
      event: `Ajout appareil irrigation: ${name} (Pin ${pin})` 
    });
  };

  const toggleDeviceActive = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    console.log('🔄 [useIrrigation] Toggle appareil', id, ':', currentStatus, '→', newStatus);
    await set(ref(database, `irrigation/devices/${id}/isActive`), newStatus);
    
    const device = devices.find(d => d.id === id);
    if (device) {
      push(ref(database, 'logs'), { 
        time: new Date().toISOString(), 
        event: `Appareil ${device.name} ${newStatus ? 'activé' : 'désactivé'}` 
      });
    }
  };

  const deleteDevice = async (id: string) => {
    const device = devices.find(d => d.id === id);
    const deviceName = device?.name || 'Appareil';
    console.log('🗑️  [useIrrigation] Suppression appareil:', deviceName);
    await remove(ref(database, `irrigation/devices/${id}`));
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
    deleteDevice,
  };
}