'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="panel-raised p-8 text-center max-w-md" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="px-4 py-2 mb-4" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <h1 className="font-[family-name:var(--font-vt323)] text-3xl tracking-widest text-white">
            BŁĄD 404
          </h1>
        </div>
        <div className="panel-inset p-4 mb-4" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
          <p className="font-mono text-sm mb-2" style={{ color: 'var(--mdt-content-text)' }}>
            Strona nie została znaleziona.
          </p>
          <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
            Sprawdź adres URL lub wróć do panelu głównego.
          </p>
        </div>
        <button
          onClick={() => { window.location.href = '/dashboard'; }}
          className="btn-win95 inline-block font-mono text-sm px-6 py-2"
        >
          POWRÓT DO DASHBOARD
        </button>
      </div>
    </div>
  );
}
