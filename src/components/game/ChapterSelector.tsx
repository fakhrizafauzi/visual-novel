import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { ChapterService } from '../../firebase/db';
import type { Chapter } from '../../types/game';
import { Lock, Play, ChevronLeft, ChevronRight, Loader2, CheckCircle } from 'lucide-react';

interface ChapterSelectorProps {
  onSelect: (chapterId: string) => void;
  onBack: () => void;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({ onSelect, onBack }) => {
  const { currentStory, isLoading: gameLoading, unlockedChapters, appSettings } = useGame();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!currentStory) return;
      setLoading(true);
      try {
        const list = await ChapterService.getAll([{ field: 'storyId', value: currentStory.id }]);
        setChapters(list.sort((a, b) => a.order - b.order));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, [currentStory]);

  const currentUnlockOrder = currentStory ? (unlockedChapters[currentStory.id] || 1) : 1;
  const isLoading = loading || gameLoading;

  const currentChapter = chapters[selectedIndex];
  const isLocked = currentChapter ? currentChapter.order > currentUnlockOrder : false;
  const completedCount = chapters.filter(c => c.order < currentUnlockOrder).length;

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative'
    }}>
      <div className="scan-line" />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.5rem 4rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button className="ghost-btn" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem' }}>
            <ChevronLeft size={18} /> Change Story
          </button>
          <div style={{ width: '1px', height: '30px', background: 'var(--border)' }} />
          <div>
            <div className="section-label">{appSettings?.chapterSelectTitle || 'Chapters'}</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
              {currentStory?.title || 'Select a Chapter'}
            </h1>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span className="section-label">
            {completedCount}/{chapters.length} COMPLETED
          </span>
          <div style={{ width: '120px', height: '4px', background: 'var(--border)' }}>
            <div style={{
              width: `${chapters.length ? (completedCount / chapters.length) * 100 : 0}%`,
              height: '100%', background: 'var(--accent)',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '1rem' }}>
            <Loader2 size={40} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
            <span className="section-label">Loading Chapters...</span>
          </div>
        ) : (
          <>
            {/* LEFT — Chapter List */}
            <div style={{
              width: '380px', flexShrink: 0,
              borderRight: '1px solid var(--border)',
              overflowY: 'auto',
              background: 'var(--surface)'
            }}>
              {chapters.map((chapter, index) => {
                const locked = chapter.order > currentUnlockOrder;
                const completed = chapter.order < currentUnlockOrder;
                const active = index === selectedIndex;

                return (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`chapter-row ${locked ? 'locked' : ''}`}
                    onClick={() => { setSelectedIndex(index); }}
                    style={{
                      borderLeft: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
                      background: active ? 'var(--accent-low)' : undefined,
                      cursor: 'pointer',
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.2rem',
                      borderBottom: '1px solid var(--border-light)'
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', flexShrink: 0,
                      border: `2px solid ${locked ? 'var(--border)' : completed ? 'var(--success)' : 'var(--accent)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: locked ? 'var(--text-muted)' : completed ? 'var(--success)' : 'var(--accent)',
                    }}>
                      {locked ? <Lock size={16} /> : completed ? <CheckCircle size={16} /> : <Play size={16} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="section-label" style={{ marginBottom: '0.2rem' }}>
                        Chapter {String(chapter.order).padStart(2, '0')}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: locked ? 'var(--text-muted)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {chapter.title}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* RIGHT — Chapter Preview */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4rem', position: 'relative' }}>
              {currentChapter ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentChapter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                  >
                    {/* Chapter number big decoration */}
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: '10rem', lineHeight: 0.8,
                      color: 'var(--border)', userSelect: 'none',
                      position: 'absolute', top: '2rem', right: '4rem',
                      pointerEvents: 'none', zIndex: 1, opacity: 0.5
                    }}>
                      {String(currentChapter.order).padStart(2, '0')}
                    </div>

                    {/* Thumbnail Background */}
                    {currentChapter.thumbnailUrl && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url(${currentChapter.thumbnailUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 0,
                        opacity: 0.3
                      }}>
                        <div style={{ 
                          position: 'absolute', inset: 0, 
                          background: 'linear-gradient(to right, var(--bg) 0%, transparent 60%, var(--bg) 100%), linear-gradient(to top, var(--bg) 0%, transparent 50%)' 
                        }} />
                      </div>
                    )}

                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div className="section-label" style={{ marginBottom: '1rem' }}>
                        Chapter {String(currentChapter.order).padStart(2, '0')}
                      </div>
                      <h2 style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                        letterSpacing: '2px',
                        lineHeight: 1,
                        marginBottom: '2rem',
                        color: isLocked ? 'var(--text-muted)' : 'var(--text)'
                      }}>
                        {currentChapter.title}
                      </h2>

                      {isLocked ? (
                        <div style={{
                          padding: '2rem', background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', gap: '1.5rem',
                          maxWidth: '500px', marginBottom: 'auto'
                        }}>
                          <Lock size={32} color="var(--text-muted)" />
                          <div>
                            <div style={{ fontWeight: 800, marginBottom: '0.3rem' }}>Chapter Locked</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                              Complete the previous chapter with the correct ending to unlock this content.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '500px', marginBottom: 'auto' }}>
                          {currentChapter.synopsis || 'Your story continues here. Every choice shapes your destiny.'}
                        </p>
                      )}

                      {/* Navigation + Play */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
                        <button
                          onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                          className="ghost-btn"
                          disabled={selectedIndex === 0}
                          style={{ padding: '0.8rem', opacity: selectedIndex === 0 ? 0.3 : 1 }}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() => setSelectedIndex(Math.min(chapters.length - 1, selectedIndex + 1))}
                          className="ghost-btn"
                          disabled={selectedIndex === chapters.length - 1}
                          style={{ padding: '0.8rem', opacity: selectedIndex === chapters.length - 1 ? 0.3 : 1 }}
                        >
                          <ChevronRight size={20} />
                        </button>

                        {!isLocked && (
                          <motion.button
                            className="action-btn"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onSelect(currentChapter.id)}
                            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', marginLeft: 'auto' }}
                          >
                            <Play size={18} fill="currentColor" style={{ marginRight: '0.8rem' }} /> Begin Chapter
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Select a chapter from the list
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChapterSelector;
