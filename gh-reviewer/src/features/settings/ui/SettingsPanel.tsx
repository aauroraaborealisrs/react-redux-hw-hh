import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import { resetSettings, setBlacklist, setLogin, setMode, setRepo } from '../model/settingsSlice';

type SettingsPanelProps = {
    isOpen: boolean;
    onToggle: () => void;
};

export function SettingsPanel({ isOpen, onToggle }: SettingsPanelProps) {
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.settings);

    const handleReset = () => {
        dispatch(resetSettings());
    };

    return (
        <section className="card">
            <div className="settings-header">
                <div>
                    <h2>Settings</h2>
                </div>

                <div className="settings-actions">
                    <button type="button" className="button-secondary" onClick={handleReset}>
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
                            onChange={(event) => dispatch(setLogin(event.target.value))}
                            placeholder="your-login"
                        />
                    </label>

                    <label>
                        <span>repo</span>
                        <input
                            value={settings.repo}
                            onChange={(event) => dispatch(setRepo(event.target.value))}
                            placeholder="owner/repo"
                        />
                    </label>

                    <label>
                        <span>blacklist</span>
                        <input
                            value={settings.blacklist}
                            onChange={(event) => dispatch(setBlacklist(event.target.value))}
                            placeholder='user1, user2 или ["user1", "user2"]'
                        />
                    </label>

                    <label>
                        <span>mode</span>
                        <select
                            value={settings.mode}
                            onChange={(event) =>
                                dispatch(setMode(event.target.value === 'contributions' ? 'contributions' : 'random'))
                            }
                        >
                            <option value="random">random</option>
                            <option value="contributions">contributions</option>
                        </select>
                    </label>
                </div>
            ) : null}
        </section>
    );
}
