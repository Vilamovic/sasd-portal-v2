/**
 * Generic wrapper for Supabase database queries.
 * Eliminates try-catch boilerplate across all db/* files.
 *
 * Uses PromiseLike<any> to accept Supabase's PostgrestFilterBuilder
 * (which is thenable but not a full Promise).
 */

type QueryResult<T> = { data: T | null; error: any }

export async function dbQuery<T = any>(
  queryFn: () => PromiseLike<any>,
  label: string
): Promise<QueryResult<T>> {
  try {
    const { data, error } = await queryFn()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error(`${label}:`, error)
    return { data: null, error }
  }
}

export async function dbMutate(
  mutateFn: () => PromiseLike<any>,
  label: string
): Promise<{ error: any }> {
  try {
    const { error } = await mutateFn()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error(`${label}:`, error)
    return { error }
  }
}
