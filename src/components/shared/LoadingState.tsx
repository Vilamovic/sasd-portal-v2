interface LoadingStateProps {
  message?: string;
}

/**
 * LoadingState - Universal loading spinner (Sheriff Theme pattern)
 *
 * Shared component used across AdminPanel, TokenManagement, DivisionPage
 */
export default function LoadingState({ message = 'Ładowanie...' }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4" />
        <p className="text-[#8fb5a0]">{message}</p>
      </div>
    </div>
  );
}
