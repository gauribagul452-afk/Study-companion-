export type ExamType = 'JEE' | 'NEET' | 'UPSC' | 'NDA' | 'CBSE' | 'ICSE' | 'STATE_BOARD' | 'OTHER';

export interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  duration: number; // in minutes
  completed: boolean;
  date: string; // ISO date
}

export interface TimetableEntry {
  id: string;
  day: string; // Monday, Tuesday, etc.
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subject: string;
  activity: string;
}

export interface UserProfile {
  name: string;
  exam: ExamType;
  targetDate: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}
