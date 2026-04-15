import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { fetchContributors } from '../../../shared/api/github/fetchContributors';

import type { GithubUser } from './types';

type CachedRepoEntry = {
    contributors: GithubUser[];
    fetchedAt: number;
};

type GithubState = {
    contributorsByRepo: Record<string, CachedRepoEntry>;
    loading: boolean;
    error: string;
};

const initialState: GithubState = {
    contributorsByRepo: {},
    loading: false,
    error: '',
};

export const fetchContributorsThunk = createAsyncThunk<
    { repo: string; contributors: GithubUser[] },
    string,
    { rejectValue: string }
>('github/fetchContributors', async (repo, { rejectWithValue }) => {
    try {
        const contributors = await fetchContributors(repo);

        return {
            repo,
            contributors,
        };
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
});

const githubSlice = createSlice({
    name: 'github',
    initialState,
    reducers: {
        clearGithubState(state) {
            state.contributorsByRepo = {};
            state.loading = false;
            state.error = '';
        },
        clearGithubError(state) {
            state.error = '';
        },
        setGithubError(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchContributorsThunk.pending, (state) => {
                state.loading = true;
                state.error = '';
            })
            .addCase(fetchContributorsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.contributorsByRepo[action.payload.repo] = {
                    contributors: action.payload.contributors,
                    fetchedAt: Date.now(),
                };
            })
            .addCase(fetchContributorsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Неизвестная ошибка';
            });
    },
});

export const { clearGithubState, clearGithubError, setGithubError } = githubSlice.actions;

export const githubReducer = githubSlice.reducer;
