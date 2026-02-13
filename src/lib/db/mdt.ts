import { supabase } from '@/src/supabaseClient';
import { dbQuery, dbMutate } from './queryWrapper';

// ============================================
// MDT RECORDS - CRUD
// ============================================

export function getMdtRecords() {
  return dbQuery(
    () => supabase.from('mdt_records').select('*').order('last_name', { ascending: true }),
    'getMdtRecords'
  );
}

export function getMdtRecordById(id: string) {
  return dbQuery(
    () => supabase
      .from('mdt_records')
      .select('*, criminal_records:mdt_criminal_records(*), mdt_notes(*), mdt_warrants(*)')
      .eq('id', id)
      .single(),
    'getMdtRecordById'
  );
}

export async function searchMdtRecords(query: string) {
  const trimmed = query.trim();
  const parts = trimmed.split(/\s+/);

  let q;
  if (parts.length >= 2) {
    const [p1, ...rest] = parts;
    const p2 = rest.join(' ');
    q = supabase
      .from('mdt_records')
      .select('id, first_name, last_name, ssn, gang_affiliation, wanted_status, priors')
      .or(
        `and(first_name.ilike.%${p1}%,last_name.ilike.%${p2}%),` +
        `and(first_name.ilike.%${p2}%,last_name.ilike.%${p1}%),` +
        `ssn.ilike.%${trimmed}%,` +
        `gang_affiliation.ilike.%${trimmed}%`
      );
  } else {
    q = supabase
      .from('mdt_records')
      .select('id, first_name, last_name, ssn, gang_affiliation, wanted_status, priors')
      .or(`first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%,ssn.ilike.%${trimmed}%,gang_affiliation.ilike.%${trimmed}%`);
  }

  return dbQuery(
    () => q.order('last_name', { ascending: true }).limit(10),
    'searchMdtRecords'
  );
}

export function createMdtRecord(record: {
  first_name: string;
  last_name: string;
  dob?: string;
  ssn?: string;
  gender?: string;
  race?: string;
  height?: string;
  weight?: string;
  hair?: string;
  eyes?: string;
  address?: string;
  license_no?: string;
  license_status?: string;
  gang_affiliation?: string;
  record_level?: number;
  created_by?: string;
}) {
  return dbQuery(
    () => supabase.from('mdt_records').insert(record).select().single(),
    'createMdtRecord'
  );
}

