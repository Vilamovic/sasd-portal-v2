"use client"

import { useState, useCallback } from "react"
import {
  getMdtDashboardStats,
  getMostWanted,
  getRecentActivity,
  getLatestBolos,
} from "@/src/lib/db/mdt"

interface DashboardStats {
  totalRecords: number
  activeWarrants: number
  activeBolos: number
}

interface MostWantedEntry {
  id: string
  first_name: string
  last_name: string
  priors: number
  wanted_status: string
}

interface RecentActivityEntry {
  id: string
  date: string
  offense: string
  officer: string
  status: string
  created_at: string
  record_id: string
  record: { first_name: string; last_name: string }[] | null
}

interface LatestBolo {
  id: string
  plate: string
  make: string
  model: string
  color: string
  reason: string
  status: string
  created_at: string
}

export function useMdtDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalRecords: 0, activeWarrants: 0, activeBolos: 0 })
  const [mostWanted, setMostWanted] = useState<MostWantedEntry[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivityEntry[]>([])
  const [latestBolos, setLatestBolos] = useState<LatestBolo[]>([])
  const [loading, setLoading] = useState(false)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    const [statsRes, wantedRes, activityRes, boloRes] = await Promise.all([
      getMdtDashboardStats(),
      getMostWanted(5),
      getRecentActivity(10),
      getLatestBolos(5),
    ])

    if (statsRes.data) setStats(statsRes.data)
    if (wantedRes.data) setMostWanted(wantedRes.data as MostWantedEntry[])
    if (activityRes.data) setRecentActivity(activityRes.data as RecentActivityEntry[])
    if (boloRes.data) setLatestBolos(boloRes.data as LatestBolo[])
    setLoading(false)
  }, [])

  return {
    stats,
    mostWanted,
    recentActivity,
    latestBolos,
    loading,
    loadDashboard,
  }
}
