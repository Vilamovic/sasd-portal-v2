/**
 * useRoleCheck - Hook dla hierarchii ról
 *
 * Features:
 * - DEV_UUID hardcoded (nietykalne)
 * - determineRole (dev hardcoded, reszta z DB)
 * - Role helpers (isDev, isHCS, isCS, isDeputy, isTrainee, isAdmin)
 *
 * Hierarchy:
 * dev > hcs > cs > deputy > trainee
 */

// UUID developera (hardcoded - nietykalne)
const DEV_UUID = '2ab9b7ad-a32f-4219-b1fd-3c0e79628d75';

export interface RoleCheckHelpers {
  isDev: boolean;
  isHCS: boolean;
  isCS: boolean;
  isDeputy: boolean;
  isTrainee: boolean;
  isAdmin: boolean; // Backward compatibility (cs + hcs + dev)
}

/**
 * Określa rolę użytkownika
 * @param userId - UUID użytkownika
 * @param dbUser - Dane użytkownika z bazy (może być undefined)
 * @returns Rola użytkownika (dev, hcs, cs, deputy, trainee)
 */
export function determineRole(
  userId: string,
  dbUser: { role?: string } | null | undefined
): string {
  // Dev role hardcoded
  if (userId === DEV_UUID) {
    return 'dev';
  }
  // Role z bazy danych (domyślnie trainee)
  return dbUser?.role || 'trainee';
}

/**
 * Oblicza role helpers na podstawie aktualnej roli
 * @param role - Aktualna rola użytkownika (dev, hcs, cs, deputy, trainee)
 * @returns Object z booleanami (isDev, isHCS, isCS, isDeputy, isTrainee, isAdmin)
 */
export function getRoleHelpers(role: string | null): RoleCheckHelpers {
  return {
    isDev: role === 'dev',
    isHCS: role === 'hcs' || role === 'dev',
    isCS: role === 'cs' || role === 'hcs' || role === 'dev',
    isDeputy: role === 'deputy' || role === 'cs' || role === 'hcs' || role === 'dev',
    isTrainee: !!role, // Każdy zalogowany użytkownik ma co najmniej dostęp trainee
    // Backward compatibility - admin obejmuje CS i wyżej
    isAdmin: role === 'cs' || role === 'hcs' || role === 'dev',
  };
}

/**
 * Hook do sprawdzania roli użytkownika
 * @param role - Aktualna rola użytkownika
 * @returns Role helpers object
 */
export function useRoleCheck(role: string | null): RoleCheckHelpers {
  return getRoleHelpers(role);
}

// Export DEV_UUID dla innych hooków
export { DEV_UUID };
