'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getTrainingGroups,
  createTrainingGroup,
  updateTrainingGroup,
  deleteTrainingGroup,
  addGroupMember,
  removeGroupMember,
  getAttendanceByDate,
  upsertAttendance,
  getTrainees,
  getFTOMembers,
} from '@/src/lib/db/ftoAttendance';

export interface TrainingGroup {
  id: string;
  name: string;
  fto1_id: string | null;
  fto2_id: string | null;
  created_by: string | null;
  fto1: { id: string; username: string; mta_nick: string | null } | null;
  fto2: { id: string; username: string; mta_nick: string | null } | null;
  members: {
    id: string;
    user_id: string;
    user: { id: string; username: string; mta_nick: string | null } | null;
  }[];
}

export interface AttendanceRecord {
  id: string;
  group_id: string;
  user_id: string;
  date: string;
  status: 'OB' | 'NB' | 'U';
  marked_by: string | null;
}

export interface UserOption {
  id: string;
  username: string;
  mta_nick: string | null;
  role?: string;
}

export function useFtoAttendance(userId?: string) {
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [trainees, setTrainees] = useState<UserOption[]>([]);
  const [ftoMembers, setFtoMembers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load groups on mount
  useEffect(() => {
    loadGroups();
    loadUsers();
  }, []);

  // Load attendance when group or date changes
  useEffect(() => {
    if (selectedGroupId) {
      loadAttendance(selectedGroupId, selectedDate);
    }
  }, [selectedGroupId, selectedDate]);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    const { data } = await getTrainingGroups();
    if (data) {
      setGroups(data as TrainingGroup[]);
      // Auto-select first group if none selected
      if (!selectedGroupId && data.length > 0) {
        setSelectedGroupId(data[0].id);
      }
    }
    setLoading(false);
  }, [selectedGroupId]);

  const loadUsers = useCallback(async () => {
    const [traineeRes, ftoRes] = await Promise.all([getTrainees(), getFTOMembers()]);
    if (traineeRes.data) setTrainees(traineeRes.data as UserOption[]);
    if (ftoRes.data) setFtoMembers(ftoRes.data as UserOption[]);
  }, []);

  const loadAttendance = useCallback(async (groupId: string, date: string) => {
    const { data } = await getAttendanceByDate(groupId, date);
    if (data) setAttendance(data as AttendanceRecord[]);
  }, []);

  // Group management
  const handleCreateGroup = useCallback(async (name: string, fto1Id?: string | null, fto2Id?: string | null) => {
    const { data, error } = await createTrainingGroup({
      name,
      fto1_id: fto1Id || null,
      fto2_id: fto2Id || null,
      created_by: userId,
    });
    if (!error && data) {
      await loadGroups();
      setSelectedGroupId(data.id);
    }
    return { error };
  }, [userId, loadGroups]);

  const handleUpdateGroup = useCallback(async (id: string, updates: { name?: string; fto1_id?: string | null; fto2_id?: string | null }) => {
    const { error } = await updateTrainingGroup(id, updates);
    if (!error) await loadGroups();
    return { error };
  }, [loadGroups]);

  const handleDeleteGroup = useCallback(async (id: string) => {
    const { error } = await deleteTrainingGroup(id);
    if (!error) {
      if (selectedGroupId === id) setSelectedGroupId(null);
      await loadGroups();
    }
    return { error };
  }, [selectedGroupId, loadGroups]);

  // Member management
  const handleAddMember = useCallback(async (groupId: string, memberId: string) => {
    const { error } = await addGroupMember(groupId, memberId);
    if (!error) await loadGroups();
    return { error };
  }, [loadGroups]);

  const handleRemoveMember = useCallback(async (groupId: string, memberId: string) => {
    const { error } = await removeGroupMember(groupId, memberId);
    if (!error) await loadGroups();
    return { error };
  }, [loadGroups]);

  // Attendance
  const handleMarkAttendance = useCallback(async (
    groupId: string,
    memberId: string,
    date: string,
    status: 'OB' | 'NB' | 'U'
  ) => {
    setSaving(true);
    const { error } = await upsertAttendance({
      group_id: groupId,
      user_id: memberId,
      date,
      status,
      marked_by: userId,
    });
    if (!error) {
      await loadAttendance(groupId, date);
    }
    setSaving(false);
    return { error };
  }, [userId, loadAttendance]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  return {
    groups,
    selectedGroup,
    selectedGroupId,
    setSelectedGroupId,
    attendance,
    selectedDate,
    setSelectedDate,
    trainees,
    ftoMembers,
    loading,
    saving,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleAddMember,
    handleRemoveMember,
    handleMarkAttendance,
    refreshGroups: loadGroups,
  };
}
