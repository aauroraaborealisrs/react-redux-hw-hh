import { useEffect, useState } from 'react';

import { SETTINGS_STORAGE_KEY } from '../config/storage.ts';
import type { Settings } from '../types/settings';

const defaultSettings: Settings = {
  login: '',
  repo: '',
  blacklist: '',
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!raw) {
      return defaultSettings;
    }

    const parsed = JSON.parse(raw) as Partial<Settings>;

    return {
      login: parsed.login ?? '',
      repo: parsed.repo ?? '',
      blacklist: parsed.blacklist ?? '',
    };
  } catch {
    return defaultSettings;
  }
}

export function useSettingsStorage() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  return {
    settings,
    setSettings,
  };
}