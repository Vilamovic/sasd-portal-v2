import { useState } from 'react';
import { verifyAndConsumeExamToken } from '@/src/lib/db/tokens';

interface UseTokenVerificationProps {
  userId: string;
  onSuccess: (examTypeId: number) => void;
}

/**
 * useTokenVerification - Hook dla token modal logic
 */
export function useTokenVerification({ userId, onSuccess }: UseTokenVerificationProps) {
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [pendingExamTypeId, setPendingExamTypeId] = useState<number | null>(null);

  const openTokenModal = (examTypeId: number) => {
    setPendingExamTypeId(examTypeId);
    setTokenInput('');
    setTokenError('');
    setShowTokenModal(true);
  };

  const closeTokenModal = () => {
    setShowTokenModal(false);
    setTokenInput('');
    setTokenError('');
    setPendingExamTypeId(null);
  };

  const verifyTokenAndStart = async () => {
    if (!tokenInput.trim()) {
      setTokenError('Proszę wprowadzić token dostępu.');
      return;
    }

    if (!pendingExamTypeId) return;

    setVerifyingToken(true);
    setTokenError('');

    try {
      const { data, error } = await verifyAndConsumeExamToken(tokenInput.trim(), userId, pendingExamTypeId);

      if (error || !data?.success) {
        setTokenError(data?.error || 'Nieprawidłowy token. Sprawdź i spróbuj ponownie.');
        setVerifyingToken(false);
        return;
      }

      // Token zweryfikowany - zamknij modal i rozpocznij egzamin
      setShowTokenModal(false);
      onSuccess(pendingExamTypeId);
      setVerifyingToken(false);
    } catch (error) {
      console.error('Error verifying token or starting exam:', error);
      setTokenError('Błąd podczas weryfikacji tokenu. Spróbuj ponownie.');
      setVerifyingToken(false);
    }
  };

  return {
    showTokenModal,
    tokenInput,
    setTokenInput,
    tokenError,
    setTokenError,
    verifyingToken,
    openTokenModal,
    closeTokenModal,
    verifyTokenAndStart,
  };
}
