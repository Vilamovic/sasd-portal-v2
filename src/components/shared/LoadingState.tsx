interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'ŁADOWANIE...' }: LoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="text-center">
        <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
          {message}_
        </div>
      </div>
    </div>
  );
}
