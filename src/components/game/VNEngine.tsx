import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { ChevronRight, Home, SkipForward, Trophy, X, Volume2, VolumeX } from 'lucide-react';

const VNEngine: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const {
    currentScene,
    dialogueIndex,
    nextStep,
    jumpToScene,
    resetGame,
    completeChapter,
    currentChapter,
    currentStory,
    appSettings
  } = useGame();

  const [isAuto, setIsAuto] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [choiceFeedback, setChoiceFeedback] = useState<'correct' | 'wrong' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentBgmRef = useRef<string | null>(null);

  // BGM management — crossfade when scene bgmUrl changes
  const playBgm = useCallback((url: string | undefined) => {
    if (!url) {
      if (audioRef.current) {
        audioRef.current.pause();
        currentBgmRef.current = null;
      }
      return;
    }
    if (currentBgmRef.current === url) return; // same track, keep playing
    currentBgmRef.current = url;
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = isMuted ? 0 : 0.5;
    audio.play().catch(() => {}); // autoplay may be blocked
    audioRef.current = audio;
  }, [isMuted]);

  useEffect(() => {
    playBgm(currentScene?.bgmUrl);
    return () => { /* keep playing between scenes */ };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene?.bgmUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : 0.5;
  }, [isMuted]);

  // Sync Local Theme Color (Scoped to this component)
  const engineRootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!engineRootRef.current) return;
    const color = currentStory?.primaryColor || '#7c3aed';
    engineRootRef.current.style.setProperty('--accent', color);
    engineRootRef.current.style.setProperty('--accent-low', `${color}33`);
  }, [currentStory?.primaryColor]);

  // Stop BGM on unmount
  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  // Auto-play timer
  useEffect(() => {
    let timer: any;
    if (isAuto && currentScene?.type === 'dialogue') {
      timer = setTimeout(() => { nextStep(); }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isAuto, currentScene, dialogueIndex, nextStep]);

  if (!currentScene) return null;

  const currentDialogue = currentScene.dialogue?.[dialogueIndex];

  return (
    <div 
      ref={engineRootRef}
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        zIndex: 50, background: '#000',
        '--accent': currentStory?.primaryColor || '#7c3aed',
        '--accent-low': `${currentStory?.primaryColor || '#7c3aed'}33`
      } as any}
    >
      {/* ── BACKGROUND LAYER ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentScene.backgroundUrl || currentScene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: currentScene.backgroundUrl ? `url(${currentScene.backgroundUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: currentScene.backgroundUrl ? undefined : '#0d0f1a'
          }}
        />
      </AnimatePresence>

      {/* Cinematic letterbox */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8vh', background: 'rgba(0,0,0,0.85)', zIndex: 2 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8vh', background: 'rgba(0,0,0,0.85)', zIndex: 2 }} />

      {/* ── HUD TOP ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', zIndex: 10, pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <HudBtn icon={<Home size={16} />} label="Menu" onClick={() => setShowMenu(true)} />
          <HudBtn
            icon={<SkipForward size={16} />}
            label={isAuto ? 'Auto ON' : 'Auto'}
            onClick={() => setIsAuto(!isAuto)}
            active={isAuto}
          />
          {appSettings?.showMusicToggle !== false && (
            <HudBtn
              icon={isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              label={isMuted ? 'Muted' : 'Music'}
              onClick={() => setIsMuted(!isMuted)}
              active={isMuted}
            />
          )}
        </div>
        {/* Progress indicator */}
        {currentScene.type === 'dialogue' && currentScene.dialogue && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '100px', height: '3px',
              background: 'rgba(255,255,255,0.15)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${((dialogueIndex + 1) / currentScene.dialogue.length) * 100}%`,
                background: 'var(--accent)',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '2px' }}>
              {dialogueIndex + 1}/{currentScene.dialogue.length}
            </span>
            {/* Subtle debug info for admin */}
            <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.15)', marginLeft: '1rem' }}>
              ID: {currentScene.id.slice(0,4)} | Type: {currentScene.type}
            </span>
          </div>
        )}
      </div>

      {/* ── CHARACTER SPRITES ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center', zIndex: 5,
        paddingBottom: 'clamp(180px, 30vh, 280px)',
        pointerEvents: 'none'
      }}>
        <AnimatePresence mode="popLayout">
          {currentDialogue?.activeCharacters?.map((char: any, i: number) => {
            const imageUrl = char.url || char.image || char.imageUrl || char.characterImageUrl || char.spriteUrl;
            if (!imageUrl) return null;
            // Determine position offset for left/right/center
            const positions = [
              { left: '50%', transform: 'translateX(-50%)' },
              { left: '20%', transform: 'translateX(-50%)' },
              { left: '80%', transform: 'translateX(-50%)' }
            ];
            const pos = positions[i] || positions[0];
            return (
              <motion.div
                key={`${char.name || 'char'}-${i}`}
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.96 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  height: 'clamp(200px, 45vh, 420px)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  position: 'absolute',
                  ...pos
                }}
              >
                <img
                  src={imageUrl}
                  alt={char.name || 'Character'}
                  style={{
                    height: '100%', width: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'
                  }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── DIALOGUE LAYER ── */}
      {currentScene.type === 'dialogue' && currentDialogue && (
        <>
          {/* Gradient background for text */}
          <div className="hud-gradient" />

          <motion.div
            className="vn-text-area"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={nextStep}
          >
            {currentDialogue.characterName && (
              <div className="vn-name-tag">{currentDialogue.characterName}</div>
            )}
            <AnimatePresence mode="wait">
              <motion.p
                key={`${dialogueIndex}-${currentDialogue.text?.slice(0, 20)}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                  lineHeight: 1.7,
                  fontWeight: 500,
                  color: 'var(--text)',
                  maxWidth: '80vw'
                }}
              >
                {currentDialogue.text}
              </motion.p>
            </AnimatePresence>

            {/* Click indicator */}
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
              style={{
                position: 'absolute', bottom: '5rem', right: '8%',
                color: 'var(--accent)', opacity: 0.7
              }}
            >
              <ChevronRight size={28} strokeWidth={3} />
            </motion.div>
          </motion.div>
        </>
      )}

      {/* ── CHOICES ── */}
      <AnimatePresence>
        {(currentScene.type === 'choice' || currentScene.type === 'branch') && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--overlay)', backdropFilter: 'blur(4px)',
            pointerEvents: 'auto'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%', maxWidth: '600px', padding: '2rem' }}
            >
              <div className="section-label" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                — {currentScene.type === 'branch' ? 'Challenge' : 'Make Your Choice'} —
              </div>
              {currentScene.choices?.map((choice, i) => (
                <motion.button
                  key={choice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                    onClick={() => {
                      const targetId = choice.nextSceneId;
                      
                      if (currentScene.type === 'branch') {
                        // Branch logic: Must be correct to advance
                        if (choice.isCorrect) {
                          setChoiceFeedback('correct');
                          setTimeout(async () => {
                            await jumpToScene(targetId);
                            setChoiceFeedback(null);
                          }, 1000);
                        } else {
                          setChoiceFeedback('wrong');
                          setTimeout(() => {
                            setChoiceFeedback(null);
                            // Stay on same scene (loop)
                          }, 1000);
                        }
                        return;
                      }

                      // Standard choice logic
                      if (!targetId) {
                                console.warn("Choice has no nextSceneId!");
                                if (onExit) onExit();
                                return;
                      }

                      if (choice.isCorrect !== undefined) {
                        setChoiceFeedback(choice.isCorrect ? 'correct' : 'wrong');
                        setTimeout(async () => {
                          await jumpToScene(targetId);
                          setChoiceFeedback(null);
                        }, 1000);
                      } else {
                        jumpToScene(targetId);
                      }
                    }}
                  style={{
                    padding: '1.2rem 2rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    textAlign: 'left',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: '1rem'
                  }}
                  whileHover={{ background: 'var(--surface2)', borderColor: 'var(--accent)', x: 8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span style={{ color: 'var(--accent)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '2px', flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {choice.text}
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CHOICE FEEDBACK OVERLAY ── */}
      <AnimatePresence>
        {choiceFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: choiceFeedback === 'correct' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
              backdropFilter: 'blur(10px)',
              pointerEvents: 'auto'
            }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                background: 'var(--surface)',
                padding: '2rem 4rem',
                borderRadius: '20px',
                border: `4px solid ${choiceFeedback === 'correct' ? '#10b981' : '#ef4444'}`,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                textAlign: 'center'
              }}
            >
              <h2 style={{ 
                fontFamily: "'Bebas Neue', sans-serif", 
                fontSize: '4rem', 
                color: choiceFeedback === 'correct' ? '#10b981' : '#ef4444',
                margin: 0,
                letterSpacing: '4px'
              }}>
                {choiceFeedback === 'correct' ? 'NICE!' : 'OOF...'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontWeight: 700, marginTop: '0.5rem' }}>
                {choiceFeedback === 'correct' ? 'Great decision!' : 'That could have gone better.'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ENDING SCREEN ── */}
      <AnimatePresence>
        {currentScene.type === 'ending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 30,
              background: 'var(--overlay)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'auto',
              backdropFilter: 'blur(8px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', bounce: 0.3 }}
              style={{
                textAlign: 'center', maxWidth: '600px', padding: '4rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                position: 'relative'
              }}
            >
              {/* Corner accents */}
              <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '30px', height: '30px', borderLeft: '2px solid var(--accent)', borderTop: '2px solid var(--accent)' }} />
              <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', width: '30px', height: '30px', borderRight: '2px solid var(--accent)', borderBottom: '2px solid var(--accent)' }} />

              <Trophy size={48} color="var(--accent2)" style={{ marginBottom: '2rem' }} />

              <div className="section-label" style={{ marginBottom: '1rem', color: 'var(--accent)' }}>
                — Chapter Complete —
              </div>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '4rem', letterSpacing: '4px',
                color: 'var(--text)', marginBottom: '1.5rem'
              }}>
                {currentScene.isGoodEnd !== false ? 'True End' : 'Bad End'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '3rem' }}>
                {currentScene.isGoodEnd !== false
                  ? 'Congratulations. You found the true path. The next chapter has been unlocked.'
                  : 'Your choices led here. Return and find the correct path to continue.'}
              </p>
              
              <div style={{ position: 'absolute', bottom: '0.5rem', right: '1rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.1)' }}>
                Scene ID: {currentScene.id}
              </div>

              <button
                className="action-btn"
                style={{ margin: '0 auto', padding: '1rem 3rem', fontSize: '1.1rem' }}
                onClick={() => {
                  if (currentChapter && currentScene.isGoodEnd !== false) completeChapter(currentChapter.id);
                  if (onExit) onExit();
                  else resetGame();
                }}
              >
                Return to Chapters
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAUSE MENU ── */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 40,
              background: 'var(--overlay)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                padding: '3rem', minWidth: '300px',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                position: 'relative'
              }}
            >
              <button onClick={() => setShowMenu(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
              <div className="section-label">Paused</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>Game Menu</h3>

              <button className="ghost-btn" style={{ justifyContent: 'flex-start' }} onClick={() => { setShowMenu(false); }}>
                ▶ Resume
              </button>
              <button className="ghost-btn" style={{ justifyContent: 'flex-start' }} onClick={() => { setIsAuto(!isAuto); setShowMenu(false); }}>
                ⏩ Auto Play {isAuto ? '(ON)' : '(OFF)'}
              </button>
              <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }} />
              <button
                className="ghost-btn"
                style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}
                onClick={() => { setShowMenu(false); if (onExit) onExit(); else resetGame(); }}
              >
                ⬅ Return to Menu
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HudBtn = ({ icon, label, onClick, active }: any) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: active ? 'var(--accent)' : 'var(--surface)',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      color: active ? 'var(--white)' : 'var(--text-muted)',
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px',
      backdropFilter: 'blur(4px)',
      textTransform: 'uppercase'
    }}
  >
    {icon} {label}
  </motion.button>
);

export default VNEngine;
