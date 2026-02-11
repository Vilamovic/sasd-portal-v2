// ============================================
// MDT Terminal - Database-backed types
// ============================================

export interface MdtRecord {
  id: string
  first_name: string
  last_name: string
  dob: string
  ssn: string
  gender: string
  race: string
  height: string
  weight: string
  hair: string
  eyes: string
  address: string
  phone: string
  license_no: string
  license_status: string
  wanted_status: string
  gang_affiliation: string
  priors: number
  mugshot_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined relations (loaded on detail view)
  criminal_records?: MdtCriminalRecord[]
  mdt_notes?: MdtNote[]
  mdt_warrants?: MdtWarrant[]
}

export interface MdtCriminalRecord {
  id: string
  record_id: string
  date: string
  offense: string
  code: string
  status: string
  officer: string
  created_at: string
}

export interface MdtNote {
  id: string
  record_id: string
  content: string
  officer: string
  created_at: string
}

export interface MdtWarrant {
  id: string
  record_id: string
  type: "PRZESZUKANIA" | "ARESZTOWANIA" | "NO-KNOCK"
  reason: string
  officer: string
  issued_date: string
  is_active: boolean
  created_at: string
}

export interface MdtBoloVehicle {
  id: string
  plate: string
  make: string
  model: string
  color: string
  reason: string
  status: "ACTIVE" | "RESOLVED"
  reported_by: string
  created_by: string | null
  created_at: string
  updated_at: string
}

// Search suggestion type for SearchPanel
export interface SearchSuggestion {
  type: "person" | "vehicle"
  id: string
  label: string
  sublabel?: string
}
