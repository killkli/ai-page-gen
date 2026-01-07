import type { Subject } from './curriculum';

export interface ClassRoom {
  id: string;
  name: string;
  teacherId: string;
  subject: Subject;
  gradeLevel: number;
  students: StudentEntry[];
  assignedContent: AssignedContent[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentEntry {
  id: string;
  name: string;
  resultBinIds: string[];
  diagnosticReportIds: string[];
  lastActivity: string;
  totalQuizzes: number;
  averageScore: number;
}

export interface AssignedContent {
  contentBinId: string;
  contentType: 'quiz' | 'writing' | 'interactive';
  title: string;
  assignedAt: string;
  dueDate?: string;
  completedByStudentIds: string[];
}

export interface CreateClassRoomInput {
  name: string;
  subject: Subject;
  gradeLevel: number;
}

export interface AddStudentInput {
  name: string;
}

export interface AssignContentInput {
  contentBinId: string;
  contentType: 'quiz' | 'writing' | 'interactive';
  title: string;
  dueDate?: string;
}

export interface ClassRoomStats {
  totalStudents: number;
  activeStudentsCount: number;
  totalAssignments: number;
  completionRatePercent: number;
  averageScore: number;
}

export interface TeacherIdentity {
  id: string;
  name: string;
  createdAt: string;
}
