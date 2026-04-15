import { useEffect, useState } from 'react';

import { SETTINGS_STORAGE_KEY } from '../config/storage';
import type { Settings } from '../types/settings';

export const defaultSettings: Settings = {
    login: '',
    repo: '',
    blacklist: '',
    mode: 'random',
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
            mode: parsed.mode === 'contributions' ? 'contributions' : 'random',
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

    const resetSettings = () => {
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
        setSettings(defaultSettings);
    };

    return {
        settings,
        setSettings,
        resetSettings,
    };
}