export function updateMdtRecord(id: string, updates: Partial<{
  first_name: string;
  last_name: string;
  dob: string;
  ssn: string;
  gender: string;
  race: string;
  height: string;
  weight: string;
  hair: string;
  eyes: string;
  address: string;
  license_no: string;
  license_status: string;
  wanted_status: string;
  gang_affiliation: string;
  priors: number;
  record_level: number;
  mugshot_url: string | null;
}>) {
  return dbQuery(
    () => supabase
      .from('mdt_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
    'updateMdtRecord'
  );
}

export function deleteMdtRecord(id: string) {
  return dbMutate(
    () => supabase.from('mdt_records').delete().eq('id', id),
    'deleteMdtRecord'
  );
}

// ============================================
// CRIMINAL RECORDS
// ============================================

// Complex multi-query function — kept with manual try-catch
export async function addCriminalRecord(data: {
  record_id: string;
  date: string;
  offense: string;
  code?: string;
  status?: string;
  officer?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('mdt_criminal_records')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    // Increment priors
    const { data: rec } = await supabase
      .from('mdt_records')
      .select('priors')
      .eq('id', data.record_id)
      .single();

    if (rec) {
      await supabase.from('mdt_records').update({ priors: (rec.priors || 0) + 1 }).eq('id', data.record_id);
    }

    return { data: result, error: null };
  } catch (error) {
    console.error('addCriminalRecord:', error);
    return { data: null, error };
  }
}

// Complex multi-query function — kept with manual try-catch
export async function deleteCriminalRecord(id: string, recordId: string) {
  try {
    const { error } = await supabase
      .from('mdt_criminal_records')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Decrement priors
    const { data: rec } = await supabase
      .from('mdt_records')
      .select('priors')
      .eq('id', recordId)
      .single();

    if (rec) {
      await supabase.from('mdt_records').update({ priors: Math.max(0, (rec.priors || 0) - 1) }).eq('id', recordId);
    }

    return { error: null };
  } catch (error) {
    console.error('deleteCriminalRecord:', error);
    return { error };
  }
}

export function updateCriminalRecord(id: string, updates: Partial<{
  date: string;
  offense: string;
  code: string;
  status: string;
  officer: string;
}>) {
  return dbQuery(
    () => supabase.from('mdt_criminal_records').update(updates).eq('id', id).select().single(),
    'updateCriminalRecord'
  );
}

// ============================================
// NOTES
// ============================================

export function addMdtNote(data: {
  record_id: string;
  content: string;
  officer?: string;
}) {
  return dbQuery(
    () => supabase.from('mdt_notes').insert(data).select().single(),
    'addMdtNote'
  );
}

export function updateMdtNote(id: string, updates: { content: string }) {
  return dbQuery(
    () => supabase.from('mdt_notes').update(updates).eq('id', id).select().single(),
    'updateMdtNote'
  );
}

export function deleteMdtNote(id: string) {
  return dbMutate(
    () => supabase.from('mdt_notes').delete().eq('id', id),
    'deleteMdtNote'
  );
}

// ============================================
// WARRANTS
// ============================================

// Complex multi-query function — kept with manual try-catch
export async function issueWarrant(data: {
  record_id: string;
  type: string;
  reason: string;
  officer?: string;
  issued_date?: string;
}) {
  try {
    // Deactivate existing warrants
    await supabase
      .from('mdt_warrants')
      .update({ is_active: false })
      .eq('record_id', data.record_id)
      .eq('is_active', true);

    const { data: result, error } = await supabase
      .from('mdt_warrants')
      .insert({ ...data, is_active: true })
      .select()
      .single();

    if (error) throw error;

    // Update wanted status
    await supabase
      .from('mdt_records')
      .update({ wanted_status: 'POSZUKIWANY', updated_at: new Date().toISOString() })
      .eq('id', data.record_id);

    return { data: result, error: null };
  } catch (error) {
    console.error('issueWarrant:', error);
    return { data: null, error };
  }
}

// Complex multi-query function — kept with manual try-catch
export async function removeWarrant(warrantId: string, recordId: string) {
  try {
    await supabase
      .from('mdt_warrants')
      .update({ is_active: false })
      .eq('id', warrantId);

    // Check if there are other active warrants
    const { data: remaining } = await supabase
      .from('mdt_warrants')
      .select('id')
      .eq('record_id', recordId)
      .eq('is_active', true);

    if (!remaining || remaining.length === 0) {
      await supabase
        .from('mdt_records')
        .update({ wanted_status: 'BRAK', updated_at: new Date().toISOString() })
        .eq('id', recordId);
    }

    return { error: null };
  } catch (error) {
    console.error('removeWarrant:', error);
    return { error };
  }
}

// ============================================
// BOLO VEHICLES
// ============================================

export async function getBoloVehicles(statusFilter?: string) {
  let query = supabase
    .from('mdt_bolo_vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'ALL') {
    query = query.eq('status', statusFilter);
  }

  return dbQuery(() => query, 'getBoloVehicles');
}

export function searchBoloVehicles(query: string) {
  return dbQuery(
    () => supabase
      .from('mdt_bolo_vehicles')
      .select('id, plate, make, model, color, status')
      .or(`plate.ilike.%${query}%,make.ilike.%${query}%,model.ilike.%${query}%`)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(5),
    'searchBoloVehicles'
  );
}

export function createBoloVehicle(data: {
  plate: string;
  make?: string;
  model?: string;
  color?: string;
  reason?: string;
  reported_by?: string;
  created_by?: string;
}) {
  return dbQuery(
    () => supabase.from('mdt_bolo_vehicles').insert(data).select().single(),
    'createBoloVehicle'
  );
}

export function updateBoloVehicle(id: string, updates: Partial<{
  plate: string;
  make: string;
  model: string;
  color: string;
  reason: string;
  status: string;
  reported_by: string;
}>) {
  return dbQuery(
    () => supabase
      .from('mdt_bolo_vehicles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
    'updateBoloVehicle'
  );
}

export function deleteBoloVehicle(id: string) {
  return dbMutate(
    () => supabase.from('mdt_bolo_vehicles').delete().eq('id', id),
    'deleteBoloVehicle'
  );
}

// ============================================
// MUGSHOT UPLOAD (Supabase Storage)
// ============================================

// Complex multi-step function (storage + DB update) — kept with manual try-catch
export async function uploadMugshot(recordId: string, blob: Blob) {
  try {
    const filePath = `mugshots/${recordId}.webp`;

    const { error: uploadError } = await supabase.storage
      .from('mdt-photos')
      .upload(filePath, blob, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('mdt-photos')
      .getPublicUrl(filePath);

    // Append cache-buster to force refresh
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Update the record with the new URL
    await supabase
      .from('mdt_records')
      .update({ mugshot_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', recordId);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('uploadMugshot:', error);
    return { url: null, error };
  }
}

// ============================================
// DASHBOARD STATS
// ============================================

// Complex multi-query function (Promise.all) — kept with manual try-catch
export async function getMdtDashboardStats() {
  try {
    const [recordsRes, warrantsRes, boloRes] = await Promise.all([
      supabase.from('mdt_records').select('id', { count: 'exact', head: true }),
      supabase.from('mdt_warrants').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('mdt_bolo_vehicles').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    ]);

    return {
      data: {
        totalRecords: recordsRes.count || 0,
        activeWarrants: warrantsRes.count || 0,
        activeBolos: boloRes.count || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('getMdtDashboardStats:', error);
    return { data: null, error };
  }
}

export function getMostWanted(limit = 5) {
  return dbQuery(
    () => supabase
      .from('mdt_records')
      .select('id, first_name, last_name, priors, wanted_status')
      .order('priors', { ascending: false })
      .limit(limit),
    'getMostWanted'
  );
}

export function getRecentActivity(limit = 10) {
  return dbQuery(
    () => supabase
      .from('mdt_criminal_records')
      .select('id, date, offense, officer, status, created_at, record_id, record:mdt_records!record_id(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(limit),
    'getRecentActivity'
  );
}

export function getLatestBolos(limit = 5) {
  return dbQuery(
    () => supabase
      .from('mdt_bolo_vehicles')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(limit),
    'getLatestBolos'
  );
}
