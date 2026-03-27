import React, { useState } from 'react';
import MainMenu from '../components/game/MainMenu';
import VNEngine from '../components/game/VNEngine';
import StorySelector from '../components/game/StorySelector';
import ChapterSelector from '../components/game/ChapterSelector';
import { useGame } from '../context/GameContext';

const Game: React.FC = () => {
  const { loadStory, loadChapter, currentScene, loadSave, clearScene } = useGame();
  const [gameState, setGameState] = useState<'menu' | 'story-select' | 'chapter-select' | 'playing' | 'settings' | 'credits'>('menu');

  // Sync gameState with currentScene to handle external resets (like the Menu button)
  React.useEffect(() => {
    if (!currentScene && gameState === 'playing') {
      setGameState('menu');
    }
  }, [currentScene, gameState]);

  const handleStorySelect = async (storyId: string) => {
    const loadedScene = await loadSave(storyId);
    
    // If we have a save, and it's NOT an ending, we can resume.
    // If it IS an ending, they probably finished the story, so go to chapter-select.
    if (loadedScene && loadedScene.type !== 'ending') {
      setGameState('playing');
    } else {
      await loadStory(storyId);
      setGameState('chapter-select');
    }
  };

  const goToChapterSelect = () => {
    // This is called after clearing a chapter
    clearScene();
    setGameState('chapter-select');
  };

  const handleChapterSelect = async (chapterId: string) => {
    await loadChapter(chapterId);
    setGameState('playing');
  };

  return (
    <div className="game-page" style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {gameState === 'menu' && (
        <MainMenu 
          onStart={() => setGameState('story-select')} 
          onCredits={() => setGameState('credits')} 
        />
      )}

      {gameState === 'story-select' && (
        <StorySelector 
          onSelect={handleStorySelect} 
          onBack={() => setGameState('menu')} 
        />
      )}

      {gameState === 'chapter-select' && (
        <ChapterSelector 
          onSelect={handleChapterSelect} 
          onBack={() => setGameState('story-select')} 
        />
      )}

      {gameState === 'playing' && (
        <VNEngine onExit={goToChapterSelect} />
      )}

      {(gameState === 'settings' || gameState === 'credits') && (
        <div className="manga-modal-overlay" onClick={() => setGameState('menu')}>
          <div className="manga-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Accents */}
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '30px', height: '30px', borderLeft: '2px solid var(--accent)', borderTop: '2px solid var(--accent)' }} />
            <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', width: '30px', height: '30px', borderRight: '2px solid var(--accent)', borderBottom: '2px solid var(--accent)' }} />

            <div className="section-label" style={{ marginBottom: '1rem', color: 'var(--accent)' }}>
              {gameState === 'settings' ? 'Configuration' : 'System Information'}
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', letterSpacing: '2px', marginBottom: '2rem' }}>
              {gameState === 'settings' ? 'Settings' : 'About & Credits'}
            </h2>
            
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              {gameState === 'settings' ? (
                <p>Volume and Text speed controls coming soon.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: '0.5rem' }}>Development Team</h3>
                    <p>Developed by the AntiGravity Engine Team.<br/>Special thanks to <strong>Ryza</strong> for inspiration and testing.</p>
                  </div>
                  <div style={{ height: '1px', background: 'var(--border)' }} />
                  <div>
                    <h3 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: '0.5rem' }}>How to Play</h3>
                    <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <li><strong>Click or Tap</strong> anywhere to advance dialogue.</li>
                      <li>Use the <strong>Auto</strong> button in the top HUD to progress automatically.</li>
                      <li>Make choices carefully—they affect the story outcome and endings.</li>
                      <li>If you find a Bad End, you will be brought back to the chapter select screen to try again.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <button className="action-btn" style={{ padding: '0.8rem 2.5rem' }} onClick={() => setGameState('menu')}>
              Return to Menu
            </button>
          </div>
        </div>
      )}

      {/* Background Ambience (Shared) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent, rgba(0,0,0,0.4))'
        }} />
      </div>
    </div>
  );
};

export default Game;
