import React, { useState, useEffect } from 'react';
import { Trash2, Save, Type, List, Flag, X, GitBranch } from 'lucide-react';
import { SceneService, getScenesByChapter, AssetService } from '../firebase/db';
import type { Scene, Asset } from '../types/game';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useSnackbar } from '../context/SnackbarContext';

interface SceneManagerProps {
  chapterId: string;
  onBack: () => void;
}

const SceneManager: React.FC<SceneManagerProps> = ({ chapterId, onBack }) => {
  const { showSnackbar } = useSnackbar();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [assetPickerCallback, setAssetPickerCallback] = useState<(url: string) => void>(() => {});
  const [assetPickerFilter, setAssetPickerFilter] = useState<'background' | 'character' | 'bgm' | 'sfx'>('background');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' as any, onConfirm: () => {}, showCancel: true });

  const fetchAssets = async () => {
    try {
      const fetched = await AssetService.getAll();
      setAvailableAssets(fetched);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchScenes = async () => {
    setLoading(true);
    try {
      const fetched = await getScenesByChapter(chapterId);
      setScenes(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenes();
    fetchAssets();
  }, [chapterId]);

  const openAssetPicker = (filter: 'background' | 'character' | 'bgm' | 'sfx', onSelect: (url: string) => void) => {
    setAssetPickerFilter(filter);
    setAssetPickerCallback(() => onSelect);
    setIsAssetPickerOpen(true);
  };

  const handleCreateScene = async (type: 'dialogue' | 'choice' | 'ending' | 'branch') => {
    try {
      const newScene: any = {
        chapterId,
        type,
        backgroundUrl: 'https://images.unsplash.com/photo-1514467953090-fb06baa197cf?auto=format&fit=crop&q=80&w=1000',
        nextSceneId: ''
      };

      if (type === 'dialogue') {
        newScene.dialogue = [{ 
          id: Date.now().toString(), 
          characterName: 'Character', 
          text: 'New dialogue...',
          activeCharacters: [] 
        }];
      } else if (type === 'choice' || type === 'branch') {
        newScene.choices = [
          { id: '1', text: type === 'branch' ? 'Correct Choice' : 'Choice A', nextSceneId: '', isCorrect: type === 'branch' ? true : undefined },
          { id: '2', text: type === 'branch' ? 'Incorrect Choice' : 'Choice B', nextSceneId: '', isCorrect: type === 'branch' ? false : undefined }
        ];
      }

      await SceneService.add(newScene);
      fetchScenes();
      showSnackbar("Scene created", "success");
    } catch (e) {
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'Could not create scene. Please try again.',
        type: 'error',
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
        showCancel: false
      });
    }
  };

  const handleDelete = (id: string) => {
    setModal({
      isOpen: true,
      title: 'Delete Scene',
      message: 'Are you sure you want to delete this scene?',
      type: 'warning',
      onConfirm: async () => {
        await SceneService.remove(id);
        setModal(prev => ({ ...prev, isOpen: false }));
        fetchScenes();
        showSnackbar("Scene deleted", "warning");
      },
      showCancel: true
    });
  };

  const handleUpdateScene = async () => {
    if (!editingScene) return;
    try {
      await SceneService.update(editingScene.id, editingScene);
      setEditingScene(null);
      fetchScenes();
      showSnackbar("Scene saved", "success");
    } catch (e) {
      setModal({
        isOpen: true,
        title: 'Update Failed',
        message: 'There was an error updating the scene.',
        type: 'error',
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
        showCancel: false
      });
    }
  };

  return (
    <div className="scene-manager">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="kawaii-btn" onClick={onBack}>← Back to Chapters</button>
        <h2 style={{ fontSize: '1.5rem' }}>Scene Editor</h2>
      </div>

      {!editingScene ? (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button className="kawaii-btn" onClick={() => handleCreateScene('dialogue')}><Type size={18}/> Add Dialogue</button>
            <button className="kawaii-btn" onClick={() => handleCreateScene('choice')}><List size={18}/> Add Choice</button>
            <button className="kawaii-btn" onClick={() => handleCreateScene('branch')}><GitBranch size={18}/> Add Branch</button>
            <button className="kawaii-btn" onClick={() => handleCreateScene('ending')}><Flag size={18}/> Add Ending</button>
          </div>

          {loading ? <div>Loading scenes...</div> : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {scenes.map((scene, idx) => (
                <div key={scene.id} className="kawaii-panel" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ opacity: 0.5 }}>#{idx + 1}</div>
                    <div style={{ 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '4px', 
                      background: scene.type === 'choice' ? '#7c3aed' : scene.type === 'ending' ? '#dc2626' : '#2563eb',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase'
                    }}>
                      {scene.type}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                      {scene.type === 'dialogue' ? (scene.dialogue?.[0]?.text?.slice(0, 40) + '...') : 'Interactive Scene'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="kawaii-btn" style={{ padding: '0.4rem 0.8rem' }} onClick={() => setEditingScene(scene)}>Edit</button>
                    <button className="kawaii-btn" style={{ padding: '0.4rem', color: '#ff4444' }} onClick={() => handleDelete(scene.id)}><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="kawaii-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Edit Scene ({editingScene.type})</h3>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Background</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={editingScene.backgroundUrl}
                    onChange={(e) => setEditingScene({...editingScene, backgroundUrl: e.target.value})}
                    style={inputStyle}
                  />
                  <button 
                    className="kawaii-btn" 
                    style={{ padding: '0.5rem', flexShrink: 0 }}
                    onClick={() => openAssetPicker('background', (url) => setEditingScene({...editingScene, backgroundUrl: url}))}
                  >
                    Browse
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>BGM (Background Music)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={editingScene.bgmUrl || ''}
                    onChange={(e) => setEditingScene({...editingScene, bgmUrl: e.target.value})}
                    style={inputStyle}
                  />
                  <button 
                    className="kawaii-btn" 
                    style={{ padding: '0.5rem', flexShrink: 0 }}
                    onClick={() => openAssetPicker('bgm', (url) => setEditingScene({...editingScene, bgmUrl: url}))}
                  >
                    Browse
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>{editingScene.type === 'branch' ? 'Next Scene (On Correct)' : 'Next Scene (Link)'}</label>
              <select 
                value={editingScene.nextSceneId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const updates: any = { nextSceneId: val };
                  if (editingScene.type === 'branch' && editingScene.choices) {
                    updates.choices = editingScene.choices.map((c: any) => ({ ...c, nextSceneId: val }));
                  }
                  setEditingScene({...editingScene, ...updates});
                }}
                style={inputStyle}
              >
                <option value="">-- No Link (End of Sequence) --</option>
                {scenes.filter(s => s.id !== editingScene.id).map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.type}] {s.type === 'dialogue' ? s.dialogue?.[0]?.text.slice(0, 30) + '...' : s.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>

            {editingScene.type === 'dialogue' && (
              <div>
                <label style={labelStyle}>Dialogue Lines</label>
                {(editingScene.dialogue || []).map((line, idx) => (
                  <div key={line.id || idx} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ ...labelStyle, fontSize: '0.7rem' }}>Active Characters (Max 3)</label>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {(line.activeCharacters || []).map((char, cIdx) => (
                          <div key={cIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input 
                                type="text" 
                                placeholder="Name" 
                                value={char.name}
                                onChange={(e) => {
                                  const newDiag = [...(editingScene.dialogue || [])];
                                  const newChars = [...(newDiag[idx].activeCharacters || [])];
                                  newChars[cIdx] = { ...newChars[cIdx], name: e.target.value };
                                  newDiag[idx] = { ...newDiag[idx], activeCharacters: newChars };
                                  setEditingScene({...editingScene, dialogue: newDiag});
                                }}
                                style={inputStyle}
                              />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <select 
                                value={char.position}
                                onChange={(e) => {
                                  const newDiag = [...(editingScene.dialogue || [])];
                                  const newChars = [...(newDiag[idx].activeCharacters || [])];
                                  newChars[cIdx] = { ...newChars[cIdx], position: e.target.value as any };
                                  newDiag[idx] = { ...newDiag[idx], activeCharacters: newChars };
                                  setEditingScene({...editingScene, dialogue: newDiag});
                                }}
                                style={inputStyle}
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                              <select 
                                value={char.animation || 'fade'}
                                onChange={(e) => {
                                  const newDiag = [...(editingScene.dialogue || [])];
                                  const newChars = [...(newDiag[idx].activeCharacters || [])];
                                  newChars[cIdx] = { ...newChars[cIdx], animation: e.target.value };
                                  newDiag[idx] = { ...newDiag[idx], activeCharacters: newChars };
                                  setEditingScene({...editingScene, dialogue: newDiag});
                                }}
                                style={inputStyle}
                              >
                                <option value="fade">Fade</option>
                                <option value="slide-up">Slide Up</option>
                                <option value="slide-in-left">Slide L</option>
                                <option value="slide-in-right">Slide R</option>
                                <option value="zoom-in">Zoom</option>
                                <option value="bounce">Bounce</option>
                                <option value="shake">Shake</option>
                              </select>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', color: '#666' }}>X%:</span>
                              <input 
                                type="number" 
                                placeholder="X" 
                                value={char.x ?? ''}
                                onChange={(e) => {
                                  const newDiag = [...(editingScene.dialogue || [])];
                                  const newChars = [...(newDiag[idx].activeCharacters || [])];
                                  newChars[cIdx] = { ...newChars[cIdx], x: e.target.value === '' ? undefined : Number(e.target.value) };
                                  newDiag[idx] = { ...newDiag[idx], activeCharacters: newChars };
                                  setEditingScene({...editingScene, dialogue: newDiag});
                                }}
                                style={{ ...inputStyle, padding: '0.3rem' }}
                              />
                              <span style={{ fontSize: '0.7rem', color: '#666' }}>Y%:</span>
                              <input 
                                type="number" 
                                placeholder="Y" 
                                value={char.y ?? ''}
                                onChange={(e) => {
                                  const newDiag = [...(editingScene.dialogue || [])];
                                  const newChars = [...(newDiag[idx].activeCharacters || [])];
                                  newChars[cIdx] = { ...newChars[cIdx], y: e.target.value === '' ? undefined : Number(e.target.value) };
                                  newDiag[idx] = { ...newDiag[idx], activeCharacters: newChars };
                                  setEditingScene({...editingScene, dialogue: newDiag});
                                }}
                                style={{ ...inputStyle, padding: '0.3rem' }}
                              />
                            </div>
                            <button className="kawaii-btn" style={{ color: '#ff4444', padding: '0 0.5rem' }} onClick={() => {
                              const newDiag = [...(editingScene.dialogue || [])];
                              const newChars = (newDiag[idx].activeCharacters || []).filter((_, i) => i !== cIdx);
                              newDiag[idx] = { ...newDiag[idx], activeCharacters: newChars };
                              setEditingScene({...editingScene, dialogue: newDiag});
                            }}><Trash2 size={14}/></button>
                            
                            <div style={{ gridColumn: 'span 4', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <input 
                                type="text" 
                                placeholder="Image URL" 
                                value={char.image}
                                onChange={(e) => {
                                  const newDiag = [...(editingScene.dialogue || [])];
                                  const newChars = [...(newDiag[idx].activeCharacters || [])];
                                  newChars[cIdx] = { ...newChars[cIdx], image: e.target.value };
                                  newDiag[idx] = { ...newDiag[idx], activeCharacters: newChars };
                                  setEditingScene({...editingScene, dialogue: newDiag});
                                }}
                                style={{ ...inputStyle, fontSize: '0.8rem' }}
                              />
                              <button 
                                className="kawaii-btn" 
                                style={{ padding: '0.4rem', whiteSpace: 'nowrap' }}
                                onClick={() => openAssetPicker('character', (url) => {
                                  const newDiag = [...(editingScene.dialogue || [])];
                                  const newChars = [...(newDiag[idx].activeCharacters || [])];
                                  newChars[cIdx] = { ...newChars[cIdx], image: url };
                                  newDiag[idx] = { ...newDiag[idx], activeCharacters: newChars };
                                  setEditingScene({...editingScene, dialogue: newDiag});
                                })}
                              >
                                Pick
                              </button>
                            </div>
                          </div>
                        ))}
                        {(line.activeCharacters || []).length < 3 && (
                          <button 
                            className="kawaii-btn" 
                            style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              const newDiag = [...(editingScene.dialogue || [])];
                              const newChars = [...(newDiag[idx].activeCharacters || []), { name: '', image: '', position: 'center' as const, animation: 'fade' }];
                              newDiag[idx] = { ...newDiag[idx], activeCharacters: newChars };
                              setEditingScene({...editingScene, dialogue: newDiag});
                            }}
                          >+ Add Character</button>
                        )}
                      </div>
                    </div>
                    <textarea 
                      placeholder="Dialogue Text" 
                      value={line.text}
                      onChange={(e) => {
                        const newDiag = [...(editingScene.dialogue || [])];
                        newDiag[idx] = { ...newDiag[idx], text: e.target.value };
                        setEditingScene({...editingScene, dialogue: newDiag});
                      }}
                      style={{ ...inputStyle, minHeight: '60px' }}
                    />
                  </div>
                ))}
                <button className="kawaii-btn" style={{ padding: '0.5rem' }} onClick={() => {
                  const newDiag = [...(editingScene.dialogue || []), { id: Date.now().toString(), characterName: '', text: '' }];
                  setEditingScene({...editingScene, dialogue: newDiag});
                }}>+ Add Line</button>
              </div>
            )}

            {editingScene.type === 'choice' && (
              <div>
                <label style={labelStyle}>Branching Choices (Story Paths)</label>
                {(editingScene.choices || []).map((choice, idx) => (
                  <div key={choice.id || idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto auto', gap: '0.5rem', marginBottom: '0.8rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Choice Text" 
                      value={choice.text}
                      onChange={(e) => {
                        const newChoices = [...(editingScene.choices || [])];
                        newChoices[idx] = { ...newChoices[idx], text: e.target.value };
                        setEditingScene({...editingScene, choices: newChoices});
                      }}
                      style={inputStyle}
                    />
                    <select 
                      value={choice.nextSceneId}
                      onChange={(e) => {
                        const newChoices = [...(editingScene.choices || [])];
                        newChoices[idx] = { ...newChoices[idx], nextSceneId: e.target.value };
                        setEditingScene({...editingScene, choices: newChoices});
                      }}
                      style={inputStyle}
                    >
                      <option value="">-- Choose Target Scene --</option>
                      {scenes.map(s => (
                        <option key={s.id} value={s.id}>
                          #{scenes.indexOf(s) + 1} [{s.type.toUpperCase()}] 
                          {s.type === 'ending' ? ` (${s.isGoodEnd ? 'GOOD' : 'BAD'})` : ''} 
                          - {s.type === 'dialogue' ? s.dialogue?.[0]?.text.slice(0, 20) + '...' : s.id.slice(0, 6)}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button 
                         className="kawaii-btn" 
                         style={{ padding: '0.4rem', background: choice.isCorrect ? '#10b981' : 'var(--surface2)', color: choice.isCorrect ? '#fff' : '#10b981', fontSize: '0.7rem', border: '1px solid #10b981' }}
                         onClick={() => {
                           const newChoices = [...(editingScene.choices || [])];
                           newChoices[idx] = { ...newChoices[idx], isCorrect: true };
                           setEditingScene({...editingScene, choices: newChoices});
                         }}
                       >Good</button>
                       <button 
                         className="kawaii-btn" 
                         style={{ padding: '0.4rem', background: choice.isCorrect === false ? '#ef4444' : 'var(--surface2)', color: choice.isCorrect === false ? '#fff' : '#ef4444', fontSize: '0.7rem', border: '1px solid #ef4444' }}
                         onClick={() => {
                           const newChoices = [...(editingScene.choices || [])];
                           newChoices[idx] = { ...newChoices[idx], isCorrect: false };
                           setEditingScene({...editingScene, choices: newChoices});
                         }}
                       >Bad</button>
                    </div>
                    <button className="kawaii-btn" style={{ color: '#ff4444', padding: '0.5rem' }} onClick={() => {
                      const newChoices = (editingScene.choices || []).filter((_, i) => i !== idx);
                      setEditingScene({...editingScene, choices: newChoices});
                    }}><Trash2 size={16}/></button>
                  </div>
                ))}
                <button className="kawaii-btn" style={{ padding: '0.5rem' }} onClick={() => {
                  const newChoices = [...(editingScene.choices || []), { id: Date.now().toString(), text: '', nextSceneId: '' }];
                  setEditingScene({...editingScene, choices: newChoices});
                }}>+ Add Choice</button>
              </div>
            )}
            {editingScene.type === 'branch' && (
              <div>
                <label style={labelStyle}>Challenge Choices (Correct/Wrong Loop)</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  A "Good" choice will proceed to the Next Scene link above. A "Bad" choice will show "OOF..." and loop back.
                </p>
                {(editingScene.choices || []).map((choice, idx) => (
                  <div key={choice.id || idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr auto auto', gap: '0.5rem', marginBottom: '0.8rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Choice Text" 
                      value={choice.text}
                      onChange={(e) => {
                        const newChoices = [...(editingScene.choices || [])];
                        newChoices[idx] = { ...newChoices[idx], text: e.target.value };
                        setEditingScene({...editingScene, choices: newChoices});
                      }}
                      style={inputStyle}
                    />
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button 
                         className="kawaii-btn" 
                         style={{ padding: '0.4rem', background: choice.isCorrect ? '#10b981' : 'var(--surface2)', color: choice.isCorrect ? '#fff' : '#10b981', fontSize: '0.7rem', border: '1px solid #10b981' }}
                         onClick={() => {
                           const newChoices = [...(editingScene.choices || [])];
                           newChoices[idx] = { ...newChoices[idx], isCorrect: !newChoices[idx].isCorrect };
                           setEditingScene({...editingScene, choices: newChoices});
                         }}
                      >
                         {choice.isCorrect ? 'GOOD' : 'BAD'}
                      </button>
                    </div>
                    <button 
                      className="kawaii-btn" 
                      style={{ padding: '0.4rem', color: '#ff4444', background: 'transparent' }} 
                      onClick={() => {
                        const newChoices = [...(editingScene.choices || [])];
                        newChoices.splice(idx, 1);
                        setEditingScene({...editingScene, choices: newChoices});
                      }}
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
                <button 
                  className="kawaii-btn" 
                  style={{ width: '100%', marginTop: '0.5rem', borderStyle: 'dashed', opacity: 0.7 }}
                  onClick={() => {
                    const newChoices = [...(editingScene.choices || []), { id: Date.now().toString(), text: '', nextSceneId: editingScene.nextSceneId || '', isCorrect: false }];
                    setEditingScene({...editingScene, choices: newChoices});
                  }}
                >
                  + Add Challenge Option
                </button>
              </div>
            )}
            {editingScene.type === 'ending' && (
              <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <label style={labelStyle}>Ending Classification</label>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="endingType" 
                      checked={editingScene.isGoodEnd !== false}
                      onChange={() => setEditingScene({...editingScene, isGoodEnd: true})}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#10b981' }}>Good / True End</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="endingType" 
                      checked={editingScene.isGoodEnd === false}
                      onChange={() => setEditingScene({...editingScene, isGoodEnd: false})}
                      style={{ accentColor: '#ef4444' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ef4444' }}>Bad / Fail End</span>
                  </label>
                </div>
                <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Good endings allow the player to unlock the next chapter. Bad endings force a retry or return to menu.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="kawaii-btn" style={{ background: 'var(--accent)', color: 'var(--white)' }} onClick={handleUpdateScene}><Save size={18}/> Update Scene</button>
              <button className="kawaii-btn" onClick={() => setEditingScene(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Picker Modal */}
      {isAssetPickerOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--overlay)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="kawaii-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text)' }}>Select {assetPickerFilter}</h3>
              <button onClick={() => setIsAssetPickerOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {availableAssets.filter(a => a.category === assetPickerFilter).map(asset => (
                  <div 
                    key={asset.id} 
                    className="hover-bright"
                    style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}
                    onClick={() => {
                      assetPickerCallback(asset.url);
                      setIsAssetPickerOpen(false);
                    }}
                  >
                    <div style={{ aspectRatio: '16/9', background: '#000' }}>
                      {asset.type === 'image' ? (
                        <img src={asset.url} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><List size={32} opacity={0.2}/></div>
                      )}
                    </div>
                    <div style={{ padding: '0.8rem', fontSize: '0.8rem' }}>{asset.name}</div>
                  </div>
                ))}
                {availableAssets.filter(a => a.category === assetPickerFilter).length === 0 && (
                  <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No assets found in this category.
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
              <button className="kawaii-btn" onClick={() => setIsAssetPickerOpen(false)}>Close</button>
            </div>
          </div>
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
  color: 'var(--text-muted)',
  marginBottom: '0.5rem',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.8rem 1rem',
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text)',
  outline: 'none'
};

export default SceneManager;
