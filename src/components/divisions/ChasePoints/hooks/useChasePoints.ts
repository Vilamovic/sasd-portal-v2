'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAllChasePoints,
  getPointsForUser,
  addChasePoints,
  deleteChasePoint,
  getAllDeputies,
} from '@/src/lib/db/chasePoints';

export interface ChasePointEntry {
  id: string;
  target_user_id: string;
  points: number;
  reason: string;
  evidence_url: string | null;
  given_by: string;
  created_at: string;
  target: { id: string; username: string; mta_nick: string | null; badge: string | null } | null;
  giver: { id: string; username: string; mta_nick: string | null } | null;
}

export interface UserSummary {
  userId: string;
  username: string;
  mtaNick: string | null;
  badge: string | null;
  totalPoints: number;
  entries: ChasePointEntry[];
}

export interface DeputyOption {
  id: string;
  username: string;
  mta_nick: string | null;
  badge: string | null;
  role: string;
}

export function useChasePoints(currentUserId?: string) {
  const [entries, setEntries] = useState<ChasePointEntry[]>([]);
  const [deputies, setDeputies] = useState<DeputyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [pointsRes, deputiesRes] = await Promise.all([
      getAllChasePoints(),
      getAllDeputies(),
    ]);
    if (pointsRes.data) setEntries(pointsRes.data as ChasePointEntry[]);
    if (deputiesRes.data) setDeputies(deputiesRes.data as DeputyOption[]);
    setLoading(false);
  }, []);

  // Group entries by target user
  const userSummaries: UserSummary[] = (() => {
    const map = new Map<string, UserSummary>();
    for (const entry of entries) {
      const uid = entry.target_user_id;
      if (!map.has(uid)) {
        map.set(uid, {
          userId: uid,
          username: entry.target?.username || '—',
          mtaNick: entry.target?.mta_nick || null,
          badge: entry.target?.badge || null,
          totalPoints: 0,
          entries: [],
        });
      }
      const summary = map.get(uid)!;
      summary.totalPoints += entry.points;
      summary.entries.push(entry);
    }
    // Sort by total points descending
    return Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints);
  })();

  const handleAddPoints = useCallback(async (data: {
    target_user_id: string;
    points: number;
    reason: string;
    evidence_url?: string | null;
  }) => {
    if (!currentUserId) return { error: 'No user' };
    setSaving(true);
    const { error } = await addChasePoints({
      ...data,
      given_by: currentUserId,
    });
    if (!error) await loadData();
    setSaving(false);
    return { error };
  }, [currentUserId, loadData]);

  const handleDeletePoint = useCallback(async (id: string) => {
    const { error } = await deleteChasePoint(id);
    if (!error) await loadData();
    return { error };
  }, [loadData]);

  const handleGetHistory = useCallback(async (userId: string) => {
    const { data } = await getPointsForUser(userId);
    return data as ChasePointEntry[] || [];
  }, []);

  return {
    entries,
    userSummaries,
    deputies,
    loading,
    saving,
    handleAddPoints,
    handleDeletePoint,
    handleGetHistory,
    refresh: loadData,
  };
}
