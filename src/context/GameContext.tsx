import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Story, Chapter, Scene, AppSettings } from '../types/game';
import { StoryService, ChapterService, SceneService, getAppSettings } from '../firebase/db';

interface GameContextType {
  currentStory: Story | null;
  currentChapter: Chapter | null;
  currentScene: Scene | null;
  dialogueIndex: number;
  storyList: Story[];
  isLoading: boolean;
  unlockedChapters: Record<string, number>; // storyId -> maxOrder
  lastCheckpointId: string | null;
  appSettings: AppSettings | null;
  isInitialLoading: boolean;
  
  loadStory: (storyId: string) => Promise<void>;
  loadChapter: (chapterId: string) => Promise<void>;
  completeChapter: (chapterId: string) => void;
  fetchStories: () => Promise<void>;
  nextStep: () => void;
  jumpToScene: (sceneId: string) => Promise<void>;
  resetGame: () => void;
  restartFromCheckpoint: () => void;
  saveGame: () => void;
  loadSave: (storyId: string) => Promise<Scene | null>;
  clearScene: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [storyList, setStoryList] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheckpointId, setLastCheckpointId] = useState<string | null>(null);
  const [unlockedChapters, setUnlockedChapters] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('lumina_progress');
    return saved ? JSON.parse(saved) : {};
  });
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  React.useEffect(() => {
    getAppSettings().then((settings) => {
      setAppSettings(settings);
      setIsInitialLoading(false);
      if (settings?.themeOutlineColor) {
        // App theme color (Default for the site)
        document.documentElement.style.setProperty('--accent', settings.themeOutlineColor);
        document.documentElement.style.setProperty('--kawaii-color', settings.themeOutlineColor);
      }
      if (settings?.globalBackgroundUrl) {
        document.body.style.backgroundImage = `url(${settings.globalBackgroundUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      } else {
        document.body.style.backgroundImage = 'none';
      }
    });
  }, []);

  const saveProgress = useCallback((storyId: string, order: number) => {
    setUnlockedChapters(prev => {
      const currentMax = prev[storyId] || 1;
      if (order > currentMax) {
        const next = { ...prev, [storyId]: order };
        localStorage.setItem('lumina_progress', JSON.stringify(next));
        return next;
      }
      return prev;
    });
  }, []);

  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    try {
      const stories = await StoryService.getAll();
      setStoryList(stories);
    } catch (e) {
      console.error("Fetch Stories Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStory = async (storyId: string) => {
    setIsLoading(true);
    try {
      const story = await StoryService.getOne(storyId);
      if (story) {
        setCurrentStory(story);
        setLastCheckpointId(null);
      }
    } catch (e) {
      console.error("Story Load Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChapter = async (chapterId: string) => {
    setIsLoading(true);
    setCurrentScene(null);
    try {
      const chapter = await ChapterService.getOne(chapterId);
      if (chapter && chapter.startSceneId) {
        setCurrentChapter(chapter);
        const scene = await SceneService.getOne(chapter.startSceneId);
        setCurrentScene(scene);
        setDialogueIndex(0);
      }
    } catch (e) {
      console.error("Chapter Load Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const completeChapter = (_chapterId: string) => {
    if (!currentStory || !currentChapter) return;
    saveProgress(currentStory.id, currentChapter.order + 1);
  };

  const jumpToScene = async (sceneId: string) => {
    const scene = await SceneService.getOne(sceneId);
    if (scene) {
      if (scene.type === 'choice') {
        setLastCheckpointId(sceneId);
      }
      setCurrentScene(scene);
      setDialogueIndex(0);
    }
  };

  const restartFromCheckpoint = async () => {
    if (lastCheckpointId) {
      await jumpToScene(lastCheckpointId);
    }
  };

  const nextStep = useCallback(async () => {
    if (!currentScene) return;

    if (currentScene.type === 'dialogue' && currentScene.dialogue) {
      if (dialogueIndex < currentScene.dialogue.length - 1) {
        setDialogueIndex(prev => prev + 1);
        return;
      }
    }

    if (currentScene.nextSceneId) {
      await jumpToScene(currentScene.nextSceneId);
      return;
    }
  }, [currentScene, dialogueIndex]);

  const resetGame = () => {
    setCurrentStory(null);
    setCurrentChapter(null);
    setCurrentScene(null);
    setDialogueIndex(0);
    setLastCheckpointId(null);
  };

  const clearScene = () => {
    setCurrentScene(null);
  };

  const saveGame = useCallback(() => {
    if (!currentStory || !currentChapter || !currentScene) return;
    
    const save = {
      storyId: currentStory.id,
      chapterId: currentChapter.id,
      sceneId: currentScene.id,
      dialogueIndex,
      updatedAt: new Date().toISOString()
    };
    
    const allSaves = JSON.parse(localStorage.getItem('lumina_saves') || '{}');
    allSaves[currentStory.id] = save;
    localStorage.setItem('lumina_saves', JSON.stringify(allSaves));
  }, [currentStory, currentChapter, currentScene, dialogueIndex]);

  const loadSave = async (storyId: string) => {
    const allSaves = JSON.parse(localStorage.getItem('lumina_saves') || '{}');
    const save = allSaves[storyId];
    
    if (save) {
      setIsLoading(true);
      try {
        const story = await StoryService.getOne(save.storyId);
        const chapter = await ChapterService.getOne(save.chapterId);
        const scene = await SceneService.getOne(save.sceneId);
        
        if (story && chapter && scene) {
          setCurrentStory(story);
          setCurrentChapter(chapter);
          setCurrentScene(scene);
          setDialogueIndex(save.dialogueIndex);
          return scene;
        }
      } catch (e) {
        console.error("Load Save Error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    return null;
  };

  React.useEffect(() => {
    if (currentScene) {
      saveGame();
    }
  }, [currentScene, dialogueIndex, saveGame]);

  return (
    <GameContext.Provider value={{
      currentStory,
      currentChapter,
      currentScene,
      dialogueIndex,
      storyList,
      isLoading,
      unlockedChapters,
      lastCheckpointId,
      appSettings,
      isInitialLoading,
      loadStory,
      loadChapter,
      completeChapter,
      fetchStories,
      nextStep,
      jumpToScene,
      resetGame,
      restartFromCheckpoint,
      saveGame,
      loadSave,
      clearScene
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
