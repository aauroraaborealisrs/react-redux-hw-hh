import type { GithubUser } from '../../types/github';

type FilterCandidatesParams = {
    users: GithubUser[];
    currentLogin: string;
    blacklistSet: Set<string>;
};

export function filterCandidates({ users, currentLogin, blacklistSet }: FilterCandidatesParams): GithubUser[] {
    const normalizedLogin = currentLogin.trim().toLowerCase();

    return users.filter((user) => {
        const candidateLogin = user.login.toLowerCase();

        if (user.type === 'Bot' || candidateLogin.endsWith('[bot]')) {
            return false;
        }

        if (candidateLogin === normalizedLogin) {
            return false;
        }

        if (blacklistSet.has(candidateLogin)) {
            return false;
        }

        return true;
    });
}
