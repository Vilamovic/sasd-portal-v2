import { useState } from 'react';
import {
  updateUserBadge,
  updateUserPermissions,
  updateUserDivision,
  updateIsCommander,
} from '@/src/lib/db/users';
import { notifyBadgeChange, notifyPermissionChange, notifyDivisionChange } from '@/src/lib/webhooks/personnel';

interface UseBatchOperationsProps {
  users: any[];
  badges: string[];
  currentUser: any;
  onReload: () => void;
}

/**
 * useBatchOperations - Hook dla zarządzania batch operations (zaznaczanie + operacje grupowe)
 * Uses Promise.allSettled for parallel execution (5-10x faster than sequential).
 */
export function useBatchOperations({ users, badges, currentUser, onReload }: UseBatchOperationsProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = (allUserIds: string[]) => {
    if (selectedUsers.size === allUserIds.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(allUserIds));
    }
  };

  const createdByName = () => currentUser?.user_metadata?.full_name || 'Admin';

  const handleBatchPromote = async () => {
    if (!currentUser) return;
    const confirmed = confirm(`Czy na pewno chcesz awansować ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    const results = await Promise.allSettled(
      Array.from(selectedUsers).map(async (userId) => {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) return;

        const currentStopień = targetUser.badge;
        const currentIndex = badges.indexOf(currentStopień);
        if (currentIndex === -1 || currentIndex >= badges.length - 1) return;

        const newBadge = badges[currentIndex + 1];
        const { error } = await updateUserBadge(userId, newBadge);
        if (error) throw error;

        if (newBadge === 'Captain III' && targetUser.division) {
          await updateIsCommander(userId, true);
        }

        await notifyBadgeChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          oldBadge: currentStopień || 'Brak',
          newBadge,
          isPromotion: true,
          createdBy: { username: createdByName(), mta_nick: undefined },
        });
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.filter(r => r.status === 'rejected').length;

    await onReload();
    setSelectedUsers(new Set());
    alert(`Awansowano ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchDemote = async () => {
    if (!currentUser) return;
    const confirmed = confirm(`Czy na pewno chcesz zdegradować ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    const results = await Promise.allSettled(
      Array.from(selectedUsers).map(async (userId) => {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) return;

        const currentStopień = targetUser.badge;
        const currentIndex = badges.indexOf(currentStopień);
        if (currentIndex <= 0) return;

        const newBadge = badges[currentIndex - 1];
        const { error } = await updateUserBadge(userId, newBadge);
        if (error) throw error;

        await notifyBadgeChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          oldBadge: currentStopień || 'Brak',
          newBadge,
          isPromotion: false,
          createdBy: { username: createdByName(), mta_nick: undefined },
        });
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.filter(r => r.status === 'rejected').length;

    await onReload();
    setSelectedUsers(new Set());
    alert(`Zdegradowano ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchAddPermissions = async (batchPermissions: string[]) => {
    if (!currentUser || batchPermissions.length === 0) {
      alert('Wybierz przynajmniej jedno uprawnienie.');
      return;
    }

    const confirmed = confirm(`Czy na pewno chcesz dodać uprawnienia dla ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    const results = await Promise.allSettled(
      Array.from(selectedUsers).map(async (userId) => {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) return;

        const currentPermissions = targetUser.permissions || [];
        const newPermissions = [...new Set([...currentPermissions, ...batchPermissions])];
        const { error } = await updateUserPermissions(userId, newPermissions);
        if (error) throw error;

        const added = batchPermissions.filter((p: string) => !currentPermissions.includes(p));
        await Promise.all(added.map((permission) =>
          notifyPermissionChange({
            user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
            permission,
            isGranted: true,
            createdBy: { username: createdByName(), mta_nick: undefined },
          })
        ));
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.filter(r => r.status === 'rejected').length;

    await onReload();
    setSelectedUsers(new Set());
    alert(`Dodano uprawnienia dla ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchRemovePermissions = async (batchPermissions: string[]) => {
    if (!currentUser || batchPermissions.length === 0) {
      alert('Wybierz przynajmniej jedno uprawnienie.');
      return;
    }

    const confirmed = confirm(`Czy na pewno chcesz usunąć uprawnienia dla ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    const results = await Promise.allSettled(
      Array.from(selectedUsers).map(async (userId) => {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) return;

        const currentPermissions = targetUser.permissions || [];
        const newPermissions = currentPermissions.filter((p: string) => !batchPermissions.includes(p));
        const { error } = await updateUserPermissions(userId, newPermissions);
        if (error) throw error;

        const removed = batchPermissions.filter((p: string) => currentPermissions.includes(p));
        await Promise.all(removed.map((permission) =>
          notifyPermissionChange({
            user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
            permission,
            isGranted: false,
            createdBy: { username: createdByName(), mta_nick: undefined },
          })
        ));
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.filter(r => r.status === 'rejected').length;

    await onReload();
    setSelectedUsers(new Set());
    alert(`Usunięto uprawnienia dla ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchAssignDivision = async (batchDivision: string) => {
    if (!currentUser || !batchDivision) {
      alert('Wybierz dywizję.');
      return;
    }

    const confirmed = confirm(`Czy na pewno chcesz przypisać dywizję ${batchDivision} dla ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    const results = await Promise.allSettled(
      Array.from(selectedUsers).map(async (userId) => {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) return;

        const { error } = await updateUserDivision(userId, batchDivision);
        if (error) throw error;

        await notifyDivisionChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          division: batchDivision as 'FTO' | 'SS' | 'DTU' | 'GU',
          isGranted: true,
          isCommander: false,
          createdBy: { username: createdByName(), mta_nick: undefined },
        });
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.filter(r => r.status === 'rejected').length;

    await onReload();
    setSelectedUsers(new Set());
    alert(`Przypisano dywizję dla ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchRemoveDivision = async () => {
    if (!currentUser) return;

    const confirmed = confirm(`Czy na pewno chcesz usunąć dywizje dla ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    const results = await Promise.allSettled(
      Array.from(selectedUsers).map(async (userId) => {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser || !targetUser.division) return;

        const oldDivision = targetUser.division;
        const { error } = await updateUserDivision(userId, null);
        if (error) throw error;

        await notifyDivisionChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          division: oldDivision,
          isGranted: false,
          isCommander: false,
          createdBy: { username: createdByName(), mta_nick: undefined },
        });
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.filter(r => r.status === 'rejected').length;

    await onReload();
    setSelectedUsers(new Set());
    alert(`Usunięto dywizje dla ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  return {
    selectedUsers,
    toggleUserSelection,
    toggleSelectAll,
    handleBatchPromote,
    handleBatchDemote,
    handleBatchAddPermissions,
    handleBatchRemovePermissions,
    handleBatchAssignDivision,
    handleBatchRemoveDivision,
  };
}
