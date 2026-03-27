export interface Story {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  startChapterId: string;
  primaryColor?: string; // Hex code for UI branding
  isVisible?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Chapter {
  id: string;
  storyId: string;
  title: string;
  synopsis?: string;
  thumbnailUrl?: string; // Cinematic preview image
  order: number;
  startSceneId: string;
}

export type SceneType = 'dialogue' | 'choice' | 'transition' | 'ending' | 'branch';

export interface Scene {
  id: string;
  chapterId: string;
  type: SceneType;
  backgroundUrl: string;
  bgmUrl?: string;
  nextSceneId?: string; // For linear progression
  dialogue?: DialogueLine[]; // Array of dialogue for this scene
  choices?: Choice[]; // For choice type scenes
  endingId?: string; // For ending type scenes
  isGoodEnd?: boolean; // Determines if the chapter clears
}

export interface DialogueLine {
  id: string;
  characterName: string;
  text: string;
  activeCharacters?: ActiveCharacter[]; // Up to 3 characters
  characterImageUrl?: string; // Legacy fallback
  expression?: string;
  position?: 'left' | 'center' | 'right'; // Legacy fallback
  sfxUrl?: string;
}

export interface ActiveCharacter {
  name: string;
  image: string;
  position: 'left' | 'center' | 'right';
  animation?: string; // Template name: fade, slide-up, etc.
  x?: number; // 0-100 percentage
  y?: number; // 0-100 percentage
}

export interface Choice {
  id: string;
  text: string;
  nextSceneId: string;
  isCorrect?: boolean;
  logicResult?: string; // For complex branching
}

export interface Ending {
  id: string;
  storyId: string;
  title: string;
  description: string;
  type: 'good' | 'bad' | 'true';
  imageUrl: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'audio';
  category: 'background' | 'character' | 'bgm' | 'sfx';
  url: string;
}

export interface Checkpoint {
  id: string;
  playerId: string;
  storyId: string;
  sceneId: string;
  timestamp: any;
}

export interface AppSettings {
  id: string;
  themeOutlineColor: string; // Used for the Kawaii thick borders
  globalBackgroundUrl: string;
  globalBackgroundColor: string;
  menuTitle?: string;
  menuStartBtn?: string;
  menuAboutBtn?: string;
  storySelectTitle?: string;
  chapterSelectTitle?: string;
  showAccents?: boolean;
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  showMusicToggle?: boolean;
}
