import { supabase } from '@/src/supabaseClient';

// ============================================
// MDT RECORDS - CRUD
// ============================================

export async function getMdtRecords() {
  try {
    const { data, error } = await supabase
      .from('mdt_records')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getMdtRecords error:', error);
    return { data: null, error };
  }
}

export async function getMdtRecordById(id: string) {
  try {
    const { data, error } = await supabase
      .from('mdt_records')
      .select('*, criminal_records:mdt_criminal_records(*), mdt_notes(*), mdt_warrants(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getMdtRecordById error:', error);
    return { data: null, error };
  }
}

export async function searchMdtRecords(query: string) {
  try {
    const { data, error } = await supabase
      .from('mdt_records')
      .select('id, first_name, last_name, wanted_status, priors')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,license_no.ilike.%${query}%`)
      .order('last_name', { ascending: true })
      .limit(10);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('searchMdtRecords error:', error);
    return { data: null, error };
  }
}

export async function createMdtRecord(record: {
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
  phone?: string;
  license_no?: string;
  license_status?: string;
  gang_affiliation?: string;
  created_by?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('mdt_records')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('createMdtRecord error:', error);
    return { data: null, error };
  }
}

export async function updateMdtRecord(id: string, updates: Partial<{
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
  phone: string;
  license_no: string;
  license_status: string;
  wanted_status: string;
  gang_affiliation: string;
  priors: number;
  mugshot_url: string | null;
}>) {
  try {
    const { data, error } = await supabase
      .from('mdt_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateMdtRecord error:', error);
    return { data: null, error };
  }
}

export async function deleteMdtRecord(id: string) {
  try {
    const { error } = await supabase
      .from('mdt_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteMdtRecord error:', error);
    return { error };
  }
}

// ============================================
// CRIMINAL RECORDS
// ============================================

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
    console.error('addCriminalRecord error:', error);
    return { data: null, error };
  }
}

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
    console.error('deleteCriminalRecord error:', error);
    return { error };
  }
}

// ============================================
// NOTES
// ============================================

export async function addMdtNote(data: {
  record_id: string;
  content: string;
  officer?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('mdt_notes')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('addMdtNote error:', error);
    return { data: null, error };
  }
}

export async function deleteMdtNote(id: string) {
  try {
    const { error } = await supabase
      .from('mdt_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteMdtNote error:', error);
    return { error };
  }
}

// ============================================
// WARRANTS
// ============================================

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
    console.error('issueWarrant error:', error);
    return { data: null, error };
  }
}

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
    console.error('removeWarrant error:', error);
    return { error };
  }
}

// ============================================
// BOLO VEHICLES
// ============================================

export async function getBoloVehicles(statusFilter?: string) {
  try {
    let query = supabase
      .from('mdt_bolo_vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getBoloVehicles error:', error);
    return { data: null, error };
  }
}

export async function searchBoloVehicles(query: string) {
  try {
    const { data, error } = await supabase
      .from('mdt_bolo_vehicles')
      .select('id, plate, make, model, color, status')
      .or(`plate.ilike.%${query}%,make.ilike.%${query}%,model.ilike.%${query}%`)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('searchBoloVehicles error:', error);
    return { data: null, error };
  }
}

export async function createBoloVehicle(data: {
  plate: string;
  make?: string;
  model?: string;
  color?: string;
  reason?: string;
  reported_by?: string;
  created_by?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('mdt_bolo_vehicles')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('createBoloVehicle error:', error);
    return { data: null, error };
  }
}

export async function updateBoloVehicle(id: string, updates: Partial<{
  plate: string;
  make: string;
  model: string;
  color: string;
  reason: string;
  status: string;
  reported_by: string;
}>) {
  try {
    const { data, error } = await supabase
      .from('mdt_bolo_vehicles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateBoloVehicle error:', error);
    return { data: null, error };
  }
}

export async function deleteBoloVehicle(id: string) {
  try {
    const { error } = await supabase
      .from('mdt_bolo_vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteBoloVehicle error:', error);
    return { error };
  }
}

// ============================================
// DASHBOARD STATS
// ============================================

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
    console.error('getMdtDashboardStats error:', error);
    return { data: null, error };
  }
}

export async function getMostWanted(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('mdt_records')
      .select('id, first_name, last_name, priors, wanted_status')
      .order('priors', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getMostWanted error:', error);
    return { data: null, error };
  }
}

export async function getRecentActivity(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('mdt_criminal_records')
      .select('id, date, offense, officer, status, created_at, record_id, record:mdt_records!record_id(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getRecentActivity error:', error);
    return { data: null, error };
  }
}

export async function getLatestBolos(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('mdt_bolo_vehicles')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getLatestBolos error:', error);
    return { data: null, error };
  }
}
