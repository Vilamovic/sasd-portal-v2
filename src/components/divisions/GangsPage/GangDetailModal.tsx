'use client';

import { X, Users } from 'lucide-react';

interface GangDetailModalProps {
  gang: {
    id: string;
    title: string;
    description: string | null;
  };
  onClose: () => void;
}

export default function GangDetailModal({ gang, onClose }: GangDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div
        className="panel-raised flex flex-col max-h-[85vh] w-full max-w-3xl mx-4"
        style={{ backgroundColor: 'var(--mdt-btn-face)' }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#059669' }}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
              {gang.title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center text-xs font-bold"
            style={{ backgroundColor: '#c41e1e', color: '#fff', border: '1px solid #555' }}
            aria-label="Zamknij"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {gang.description ? (
            <div
              className="font-mono text-sm prose-sm max-w-none leading-relaxed"
              style={{ color: 'var(--mdt-content-text)' }}
              dangerouslySetInnerHTML={{
                __html: gang.description
                  .replace(/&nbsp;/g, ' ')
                  .replace(/\u00A0/g, ' '),
              }}
            />
          ) : (
            <p className="font-mono text-sm italic" style={{ color: 'var(--mdt-muted-text)' }}>
              Brak opisu
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t-2 border-[#999] p-3">
          <button className="btn-win95 text-xs" onClick={onClose}>
            ZAMKNIJ
          </button>
        </div>
      </div>
    </div>
  );
}
