"use client"

import { useState } from "react"
import { MdtModal } from "../MdtModal"
import { WantedPoster } from "../WantedPoster"
import type { MdtRecord } from "../types"

// ==================== Types ====================

type CriminalRecordForm = { date: string; offense: string; code: string; status: string; officer: string }

export type ModalType =
  | "none"
  | "addRecord"
  | "editRecord"
  | "addNote"
  | "editNote"
  | "warrant"
  | "print"
  | "createPerson"
  | "deleteConfirm"
  | "poster"

export interface ModalEditData {
  editCrRecordId?: string | null
  editCrForm?: CriminalRecordForm
  editNoteId?: string | null
  editNoteContent?: string
  posterReason?: string
}

interface MdtModalsProps {
  activeModal: ModalType
  editData: ModalEditData
  selectedRecord: MdtRecord | null
  officerName: string
  onClose: () => void
  onAddCriminalRecord: (form: CriminalRecordForm) => Promise<void>
  onSaveEditCriminalRecord: (id: string, form: CriminalRecordForm) => Promise<void>
  onAddNote: (content: string, officer: string) => Promise<void>
  onSaveEditNote: (id: string, content: string) => Promise<void>
  onIssueWarrant: (type: string, reason: string) => Promise<void>
  onGeneratePoster: (reason: string) => void
  onCreatePerson: (firstName: string, lastName: string) => Promise<void>
  onDeleteKartoteka: (confirmText: string) => Promise<void>
}

// ==================== Shared styles ====================

const inputClass = "panel-inset flex-1 px-2 py-1 font-mono text-xs"
const inputStyle = { backgroundColor: "var(--mdt-input-bg)", color: "var(--mdt-content-text)", outline: "none" }
const labelClass = "font-mono text-xs font-bold"
const labelStyle = { color: "var(--mdt-muted-text)" }
const submitBtnStyle = { backgroundColor: "#3a6a3a", color: "#fff", borderColor: "#5a9a5a #1a3a1a #1a3a1a #5a9a5a" }

// ==================== Criminal Record Modal (Add/Edit) ====================

function CriminalRecordModal({
  mode, initialForm, onSubmit, onClose,
}: {
  mode: "add" | "edit"
  initialForm: CriminalRecordForm
  onSubmit: (form: CriminalRecordForm) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initialForm)

  const fields = [
    { label: "DATA", key: "date" as const, placeholder: "" },
    { label: "PRZESTĘPSTWO", key: "offense" as const, placeholder: "np. Kradzież pojazdu" },
    { label: "KOD", key: "code" as const, placeholder: "np. PC 487(d)(1)" },
    { label: "FUNKCJONARIUSZ", key: "officer" as const, placeholder: "np. Dep. Kowalski" },
  ]

  return (
    <MdtModal title={mode === "add" ? "Dodaj wpis do historii karnej" : "Edytuj wpis karny"} onClose={onClose}>
      <div className="flex flex-col gap-3">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center gap-2">
            <label className={`w-32 shrink-0 ${labelClass}`} style={labelStyle}>{f.label}:</label>
            <input
              type="text"
              value={form[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              className={inputClass}
              style={inputStyle}
              placeholder={f.placeholder}
            />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <label className={`w-32 shrink-0 ${labelClass}`} style={labelStyle}>STATUS:</label>
          <select
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            className={inputClass}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="W TOKU">W TOKU</option>
            <option value="SKAZANY">SKAZANY</option>
            <option value="ODDALONO">ODDALONO</option>
            <option value="OCZEKUJE">OCZEKUJE</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
          <button className="btn-win95 text-xs" style={submitBtnStyle} onClick={() => onSubmit(form)}>
            {mode === "add" ? "DODAJ WPIS" : "ZAPISZ ZMIANY"}
          </button>
          <button className="btn-win95 text-xs" onClick={onClose}>ANULUJ</button>
        </div>
      </div>
    </MdtModal>
  )
}

// ==================== Note Modal (Add/Edit) ====================

function NoteModal({
  mode, initialContent, onSubmit, onClose,
}: {
  mode: "add" | "edit"
  initialContent: string
  onSubmit: (content: string) => void
  onClose: () => void
}) {
  const [content, setContent] = useState(initialContent)

  return (
    <MdtModal title={mode === "add" ? "Dodaj notatkę" : "Edytuj notatkę"} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className={labelClass} style={labelStyle}>TREŚĆ NOTATKI:</label>
        <textarea
          value={content}
          onChange={(e) => { if (e.target.value.length <= 500) setContent(e.target.value) }}
          maxLength={500}
          rows={4}
          className="panel-inset w-full resize-none px-2 py-1 font-mono text-xs"
          style={inputStyle}
          placeholder="Wpisz treść notatki..."
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px]" style={{ color: content.length >= 450 ? "#c41e1e" : "var(--mdt-muted-text)" }}>
            {content.length}/500
          </span>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
          <button className="btn-win95 text-xs" style={submitBtnStyle} onClick={() => onSubmit(content)}>
            {mode === "add" ? "DODAJ" : "ZAPISZ ZMIANY"}
          </button>
          <button className="btn-win95 text-xs" onClick={onClose}>ANULUJ</button>
        </div>
      </div>
    </MdtModal>
  )
}

// ==================== Warrant Modal ====================

function WarrantModal({
  selectedRecord, onSubmit, onClose,
}: {
  selectedRecord: MdtRecord
  onSubmit: (type: string, reason: string) => void
  onClose: () => void
}) {
  const [warrantType, setWarrantType] = useState<"PRZESZUKANIA" | "ARESZTOWANIA" | "NO-KNOCK">("PRZESZUKANIA")
  const [reason, setReason] = useState("")

  const options = [
    { id: "PRZESZUKANIA" as const, label: "NAKAZ PRZESZUKANIA", color: "#ffc107" },
    { id: "ARESZTOWANIA" as const, label: "NAKAZ ARESZTOWANIA", color: "#f97316" },
    { id: "NO-KNOCK" as const, label: "NAKAZ NO-KNOCK", color: "#c41e1e" },
  ]

  return (
    <MdtModal title="Wystaw nakaz" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs" style={labelStyle}>
          Wybierz rodzaj nakazu dla: <strong>{selectedRecord.last_name}, {selectedRecord.first_name}</strong>
        </span>
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <button
              key={opt.id}
              className={`btn-win95 w-full text-xs ${warrantType === opt.id ? "btn-win95-active" : ""}`}
              onClick={() => setWarrantType(opt.id)}
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 border-2" style={{ borderColor: "#555", backgroundColor: warrantType === opt.id ? opt.color : "transparent" }} />
                {opt.label}
              </div>
            </button>
          ))}
        </div>
        <label className={labelClass} style={labelStyle}>POWÓD WYSTAWIENIA:</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="panel-inset w-full resize-none px-2 py-1 font-mono text-xs"
          style={inputStyle}
          placeholder="Wpisz powód wystawienia nakazu..."
        />
        <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
          <button className="btn-win95 text-xs" style={submitBtnStyle} onClick={() => onSubmit(warrantType, reason)}>
            WYSTAW NAKAZ
          </button>
          <button className="btn-win95 text-xs" onClick={onClose}>ANULUJ</button>
        </div>
      </div>
    </MdtModal>
  )
}

