import { configureStore } from '@reduxjs/toolkit';

import { githubReducer } from '../../entities/github-user/model/githubSlice';
import { settingsMiddleware } from '../../features/settings/model/settingsMiddleware';
import { settingsReducer } from '../../features/settings/model/settingsSlice';

export const store = configureStore({
    reducer: {
        github: githubReducer,
        settings: settingsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(settingsMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
