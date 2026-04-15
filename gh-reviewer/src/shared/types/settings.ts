export type ReviewerMode = 'random' | 'contributions';

export type Settings = {
  login: string;
  repo: string;
  blacklist: string;
  mode: ReviewerMode;
};