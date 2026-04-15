import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { GithubUser } from '../../../entities/github-user/model/types';

type ReviewerState = {
  selectedReviewer: GithubUser | null;
  animatedList: GithubUser[];
  offsetIndex: number;
  isAnimating: boolean;
};

const initialState: ReviewerState = {
  selectedReviewer: null,
  animatedList: [],
  offsetIndex: 0,
  isAnimating: false,
};

const reviewerSlice = createSlice({
  name: 'reviewer',
  initialState,
  reducers: {
    setSelectedReviewer(state, action: PayloadAction<GithubUser | null>) {
      state.selectedReviewer = action.payload;
    },
    setAnimatedList(state, action: PayloadAction<GithubUser[]>) {
      state.animatedList = action.payload;
    },
    setOffsetIndex(state, action: PayloadAction<number>) {
      state.offsetIndex = action.payload;
    },
    setIsAnimating(state, action: PayloadAction<boolean>) {
      state.isAnimating = action.payload;
    },
    resetReviewerState() {
      return initialState;
    },
  },
});

export const {
  setSelectedReviewer,
  setAnimatedList,
  setOffsetIndex,
  setIsAnimating,
  resetReviewerState,
} = reviewerSlice.actions;

export const reviewerReducer = reviewerSlice.reducer;