import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { SETTINGS_STORAGE_KEY } from '../../../shared/config/storage';
import type { ReviewerMode, Settings } from '../../../shared/types/settings';

export const defaultSettings: Settings = {
    login: '',
    repo: '',
    blacklist: '',
    mode: 'random',
};

export function loadSettingsFromStorage(): Settings {
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

const initialState: Settings = loadSettingsFromStorage();

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setLogin(state, action: PayloadAction<string>) {
            state.login = action.payload;
        },
        setRepo(state, action: PayloadAction<string>) {
            state.repo = action.payload;
        },
        setBlacklist(state, action: PayloadAction<string>) {
            state.blacklist = action.payload;
        },
        setMode(state, action: PayloadAction<ReviewerMode>) {
            state.mode = action.payload;
        },
        resetSettings() {
            return defaultSettings;
        },
    },
});

export const { setLogin, setRepo, setBlacklist, setMode, resetSettings } = settingsSlice.actions;

export const settingsReducer = settingsSlice.reducer;
