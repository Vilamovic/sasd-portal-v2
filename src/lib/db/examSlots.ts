import { supabase } from '@/src/supabaseClient';

export async function getExamSlots(weekStart: string, weekEnd: string) {
  try {
    const { data, error } = await supabase
      .from('exam_slots')
      .select(`
        *,
        booker:users!exam_slots_booked_by_fkey(username, mta_nick),
        creator:users!exam_slots_created_by_fkey(username, mta_nick)
      `)
      .gte('slot_date', weekStart)
      .lte('slot_date', weekEnd)
      .order('slot_date', { ascending: true })
      .order('time_start', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getExamSlots error:', error);
    return { data: null, error };
  }
}

export async function createExamSlot(data: {
  exam_type: string;
  slot_date: string;
  time_start: string;
  time_end: string;
  created_by: string;
}) {
  try {
    const { data: slot, error } = await supabase
      .from('exam_slots')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { data: slot, error: null };
  } catch (error) {
    console.error('createExamSlot error:', error);
    return { data: null, error };
  }
}

export async function deleteExamSlot(slotId: string) {
  try {
    const { error } = await supabase
      .from('exam_slots')
      .delete()
      .eq('id', slotId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteExamSlot error:', error);
    return { error };
  }
}

export async function bookExamSlot(slotId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('exam_slots')
      .update({
        booked_by: userId,
        booked_at: new Date().toISOString(),
        status: 'booked',
      })
      .eq('id', slotId)
      .eq('status', 'available')
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('bookExamSlot error:', error);
    return { data: null, error };
  }
}

export async function cancelBooking(slotId: string) {
  try {
    const { data, error } = await supabase
      .from('exam_slots')
      .update({
        booked_by: null,
        booked_at: null,
        status: 'available',
      })
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('cancelBooking error:', error);
    return { data: null, error };
  }
}

export async function completeSlot(slotId: string) {
  try {
    const { data, error } = await supabase
      .from('exam_slots')
      .update({ status: 'completed' })
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('completeSlot error:', error);
    return { data: null, error };
  }
}

export async function getBookedSlots() {
  try {
    const { data, error } = await supabase
      .from('exam_slots')
      .select(`
        *,
        booker:users!exam_slots_booked_by_fkey(username, mta_nick),
        creator:users!exam_slots_created_by_fkey(username, mta_nick)
      `)
      .eq('status', 'booked')
      .order('slot_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getBookedSlots error:', error);
    return { data: null, error };
  }
}
