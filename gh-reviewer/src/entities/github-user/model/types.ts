export type GithubUser = {
  id: number;
  login: string;
  html_url: string;
  avatar_url: string;
  type?: string;
  contributions?: number;
};