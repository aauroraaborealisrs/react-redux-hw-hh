import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { SETTINGS_STORAGE_KEY } from '../config/storage';
import type { Settings } from '../types/settings';

export const defaultSettings: Settings = {
    login: '',
    repo: '',
    blacklist: '',
    mode: 'random',
};

// я исправила функцию, как ты говорил, но потом была правка перенести в middleware,
// но я решила оставить этот компонент, отметиться, что поняла как надо делать

function parseStoredSettings(raw: string | null): Settings {
    if (!raw) {
        return defaultSettings;
    }

    try {
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
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const isHydratedRef = useRef(false);

    useLayoutEffect(() => {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        const storedSettings = parseStoredSettings(raw);

        setSettings(storedSettings);
        isHydratedRef.current = true;
    }, []);

    useEffect(() => {
        if (!isHydratedRef.current) {
            return;
        }

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
