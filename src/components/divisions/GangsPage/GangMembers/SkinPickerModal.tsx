'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { AVAILABLE_SKINS, getSkinUrl } from './skinData';

interface SkinPickerModalProps {
  currentSkinId: number | null;
  onSelect: (skinId: number) => void;
  onClose: () => void;
}

const BATCH_SIZE = 60;

export default function SkinPickerModal({ currentSkinId, onSelect, onClose }: SkinPickerModalProps) {
  const [filter, setFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [hoveredSkin, setHoveredSkin] = useState<number | null>(currentSkinId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = filter.trim()
    ? AVAILABLE_SKINS.filter((id) => String(id).includes(filter.trim()))
    : AVAILABLE_SKINS;

  const visible = filtered.slice(0, visibleCount);

  // Lazy load on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
        setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filtered.length));
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [filtered.length]);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filter]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="panel-raised flex flex-col max-h-[90vh] w-full max-w-4xl mx-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#059669' }}>
          <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest text-white uppercase">
            Wybierz wygląd postaci
          </span>
          <button
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center text-xs font-bold"
            style={{ backgroundColor: '#c41e1e', color: '#fff', border: '1px solid #555' }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 flex items-center gap-3" style={{ borderBottom: '1px solid var(--mdt-muted-text)' }}>
          <div className="relative flex-1">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtruj po ID skina..."
              className="panel-inset w-full pl-7 pr-2 py-1 font-mono text-xs"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
          </div>
          <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
            {filtered.length} skinów
          </span>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Grid */}
          <div ref={scrollRef} className="flex-1 overflow-auto p-3">
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
              {visible.map((skinId) => (
                <button
                  key={skinId}
                  onClick={() => onSelect(skinId)}
                  onMouseEnter={() => setHoveredSkin(skinId)}
                  className="relative flex flex-col items-center"
                  style={{
                    border: skinId === currentSkinId ? '2px solid #4ade80' : '2px solid transparent',
                    backgroundColor: skinId === currentSkinId ? 'rgba(74,222,128,0.1)' : undefined,
                  }}
                >
                  <img
                    src={getSkinUrl(skinId)}
                    alt={`Skin ${skinId}`}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <span className="font-mono text-[8px] mt-0.5" style={{ color: 'var(--mdt-muted-text)' }}>
                    #{skinId}
                  </span>
                </button>
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="text-center py-3">
                <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                  Przewiń w dół aby zobaczyć więcej...
                </span>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="w-48 flex-shrink-0 flex flex-col items-center justify-center p-4" style={{ borderLeft: '2px solid var(--mdt-muted-text)' }}>
            {hoveredSkin != null ? (
              <>
                <div className="relative mb-3" style={{ backgroundColor: '#2a2a2a', border: '3px solid #1a1a1a' }}>
                  <img
                    src={getSkinUrl(hoveredSkin)}
                    alt={`Skin ${hoveredSkin}`}
                    className="w-32 h-auto"
                  />
                  {/* Height markers */}
                  <div className="absolute top-0 right-0 w-4 h-full" style={{
                    background: 'repeating-linear-gradient(to bottom, transparent, transparent 9px, #555 9px, #555 10px)',
                  }} />
                </div>
                <span className="font-[family-name:var(--font-vt323)] text-lg tracking-widest" style={{ color: 'var(--mdt-content-text)' }}>
                  SKIN #{hoveredSkin}
                </span>
                <span className="font-mono text-[10px] mt-1" style={{ color: 'var(--mdt-muted-text)' }}>
                  Kliknij aby wybrać
                </span>
              </>
            ) : (
              <span className="font-mono text-xs text-center" style={{ color: 'var(--mdt-muted-text)' }}>
                Najedź na skin aby zobaczyć podgląd
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t-2 border-[#999] p-3">
          <button className="btn-win95 text-xs" onClick={onClose}>ZAMKNIJ</button>
        </div>
      </div>
    </div>
  );
}
