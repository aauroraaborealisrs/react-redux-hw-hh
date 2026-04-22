import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { fetchContributors } from '../../../shared/api/github/fetchContributors';
import type { GithubUser } from '../../../shared/types/github';

type CachedRepoEntry = {
    contributors: GithubUser[];
    fetchedAt: number;
    isTruncated: boolean;
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
    { repo: string; contributors: GithubUser[]; isTruncated: boolean },
    string,
    { rejectValue: string }
>('github/fetchContributors', async (repo, { rejectWithValue, signal }) => {
    try {
        const { contributors, isTruncated } = await fetchContributors(repo, signal);

        return {
            repo,
            contributors,
            isTruncated,
        };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return rejectWithValue('aborted');
        }

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
                    isTruncated: action.payload.isTruncated,
                };
            })
            .addCase(fetchContributorsThunk.rejected, (state, action) => {
                state.loading = false;

                if (action.payload === 'aborted' || action.error.name === 'AbortError') {
                    return;
                }

                state.error = action.payload ?? action.error.message ?? 'Неизвестная ошибка';
            });
    },
});

export const { clearGithubState, clearGithubError, setGithubError } = githubSlice.actions;
export const githubReducer = githubSlice.reducer;
