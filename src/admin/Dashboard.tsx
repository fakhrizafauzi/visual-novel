import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  BookOpen,
  Layers,
  Settings,
  LogOut,
  Plus,
  Gamepad2,
  LayoutDashboard,
  Cpu,
  Home,
  Database,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StoryService } from '../firebase/db';
import { useSnackbar } from '../context/SnackbarContext';
import type { Story } from '../types/game';
import { seedExampleStory } from '../utils/seedData';
import StoryStudio from './StoryStudio';
import SettingsPanel from './SettingsPanel';
import AssetLibrary from './AssetLibrary';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'assets' | 'settings'>('overview');
  const [stats, setStats] = useState({ stories: 0, chapters: 0, scenes: 0 });
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showConfirmSeed, setShowConfirmSeed] = useState(false);
  const { showSnackbar } = useSnackbar();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fetchedStories = await StoryService.getAll();
      setStories(fetchedStories);
      setStats({ stories: fetchedStories.length, chapters: 0, scenes: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSeed = () => {
    setShowConfirmSeed(true);
  };

  const confirmSeed = async () => {
    setShowConfirmSeed(false);
    setIsSeeding(true);
    try {
      await seedExampleStory();
      await fetchData();
      showSnackbar('Seed complete! 10 stories added.', 'success');
    } catch (e) {
      showSnackbar('Seeding failed: ' + (e as Error).message, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const NAV_ITEMS = [
    { id: 'overview',  label: 'Overview',      icon: <LayoutDashboard size={18} /> },
    { id: 'stories',   label: 'Story Planner', icon: <BookOpen size={18} /> },
    { id: 'assets',    label: 'Asset Library', icon: <Layers size={18} /> },
    { id: 'settings',  label: 'Settings',      icon: <Settings size={18} /> },
  ] as const;

  return (
    <div className="admin-layout" style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
    }}>
      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar" style={{
        width: '220px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
        zIndex: 10
      }}>
        {/* Brand */}
        <div style={{
          padding: '1.5rem 1.4rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '0.8rem'
        }}>
          <div style={{ padding: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={18} color="var(--white)" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '1px', color: 'var(--text)' }}>ANTIGRAVITY</div>
            <div className="section-label" style={{ fontSize: '0.6rem' }}>Admin Console</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="nav-active" style={{ marginLeft: 'auto', width: '6px', height: '6px', background: 'var(--accent)' }} />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* User info */}
          <div style={{ padding: '0.8rem', background: 'var(--surface2)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--white)' }}>
                {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
              </span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.displayName || user?.email || 'Admin'}
              </div>
              <div className="section-label" style={{ fontSize: '0.6rem', color: 'var(--accent)' }}>Administrator</div>
            </div>
          </div>

          <button
            className="ghost-btn"
            onClick={() => navigate('/visual-novel')}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.8rem', fontSize: '0.8rem' }}
          >
            <Home size={14} /> View Site
          </button>
          <button
            className="ghost-btn"
            onClick={logout}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'transparent' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ padding: '2.5rem 3rem', minHeight: '100vh' }}
          >
            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div style={{ maxWidth: '1100px' }}>
                <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                  <div className="section-label" style={{ marginBottom: '0.5rem' }}>Dashboard</div>
                  <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', letterSpacing: '4px', marginBottom: '0.5rem' }}>
                    PROJECT COMMAND CENTER
                  </h1>
                  <p style={{ color: 'var(--text-muted)' }}>Platform overview and quick actions.</p>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                  {[
                    { icon: <BookOpen size={20} color="var(--accent)" />, title: 'Stories', value: stats.stories, sub: 'Total published' },
                    { icon: <Gamepad2 size={20} color="var(--accent2)" />, title: 'Sessions', value: '1,240', sub: '+12% this month' },
                    { icon: <TrendingUp size={20} color="var(--success)" />, title: 'Completion Rate', value: '68%', sub: 'Good endings reached' },
                    { icon: <Database size={20} color="var(--text-muted)" />, title: 'Assets', value: '—', sub: 'See asset library' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{
                        padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)',
                        position: 'relative', overflow: 'hidden'
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--border)' }} />
                      <div style={{ marginBottom: '1rem' }}>{stat.icon}</div>
                      <div className="section-label" style={{ marginBottom: '0.3rem' }}>{stat.title}</div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{stat.value}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{stat.sub}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div style={{ marginBottom: '2rem' }}>
                  <div className="section-label" style={{ marginBottom: '1.5rem' }}>Quick Actions</div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="action-btn" onClick={() => setActiveTab('stories')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Plus size={16} /> Create Story
                    </button>
                    <button
                      className="ghost-btn"
                      onClick={handleSeed}
                      disabled={isSeeding}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', opacity: isSeeding ? 0.6 : 1 }}
                    >
                      <Database size={16} /> {isSeeding ? 'Seeding...' : 'Load Demo Data'}
                    </button>
                    <button className="ghost-btn" onClick={() => setActiveTab('assets')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Layers size={16} /> Manage Assets
                    </button>
                  </div>
                </div>

                {/* Stories Table */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div className="section-label">Recent Stories</div>
                    <button className="ghost-btn" onClick={() => setActiveTab('stories')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  <div style={{ border: '1px solid var(--border)' }}>
                    {/* Table header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px', padding: '0.8rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <div className="section-label">Story Title</div>
                      <div className="section-label">Status</div>
                      <div className="section-label">ID</div>
                    </div>
                    {isLoading ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                    ) : stories.length === 0 ? (
                      <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <BarChart3 size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No stories yet. Create one or load demo data.</p>
                      </div>
                    ) : stories.slice(0, 6).map((story, i) => (
                      <div
                        key={story.id}
                        style={{
                          display: 'grid', gridTemplateColumns: '1fr 140px 100px',
                          padding: '1rem 1.5rem', borderBottom: i < Math.min(stories.length, 6) - 1 ? '1px solid var(--border)' : 'none',
                          cursor: 'pointer', transition: 'background 0.15s'
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--surface2)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setActiveTab('stories')}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{story.title}</div>
                        <div>
                          <span style={{
                            padding: '0.25rem 0.7rem', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px',
                            background: story.isVisible !== false ? 'rgba(74,222,128,0.12)' : 'rgba(255,71,87,0.12)',
                            color: story.isVisible !== false ? 'var(--success)' : 'var(--danger)',
                            border: `1px solid ${story.isVisible !== false ? 'var(--success)' : 'var(--danger)'}`,
                            textTransform: 'uppercase'
                          }}>
                            {story.isVisible !== false ? 'Published' : 'Hidden'}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          {story.id.slice(0, 8)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stories' && <StoryStudio stories={stories} isLoading={isLoading} onRefresh={fetchData} />}
            {activeTab === 'settings' && <SettingsPanel />}
            {activeTab === 'assets' && <AssetLibrary />}
          </motion.div>
        </AnimatePresence>

        {/* Custom Confirm Modal for Seeding */}
        <AnimatePresence>
          {showConfirmSeed && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'var(--overlay)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  padding: '2.5rem', maxWidth: '450px', width: '90%',
                  display: 'flex', flexDirection: 'column', gap: '1.5rem',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', width: '20px', height: '20px', borderLeft: '2px solid var(--accent)', borderTop: '2px solid var(--accent)' }} />
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
                  Load Demo Data?
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  This will generate the complete story library with full branching chapters and cinematic assets. Proceed?
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button className="action-btn" style={{ flex: 1 }} onClick={confirmSeed}>Proceed</button>
                  <button className="ghost-btn" style={{ flex: 1 }} onClick={() => setShowConfirmSeed(false)}>Cancel</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
