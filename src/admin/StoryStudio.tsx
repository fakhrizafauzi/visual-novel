import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Save, BookOpen, Clock, Film, ChevronDown, ChevronRight, Edit2
} from 'lucide-react';
import { StoryService, ChapterService, getChaptersByStory, getScenesByChapter } from '../firebase/db';
import type { Story, Chapter, Scene } from '../types/game';
import { useSnackbar } from '../context/SnackbarContext';
import SceneManager from './SceneManager';
import ConfirmModal from '../components/ui/ConfirmModal';

interface StoryStudioProps {
  stories: Story[];
  isLoading?: boolean;
  onRefresh: () => void;
}

const StoryStudio: React.FC<StoryStudioProps> = ({ stories, onRefresh }) => {
  const { showSnackbar } = useSnackbar();
  
  // Selection State
  const [activeNode, setActiveNode] = useState<{ type: 'story' | 'chapter' | 'scene' | null, id: string | null }>({ type: null, id: null });
  
  // Caches & Expanded States
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  
  const [chaptersCache, setChaptersCache] = useState<Record<string, Chapter[]>>({});
  const [scenesCache, setScenesCache] = useState<Record<string, Scene[]>>({});

  // Selection & Confirmation
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' as any, onConfirm: () => {}, showCancel: true });

  const toggleStory = async (storyId: string) => {
    const isExpanding = !expandedStories[storyId];
    setExpandedStories(prev => ({ ...prev, [storyId]: isExpanding }));
    
    if (isExpanding && !chaptersCache[storyId]) {
      const chaps = await getChaptersByStory(storyId);
      setChaptersCache(prev => ({ ...prev, [storyId]: chaps.sort((a,b) => a.order - b.order) }));
    }
  };

  const toggleChapter = async (chapterId: string) => {
    const isExpanding = !expandedChapters[chapterId];
    setExpandedChapters(prev => ({ ...prev, [chapterId]: isExpanding }));
    
    if (isExpanding && !scenesCache[chapterId]) {
      const scns = await getScenesByChapter(chapterId);
      setScenesCache(prev => ({ ...prev, [chapterId]: scns }));
    }
  };

  const refreshChapters = async (storyId: string) => {
    const chaps = await getChaptersByStory(storyId);
    setChaptersCache(prev => ({ ...prev, [storyId]: chaps.sort((a,b) => a.order - b.order) }));
  };

  const handleBulkDelete = () => {
    const totalSelected = selectedStoryIds.length + selectedChapterIds.length;
    if (totalSelected === 0) return;
    setModal({
      isOpen: true,
      title: `Delete ${totalSelected} Items`,
      message: `Are you sure you want to delete ${selectedStoryIds.length} stories and ${selectedChapterIds.length} chapters? This action cannot be undone.`,
      type: 'warning',
      onConfirm: async () => {
        // Bulk delete stories
        await Promise.all(selectedStoryIds.map(id => StoryService.remove(id)));
        // Bulk delete chapters
        await Promise.all(selectedChapterIds.map(id => ChapterService.remove(id)));
        
        setSelectedStoryIds([]);
        setSelectedChapterIds([]);
        setIsSelectMode(false);
        setModal(prev => ({ ...prev, isOpen: false }));
        onRefresh();
        showSnackbar(`${totalSelected} items deleted`, "warning");
      },
      showCancel: true
    });
  };

  const toggleSelectStory = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedStoryIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectChapter = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedChapterIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // -------------------------
  // RENDER LEFT TREE
  // -------------------------
  const renderTree = () => {
    return (
      <div style={{ flex: '0 0 350px', borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '1.5rem', background: 'transparent' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Project Tree
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="kawaii-btn" 
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', background: isSelectMode ? 'var(--primary-color)' : 'transparent', color: isSelectMode ? '#fff' : 'inherit' }} 
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedStoryIds([]);
                setSelectedChapterIds([]);
              }}
            >
              {isSelectMode ? 'Cancel' : 'Choose Many'}
            </button>
            <button className="kawaii-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => setActiveNode({ type: 'story', id: 'new' })}>
              <Plus size={14} /> New Story
            </button>
          </div>
        </h3>
        
        {isSelectMode && (
          <div style={{ padding: '0.5rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold' }}>
              <span>{selectedStoryIds.length + selectedChapterIds.length} Selected</span>
              <button 
                onClick={() => {
                  const allStoryIds = stories.map(s => s.id);
                  if (stories.every(s => selectedStoryIds.includes(s.id))) {
                    setSelectedStoryIds([]);
                  } else {
                    setSelectedStoryIds(allStoryIds);
                  }
                }}
                style={{ color: 'var(--accent)', background: 'transparent' }}
              >
                {stories.every(s => selectedStoryIds.includes(s.id)) ? 'Deselect Stories' : 'Select All Stories'}
              </button>
            </div>
            { (selectedStoryIds.length > 0 || selectedChapterIds.length > 0) && (
              <button 
                className="kawaii-btn" 
                style={{ width: '100%', padding: '0.4rem', background: '#ff4444', color: '#fff', fontSize: '0.75rem' }} 
                onClick={handleBulkDelete}
              >
                <Trash2 size={12} /> Delete Selected items
              </button>
            )}
          </div>
        )}
        
        {stories.map(story => (
          <div key={story.id} style={{ marginBottom: '0.5rem' }}>
            <div 
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
                background: activeNode.type === 'story' && activeNode.id === story.id ? 'var(--accent-low)' : 'transparent',
                border: activeNode.type === 'story' && activeNode.id === story.id ? '1px solid var(--accent)' : '1px solid transparent'
              }}
              onClick={() => isSelectMode ? toggleSelectStory(story.id) : setActiveNode({ type: 'story', id: story.id })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isSelectMode && (
                  <input 
                    type="checkbox" 
                    checked={selectedStoryIds.includes(story.id)} 
                    onChange={() => toggleSelectStory(story.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleStory(story.id); }}
                  style={{ background: 'transparent', padding: '0.2rem', color: '#888' }}
                >
                  {expandedStories[story.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <BookOpen size={16} color="var(--accent)" />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{story.title}</span>
            </div>

            {expandedStories[story.id] && (
              <div style={{ paddingLeft: '2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(chaptersCache[story.id] || []).map(chapter => (
                  <div key={chapter.id}>
                    <div 
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer',
                        background: activeNode.type === 'chapter' && activeNode.id === chapter.id ? 'var(--accent-low)' : 'transparent',
                        border: activeNode.type === 'chapter' && activeNode.id === chapter.id ? '1px solid var(--accent)' : '1px solid transparent'
                      }}
                      onClick={() => isSelectMode ? toggleSelectChapter(chapter.id) : setActiveNode({ type: 'chapter', id: chapter.id })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isSelectMode && (
                          <input 
                            type="checkbox" 
                            checked={selectedChapterIds.includes(chapter.id)} 
                            onChange={() => toggleSelectChapter(chapter.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleChapter(chapter.id); }}
                          style={{ background: 'transparent', padding: '0.2rem', color: 'var(--text-muted)' }}
                        >
                          {expandedChapters[chapter.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <Clock size={14} color="#00e5ff" />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ch {chapter.order}: {chapter.title}</span>
                    </div>

                    {expandedChapters[chapter.id] && (
                      <div style={{ paddingLeft: '2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {(scenesCache[chapter.id] || []).map((scene, idx) => (
                          <div
                            key={scene.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer',
                              background: activeNode.type === 'scene' && activeNode.id === scene.id ? 'rgba(255, 159, 180, 0.1)' : 'transparent',
                              border: activeNode.type === 'scene' && activeNode.id === scene.id ? '1px solid var(--primary-color)' : '1px solid transparent'
                            }}
                            onClick={() => setActiveNode({ type: 'scene', id: `${chapter.id}_${scene.id}` })}
                          >
                            <Film size={12} color={scene.type === 'dialogue' ? '#2563eb' : scene.type === 'choice' ? '#7c3aed' : '#dc2626'} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.8 }}>Scene {idx + 1} ({scene.type})</span>
                          </div>
                        ))}
                        <button 
                          className="kawaii-btn" 
                          style={{ padding: '0.3rem', fontSize: '0.7rem', background: 'transparent', border: '1px dashed #444', color: '#888', margin: '0.3rem 0' }}
                          onClick={() => setActiveNode({ type: 'scene', id: `new_${chapter.id}` })}
                        >
                          + Add Scene
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button 
                  className="kawaii-btn" 
                  style={{ padding: '0.4rem', fontSize: '0.8rem', background: 'transparent', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
                  onClick={() => setActiveNode({ type: 'chapter', id: `new_${story.id}` })}
                >
                  + Add Chapter
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // -------------------------
  // RENDER RIGHT EDITOR
  // -------------------------
  const renderEditor = () => {
    if (!activeNode.type || !activeNode.id) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexDirection: 'column', gap: '1rem' }}>
          <Edit2 size={48} opacity={0.2} />
          <p>Select a node from the Project Tree to start editing.</p>
        </div>
      );
    }

    // Story Editor
    if (activeNode.type === 'story') {
      const isNew = activeNode.id === 'new';
      const story = isNew ? { title: '', description: '', coverImageUrl: '', startChapterId: '', primaryColor: '#ff9fb4', isVisible: true } : stories.find(s => s.id === activeNode.id);
      
      if (!story) return null;

      return (
        <div style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
          <StoryEditorForm 
            story={story as Story} 
            isNew={isNew} 
            onSave={async (data: Story) => {
              if (isNew) {
                await StoryService.add({ ...data, createdAt: new Date() } as any);
                showSnackbar("Story created", "success");
              } else {
                await StoryService.update((story as Story).id, data);
                showSnackbar("Story updated", "success");
              }
              onRefresh();
            }}
            onDelete={async () => {
              if (isNew) return;
              setModal({
                isOpen: true,
                title: 'Delete Story',
                message: `Are you sure you want to delete "${(story as Story).title}"? All chapters and scenes will be lost.`,
                type: 'warning',
                onConfirm: async () => {
                  await StoryService.remove((story as Story).id);
                  showSnackbar("Story deleted", "warning");
                  setActiveNode({ type: null, id: null });
                  setModal(prev => ({ ...prev, isOpen: false }));
                  onRefresh();
                },
                showCancel: true
              });
            }}
          />
        </div>
      );
    }

    // Chapter Editor
    if (activeNode.type === 'chapter') {
      const isNew = String(activeNode.id).startsWith('new_');
      const storyId = isNew ? String(activeNode.id).split('_')[1] : null;
      let chapter: any = { title: '', order: 1, storyId: storyId };
      
      if (!isNew) {
         // Find chapter across cache
         for (const sId in chaptersCache) {
           const found = chaptersCache[sId].find(c => c.id === activeNode.id);
           if (found) { chapter = found; break; }
         }
      }

      return (
        <div style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
          <ChapterEditorForm 
            chapter={chapter as Chapter}
            isNew={isNew}
            onSave={async (data: Chapter) => {
              if (isNew) {
                await ChapterService.add({ ...data, startSceneId: '' } as any);
                showSnackbar("Chapter created", "success");
                refreshChapters(data.storyId);
              } else {
                await ChapterService.update(chapter.id!, data);
                showSnackbar("Chapter updated", "success");
                refreshChapters(chapter.storyId);
              }
            }}
            onDelete={async () => {
              if (isNew) return;
              setModal({
                isOpen: true,
                title: 'Delete Chapter',
                message: `Are you sure you want to delete Chapter ${chapter.order}: ${chapter.title}? All scenes will be lost.`,
                type: 'warning',
                onConfirm: async () => {
                  await ChapterService.remove(chapter.id!);
                  showSnackbar("Chapter deleted", "warning");
                  setActiveNode({ type: null, id: null });
                  setModal(prev => ({ ...prev, isOpen: false }));
                  refreshChapters(chapter.storyId);
                },
                showCancel: true
              });
            }}
          />
        </div>
      );
    }

    // Scene Editor delegating to SceneManager (we can proxy it here or reconstruct it)
    if (activeNode.type === 'scene') {
       const isNew = String(activeNode.id).startsWith('new_');
       const targetChapterId = isNew ? String(activeNode.id).split('_')[1] : String(activeNode.id).split('_')[0];
       // Instead of full SceneManager, we just render it inside this pane!
       return (
         <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
            <SceneManager 
              chapterId={targetChapterId} 
              onBack={() => setActiveNode({ type: 'chapter', id: targetChapterId })} 
            />
         </div>
       );
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 6rem)', margin: '-3rem -4rem', background: 'transparent' }}>
      {renderTree()}
      {renderEditor()}
      
      <ConfirmModal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))}
        showCancel={modal.showCancel}
      />
    </div>
  );
};

const StoryEditorForm = ({ story, isNew, onSave, onDelete }: any) => {
  const [formData, setFormData] = useState(story);
  // Update state if story prop changes
  useEffect(() => { setFormData(story); }, [story]);
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem' }}>{isNew ? 'Create New Story' : 'Story Details'}</h2>
        {!isNew && (
          <button className="kawaii-btn" style={{ padding: '0.5rem', color: '#ff4444' }} onClick={onDelete}>
            <Trash2 size={18} /> Delete Story
          </button>
        )}
      </div>

      <div className="kawaii-panel" style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Story Title</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ ...inputStyle, minHeight: '100px' }} />
          </div>
          <div>
            <label style={labelStyle}>Cover Image URL</label>
            <input type="text" value={formData.coverImageUrl} onChange={e => setFormData({...formData, coverImageUrl: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
               <label style={labelStyle}>Primary UI Color</label>
               <input type="color" value={formData.primaryColor || '#ff9fb4'} onChange={e => setFormData({...formData, primaryColor: e.target.value})} style={{ width: '100%', height: '40px', background: 'transparent', border: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem' }}>
               <input type="checkbox" checked={formData.isVisible !== false} onChange={e => setFormData({...formData, isVisible: e.target.checked})} />
               <label style={{ ...labelStyle, marginBottom: 0 }}>Publicly Visible</label>
            </div>
          </div>
          <button className="kawaii-btn" style={{ background: 'var(--accent)', color: 'var(--white)', marginTop: '1rem' }} onClick={() => onSave(formData)}>
            <Save size={18} /> {isNew ? 'Create Story' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChapterEditorForm = ({ chapter, isNew, onSave, onDelete }: any) => {
  const [formData, setFormData] = useState(chapter);
  
  // Update state if chapter prop changes
  useEffect(() => { setFormData(chapter); }, [chapter]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem' }}>{isNew ? 'Create New Chapter' : `Chapter ${formData.order}: ${formData.title}`}</h2>
        {!isNew && (
          <button className="kawaii-btn" style={{ padding: '0.5rem', color: '#ff4444' }} onClick={onDelete}>
            <Trash2 size={18} /> Delete Chapter
          </button>
        )}
      </div>

      <div className="kawaii-panel" style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Chapter Title</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Chapter Order</label>
            <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} style={inputStyle} />
          </div>
          <button className="kawaii-btn" style={{ background: 'var(--accent)', color: 'var(--white)', marginTop: '1rem' }} onClick={() => onSave(formData)}>
            <Save size={18} /> {isNew ? 'Create Chapter' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.8rem 1rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', outline: 'none' };

export default StoryStudio;
