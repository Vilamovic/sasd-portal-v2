'use client';

import { UserCog, Award, Shield, TrendingUp, TrendingDown, Check, X } from 'lucide-react';

interface BatchOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsersCount: number;
  batchOperation: 'badges' | 'permissions' | 'divisions';
  setBatchOperation: (operation: 'badges' | 'permissions' | 'divisions') => void;
  batchPermissions: string[];
  setBatchPermissions: (permissions: string[]) => void;
  batchDivision: string;
  setBatchDivision: (division: string) => void;
  permissions: string[];
  onPromote: () => void;
  onDemote: () => void;
  onAddPermissions: () => void;
  onRemovePermissions: () => void;
  onAssignDivision: () => void;
  onRemoveDivision: () => void;
}

/**
 * BatchOperationsModal - Modal do zarządzania zaznaczonymi użytkownikami
 * 3 typy operacji: Stopnie, Uprawnienia, Dywizje
 */
export default function BatchOperationsModal({
  isOpen,
  onClose,
  selectedUsersCount,
  batchOperation,
  setBatchOperation,
  batchPermissions,
  setBatchPermissions,
  batchDivision,
  setBatchDivision,
  permissions,
  onPromote,
  onDemote,
  onAddPermissions,
  onRemovePermissions,
  onAssignDivision,
  onRemoveDivision,
}: BatchOperationsModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    setBatchPermissions([]);
    setBatchDivision('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass-strong rounded-2xl border border-[#c9a227]/30 p-8 max-w-2xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCog className="w-6 h-6 text-[#c9a227]" />
            Zarządzaj zaznaczonymi ({selectedUsersCount})
          </h3>
          <button
            onClick={handleClose}
            className="text-[#8fb5a0] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Operation Type Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setBatchOperation('badges')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
              batchOperation === 'badges'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] shadow-lg'
                : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
            }`}
          >
            <Award className="w-5 h-5" />
            Stopnie
          </button>
          <button
            onClick={() => setBatchOperation('permissions')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
              batchOperation === 'permissions'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] shadow-lg'
                : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
            }`}
          >
            <Shield className="w-5 h-5" />
            Uprawnienia
          </button>
          <button
            onClick={() => setBatchOperation('divisions')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
              batchOperation === 'divisions'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] shadow-lg'
                : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
            }`}
          >
            <Shield className="w-5 h-5" />
            Dywizje
          </button>
        </div>

        {/* Content based on operation type */}
        <div className="space-y-4">
          {/* Stopnie Operations */}
          {batchOperation === 'badges' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-xl">
                <p className="text-[#c9a227] text-sm">
                  Każdy użytkownik zostanie awansowany/zdegradowany o 1 stopień względem swojego aktualnego stopnia.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onPromote}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                  <TrendingUp className="w-5 h-5" />
                  Awansuj wszystkich
                </button>
                <button
                  onClick={onDemote}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                  <TrendingDown className="w-5 h-5" />
                  Degraduj wszystkich
                </button>
              </div>
            </div>
          )}

          {/* Permissions Operations */}
          {batchOperation === 'permissions' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">
                  Wybierz uprawnienia
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center gap-2 px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl cursor-pointer hover:bg-[#133524] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={batchPermissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBatchPermissions([...batchPermissions, perm]);
                          } else {
                            setBatchPermissions(batchPermissions.filter((p) => p !== perm));
                          }
                        }}
                        className="rounded border-[#1a4d32] bg-[#0a2818] text-[#c9a227] focus:ring-[#c9a227]"
                      />
                      <span className="text-white text-sm font-medium">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onAddPermissions}
                  disabled={batchPermissions.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" />
                  Dodaj uprawnienia
                </button>
                <button
                  onClick={onRemovePermissions}
                  disabled={batchPermissions.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  Usuń uprawnienia
                </button>
              </div>
            </div>
          )}

          {/* Divisions Operations */}
          {batchOperation === 'divisions' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[#8fb5a0] text-sm font-semibold mb-3">
                  Wybierz dywizję
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setBatchDivision('FTO')}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      batchDivision === 'FTO'
                        ? 'bg-[#c9a227] text-[#020a06] border-2 border-[#e6b830] shadow-lg'
                        : 'bg-[#0a2818] text-[#c9a227] border border-[#c9a227]/30 hover:bg-[#c9a227]/10'
                    }`}
                  >
                    FTO
                  </button>
                  <button
                    onClick={() => setBatchDivision('SS')}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      batchDivision === 'SS'
                        ? 'bg-[#ff8c00] text-white border-2 border-[#ff8c00] shadow-lg'
                        : 'bg-[#0a2818] text-[#ff8c00] border border-[#ff8c00]/30 hover:bg-[#ff8c00]/10'
                    }`}
                  >
                    SS
                  </button>
                  <button
                    onClick={() => setBatchDivision('DTU')}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      batchDivision === 'DTU'
                        ? 'bg-[#60a5fa] text-[#020a06] border-2 border-[#60a5fa] shadow-lg'
                        : 'bg-[#0a2818] text-[#60a5fa] border border-[#60a5fa]/30 hover:bg-[#60a5fa]/10'
                    }`}
                  >
                    DTU
                  </button>
                  <button
                    onClick={() => setBatchDivision('GU')}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      batchDivision === 'GU'
                        ? 'bg-[#10b981] text-white border-2 border-[#10b981] shadow-lg'
                        : 'bg-[#0a2818] text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/10'
                    }`}
                  >
                    GU
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onAssignDivision}
                  disabled={!batchDivision}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" />
                  Przypisz dywizję
                </button>
                <button
                  onClick={onRemoveDivision}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                  <X className="w-5 h-5" />
                  Usuń dywizje
                </button>
              </div>
            </div>
          )}

          {/* Cancel Button */}
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
