export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          SASD Portal v2
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          System szkoleniowy - Migracja Next.js 15 w toku...
        </p>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          FAZA 1: Inicjalizacja ukończona
        </div>
      </div>
    </div>
  );
}
