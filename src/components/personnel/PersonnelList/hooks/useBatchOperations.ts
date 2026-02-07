import { useState } from 'react';
import {
  updateUserBadge,
  updateUserPermissions,
  updateUserDivision,
  updateIsCommander,
} from '@/src/lib/db/users';
import { notifyBadgeChange, notifyPermissionChange, notifyDivisionChange } from '@/src/utils/discord';

interface UseBatchOperationsProps {
  users: any[];
  badges: string[];
  currentUser: any;
  onReload: () => void;
}

/**
 * useBatchOperations - Hook dla zarządzania batch operations (zaznaczanie + operacje grupowe)
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

  const handleBatchPromote = async () => {
    if (!currentUser) return;
    const confirmed = confirm(`Czy na pewno chcesz awansować ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) continue;

        const currentStopień = targetUser.badge;
        const currentIndex = badges.indexOf(currentStopień);

        // Sprawdź czy użytkownik nie ma już najwyższego stopnia
        if (currentIndex === -1 || currentIndex >= badges.length - 1) {
          continue;
        }

        const newStopień = badges[currentIndex + 1];

        // Update badge
        const { error } = await updateUserBadge(userId, newStopień);
        if (error) throw error;

        // Auto-Commander: Captain III + Division → is_commander = true
        if (newStopień === 'Captain III' && targetUser.division) {
          await updateIsCommander(userId, true);
        }

        // Discord webhook
        await notifyBadgeChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          oldStopień: currentStopień || 'Brak',
          newStopień,
          isPromotion: true,
          createdBy: { username: currentUser.user_metadata?.full_name || 'Admin', mta_nick: null },
        });

        successCount++;
      } catch (error) {
        console.error(`Error promoting user ${userId}:`, error);
        errorCount++;
      }
    }

    await onReload();
    setSelectedUsers(new Set());
    alert(`Awansowano ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchDemote = async () => {
    if (!currentUser) return;
    const confirmed = confirm(`Czy na pewno chcesz zdegradować ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) continue;

        const currentStopień = targetUser.badge;
        const currentIndex = badges.indexOf(currentStopień);

        // Sprawdź czy użytkownik nie ma już najniższego stopnia
        if (currentIndex <= 0) {
          continue;
        }

        const newStopień = badges[currentIndex - 1];

        // Update badge
        const { error } = await updateUserBadge(userId, newStopień);
        if (error) throw error;

        // Discord webhook
        await notifyBadgeChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          oldStopień: currentStopień || 'Brak',
          newStopień,
          isPromotion: false,
          createdBy: { username: currentUser.user_metadata?.full_name || 'Admin', mta_nick: null },
        });

        successCount++;
      } catch (error) {
        console.error(`Error demoting user ${userId}:`, error);
        errorCount++;
      }
    }

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

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) continue;

        const currentPermissions = targetUser.permissions || [];
        const newPermissions = [...new Set([...currentPermissions, ...batchPermissions])];

        // Update permissions
        const { error } = await updateUserPermissions(userId, newPermissions);
        if (error) throw error;

        // Discord webhooks dla każdego dodanego uprawnienia
        const added = batchPermissions.filter((p: string) => !currentPermissions.includes(p));
        for (const permission of added) {
          await notifyPermissionChange({
            user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
            permission,
            isGranted: true,
            createdBy: { username: currentUser.user_metadata?.full_name || 'Admin', mta_nick: null },
          });
        }

        successCount++;
      } catch (error) {
        console.error(`Error adding permissions to user ${userId}:`, error);
        errorCount++;
      }
    }

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

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) continue;

        const currentPermissions = targetUser.permissions || [];
        const newPermissions = currentPermissions.filter((p: string) => !batchPermissions.includes(p));

        // Update permissions
        const { error } = await updateUserPermissions(userId, newPermissions);
        if (error) throw error;

        // Discord webhooks dla każdego usuniętego uprawnienia
        const removed = batchPermissions.filter((p: string) => currentPermissions.includes(p));
        for (const permission of removed) {
          await notifyPermissionChange({
            user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
            permission,
            isGranted: false,
            createdBy: { username: currentUser.user_metadata?.full_name || 'Admin', mta_nick: null },
          });
        }

        successCount++;
      } catch (error) {
        console.error(`Error removing permissions from user ${userId}:`, error);
        errorCount++;
      }
    }

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

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) continue;

        // Update division
        const { error } = await updateUserDivision(userId, batchDivision);
        if (error) throw error;

        // Discord webhook
        await notifyDivisionChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          division: batchDivision,
          isGranted: true,
          isCommander: false,
          createdBy: { username: currentUser.user_metadata?.full_name || 'Admin', mta_nick: null },
        });

        successCount++;
      } catch (error) {
        console.error(`Error assigning division to user ${userId}:`, error);
        errorCount++;
      }
    }

    await onReload();
    setSelectedUsers(new Set());
    alert(`Przypisano dywizję dla ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchRemoveDivision = async () => {
    if (!currentUser) return;

    const confirmed = confirm(`Czy na pewno chcesz usunąć dywizje dla ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser || !targetUser.division) continue;

        const oldDivision = targetUser.division;

        // Update division
        const { error } = await updateUserDivision(userId, null);
        if (error) throw error;

        // Discord webhook
        await notifyDivisionChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          division: oldDivision,
          isGranted: false,
          isCommander: false,
          createdBy: { username: currentUser.user_metadata?.full_name || 'Admin', mta_nick: null },
        });

        successCount++;
      } catch (error) {
        console.error(`Error removing division from user ${userId}:`, error);
        errorCount++;
      }
    }

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
