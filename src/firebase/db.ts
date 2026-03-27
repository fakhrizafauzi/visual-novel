import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc,
  deleteDoc,
  query, 
  where, 
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './config';
import type { Story, Chapter, Scene, Asset, AppSettings } from '../types/game';

// Generic CRUD helper
const createCRUD = <T extends { id?: string }>(collectionName: string) => {
  return {
    getAll: async (filters?: { field: string, value: any }[]) => {
      let q = query(collection(db, collectionName));
      if (filters) {
        filters.forEach(f => {
          q = query(q, where(f.field, '==', f.value));
        });
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    },
    getOne: async (id: string) => {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null;
    },
    add: async (data: Omit<T, 'id'>) => {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },
    update: async (id: string, data: Partial<T>) => {
      const docRef = doc(db, collectionName, id);
      // Use setDoc with merge to ensure doc exists
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    },
    remove: async (id: string) => {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    }
  };
};

export const StoryService = createCRUD<Story>('stories');
export const ChapterService = createCRUD<Chapter>('chapters');
export const SceneService = createCRUD<Scene>('scenes');
export const AssetService = createCRUD<Asset>('assets');
export const SettingsService = createCRUD<AppSettings>('settings');

export const getAppSettings = async () => {
  // Try to get specifically the 'global' document
  const globalSettings = await SettingsService.getOne('global');
  if (globalSettings) return globalSettings;
  
  // Fallback to first found
  const allSettings = await SettingsService.getAll();
  return allSettings.length > 0 ? allSettings[0] : null;
};

// Specific queries
export const getChaptersByStory = (storyId: string) => 
  ChapterService.getAll([{ field: 'storyId', value: storyId }]);

export const getScenesByChapter = (chapterId: string) => 
  SceneService.getAll([{ field: 'chapterId', value: chapterId }]);
