type UserInfoCardProps = {
    title: string;
    value: string;
    success?: boolean;
};

export function UserInfoCard({ title, value, success = false }: UserInfoCardProps) {
    return (
        <div className="mini-card">
            <div className="mini-title">{title}</div>
            <div className={`mini-value ${success ? 'success' : ''}`}>{value || '—'}</div>
        </div>
    );
}
