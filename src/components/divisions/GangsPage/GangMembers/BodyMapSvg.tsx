'use client';

import { X } from 'lucide-react';

export interface BodyMarker {
  x: number;
  y: number;
  side: 'front' | 'back';
}

interface BodyMapSvgProps {
  markers: BodyMarker[];
  onAddMarker: (marker: BodyMarker) => void;
  onRemoveMarker: (index: number) => void;
  readOnly?: boolean;
}

const BODY_WIDTH = 200;
const BODY_HEIGHT = 400;

/**
 * SVG body outline for front and back views.
 * Simplified human silhouette paths.
 */
function BodyOutline() {
  return (
    <g>
      {/* Head */}
      <ellipse cx="100" cy="40" rx="25" ry="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Neck */}
      <line x1="90" y1="70" x2="90" y2="85" stroke="currentColor" strokeWidth="1.5" />
      <line x1="110" y1="70" x2="110" y2="85" stroke="currentColor" strokeWidth="1.5" />
      {/* Torso */}
      <path d="M 60 85 Q 55 90, 50 130 L 50 220 Q 55 240, 70 250 L 70 250" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 140 85 Q 145 90, 150 130 L 150 220 Q 145 240, 130 250 L 130 250" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Shoulders */}
      <path d="M 60 85 Q 70 80, 90 85" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 140 85 Q 130 80, 110 85" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Arms left */}
      <path d="M 60 85 Q 30 100, 25 160 Q 22 180, 20 200" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 20 200 Q 18 210, 15 215" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Arms right */}
      <path d="M 140 85 Q 170 100, 175 160 Q 178 180, 180 200" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 180 200 Q 182 210, 185 215" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Hips */}
      <path d="M 70 250 Q 80 260, 85 260 L 85 270" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 130 250 Q 120 260, 115 260 L 115 270" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Waist line */}
      <line x1="50" y1="220" x2="150" y2="220" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4,2" />
      {/* Legs left */}
      <path d="M 85 270 Q 80 310, 75 350 Q 73 370, 70 390" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 70 390 L 60 395" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Legs right */}
      <path d="M 115 270 Q 120 310, 125 350 Q 127 370, 130 390" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 130 390 L 140 395" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Inner legs */}
      <path d="M 85 270 Q 90 290, 90 310 Q 88 340, 85 370 Q 83 385, 80 395" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 115 270 Q 110 290, 110 310 Q 112 340, 115 370 Q 117 385, 120 395" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </g>
  );
}

function BodySvg({
  side,
  markers,
  onAddMarker,
  onRemoveMarker,
  readOnly,
}: {
  side: 'front' | 'back';
  markers: BodyMarker[];
  onAddMarker: (marker: BodyMarker) => void;
  onRemoveMarker: (index: number) => void;
  readOnly?: boolean;
}) {
  const sideMarkers = markers.filter((m) => m.side === side);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * BODY_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * BODY_HEIGHT;
    onAddMarker({ x: Math.round(x), y: Math.round(y), side });
  };

  return (
    <div className="flex flex-col items-center">
      <span className="font-[family-name:var(--font-vt323)] text-xs tracking-widest mb-1" style={{ color: 'var(--mdt-content-text)' }}>
        {side === 'front' ? 'PRZÓD' : 'TYŁ'}
      </span>
      <svg
        viewBox={`0 0 ${BODY_WIDTH} ${BODY_HEIGHT}`}
        className="w-full max-w-[180px] h-auto"
        style={{
          color: 'var(--mdt-muted-text)',
          cursor: readOnly ? 'default' : 'crosshair',
        }}
        onClick={handleClick}
      >
        <BodyOutline />
        {/* Markers */}
        {sideMarkers.map((marker, idx) => {
          const globalIdx = markers.indexOf(marker);
          return (
            <g key={idx}>
              <circle cx={marker.x} cy={marker.y} r="8" fill="#3b82f6" opacity="0.8" />
              <circle cx={marker.x} cy={marker.y} r="3" fill="#fff" />
              {!readOnly && (
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveMarker(globalIdx);
                  }}
                  className="cursor-pointer"
                >
                  <circle cx={marker.x + 9} cy={marker.y - 9} r="6" fill="#c41e1e" />
                  <text x={marker.x + 9} y={marker.y - 5} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">×</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function BodyMapSvg({ markers, onAddMarker, onRemoveMarker, readOnly }: BodyMapSvgProps) {
  return (
    <div>
      <div className="flex gap-4 justify-center">
        <BodySvg side="front" markers={markers} onAddMarker={onAddMarker} onRemoveMarker={onRemoveMarker} readOnly={readOnly} />
        <BodySvg side="back" markers={markers} onAddMarker={onAddMarker} onRemoveMarker={onRemoveMarker} readOnly={readOnly} />
      </div>
      {!readOnly && (
        <div className="mt-2 text-center">
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
            Kliknij na sylwetkę aby oznaczyć obrażenie. {markers.length} oznaczeń.
          </span>
        </div>
      )}
    </div>
  );
}
