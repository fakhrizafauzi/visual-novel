import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { Book, ChevronLeft, Loader2, Play, Star } from 'lucide-react';

interface StorySelectorProps {
  onSelect: (storyId: string) => void;
  onBack: () => void;
}

const StorySelector: React.FC<StorySelectorProps> = ({ onSelect, onBack }) => {
  const { storyList, fetchStories, isLoading, appSettings } = useGame();

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const visible = storyList.filter(s => s.isVisible !== false);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div className="scan-line" />

      {/* TOP HEADER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem 4rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button className="ghost-btn" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem' }}>
            <ChevronLeft size={18} /> Back
          </button>
          <div style={{ width: '1px', height: '30px', background: 'var(--border)' }} />
          <div>
            <div className="section-label">Story Library</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
              {appSettings?.storySelectTitle || 'Choose Your Story'}
            </h1>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="section-label">{visible.length} {visible.length === 1 ? 'STORY' : 'STORIES'} AVAILABLE</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
            <Loader2 size={40} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
            <span className="section-label">Loading Library...</span>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', color: 'var(--text-muted)' }}>
            <Book size={64} opacity={0.2} />
            <div className="section-label">Library is Empty</div>
            <p style={{ fontSize: '0.95rem' }}>No stories available. Ask an admin to add content.</p>
          </div>
        ) : (
          <div 
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            style={{
              display: 'flex',
              gap: 0,
              height: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollBehavior: 'smooth'
            }}
          >
            {visible.map((story, index) => (
              <StoryPanel key={story.id} story={story} index={index} total={visible.length} onSelect={() => onSelect(story.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StoryPanel = ({ story, index, total, onSelect }: any) => {
  const isStarted = !!(localStorage.getItem('lumina_saves') &&
    JSON.parse(localStorage.getItem('lumina_saves') || '{}')[story.id]);

  const panelWidth = `${100 / total}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      onClick={onSelect}
      style={{
        width: panelWidth,
        minWidth: '280px',
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
        flexGrow: 1
      }}
      whileHover="hover"
    >
      {/* BG Art */}
      <motion.div
        style={{ position: 'absolute', inset: 0 }}
        variants={{ hover: { scale: 1.05 } }}
        transition={{ duration: 0.5 }}
      >
        {story.coverImageUrl ? (
          <img src={story.coverImageUrl} alt={story.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, hsl(${index * 40 + 200}, 40%, 15%), hsl(${index * 40 + 220}, 30%, 8%))`,
          }}>
            <div style={{ position: 'absolute', bottom: '30%', left: '50%', transform: 'translateX(-50%)' }}>
              <Book size={80} color="var(--border)" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Gradient overlay */}
      <div className="img-overlay" />

      {/* Vertical index bar */}
      <div style={{
        position: 'absolute',
        top: '2rem', left: '2rem',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '5rem',
        color: 'var(--text)',
        opacity: 0.05,
        letterSpacing: '-2px',
        lineHeight: 1,
        userSelect: 'none'
      }}>
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Status Tag */}
      <div style={{
        position: 'absolute',
        top: '1.5rem', right: '1.5rem',
        background: isStarted ? 'var(--accent)' : 'var(--surface)',
        border: `1px solid ${isStarted ? 'var(--accent)' : 'var(--border)'}`,
        padding: '0.4rem 0.8rem',
        fontSize: '0.65rem',
        fontWeight: 900,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: 'var(--white)',
        display: 'flex', alignItems: 'center', gap: '0.4rem'
      }}>
        {isStarted ? <><Star size={10} fill="var(--white)" /> Continue</> : 'New'}
      </div>

      {/* Bottom Content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2.5rem 2rem' }}>
        <div className="section-label" style={{ marginBottom: '0.5rem' }}>Story {String(index + 1).padStart(2, '0')}</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>
          {story.title}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {story.description || 'Begin your adventure...'}
        </p>

        <motion.div
          variants={{ hover: { x: 6 } }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}
        >
          <Play size={16} fill="var(--accent)" /> Play Now
        </motion.div>
      </div>

      {/* Hover accent bar */}
      <motion.div
        variants={{ hover: { scaleY: 1, opacity: 1 } }}
        initial={{ scaleY: 0, opacity: 0 }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
          background: 'var(--accent)',
          transformOrigin: 'top'
        }}
      />
    </motion.div>
  );
};

export default StorySelector;
