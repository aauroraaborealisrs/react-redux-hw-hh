import type { Middleware } from '@reduxjs/toolkit';

import { SETTINGS_STORAGE_KEY } from '../../../shared/config/storage';

import { resetSettings, setBlacklist, setLogin, setMode, setRepo } from './settingsSlice';

const settingsActionTypes = new Set<string>([
    setLogin.type,
    setRepo.type,
    setBlacklist.type,
    setMode.type,
    resetSettings.type,
]);

export const settingsMiddleware: Middleware = (storeApi) => (next) => (action) => {
    const result = next(action);

    if (
        typeof action === 'object' &&
        action !== null &&
        'type' in action &&
        typeof action.type === 'string' &&
        settingsActionTypes.has(action.type)
    ) {
        const state = storeApi.getState() as {
            settings: {
                login: string;
                repo: string;
                blacklist: string;
                mode: 'random' | 'contributions';
            };
        };

        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
    }

    return result;
};
