'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getGangMembers,
  getGangMember,
  searchGangMembers,
  createGangMember,
  updateGangMember,
  deleteGangMember,
  createMemberReport,
  deleteMemberReport,
} from '@/src/lib/db/gangMembers';
import { getGangProfiles } from '@/src/lib/db/gangs';

export interface GangMember {
  id: string;
  gang_id: string;
  first_name: string;
  last_name: string;
  alias: string | null;
  dob: string | null;
  gender: string | null;
  race: string | null;
  height: string | null;
  weight: string | null;
  description: string | null;
  skin_id: number | null;
  mugshot_url: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  gang: { id: string; title: string } | null;
  reports?: GangMemberReport[];
}

export interface GangMemberReport {
  id: string;
  member_id: string;
  report_type: 'investigation' | 'autopsy';
  date: string | null;
  location: string | null;
  description: string | null;
  result_status: string | null;
  officers: string[] | null;
  evidence_urls: string[] | null;
  autopsy_data: Record<string, unknown> | null;
  body_markers: Array<{ x: number; y: number; side: string }> | null;
  signed_by: string;
  created_by: string | null;
  created_at: string;
}

export interface GangOption {
  id: string;
  title: string;
}

export function useGangMembers(userId?: string) {
  const [members, setMembers] = useState<GangMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<GangMember | null>(null);
  const [gangs, setGangs] = useState<GangOption[]>([]);
  const [gangFilter, setGangFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load gangs on mount
  useEffect(() => {
    loadGangs();
  }, []);

  // Load members when filter changes
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    } else {
      loadMembers(gangFilter || undefined);
    }
  }, [gangFilter]);

  const loadGangs = useCallback(async () => {
    const { data } = await getGangProfiles();
    if (data) setGangs(data.map((g: { id: string; title: string }) => ({ id: g.id, title: g.title })));
  }, []);

  const loadMembers = useCallback(async (gangId?: string) => {
    setLoading(true);
    const { data } = await getGangMembers(gangId);
    if (data) setMembers(data as GangMember[]);
    setLoading(false);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadMembers(gangFilter || undefined);
      return;
    }
    setLoading(true);
    const { data } = await searchGangMembers(query);
    if (data) setMembers(data as GangMember[]);
    setLoading(false);
  }, [gangFilter, loadMembers]);

  const selectMember = useCallback(async (id: string) => {
    const { data } = await getGangMember(id);
    if (data) setSelectedMember(data as GangMember);
  }, []);

  const handleCreateMember = useCallback(async (data: Parameters<typeof createGangMember>[0]) => {
    setSaving(true);
    const { data: result, error } = await createGangMember({ ...data, created_by: userId });
    if (!error && result) {
      await loadMembers(gangFilter || undefined);
      setSelectedMember(result as GangMember);
    }
    setSaving(false);
    return { error };
  }, [userId, gangFilter, loadMembers]);

  const handleUpdateMember = useCallback(async (id: string, updates: Parameters<typeof updateGangMember>[1]) => {
    setSaving(true);
    const { data: result, error } = await updateGangMember(id, updates);
    if (!error && result) {
      await loadMembers(gangFilter || undefined);
      setSelectedMember(result as GangMember);
    }
    setSaving(false);
    return { error };
  }, [gangFilter, loadMembers]);

  const handleDeleteMember = useCallback(async (id: string) => {
    const { error } = await deleteGangMember(id);
    if (!error) {
      setSelectedMember(null);
      await loadMembers(gangFilter || undefined);
    }
    return { error };
  }, [gangFilter, loadMembers]);

  const handleCreateReport = useCallback(async (data: Parameters<typeof createMemberReport>[0]) => {
    setSaving(true);
    const { error } = await createMemberReport({ ...data, created_by: userId });
    if (!error && selectedMember) {
      await selectMember(selectedMember.id);
    }
    setSaving(false);
    return { error };
  }, [userId, selectedMember, selectMember]);

  const handleDeleteReport = useCallback(async (reportId: string) => {
    const { error } = await deleteMemberReport(reportId);
    if (!error && selectedMember) {
      await selectMember(selectedMember.id);
    }
    return { error };
  }, [selectedMember, selectMember]);

  return {
    members,
    selectedMember,
    setSelectedMember,
    gangs,
    gangFilter,
    setGangFilter,
    searchQuery,
    setSearchQuery,
    loading,
    saving,
    selectMember,
    handleSearch,
    handleCreateMember,
    handleUpdateMember,
    handleDeleteMember,
    handleCreateReport,
    handleDeleteReport,
    refreshMembers: () => loadMembers(gangFilter || undefined),
  };
}
