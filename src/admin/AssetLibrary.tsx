import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image, Music, Volume2, Users, Search, X } from 'lucide-react';
import { AssetService } from '../firebase/db';
import type { Asset } from '../types/game';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useSnackbar } from '../context/SnackbarContext';

const AssetLibrary: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'background' | 'character' | 'bgm' | 'sfx'>('all');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newAsset, setNewAsset] = useState<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    url: '',
    type: 'image',
    category: 'background'
  });

  const [modal, setModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void, type: 'warning' | 'error' | 'success' }>({
    isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning'
  });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const fetched = await AssetService.getAll();
      setAssets(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAdd = async () => {
    if (!newAsset.name || !newAsset.url) return;
    try {
      await AssetService.add(newAsset as any);
      setNewAsset({ name: '', type: 'image', category: 'background', url: '' });
      setIsAdding(false);
      showSnackbar("Asset added to library", "success");
      fetchAssets();
    } catch (e) {
      showSnackbar("Error adding asset", "error");
    }
  };

  const handleDelete = (id: string) => {
    setModal({
      isOpen: true,
      title: 'Delete Asset',
      message: 'Are you sure you want to delete this asset? This action cannot be undone.',
      type: 'warning',
      onConfirm: async () => {
        await AssetService.remove(id);
        setModal(prev => ({ ...prev, isOpen: false }));
        showSnackbar("Asset deleted", "warning");
        fetchAssets();
      }
    });
  };

  const handleBulkDelete = () => {
    setModal({
      isOpen: true,
      title: `Delete ${selectedIds.length} Assets`,
      message: `Are you sure you want to delete all ${selectedIds.length} selected assets?`,
      type: 'error',
      onConfirm: async () => {
        setLoading(true);
        await Promise.all(selectedIds.map(id => AssetService.remove(id)));
        setSelectedIds([]);
        setIsSelectMode(false);
        setModal(prev => ({ ...prev, isOpen: false }));
        showSnackbar(`${selectedIds.length} assets deleted`, "warning");
        fetchAssets();
      }
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredAssets = assets.filter(a => {
    const matchesFilter = filter === 'all' || a.category === filter;
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="asset-library">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Asset Library</h2>
          <p style={{ color: '#888' }}>Manage your backgrounds, characters, and audio files.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="kawaii-btn" 
            style={{ background: isSelectMode ? 'var(--primary-color)' : 'transparent', color: '#fff' }}
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedIds([]);
            }}
          >
            {isSelectMode ? 'Cancel Selection' : 'Choose Many'}
          </button>
          <button className="kawaii-btn" onClick={() => setIsAdding(true)}>
            <Plus size={18} /> Add New Asset
          </button>
        </div>
      </div>

      {isSelectMode && (
        <div className="kawaii-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'var(--primary-color)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>{selectedIds.length} Assets Selected</span>
            <button 
              className="kawaii-btn" 
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
              onClick={() => {
                const allFilteredIds = filteredAssets.map(a => a.id);
                const areAllSelected = allFilteredIds.every(id => selectedIds.includes(id));
                if (areAllSelected) {
                  setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                } else {
                  setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
                }
              }}
            >
              {filteredAssets.every(a => selectedIds.includes(a.id)) ? 'Deselect All' : 'Select All Filtered'}
            </button>
          </div>
          {selectedIds.length > 0 && (
            <button className="kawaii-btn" style={{ background: '#ff4444', color: '#fff', padding: '0.5rem 1.5rem' }} onClick={handleBulkDelete}>
              <Trash2 size={16} /> Delete Selected
            </button>
          )}
        </div>
      )}

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={18} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '3rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <FilterBtn active={filter === 'all'} label="All" onClick={() => setFilter('all')} />
          <FilterBtn active={filter === 'background'} label="Backgrounds" onClick={() => setFilter('background')} icon={<Image size={14}/>} />
          <FilterBtn active={filter === 'character'} label="Characters" onClick={() => setFilter('character')} icon={<Users size={14}/>} />
          <FilterBtn active={filter === 'bgm'} label="Music" onClick={() => setFilter('bgm')} icon={<Music size={14}/>} />
          <FilterBtn active={filter === 'sfx'} label="SFX" onClick={() => setFilter('sfx')} icon={<Volume2 size={14}/>} />
        </div>
      </div>

      {/* Add Asset Modal/Panel */}
      {isAdding && (
        <div className="kawaii-panel" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>New Asset</h3>
            <button onClick={() => setIsAdding(false)}><X size={20}/></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Asset Name</label>
              <input 
                type="text" 
                value={newAsset.name} 
                onChange={e => setNewAsset({...newAsset, name: e.target.value})} 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select 
                value={newAsset.category} 
                onChange={e => {
                  const category = e.target.value as any;
                  const type = (category === 'background' || category === 'character') ? 'image' : 'audio';
                  setNewAsset({...newAsset, category, type});
                }}
                style={inputStyle}
              >
                <option value="background">Background</option>
                <option value="character">Character Sprite</option>
                <option value="bgm">Background Music</option>
                <option value="sfx">Sound Effect</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Source URL</label>
              <input 
                type="text" 
                placeholder="https://..." 
                value={newAsset.url} 
                onChange={e => setNewAsset({...newAsset, url: e.target.value})} 
                style={inputStyle} 
              />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button className="kawaii-btn" style={{ background: 'var(--primary-color)' }} onClick={handleAdd}>Save Asset</button>
            <button className="kawaii-btn" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#888' }}>Loading library...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {filteredAssets.map(asset => (
            <div 
              key={asset.id} 
              className="kawaii-panel hover-bright" 
              onClick={() => isSelectMode && toggleSelect(asset.id)}
              style={{ 
                overflow: 'hidden', 
                transition: 'all 0.3s ease',
                cursor: isSelectMode ? 'pointer' : 'default',
                border: selectedIds.includes(asset.id) ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)',
                transform: selectedIds.includes(asset.id) ? 'scale(1.02)' : 'none'
              }}
            >
              <div style={{ aspectRatio: '16/9', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {isSelectMode && (
                  <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10 }}>
                    <input type="checkbox" checked={selectedIds.includes(asset.id)} readOnly />
                  </div>
                )}
                {asset.type === 'image' ? (
                  <img src={asset.url} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ opacity: 0.3 }}><Music size={40} /></div>
                )}
                <div style={{ 
                  position: 'absolute', 
                  top: '0.5rem', 
                  right: '0.5rem',
                  padding: '0.2rem 0.5rem',
                  background: 'rgba(0,0,0,0.8)',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase'
                }}>
                  {asset.category}
                </div>
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {asset.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#666' }}>ID: {asset.id.slice(0, 8)}</span>
                  {!isSelectMode && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }} style={{ color: '#ff4444', padding: '0.3rem' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

const FilterBtn = ({ active, label, onClick, icon }: { active: boolean, label: string, onClick: () => void, icon?: React.ReactNode }) => (
  <button 
    onClick={onClick}
    style={{ 
      padding: '0.6rem 1rem', 
      borderRadius: '8px', 
      background: active ? 'var(--primary-color)' : 'var(--glass-bg)',
      border: `1px solid ${active ? 'var(--primary-color)' : 'var(--glass-border)'}`,
      color: active ? '#fff' : '#888',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    }}
  >
    {icon} {label}
  </button>
);

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

export default AssetLibrary;
