'use client';

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
 * Improved filled human silhouette for body map.
 */
function BodyOutline() {
  return (
    <g>
      {/* Head */}
      <ellipse cx="100" cy="35" rx="22" ry="26" fill="var(--body-fill, #f0f0f0)" stroke="currentColor" strokeWidth="1.5" />
      {/* Neck */}
      <rect x="91" y="60" width="18" height="14" rx="3" fill="var(--body-fill, #f0f0f0)" stroke="currentColor" strokeWidth="1" />
      {/* Torso */}
      <path
        d="M 65 74 L 60 80 Q 55 85, 52 110 L 50 180 Q 52 200, 60 210 L 70 220 L 85 225 L 100 228 L 115 225 L 130 220 L 140 210 Q 148 200, 150 180 L 148 110 Q 145 85, 140 80 L 135 74"
        fill="var(--body-fill, #f0f0f0)" stroke="currentColor" strokeWidth="1.5"
      />
      {/* Shoulders connection */}
      <path d="M 65 74 Q 80 68, 100 67 Q 120 68, 135 74" fill="var(--body-fill, #f0f0f0)" stroke="currentColor" strokeWidth="1.5" />
      {/* Left arm */}
      <path d="M 55 85 Q 40 95, 32 130 Q 28 155, 25 180 Q 22 195, 20 205" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="18" cy="210" rx="6" ry="8" fill="var(--body-fill, #f0f0f0)" stroke="currentColor" strokeWidth="1" />
      {/* Right arm */}
      <path d="M 145 85 Q 160 95, 168 130 Q 172 155, 175 180 Q 178 195, 180 205" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="182" cy="210" rx="6" ry="8" fill="var(--body-fill, #f0f0f0)" stroke="currentColor" strokeWidth="1" />
      {/* Left leg */}
      <path d="M 78 225 Q 75 260, 72 300 Q 70 330, 68 360 L 66 380" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="64" cy="386" rx="10" ry="6" fill="var(--body-fill, #f0f0f0)" stroke="currentColor" strokeWidth="1" />
      {/* Right leg */}
      <path d="M 122 225 Q 125 260, 128 300 Q 130 330, 132 360 L 134 380" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="136" cy="386" rx="10" ry="6" fill="var(--body-fill, #f0f0f0)" stroke="currentColor" strokeWidth="1" />
      {/* Inner legs */}
      <path d="M 90 228 Q 88 260, 85 300 Q 83 330, 80 360 L 78 380" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M 110 228 Q 112 260, 115 300 Q 117 330, 120 360 L 122 380" fill="none" stroke="currentColor" strokeWidth="1.2" />
      {/* Waist line */}
      <line x1="50" y1="180" x2="150" y2="180" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.5" />
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
