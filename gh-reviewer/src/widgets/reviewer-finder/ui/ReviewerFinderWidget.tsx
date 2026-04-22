import { useState } from 'react';

import { ReviewerSearch } from '../../../features/reviewer-search/ui/ReviewerSearch';
import { SettingsPanel } from '../../../features/settings/ui/SettingsPanel';

export function ReviewerFinderWidget() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(true);

    const handleToggleSettings = () => {
        setIsSettingsOpen((prev) => !prev);
    };

    return (
        <div className="page">
            <div className="container">
                <div className="hero">
                    <h1>Reviewer Finder</h1>
                </div>

                <SettingsPanel isOpen={isSettingsOpen} onToggle={handleToggleSettings} />

                <ReviewerSearch />
            </div>
        </div>
    );
}
