'use client';

import MaterialsPage from './Materials/MaterialsPage';

/**
 * Materials - Routing wrapper for Materials page
 * Original: 586L → 11L (-575L, -98%)
 * Refactored: 2026-02-07 (ETAP 2.3)
 */
export default function Materials({ onBack }: { onBack?: () => void }) {
  return <MaterialsPage onBack={onBack} />;
}
