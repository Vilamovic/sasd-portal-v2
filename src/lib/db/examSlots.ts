import { supabase } from '@/src/supabaseClient';
import { dbQuery, dbMutate } from './queryWrapper';

export function getExamSlots(weekStart: string, weekEnd: string) {
  return dbQuery(
    () => supabase
      .from('exam_slots')
      .select(`
        *,
        booker:users!exam_slots_booked_by_fkey(username, mta_nick),
        creator:users!exam_slots_created_by_fkey(username, mta_nick)
      `)
      .gte('slot_date', weekStart)
      .lte('slot_date', weekEnd)
      .order('slot_date', { ascending: true })
      .order('time_start', { ascending: true }),
    'getExamSlots'
  );
}

export function createExamSlot(data: {
  exam_type: string;
  slot_date: string;
  time_start: string;
  time_end: string;
  created_by: string;
}) {
  return dbQuery(
    () => supabase
      .from('exam_slots')
      .insert(data)
      .select()
      .single(),
    'createExamSlot'
  );
}

export function deleteExamSlot(slotId: string) {
  return dbMutate(
    () => supabase
      .from('exam_slots')
      .delete()
      .eq('id', slotId),
    'deleteExamSlot'
  );
}

export function bookExamSlot(slotId: string, userId: string) {
  return dbQuery(
    () => supabase
      .from('exam_slots')
      .update({
        booked_by: userId,
        booked_at: new Date().toISOString(),
        status: 'booked',
      })
      .eq('id', slotId)
      .eq('status', 'available')
      .select()
      .single(),
    'bookExamSlot'
  );
}

export function cancelBooking(slotId: string) {
  return dbQuery(
    () => supabase
      .from('exam_slots')
      .update({
        booked_by: null,
        booked_at: null,
        status: 'available',
      })
      .eq('id', slotId)
      .select()
      .single(),
    'cancelBooking'
  );
}

export function completeSlot(slotId: string) {
  return dbQuery(
    () => supabase
      .from('exam_slots')
      .update({ status: 'completed' })
      .eq('id', slotId)
      .select()
      .single(),
    'completeSlot'
  );
}

export function getActiveSlots() {
  return dbQuery(
    () => supabase
      .from('exam_slots')
      .select(`
        *,
        booker:users!exam_slots_booked_by_fkey(username, mta_nick),
        creator:users!exam_slots_created_by_fkey(username, mta_nick)
      `)
      .in('status', ['available', 'booked'])
      .order('slot_date', { ascending: true })
      .order('time_start', { ascending: true }),
    'getActiveSlots'
  );
}
