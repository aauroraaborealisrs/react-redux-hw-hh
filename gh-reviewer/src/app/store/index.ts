import { configureStore } from '@reduxjs/toolkit';

import { githubReducer } from '../../entities/github-user/model/githubSlice';
import { reviewerReducer } from '../../features/reviewer-search/model/reviewerSlice';

export const store = configureStore({
  reducer: {
    github: githubReducer,
    reviewer: reviewerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;