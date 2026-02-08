export interface CriminalRecord {
  date: string
  offense: string
  code: string
  status: string
  officer: string
}

export interface Warrant {
  type: "PRZESZUKANIA" | "ARESZTOWANIA" | "NO-KNOCK"
  reason: string
  issuedDate: string
  officer: string
}

export interface PlayerData {
  firstName: string
  lastName: string
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
  licenseNo: string
  licenseStatus: string
  wantedStatus: string
  gangAffiliation: string
  priors: number
  mugshot: string
  records: CriminalRecord[]
  notes: string[]
  warrant: Warrant | null
}

export const defaultPlayer: PlayerData = {
  firstName: "Carlos",
  lastName: "Vasquez",
  dob: "03/15/1972",
  ssn: "XXX-XX-4821",
  gender: "Mężczyzna",
  race: "Latynos",
  height: "5'11\"",
  weight: "187 lbs",
  hair: "Czarne",
  eyes: "Brązowe",
  address: "1247 Grove St, Los Santos, SA 90012",
  phone: "(555) 341-8827",
  licenseNo: "SA-DL-4482917",
  licenseStatus: "ZAWIESZONY",
  wantedStatus: "BRAK",
  gangAffiliation: "NIEZNANE",
  priors: 4,
  mugshot: "",
  records: [
    {
      date: "11/23/1998",
      offense: "Kradzież pojazdu",
      code: "PC 487(d)(1)",
      status: "SKAZANY",
      officer: "Dep. Morrison",
    },
    {
      date: "06/14/1996",
      offense: "Napad z bronią",
      code: "PC 245(a)(1)",
      status: "SKAZANY",
      officer: "Dep. Tenpenny",
    },
    {
      date: "02/08/1995",
      offense: "Ucieczka przed policją",
      code: "VC 2800.2",
      status: "SKAZANY",
      officer: "Dep. Hernandez",
    },
    {
      date: "09/30/1993",
      offense: "Posiadanie narkotyków",
      code: "HS 11350(a)",
      status: "ODDALONO",
      officer: "Dep. Pulaski",
    },
  ],
  notes: [
    "Osobnik często widziany w rejonach Idlewood i East LS.",
    "Znany współpracownik udokumentowanych członków gangu.",
    "Posiada historię ucieczek przed organami ścigania.",
    "Zachować ostrożność - historia przemocy.",
  ],
  warrant: null,
}
