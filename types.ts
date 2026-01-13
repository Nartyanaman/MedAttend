
export type ComponentType = 'Theory' | 'Practical' | 'Tutorial' | 'Seminar/Viva';

export interface SubjectComponent {
  id: string;
  type: ComponentType;
  attended: number;
  total: number;
  requiredPct: number;
  isBaselineMode: boolean;
  baselinePct?: number;
}

export interface Subject {
  id: string;
  name: string;
  components: SubjectComponent[];
}

export interface Posting {
  id: string;
  department: string;
  startDate: string;
  endDate: string;
  requiredDays: number;
  attendedDays: number;
}

export interface AttendanceEntry {
  id: string;
  subjectId: string;
  componentId: string;
  subjectName: string;
  componentType: string;
  date: string; // ISO string (YYYY-MM-DD)
  status: 'present' | 'absent';
  timestamp: number;
}

export interface UserSettings {
  name?: string;
  profilePhoto?: string; // base64
  bio?: string;
  college: string;
  year: string;
  onboarded: boolean;
  startMode: 'fresh' | 'current';
  defaultBaselinePct?: number;
  defaultAttendedCount?: number;
  defaultTotalCount?: number;
  entryType: 'percentage' | 'counts';
  isMYSY: boolean;
  remindersEnabled: boolean;
  theme: 'light' | 'dark' | 'clinical';
}

export interface AppState {
  subjects: Subject[];
  postings: Posting[];
  history: AttendanceEntry[];
  settings: UserSettings;
}

export enum RiskLevel {
  SAFE = 'SAFE',
  BORDERLINE = 'BORDERLINE',
  DANGER = 'DANGER'
}

export interface AnalyticsSummary {
  overallPct: number;
  totalBunksLeft: number;
  eligibilityScore: number; // 0-100
  deficitCount: number;
}

export interface User {
  username: string;
  password: string; // In production, this should be hashed
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: string | null; // username
}
