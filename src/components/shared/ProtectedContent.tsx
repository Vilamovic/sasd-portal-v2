'use client';

import { useEffect, useRef, useState } from 'react';

interface ProtectedContentProps {
  children: React.ReactNode;
  username: string;
}

/**
 * ProtectedContent - Copy protection wrapper (deterrent)
 *
 * Features:
 * 1. user-select: none - blokuje zaznaczanie tekstu
 * 2. Tiled watermark - powtarzający się username overlay
 * 3. Print blocking - @media print ukrywa treść
 * 4. Ctrl+C / Ctrl+P / right-click / drag blocking
 * 5. DevTools detection - F12 / Ctrl+Shift+I/J/C = blur + warning
 */
export default function ProtectedContent({ children, username }: ProtectedContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [devToolsBlocked, setDevToolsBlocked] = useState(false);

  // Block keyboard shortcuts and detect DevTools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        setDevToolsBlocked(true);
        return;
      }

      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools shortcuts)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        const key = e.key.toLowerCase();
        if (key === 'i' || key === 'j' || key === 'c') {
          e.preventDefault();
          setDevToolsBlocked(true);
          return;
        }
      }

      // Ctrl+U (view source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setDevToolsBlocked(true);
        return;
      }
    };

    // Global listener (must catch F12 before browser handles it)
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Container-level protection (copy, print, right-click, drag)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'c' || key === 'p' || key === 'a' || key === 's') {
          e.preventDefault();
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('dragstart', handleDragStart);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="protected-content relative"
      tabIndex={-1}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Tiled watermark overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            inset: '-50%',
            width: '200%',
            height: '200%',
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'center',
            justifyContent: 'center',
            gap: '60px',
            transform: 'rotate(-30deg)',
            opacity: 0.04,
          }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'var(--mdt-content-text)',
                letterSpacing: '4px',
                fontFamily: 'var(--font-vt323)',
                whiteSpace: 'nowrap',
              }}
            >
              {username}
            </span>
          ))}
        </div>
      </div>

      {/* Content (blurred if DevTools shortcut detected) */}
      <div
        className="relative"
        style={{
          filter: devToolsBlocked ? 'blur(10px)' : 'none',
          transition: 'filter 0.3s',
        }}
      >
        {children}
      </div>

      {/* DevTools warning overlay */}
      {devToolsBlocked && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <div className="panel-raised p-6 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <p className="font-mono text-sm mb-4" style={{ color: 'var(--mdt-content-text)' }}>
              Wykryto próbę otwarcia narzędzi deweloperskich.
            </p>
            <button
              onClick={() => setDevToolsBlocked(false)}
              className="btn-win95 font-mono text-xs"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      {/* Print-only block message */}
      <div className="protected-print-block">
        <p style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', padding: '100px 20px' }}>
          Drukowanie materiałów jest zabronione.
        </p>
      </div>
    </div>
  );
}
