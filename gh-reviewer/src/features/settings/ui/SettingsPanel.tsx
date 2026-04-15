import type { Settings } from '../../../shared/types/settings.ts';

type SettingsPanelProps = {
  settings: Settings;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (field: keyof Settings, value: string) => void;
};

export function SettingsPanel({
  settings,
  isOpen,
  onToggle,
  onChange,
}: SettingsPanelProps) {
  return (
    <section className="card">
      <div className="settings-header">
        <div>
          <h2>Настройки</h2>
        </div>

        <button type="button" onClick={onToggle}>
          {isOpen ? 'Скрыть' : 'Показать'}
        </button>
      </div>

      {isOpen && (
        <div className="form-grid">
          <label>
            <span>login</span>
            <input
              value={settings.login}
              onChange={(event) => onChange('login', event.target.value)}
              placeholder="your-login"
            />
          </label>

          <label>
            <span>repo</span>
            <input
              value={settings.repo}
              onChange={(event) => onChange('repo', event.target.value)}
              placeholder="owner/repo"
            />
          </label>

          <label>
            <span>blacklist</span>
            <input
              value={settings.blacklist}
              onChange={(event) => onChange('blacklist', event.target.value)}
              placeholder="user1, user2"
            />
          </label>
        </div>
      )}
    </section>
  );
}