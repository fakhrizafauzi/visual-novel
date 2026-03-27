import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { SettingsService, getAppSettings } from '../firebase/db';
import type { AppSettings } from '../types/game';
import { useSnackbar } from '../context/SnackbarContext';

const ACCENT_PRESETS = [
  { name: 'Coral', color: '#ff6b6b' },
  { name: 'Sky', color: '#4fc3f7' },
  { name: 'Violet', color: '#9c88ff' },
  { name: 'Gold', color: '#ffd166' },
  { name: 'Lime', color: '#6bff8e' },
];

const SettingsPanel: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [settings, setSettings] = useState<AppSettings>({
    id: 'global',
    themeOutlineColor: '#ff6b6b',
    globalBackgroundUrl: '',
    globalBackgroundColor: '#0d0f1a',
    menuTitle: '',
    menuStartBtn: '',
    menuAboutBtn: '',
    storySelectTitle: '',
    chapterSelectTitle: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getAppSettings();
      if (data) setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docId = settings.id || 'global';
      await SettingsService.update(docId, settings);
      // Apply immediately
      document.documentElement.style.setProperty('--accent', settings.themeOutlineColor || '#ff6b6b');
      document.documentElement.style.setProperty('--kawaii-color', settings.themeOutlineColor || '#ff6b6b');
      if (settings.globalBackgroundUrl) {
        document.body.style.backgroundImage = `url(${settings.globalBackgroundUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
      } else {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = settings.globalBackgroundColor || '#0d0f1a';
      }
      showSnackbar('Settings saved!', 'success');
    } catch (error) {
      console.error(error);
      showSnackbar('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const setField = (field: keyof AppSettings, value: any) =>
    setSettings(prev => ({ ...prev, [field]: value }));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', padding: '2rem' }}>
      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading settings...
    </div>
  );

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <div className="section-label" style={{ marginBottom: '0.5rem' }}>Configuration</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', letterSpacing: '4px', marginBottom: '0.5rem' }}>
          GLOBAL SETTINGS
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Platform-wide appearance and branding configuration.</p>
      </div>

      {/* SECTION: Accent Color */}
      <Section title="Accent Color">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {ACCENT_PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => setField('themeOutlineColor', p.color)}
              style={{
                padding: '0.6rem 1.2rem',
                background: settings.themeOutlineColor === p.color ? p.color : 'var(--surface2)',
                border: `1px solid ${settings.themeOutlineColor === p.color ? p.color : 'var(--border)'}`,
                color: settings.themeOutlineColor === p.color ? '#000' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <FormField label="Custom Accent Color" type="color"
            value={settings.themeOutlineColor || '#ff6b6b'}
            onChange={v => setField('themeOutlineColor', v)} />
          <FormField label="Background Color (Fallback)" type="color"
            value={settings.globalBackgroundColor || '#0d0f1a'}
            onChange={v => setField('globalBackgroundColor', v)} />
        </div>
      </Section>

      {/* SECTION: Background Image */}
      <Section title="Background Image">
        <FormField
          label="Global Background Image URL"
          placeholder="https://example.com/background.jpg"
          value={settings.globalBackgroundUrl || ''}
          onChange={v => setField('globalBackgroundUrl', v)}
        />
        {settings.globalBackgroundUrl && (
          <div style={{ marginTop: '1rem', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)', height: '120px' }}>
            <img src={settings.globalBackgroundUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </Section>

      {/* SECTION: Text Labels */}
      <Section title="Interface Text Labels">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <FormField label="Menu Title" placeholder="Eternal Echoes"
            value={settings.menuTitle || ''} onChange={v => setField('menuTitle', v)} />
          <FormField label="Start Button Text" placeholder="Start Your Journey"
            value={settings.menuStartBtn || ''} onChange={v => setField('menuStartBtn', v)} />
          <FormField label="About Button Text" placeholder="About Project"
            value={settings.menuAboutBtn || ''} onChange={v => setField('menuAboutBtn', v)} />
          <FormField label="Story Select Title" placeholder="Choose Your Story"
            value={settings.storySelectTitle || ''} onChange={v => setField('storySelectTitle', v)} />
          <FormField label="Chapter Select Title" placeholder="Chapters"
            value={settings.chapterSelectTitle || ''} onChange={v => setField('chapterSelectTitle', v)} />
        </div>
      </Section>

      {/* SECTION: Engine Features */}
      <Section title="Engine Features">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface2)', padding: '1rem', border: '1px solid var(--border)' }}>
          <input
            type="checkbox"
            id="showMusicToggle"
            checked={!!settings.showMusicToggle}
            onChange={(e) => setField('showMusicToggle', e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
          <label htmlFor="showMusicToggle" style={{ fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
            Check to Show Music/Volume Button in Game
          </label>
        </div>
      </Section>

      {/* Save Button */}
      <button
        className="action-btn"
        onClick={handleSave}
        disabled={saving}
        style={{ width: '100%', padding: '1.2rem', fontSize: '1rem', justifyContent: 'center', marginTop: '2rem', opacity: saving ? 0.7 : 1 }}
      >
        <Save size={18} /> {saving ? 'Saving...' : 'Save & Apply Changes'}
      </button>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '3rem' }}>
    <div className="section-label" style={{ marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)' }}>
      {title}
    </div>
    {children}
  </div>
);

const FormField = ({
  label, placeholder = '', value, onChange, type = 'text'
}: {
  label: string; placeholder?: string; value: string;
  onChange: (v: string) => void; type?: string;
}) => (
  <div>
    <label className="form-label">{label}</label>
    {type === 'color' ? (
      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '44px', height: '44px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', padding: '2px' }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="manga-input"
          style={{ flex: 1 }}
        />
      </div>
    ) : (
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="manga-input"
      />
    )}
  </div>
);

export default SettingsPanel;
