export function parseBlacklist(value: string): string[] {
    const trimmed = value.trim();

    if (!trimmed) {
        return [];
    }

    try {
        if (trimmed.startsWith('[')) {
            const parsed = JSON.parse(trimmed);

            if (Array.isArray(parsed)) {
                return [...new Set(parsed.map((item) => String(item).trim().toLowerCase()).filter(Boolean))];
            }
        }
    } catch {
        //в реальном проекте полетит в багтрекер
    }

    const normalized = trimmed.replace(/^\[/, '').replace(/\]$/, '');

    return [
        ...new Set(
            normalized
                .split(',')
                .map((item) =>
                    item
                        .trim()
                        .replace(/^["']|["']$/g, '')
                        .toLowerCase()
                )
                .filter(Boolean)
        ),
    ];
}
