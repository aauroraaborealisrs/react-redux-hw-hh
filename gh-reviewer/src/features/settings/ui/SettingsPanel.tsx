import type { Settings } from '../../../shared/types/settings';

type SettingsPanelProps = {
  settings: Settings;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (field: keyof Settings, value: string) => void;
  onReset: () => void;
};

export function SettingsPanel({
  settings,
  isOpen,
  onToggle,
  onChange,
  onReset,
}: SettingsPanelProps) {
  return (
    <section className="card">
      <div className="settings-header">
        <div>
          <h2>Settings</h2>
        </div>

                  <label className='mode-label'>
            <span>mode</span>
            <select
              value={settings.mode}
              onChange={(event) => onChange('mode', event.target.value)}
            >
              <option value="random">random</option>
              <option value="contributions">contributions</option>
            </select>
          </label>

        <div className="settings-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={onReset}
          >
            Reset
          </button>

          <button type="button" onClick={onToggle}>
            {isOpen ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="form-grid">
          <label>
            <span>login</span>
            <input
              value={settings.login}
              onChange={(event) => onChange('login', event.target.value)}
              placeholder="your login"
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
              placeholder='user1, user2 or [user1, user2]'
            />
          </label>

        </div>
      ) : null}
    </section>
  );
}