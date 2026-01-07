import type {
  ClassRoom,
  StudentEntry,
  AssignedContent,
  CreateClassRoomInput,
  AddStudentInput,
  AssignContentInput,
  ClassRoomStats,
  TeacherIdentity,
} from '../../src/core/types/class';

const DB_NAME = 'AILearningPageGenerator';
const DB_VERSION = 2;
const CLASSROOMS_STORE = 'classrooms';
const TEACHER_IDENTITY_KEY = 'teacher_identity';

class ClassService {
  private db: IDBDatabase | null = null;

  resetForTesting(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB for classrooms'));
      };

      request.onsuccess = event => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(CLASSROOMS_STORE)) {
          const store = db.createObjectStore(CLASSROOMS_STORE, {
            keyPath: 'id',
          });
          store.createIndex('teacherId', 'teacherId', { unique: false });
          store.createIndex('subject', 'subject', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  getTeacherIdentity(): TeacherIdentity | null {
    const stored = localStorage.getItem(TEACHER_IDENTITY_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as TeacherIdentity;
  }

  setTeacherIdentity(name: string): TeacherIdentity {
    const identity: TeacherIdentity = {
      id: `teacher_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(TEACHER_IDENTITY_KEY, JSON.stringify(identity));
    return identity;
  }

  getOrCreateTeacherIdentity(name: string): TeacherIdentity {
    const existing = this.getTeacherIdentity();
    if (existing) return existing;
    return this.setTeacherIdentity(name);
  }

  async createClassRoom(input: CreateClassRoomInput): Promise<ClassRoom> {
    const db = await this.ensureDB();
    const teacher = this.getTeacherIdentity();
    if (!teacher) {
      throw new Error('Teacher identity not set');
    }

    const now = new Date().toISOString();
    const classroom: ClassRoom = {
      id: `class_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: input.name,
      teacherId: teacher.id,
      subject: input.subject,
      gradeLevel: input.gradeLevel,
      students: [],
      assignedContent: [],
      createdAt: now,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CLASSROOMS_STORE], 'readwrite');
      const store = transaction.objectStore(CLASSROOMS_STORE);
      const request = store.add(classroom);

      request.onsuccess = () => resolve(classroom);
      request.onerror = () => reject(new Error('Failed to create classroom'));
    });
  }

  async getClassRoom(id: string): Promise<ClassRoom | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CLASSROOMS_STORE], 'readonly');
      const store = transaction.objectStore(CLASSROOMS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get classroom'));
    });
  }

  async getAllClassRooms(): Promise<ClassRoom[]> {
    const db = await this.ensureDB();
    const teacher = this.getTeacherIdentity();
    if (!teacher) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CLASSROOMS_STORE], 'readonly');
      const store = transaction.objectStore(CLASSROOMS_STORE);
      const index = store.index('teacherId');
      const request = index.getAll(teacher.id);

      request.onsuccess = () => {
        const results = request.result as ClassRoom[];
        results.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        resolve(results);
      };
      request.onerror = () => reject(new Error('Failed to get classrooms'));
    });
  }

  async updateClassRoom(classroom: ClassRoom): Promise<void> {
    const db = await this.ensureDB();
    classroom.updatedAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CLASSROOMS_STORE], 'readwrite');
      const store = transaction.objectStore(CLASSROOMS_STORE);
      const request = store.put(classroom);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to update classroom'));
    });
  }

  async deleteClassRoom(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CLASSROOMS_STORE], 'readwrite');
      const store = transaction.objectStore(CLASSROOMS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete classroom'));
    });
  }

  async addStudent(
    classId: string,
    input: AddStudentInput
  ): Promise<StudentEntry> {
    const classroom = await this.getClassRoom(classId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    const student: StudentEntry = {
      id: `student_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: input.name,
      resultBinIds: [],
      diagnosticReportIds: [],
      lastActivity: new Date().toISOString(),
      totalQuizzes: 0,
      averageScore: 0,
    };

    classroom.students.push(student);
    await this.updateClassRoom(classroom);
    return student;
  }

  async removeStudent(classId: string, studentId: string): Promise<void> {
    const classroom = await this.getClassRoom(classId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    classroom.students = classroom.students.filter(s => s.id !== studentId);
    await this.updateClassRoom(classroom);
  }

  async updateStudentResult(
    classId: string,
    studentId: string,
    resultBinId: string,
    score: number
  ): Promise<void> {
    const classroom = await this.getClassRoom(classId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    const student = classroom.students.find(s => s.id === studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    student.resultBinIds.push(resultBinId);
    student.totalQuizzes += 1;
    student.averageScore =
      (student.averageScore * (student.totalQuizzes - 1) + score) /
      student.totalQuizzes;
    student.lastActivity = new Date().toISOString();

    await this.updateClassRoom(classroom);
  }

  async addStudentResultByUrl(
    classId: string,
    resultUrl: string
  ): Promise<StudentEntry | null> {
    try {
      const url = new URL(resultUrl);
      const binId = url.searchParams.get('binId');
      if (!binId) return null;

      const classroom = await this.getClassRoom(classId);
      if (!classroom) return null;

      const existingStudent = classroom.students.find(s =>
        s.resultBinIds.includes(binId)
      );
      if (existingStudent) {
        return existingStudent;
      }

      const student: StudentEntry = {
        id: `student_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name: '待確認學生',
        resultBinIds: [binId],
        diagnosticReportIds: [],
        lastActivity: new Date().toISOString(),
        totalQuizzes: 1,
        averageScore: 0,
      };

      classroom.students.push(student);
      await this.updateClassRoom(classroom);
      return student;
    } catch {
      return null;
    }
  }

  async assignContent(
    classId: string,
    input: AssignContentInput
  ): Promise<AssignedContent> {
    const classroom = await this.getClassRoom(classId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    const assignment: AssignedContent = {
      contentBinId: input.contentBinId,
      contentType: input.contentType,
      title: input.title,
      assignedAt: new Date().toISOString(),
      dueDate: input.dueDate,
      completedByStudentIds: [],
    };

    classroom.assignedContent.push(assignment);
    await this.updateClassRoom(classroom);
    return assignment;
  }

  async markContentCompleted(
    classId: string,
    contentBinId: string,
    studentId: string
  ): Promise<void> {
    const classroom = await this.getClassRoom(classId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    const content = classroom.assignedContent.find(
      c => c.contentBinId === contentBinId
    );
    if (!content) {
      throw new Error('Content not found');
    }

    if (!content.completedByStudentIds.includes(studentId)) {
      content.completedByStudentIds.push(studentId);
    }

    await this.updateClassRoom(classroom);
  }

  calculateClassRoomStats(classroom: ClassRoom): ClassRoomStats {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeStudentsCount = classroom.students.filter(
      s => new Date(s.lastActivity) >= sevenDaysAgo
    ).length;

    const totalCompletions = classroom.assignedContent.reduce(
      (sum, c) => sum + c.completedByStudentIds.length,
      0
    );
    const totalExpected =
      classroom.assignedContent.length * classroom.students.length;
    const completionRatePercent =
      totalExpected > 0 ? (totalCompletions / totalExpected) * 100 : 0;

    const totalScores = classroom.students.reduce(
      (sum, s) => sum + s.averageScore * s.totalQuizzes,
      0
    );
    const totalQuizzes = classroom.students.reduce(
      (sum, s) => sum + s.totalQuizzes,
      0
    );
    const averageScore = totalQuizzes > 0 ? totalScores / totalQuizzes : 0;

    return {
      totalStudents: classroom.students.length,
      activeStudentsCount,
      totalAssignments: classroom.assignedContent.length,
      completionRatePercent: Math.round(completionRatePercent * 10) / 10,
      averageScore: Math.round(averageScore * 10) / 10,
    };
  }
}

export const classService = new ClassService();
