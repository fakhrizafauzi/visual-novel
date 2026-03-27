import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ChevronRight, 
  BookOpen,
  Edit
} from 'lucide-react';
import { StoryService, getChaptersByStory, ChapterService } from '../firebase/db';
import type { Story, Chapter } from '../types/game';
import SceneManager from './SceneManager';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useSnackbar } from '../context/SnackbarContext';
import { seedExampleStory } from '../utils/seedData';

interface StoryManagerProps {
  stories: Story[];
  isLoading: boolean;
  onRefresh: () => void;
}

const StoryManager: React.FC<StoryManagerProps> = ({ stories, isLoading, onRefresh }) => {
  const { showSnackbar } = useSnackbar();
  const [isAdding, setIsAdding] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [newStory, setNewStory] = useState({ title: '', description: '', coverImageUrl: '', startChapterId: '', primaryColor: '#ff9fb4', isVisible: true });
  
  // Chapter State
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({ title: '', order: 1 });
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' as any, onConfirm: () => {}, showCancel: true });

  const fetchChapters = async (storyId: string) => {
    try {
      const fetched = await getChaptersByStory(storyId);
      setChapters(fetched.sort((a, b) => a.order - b.order));
    } catch (e) {
      console.error("Error fetching chapters", e);
    }
  };

  const handleSelectStory = async (story: Story) => {
    setSelectedStory(story);
    await fetchChapters(story.id);
  };

  const handleAdd = async () => {
    if (!newStory.title) return;
    try {
      await StoryService.add({
        ...newStory,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);
      setNewStory({ title: '', description: '', coverImageUrl: '', startChapterId: '', primaryColor: '#ff9fb4', isVisible: true });
      setIsAdding(false);
      onRefresh();
      showSnackbar("Story created successfully", "success");
    } catch (e) {
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'Could not add story. Please check your connection.',
        type: 'error',
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
        showCancel: false
      });
    }
  };

  const handleSeed = async () => {
    if (confirm("This will generate 5 full demo stories. Proceed?")) {
      setIsSeeding(true);
      try {
        await seedExampleStory();
        onRefresh();
        showSnackbar("5 Demo Stories added!", "success");
      } catch (e) {
        showSnackbar("Seeding failed: " + (e as Error).message, "error");
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleDelete = (id: string) => {
    setModal({
      isOpen: true,
      title: 'Delete Story',
      message: 'Are you sure you want to delete this story? All associated chapters and scenes will be lost.',
      type: 'warning',
      onConfirm: async () => {
        await StoryService.remove(id);
        setModal(prev => ({ ...prev, isOpen: false }));
        onRefresh();
        showSnackbar("Story deleted", "warning");
      },
      showCancel: true
    });
  };

  const handleBulkDelete = () => {
    if (selectedStoryIds.length === 0) return;
    setModal({
      isOpen: true,
      title: `Delete ${selectedStoryIds.length} Stories`,
      message: `Are you sure you want to delete ${selectedStoryIds.length} stories? This cannot be undone.`,
      type: 'warning',
      onConfirm: async () => {
        await Promise.all(selectedStoryIds.map(id => StoryService.remove(id)));
        setSelectedStoryIds([]);
        setIsSelectMode(false);
        setModal(prev => ({ ...prev, isOpen: false }));
        onRefresh();
        showSnackbar(`${selectedStoryIds.length} stories deleted`, "warning");
      },
      showCancel: true
    });
  };

  const toggleStorySelect = (id: string) => {
    setSelectedStoryIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleUpdateStory = async () => {
    if (!editingStory) return;
    try {
      await StoryService.update(editingStory.id, editingStory);
      setEditingStory(null);
      onRefresh();
      showSnackbar("Story settings updated", "success");
    } catch (e) {
      setModal({
        isOpen: true,
        title: 'Update Failed',
        message: 'Could not update story settings.',
        type: 'error',
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
        showCancel: false
      });
    }
  };

  const handleAddChapter = async () => {
    if (!selectedStory || !newChapter.title) return;
    try {
      await ChapterService.add({
        ...newChapter,
        storyId: selectedStory.id,
        startSceneId: ''
      } as any);
      setNewChapter({ title: '', order: chapters.length + 1 });
      setIsAddingChapter(false);
      await fetchChapters(selectedStory.id);
      showSnackbar(`Chapter ${newChapter.title} added`, "success");
    } catch (e) {
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'Could not add chapter.',
        type: 'error',
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
        showCancel: false
      });
    }
  };

  const handleDeleteChapter = (chapter: Chapter) => {
    setModal({
      isOpen: true,
      title: 'Delete Chapter',
      message: `Are you sure you want to delete Chapter ${chapter.order}: ${chapter.title}? All scenes within will be deleted.`,
      type: 'warning',
      onConfirm: async () => {
        await ChapterService.remove(chapter.id);
        setModal(prev => ({ ...prev, isOpen: false }));
        if (selectedStory) await fetchChapters(selectedStory.id);
        showSnackbar("Chapter deleted", "warning");
      },
      showCancel: true
    });
  };

  return (
    <div className="story-manager">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>
          {!selectedStory ? "Manage Stories" : `Editing: ${selectedStory.title}`}
        </h2>
        {!selectedStory && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="kawaii-btn" 
              style={{ padding: '0.5rem 1rem', background: '#ffedf1', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
              onClick={handleSeed}
              disabled={isSeeding}
            >
              {isSeeding ? "Seeding..." : "Seed Demo Data"}
            </button>
            <button 
              className="kawaii-btn" 
              style={{ background: isSelectMode ? 'var(--primary-color)' : 'transparent', color: isSelectMode ? '#fff' : 'inherit' }}
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedStoryIds([]);
              }}
            >
              {isSelectMode ? "Cancel Selection" : "Choose Many"}
            </button>
            <button 
              className="kawaii-btn" 
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => setIsAdding(true)}
            >
              <Plus size={18} /> New Story
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div style={{ color: '#888', marginBottom: '1rem' }}>Refreshing data...</div>
      )}

      {isAdding && !selectedStory && (
        <div className="kawaii-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create New Story</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Story Title" 
              value={newStory.title}
              onChange={(e) => setNewStory({...newStory, title: e.target.value})}
              style={inputStyle}
            />
            <textarea 
              placeholder="Description" 
              value={newStory.description}
              onChange={(e) => setNewStory({...newStory, description: e.target.value})}
              style={{ ...inputStyle, minHeight: '80px' }}
            />
            <input 
              type="text" 
              placeholder="Cover Image URL" 
              value={newStory.coverImageUrl}
              onChange={(e) => setNewStory({...newStory, coverImageUrl: e.target.value})}
              style={inputStyle}
            />
            <div>
              <label style={labelStyle}>Primary UI Color</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={newStory.primaryColor} 
                  onChange={(e) => setNewStory({...newStory, primaryColor: e.target.value})}
                  style={{ width: '50px', height: '40px', padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                />
                <input 
                  type="text" 
                  value={newStory.primaryColor} 
                  onChange={(e) => setNewStory({...newStory, primaryColor: e.target.value})}
                  style={{ ...inputStyle, width: '120px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="kawaii-btn" style={{ background: 'var(--primary-color)', color: '#fff' }} onClick={handleAdd}>
                <Save size={18} /> Save Story
              </button>
              <button className="kawaii-btn" onClick={() => setIsAdding(false)}>
                <X size={18} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingStory && !selectedStory && (
        <div className="kawaii-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Edit Story: {editingStory.title}</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Story Title" 
              value={editingStory.title}
              onChange={(e) => setEditingStory({...editingStory, title: e.target.value})}
              style={inputStyle}
            />
            <textarea 
              placeholder="Description" 
              value={editingStory.description}
              onChange={(e) => setEditingStory({...editingStory, description: e.target.value})}
              style={{ ...inputStyle, minHeight: '80px' }}
            />
            <input 
              type="text" 
              placeholder="Cover Image URL" 
              value={editingStory.coverImageUrl}
              onChange={(e) => setEditingStory({...editingStory, coverImageUrl: e.target.value})}
              style={inputStyle}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Primary UI Color</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={editingStory.primaryColor || '#ff3e00'} 
                    onChange={(e) => setEditingStory({...editingStory, primaryColor: e.target.value})}
                    style={{ width: '50px', height: '40px', padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    value={editingStory.primaryColor || '#ff3e00'} 
                    onChange={(e) => setEditingStory({...editingStory, primaryColor: e.target.value})}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Starting Chapter</label>
                <select 
                  value={editingStory.startChapterId || ''}
                  onChange={(e) => setEditingStory({...editingStory, startChapterId: e.target.value})}
                  style={inputStyle}
                >
                  <option value="">-- No Start Chapter --</option>
                  {chapters.map(c => (
                    <option key={c.id} value={c.id}>Chapter {c.order}: {c.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Publicly Visible</label>
              <input 
                type="checkbox" 
                checked={editingStory.isVisible !== false}
                onChange={(e) => setEditingStory({...editingStory, isVisible: e.target.checked})}
              />
            </div>
            <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.5rem' }}>Note: You must Manage Chapters to see them here.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="kawaii-btn" style={{ background: 'var(--primary-color)', color: '#fff' }} onClick={handleUpdateStory}>
                <Save size={18} /> Update Story
              </button>
              <button className="kawaii-btn" onClick={() => setEditingStory(null)}>
                <X size={18} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isSelectMode && !selectedStory && (
        <div className="kawaii-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'var(--primary-color)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>{selectedStoryIds.length} Stories Selected</span>
            <button 
              className="kawaii-btn" 
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
              onClick={() => {
                const allIds = stories.map(s => s.id);
                if (stories.every(s => selectedStoryIds.includes(s.id))) {
                  setSelectedStoryIds([]);
                } else {
                  setSelectedStoryIds(allIds);
                }
              }}
            >
              {stories.every(s => selectedStoryIds.includes(s.id)) ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          {selectedStoryIds.length > 0 && (
            <button className="kawaii-btn" style={{ background: '#ff4444', color: '#fff', padding: '0.5rem 1.5rem' }} onClick={handleBulkDelete}>
              <Trash2 size={16} /> Delete Selected
            </button>
          )}
        </div>
      )}

      {!selectedStory ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {stories.map(story => (
            <div 
              key={story.id} 
              className="kawaii-panel" 
              onClick={() => isSelectMode && toggleStorySelect(story.id)}
              style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: isSelectMode ? 'pointer' : 'default',
                border: selectedStoryIds.includes(story.id) ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)',
                background: selectedStoryIds.includes(story.id) ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--glass-bg)'
              }}
            >
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {isSelectMode && (
                  <input type="checkbox" checked={selectedStoryIds.includes(story.id)} readOnly />
                )}
                {story.coverImageUrl && (
                  <img src={story.coverImageUrl} alt={story.title} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                )}
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{story.title}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>{story.description}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="kawaii-btn" 
                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => handleSelectStory(story)}
                >
                  Manage Chapters <ChevronRight size={16}/>
                </button>
                <button 
                  className="kawaii-btn" 
                  style={{ padding: '0.5rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }} 
                  onClick={async () => {
                    setEditingStory(story);
                    await fetchChapters(story.id);
                  }}
                  title="Edit Settings"
                >
                  <Edit size={18}/>
                </button>
                <button 
                  className="kawaii-btn" 
                  style={{ padding: '0.5rem', borderColor: '#ff4444', color: '#ff4444' }} 
                  onClick={() => handleDelete(story.id)}
                  title="Delete"
                >
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="chapter-manager">
          {!selectedChapter ? (
            <>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
                <button className="kawaii-btn" onClick={() => setSelectedStory(null)}>← Back to Stories</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Chapter List</h3>
                <button className="kawaii-btn" style={{ padding: '0.5rem 1rem' }} onClick={() => setIsAddingChapter(true)}>
                  <Plus size={18} /> New Chapter
                </button>
              </div>

              {isAddingChapter && (
                <div className="kawaii-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                      type="text" 
                      placeholder="Chapter Title" 
                      value={newChapter.title}
                      onChange={(e) => setNewChapter({...newChapter, title: e.target.value})}
                      style={inputStyle}
                    />
                    <button className="kawaii-btn" style={{ background: 'var(--primary-color)' }} onClick={handleAddChapter}>Save</button>
                    <button className="kawaii-btn" onClick={() => setIsAddingChapter(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gap: '1rem' }}>
                {chapters.length > 0 ? chapters.map(chapter => (
                  <div key={chapter.id} className="kawaii-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>#{chapter.order}</div>
                      <div>{chapter.title}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="kawaii-btn" 
                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => setSelectedChapter(chapter)}
                      >
                        Manage Scenes <ChevronRight size={16}/>
                      </button>
                      <button 
                        className="kawaii-btn" 
                        style={{ padding: '0.5rem', color: '#ff4444', borderColor: '#ff4444' }}
                        onClick={() => handleDeleteChapter(chapter)}
                        title="Delete Chapter"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>
                    <BookOpen size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No chapters yet. Create one to start your story.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <SceneManager 
              chapterId={selectedChapter.id} 
              onBack={() => setSelectedChapter(null)} 
            />
          )}
        </div>
      )}

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  color: '#888',
  marginBottom: '0.5rem',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.8rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  color: '#fff',
  outline: 'none'
};

export default StoryManager;
