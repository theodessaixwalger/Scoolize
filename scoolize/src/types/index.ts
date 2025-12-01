export type UserRole = 'student' | 'school'

export interface Profile {
  id: string
  email: string
  role: UserRole
  full_name?: string
  gdpr_consent: boolean
  gdpr_consent_date?: string
  anonymized: boolean
  created_at: string
  updated_at: string
}

export interface School {
  id: string
  profile_id: string
  name: string
  description?: string
  location?: string
  website?: string
  created_at: string
}

export interface Program {
  id: string
  school_id: string
  name: string
  description?: string
  level?: string
  duration_years?: number
  min_math_score?: number
  min_french_score?: number
  min_english_score?: number
  min_science_score?: number
  min_average_score?: number
  available_places?: number
  created_at: string
  updated_at: string
}

export interface StudentScore {
  id: string
  student_id: string
  math_score: number
  french_score: number
  english_score: number
  science_score: number
  average_score: number
  academic_year: string
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  student_id: string
  program_id: string
  status: 'pending' | 'accepted' | 'rejected'
  match_score?: number
  created_at: string
  updated_at: string
}

export interface MatchingProgram {
  program_id: string
  program_name: string
  school_name: string
  school_location: string
  level: string
  match_score: number
  requirements_met: boolean
  missing_requirements: string[]
}
