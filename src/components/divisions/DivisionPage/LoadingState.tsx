/**
 * LoadingState - Loading spinner for DivisionPage
 */
export default function LoadingState() {
  return (
    <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#c9a227]/30 border-t-[#c9a227] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#8fb5a0] text-lg">Ładowanie...</p>
      </div>
    </div>
  );
}
