import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByUsername } from '@/src/lib/db/users';
import { getUserPenalties } from '@/src/lib/db/penalties';
import { getUserNotes } from '@/src/lib/db/notes';

/**
 * useUserProfile - Hook dla ładowania danych profilu użytkownika
 */
export function useUserProfile(username: string) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activePenalties, setActivePenalties] = useState<any[]>([]);

  const loadUserData = async () => {
    try {
      setLoadingData(true);

      // First get user by username to get the ID
      const { data: userData, error: userError } = await getUserByUsername(username);
      if (userError) throw userError;
      if (!userData) {
        router.push('/personnel');
        return;
      }

      // Set userId for subsequent operations
      setUserId(userData.id);
      setUser(userData);

      if (userData) {
        // Load penalties + notes in parallel
        const [penaltiesRes, notesRes] = await Promise.all([
          getUserPenalties(userData.id),
          getUserNotes(userData.id),
        ]);

        if (penaltiesRes.error) throw penaltiesRes.error;
        if (notesRes.error) throw notesRes.error;

        // Map penalties
        const mappedPenalties = (penaltiesRes.data || []).map((p: any) => ({
          ...p,
          penalty_type: p.type,
          reason: p.description,
          admin_username: p.created_by_user?.username || 'Unknown',
        }));
        setPenalties(mappedPenalties);

        // Active suspensions
        const active = mappedPenalties.filter((p: any) => {
          const suspensionTypes = ['zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia', 'zawieszenie_poscigowe'];
          if (suspensionTypes.includes(p.penalty_type) && p.duration_hours) {
            const createdAt = new Date(p.created_at).getTime();
            const expiresAt = createdAt + p.duration_hours * 60 * 60 * 1000;
            return Date.now() < expiresAt;
          }
          return false;
        });
        setActivePenalties(active);

        // Map notes
        const mappedNotes = (notesRes.data || []).map((n: any) => ({
          ...n,
          admin_username: n.created_by_user?.username || 'Unknown',
        }));
        setNotes(mappedNotes);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Błąd podczas ładowania danych użytkownika.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (username) {
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  return {
    user,
    userId,
    penalties,
    notes,
    loadingData,
    activePenalties,
    loadUserData,
  };
}
