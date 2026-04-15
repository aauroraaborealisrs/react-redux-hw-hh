import { useCallback, useState } from 'react';

import { ReviewerSearch } from '../../../features/reviewer-search/ui/ReviewerSearch';
import { SettingsPanel } from '../../../features/settings/ui/SettingsPanel';
import { useSettingsStorage } from '../../../shared/hooks/useSettingsStorage';
import type { Settings } from '../../../shared/types/settings';

export function ReviewerFinderWidget() {
  const { settings, setSettings } = useSettingsStorage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const handleToggleSettings = useCallback(() => {
    setIsSettingsOpen((prev) => !prev);
  }, []);

  const handleChangeSettings = useCallback(
    (field: keyof Settings, value: string) => {
      setSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setSettings],
  );

  return (
    <div className="page">
      <div className="container">
        <div className="hero">
          <h1>Reviewer Finder</h1>
        </div>

        <SettingsPanel
          settings={settings}
          isOpen={isSettingsOpen}
          onToggle={handleToggleSettings}
          onChange={handleChangeSettings}
        />

        <ReviewerSearch settings={settings} />
      </div>
    </div>
  );
}