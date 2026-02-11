"use client"

import { useState, useCallback, useRef } from "react"
import type { MdtRecord, MdtCriminalRecord, MdtNote, MdtWarrant } from "../types"
import {
  getMdtRecords,
  getMdtRecordById,
  searchMdtRecords,
  createMdtRecord,
  updateMdtRecord,
  deleteMdtRecord,
  addCriminalRecord,
  deleteCriminalRecord,
  addMdtNote,
  deleteMdtNote,
  issueWarrant,
  removeWarrant,
} from "@/src/lib/db/mdt"

export function useMdtRecords() {
  const [records, setRecords] = useState<MdtRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<MdtRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)

  const loadRecords = useCallback(async () => {
    setLoading(true)
    const { data } = await getMdtRecords()
    if (data) setRecords(data)
    setLoading(false)
  }, [])

  const selectRecord = useCallback(async (id: string) => {
    setLoading(true)
    const { data } = await getMdtRecordById(id)
    if (data) {
      // Normalize joined relations
      const record: MdtRecord = {
        ...data,
        criminal_records: data.criminal_records || [],
        mdt_notes: data.mdt_notes || [],
        mdt_warrants: data.mdt_warrants || [],
      }
      setSelectedRecord(record)
    }
    setLoading(false)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedRecord(null)
  }, [])

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadRecords()
      return
    }
    setLoading(true)
    const { data } = await searchMdtRecords(query)
    if (data) setRecords(data as MdtRecord[])
    setLoading(false)
  }, [loadRecords])

  const handleCreateRecord = useCallback(async (data: Parameters<typeof createMdtRecord>[0]) => {
    if (submittingRef.current) return null
    submittingRef.current = true
    const { data: newRecord } = await createMdtRecord(data)
    submittingRef.current = false
    if (newRecord) {
      await loadRecords()
      return newRecord
    }
    return null
  }, [loadRecords])

  const handleUpdateRecord = useCallback(async (id: string, updates: Parameters<typeof updateMdtRecord>[1]) => {
    if (submittingRef.current) return
    submittingRef.current = true
    const { data } = await updateMdtRecord(id, updates)
    submittingRef.current = false
    if (data) {
      await selectRecord(id)
      await loadRecords()
    }
  }, [selectRecord, loadRecords])

  const handleDeleteRecord = useCallback(async (id: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    await deleteMdtRecord(id)
    submittingRef.current = false
    setSelectedRecord(null)
    await loadRecords()
  }, [loadRecords])

  // Criminal records
  const handleAddCriminalRecord = useCallback(async (data: {
    record_id: string
    date: string
    offense: string
    code?: string
    status?: string
    officer?: string
  }) => {
    if (submittingRef.current) return
    submittingRef.current = true
    await addCriminalRecord(data)
    submittingRef.current = false
    await selectRecord(data.record_id)
  }, [selectRecord])

  const handleDeleteCriminalRecord = useCallback(async (id: string, recordId: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    await deleteCriminalRecord(id, recordId)
    submittingRef.current = false
    await selectRecord(recordId)
  }, [selectRecord])

  // Notes
  const handleAddNote = useCallback(async (data: { record_id: string; content: string; officer?: string }) => {
    if (submittingRef.current) return
    submittingRef.current = true
    await addMdtNote(data)
    submittingRef.current = false
    await selectRecord(data.record_id)
  }, [selectRecord])

  const handleDeleteNote = useCallback(async (id: string, recordId: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    await deleteMdtNote(id)
    submittingRef.current = false
    await selectRecord(recordId)
  }, [selectRecord])

  // Warrants
  const handleIssueWarrant = useCallback(async (data: {
    record_id: string
    type: string
    reason: string
    officer?: string
    issued_date?: string
  }) => {
    if (submittingRef.current) return
    submittingRef.current = true
    await issueWarrant(data)
    submittingRef.current = false
    await selectRecord(data.record_id)
  }, [selectRecord])

  const handleRemoveWarrant = useCallback(async (warrantId: string, recordId: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    await removeWarrant(warrantId, recordId)
    submittingRef.current = false
    await selectRecord(recordId)
  }, [selectRecord])

  return {
    records,
    selectedRecord,
    loading,
    loadRecords,
    selectRecord,
    clearSelection,
    handleSearch,
    handleCreateRecord,
    handleUpdateRecord,
    handleDeleteRecord,
    handleAddCriminalRecord,
    handleDeleteCriminalRecord,
    handleAddNote,
    handleDeleteNote,
    handleIssueWarrant,
    handleRemoveWarrant,
  }
}
