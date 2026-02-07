/**
 * LoadingState - Loading spinner for AdminPanel
 */
export default function LoadingState() {
  return (
    <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4" />
        <p className="text-[#8fb5a0]">Ładowanie użytkowników...</p>
      </div>
    </div>
  );
}
