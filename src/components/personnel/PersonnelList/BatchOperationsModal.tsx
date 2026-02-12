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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="panel-raised max-w-2xl w-full mx-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <h3 className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            Zarządzaj zaznaczonymi ({selectedUsersCount})
          </h3>
          <button
            onClick={handleClose}
            style={{ backgroundColor: '#c41e1e', color: '#fff', border: '1px solid #555' }}
            className="w-6 h-6 flex items-center justify-center text-xs font-bold"
          >
            X
          </button>
        </div>

        <div className="p-4">
          {/* Operation Type Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setBatchOperation('badges')}
              className="btn-win95 flex-1 flex items-center justify-center gap-2"
              style={batchOperation === 'badges' ? { backgroundColor: 'var(--mdt-input-bg)', borderColor: '#555 #fff #fff #555' } : {}}
            >
              <Award className="w-4 h-4" />
              Stopnie
            </button>
            <button
              onClick={() => setBatchOperation('permissions')}
              className="btn-win95 flex-1 flex items-center justify-center gap-2"
              style={batchOperation === 'permissions' ? { backgroundColor: 'var(--mdt-input-bg)', borderColor: '#555 #fff #fff #555' } : {}}
            >
              <Shield className="w-4 h-4" />
              Uprawnienia
            </button>
            <button
              onClick={() => setBatchOperation('divisions')}
              className="btn-win95 flex-1 flex items-center justify-center gap-2"
              style={batchOperation === 'divisions' ? { backgroundColor: 'var(--mdt-input-bg)', borderColor: '#555 #fff #fff #555' } : {}}
            >
              <Shield className="w-4 h-4" />
              Dywizje
            </button>
          </div>

          {/* Content based on operation type */}
          <div className="space-y-4">
            {/* Stopnie Operations */}
            {batchOperation === 'badges' && (
              <div className="space-y-4">
                <div className="panel-inset p-3" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
                  <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
                    Każdy użytkownik zostanie awansowany/zdegradowany o 1 stopień względem swojego aktualnego stopnia.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onPromote}
                    className="btn-win95 flex-1 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Awansuj wszystkich
                  </button>
                  <button
                    onClick={onDemote}
                    className="btn-win95 flex-1 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
                  >
                    <TrendingDown className="w-4 h-4" />
                    Degraduj wszystkich
                  </button>
                </div>
              </div>
            )}

            {/* Permissions Operations */}
            {batchOperation === 'permissions' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-sm font-bold mb-2" style={{ color: 'var(--mdt-muted-text)' }}>
                    Wybierz uprawnienia
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {permissions.map((perm) => (
                      <label
                        key={perm}
                        className="panel-inset flex items-center gap-2 px-3 py-2 cursor-pointer"
                        style={{ backgroundColor: 'var(--mdt-input-bg)' }}
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
                        />
                        <span className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onAddPermissions}
                    disabled={batchPermissions.length === 0}
                    className="btn-win95 flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
                  >
                    <Check className="w-4 h-4" />
                    Dodaj uprawnienia
                  </button>
                  <button
                    onClick={onRemovePermissions}
                    disabled={batchPermissions.length === 0}
                    className="btn-win95 flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
                  >
                    <X className="w-4 h-4" />
                    Usuń uprawnienia
                  </button>
                </div>
              </div>
            )}

            {/* Divisions Operations */}
            {batchOperation === 'divisions' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-sm font-bold mb-2" style={{ color: 'var(--mdt-muted-text)' }}>
                    Wybierz dywizję
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setBatchDivision('FTO')}
                      className="btn-win95 font-mono text-sm font-bold"
                      style={batchDivision === 'FTO' ? { backgroundColor: '#c9a227', color: '#000', borderColor: '#555 #fff #fff #555' } : {}}
                    >
                      FTO
                    </button>
                    <button
                      onClick={() => setBatchDivision('SS')}
                      className="btn-win95 font-mono text-sm font-bold"
                      style={batchDivision === 'SS' ? { backgroundColor: '#ff8c00', color: '#fff', borderColor: '#555 #fff #fff #555' } : {}}
                    >
                      SS
                    </button>
                    <button
                      onClick={() => setBatchDivision('DTU')}
                      className="btn-win95 font-mono text-sm font-bold"
                      style={batchDivision === 'DTU' ? { backgroundColor: '#60a5fa', color: '#000', borderColor: '#555 #fff #fff #555' } : {}}
                    >
                      DTU
                    </button>
                    <button
                      onClick={() => setBatchDivision('GU')}
                      className="btn-win95 font-mono text-sm font-bold"
                      style={batchDivision === 'GU' ? { backgroundColor: '#059669', color: '#fff', borderColor: '#555 #fff #fff #555' } : {}}
                    >
                      GU
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onAssignDivision}
                    disabled={!batchDivision}
                    className="btn-win95 flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
                  >
                    <Check className="w-4 h-4" />
                    Przypisz dywizję
                  </button>
                  <button
                    onClick={onRemoveDivision}
                    className="btn-win95 flex-1 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
                  >
                    <X className="w-4 h-4" />
                    Usuń dywizje
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Button */}
            <button
              onClick={handleClose}
              className="btn-win95 w-full"
            >
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