// ==================== Print Modal ====================

function PrintModal({
  selectedRecord, onSubmit, onClose,
}: {
  selectedRecord: MdtRecord
  onSubmit: (reason: string) => void
  onClose: () => void
}) {
  const [reason, setReason] = useState("")

  return (
    <MdtModal title="Drukuj list gończy" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs" style={labelStyle}>
          Generowanie listu gończego dla: <strong>{selectedRecord.last_name}, {selectedRecord.first_name}</strong>
        </span>
        <label className={labelClass} style={labelStyle}>POWÓD POSZUKIWANIA:</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="panel-inset w-full resize-none px-2 py-1 font-mono text-xs"
          style={inputStyle}
          placeholder="Wpisz powód poszukiwania osoby..."
        />
        <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
          <button className="btn-win95 text-xs" style={submitBtnStyle} onClick={() => onSubmit(reason)}>
            GENERUJ PLAKAT
          </button>
          <button className="btn-win95 text-xs" onClick={onClose}>ANULUJ</button>
        </div>
      </div>
    </MdtModal>
  )
}

// ==================== Create Person Modal ====================

function CreatePersonModal({ onSubmit, onClose }: { onSubmit: (firstName: string, lastName: string) => void; onClose: () => void }) {
  const [form, setForm] = useState({ first_name: "", last_name: "" })

  return (
    <MdtModal title="Dodaj nową kartotekę" onClose={onClose}>
      <div className="flex flex-col gap-3">
        {[
          { label: "IMIĘ", key: "first_name" as const, placeholder: "Imię osoby" },
          { label: "NAZWISKO", key: "last_name" as const, placeholder: "Nazwisko osoby" },
        ].map((f) => (
          <div key={f.key} className="flex items-center gap-2">
            <label className={`w-24 shrink-0 ${labelClass}`} style={labelStyle}>{f.label}:</label>
            <input
              type="text"
              value={form[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              className={inputClass}
              style={inputStyle}
              placeholder={f.placeholder}
            />
          </div>
        ))}
        <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
          <button className="btn-win95 text-xs" style={submitBtnStyle} onClick={() => onSubmit(form.first_name, form.last_name)}>
            UTWÓRZ KARTOTEKĘ
          </button>
          <button className="btn-win95 text-xs" onClick={onClose}>ANULUJ</button>
        </div>
      </div>
    </MdtModal>
  )
}

// ==================== Delete Confirm Modal ====================

function DeleteConfirmModal({
  selectedRecord, onSubmit, onClose,
}: {
  selectedRecord: MdtRecord
  onSubmit: (confirmText: string) => void
  onClose: () => void
}) {
  const [confirmText, setConfirmText] = useState("")

  return (
    <MdtModal title="Usuwanie kartoteki" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="panel-inset p-3" style={{ backgroundColor: "#4a1a1a" }}>
          <span className="font-mono text-xs text-red-400">
            UWAGA: Ta operacja jest nieodwracalna. Wszystkie dane kartoteki, wpisy karne, notatki i nakazy zostaną trwale usunięte.
          </span>
        </div>
        <span className="font-mono text-xs" style={labelStyle}>
          Kartoteka: <strong>{selectedRecord.last_name}, {selectedRecord.first_name}</strong>
        </span>
        <label className={labelClass} style={labelStyle}>
          Wpisz &quot;potwierdzam&quot; aby usunąć:
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="panel-inset px-2 py-1 font-mono text-xs"
          style={inputStyle}
          placeholder="potwierdzam"
        />
        <div className="flex justify-end gap-2 border-t border-[#999] pt-3">
          <button
            className="btn-win95 text-xs"
            style={{
              backgroundColor: confirmText === "potwierdzam" ? "#c41e1e" : "#555",
              color: "#fff",
              borderColor: confirmText === "potwierdzam" ? "#ff6b6b #8a1a1a #8a1a1a #ff6b6b" : "#777 #333 #333 #777",
            }}
            onClick={() => onSubmit(confirmText)}
            disabled={confirmText !== "potwierdzam"}
          >
            USUŃ KARTOTEKĘ
          </button>
          <button className="btn-win95 text-xs" onClick={onClose}>ANULUJ</button>
        </div>
      </div>
    </MdtModal>
  )
}

// ==================== Main Export ====================

export default function MdtModals(props: MdtModalsProps) {
  const { activeModal, editData, selectedRecord, officerName, onClose } = props

  if (activeModal === "none") return null

  const defaultCrForm = {
    date: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
    offense: "", code: "", status: "W TOKU", officer: officerName,
  }

  switch (activeModal) {
    case "addRecord":
      return selectedRecord ? (
        <CriminalRecordModal
          mode="add"
          initialForm={defaultCrForm}
          onSubmit={async (form) => { await props.onAddCriminalRecord(form); onClose() }}
          onClose={onClose}
        />
      ) : null

    case "editRecord":
      return selectedRecord && editData.editCrRecordId ? (
        <CriminalRecordModal
          mode="edit"
          initialForm={editData.editCrForm || defaultCrForm}
          onSubmit={async (form) => { await props.onSaveEditCriminalRecord(editData.editCrRecordId!, form); onClose() }}
          onClose={onClose}
        />
      ) : null

    case "addNote":
      return selectedRecord ? (
        <NoteModal
          mode="add"
          initialContent=""
          onSubmit={async (content) => { await props.onAddNote(content, officerName); onClose() }}
          onClose={onClose}
        />
      ) : null

    case "editNote":
      return selectedRecord && editData.editNoteId ? (
        <NoteModal
          mode="edit"
          initialContent={editData.editNoteContent || ""}
          onSubmit={async (content) => { await props.onSaveEditNote(editData.editNoteId!, content); onClose() }}
          onClose={onClose}
        />
      ) : null

    case "warrant":
      return selectedRecord ? (
        <WarrantModal
          selectedRecord={selectedRecord}
          onSubmit={async (type, reason) => { await props.onIssueWarrant(type, reason); onClose() }}
          onClose={onClose}
        />
      ) : null

    case "print":
      return selectedRecord ? (
        <PrintModal
          selectedRecord={selectedRecord}
          onSubmit={(reason) => { props.onGeneratePoster(reason) }}
          onClose={onClose}
        />
      ) : null

    case "poster":
      return selectedRecord ? (
        <WantedPoster
          record={selectedRecord}
          mugshotUrl={selectedRecord.mugshot_url}
          reason={editData.posterReason || ""}
          onClose={onClose}
        />
      ) : null

    case "createPerson":
      return (
        <CreatePersonModal
          onSubmit={async (fn, ln) => { await props.onCreatePerson(fn, ln); onClose() }}
          onClose={onClose}
        />
      )

    case "deleteConfirm":
      return selectedRecord ? (
        <DeleteConfirmModal
          selectedRecord={selectedRecord}
          onSubmit={async (text) => { await props.onDeleteKartoteka(text); onClose() }}
          onClose={onClose}
        />
      ) : null

    default:
      return null
  }
}
