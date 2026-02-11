"use client"

import { useState, useCallback, useRef } from "react"
import type { MdtBoloVehicle } from "../types"
import {
  getBoloVehicles,
  createBoloVehicle,
  updateBoloVehicle,
  deleteBoloVehicle,
} from "@/src/lib/db/mdt"

export function useMdtBolo() {
  const [vehicles, setVehicles] = useState<MdtBoloVehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("ACTIVE")
  const submittingRef = useRef(false)

  const loadVehicles = useCallback(async (status?: string) => {
    setLoading(true)
    const filter = status ?? filterStatus
    const { data } = await getBoloVehicles(filter)
    if (data) setVehicles(data as MdtBoloVehicle[])
    setLoading(false)
  }, [filterStatus])

  const handleCreate = useCallback(async (data: Parameters<typeof createBoloVehicle>[0]) => {
    if (submittingRef.current) return
    submittingRef.current = true
    await createBoloVehicle(data)
    submittingRef.current = false
    await loadVehicles()
  }, [loadVehicles])

  const handleUpdate = useCallback(async (id: string, updates: Parameters<typeof updateBoloVehicle>[1]) => {
    if (submittingRef.current) return
    submittingRef.current = true
    await updateBoloVehicle(id, updates)
    submittingRef.current = false
    await loadVehicles()
  }, [loadVehicles])

  const handleDelete = useCallback(async (id: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    await deleteBoloVehicle(id)
    submittingRef.current = false
    await loadVehicles()
  }, [loadVehicles])

  const handleResolve = useCallback(async (id: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    await updateBoloVehicle(id, { status: "RESOLVED" })
    submittingRef.current = false
    await loadVehicles()
  }, [loadVehicles])

  const changeFilter = useCallback((status: string) => {
    setFilterStatus(status)
    loadVehicles(status)
  }, [loadVehicles])

  return {
    vehicles,
    loading,
    filterStatus,
    changeFilter,
    loadVehicles,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleResolve,
  }
}
