import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { classService } from '../../../services/class/classService';

const TEACHER_IDENTITY_KEY = 'teacher_identity';

describe('classService', () => {
  beforeEach(async () => {
    classService.resetForTesting();
    localStorage.clear();
    const deleteRequest = indexedDB.deleteDatabase('AILearningPageGenerator');
    await new Promise<void>((resolve, reject) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onblocked = () => resolve();
    });
  });

  afterEach(() => {
    classService.resetForTesting();
    vi.restoreAllMocks();
  });

  describe('Teacher Identity', () => {
    it('returns null when no identity is set', () => {
      const identity = classService.getTeacherIdentity();
      expect(identity).toBeNull();
    });

    it('sets and retrieves teacher identity', () => {
      const identity = classService.setTeacherIdentity('張老師');

      expect(identity.name).toBe('張老師');
      expect(identity.id).toMatch(/^teacher_\d+_[a-z0-9]+$/);
      expect(identity.createdAt).toBeDefined();

      const retrieved = classService.getTeacherIdentity();
      expect(retrieved).toEqual(identity);
    });

    it('getOrCreateTeacherIdentity returns existing identity', () => {
      const first = classService.setTeacherIdentity('張老師');
      const second = classService.getOrCreateTeacherIdentity('李老師');

      expect(second).toEqual(first);
      expect(second.name).toBe('張老師');
    });

    it('getOrCreateTeacherIdentity creates new identity if none exists', () => {
      const identity = classService.getOrCreateTeacherIdentity('王老師');

      expect(identity.name).toBe('王老師');
      expect(identity.id).toBeDefined();
    });
  });

  describe('ClassRoom Management', () => {
    beforeEach(async () => {
      classService.setTeacherIdentity('測試老師');
      await classService.init();
    });

    it('creates a new classroom', async () => {
      const classroom = await classService.createClassRoom({
        name: '七年級 A 班',
        subject: 'math',
        gradeLevel: 7,
      });

      expect(classroom.name).toBe('七年級 A 班');
      expect(classroom.subject).toBe('math');
      expect(classroom.gradeLevel).toBe(7);
      expect(classroom.id).toMatch(/^class_\d+_[a-z0-9]+$/);
      expect(classroom.students).toEqual([]);
      expect(classroom.assignedContent).toEqual([]);
    });

    it('retrieves a classroom by id', async () => {
      const created = await classService.createClassRoom({
        name: '八年級 B 班',
        subject: 'english',
        gradeLevel: 8,
      });

      const retrieved = await classService.getClassRoom(created.id);
      expect(retrieved).toEqual(created);
    });

    it('returns null for non-existent classroom', async () => {
      const result = await classService.getClassRoom('non-existent-id');
      expect(result).toBeNull();
    });

    it('gets all classrooms for current teacher', async () => {
      await classService.createClassRoom({
        name: '班級 1',
        subject: 'math',
        gradeLevel: 7,
      });
      await classService.createClassRoom({
        name: '班級 2',
        subject: 'english',
        gradeLevel: 8,
      });

      const all = await classService.getAllClassRooms();
      expect(all).toHaveLength(2);
    });

    it('deletes a classroom', async () => {
      const classroom = await classService.createClassRoom({
        name: '待刪除班級',
        subject: 'math',
        gradeLevel: 7,
      });

      await classService.deleteClassRoom(classroom.id);
      const deleted = await classService.getClassRoom(classroom.id);
      expect(deleted).toBeNull();
    });

    it('throws error when creating classroom without teacher identity', async () => {
      localStorage.removeItem(TEACHER_IDENTITY_KEY);

      await expect(
        classService.createClassRoom({
          name: '測試',
          subject: 'math',
          gradeLevel: 7,
        })
      ).rejects.toThrow('Teacher identity not set');
    });
  });

  describe('Student Management', () => {
    let classId: string;

    beforeEach(async () => {
      classService.setTeacherIdentity('測試老師');
      await classService.init();
      const classroom = await classService.createClassRoom({
        name: '學生測試班級',
        subject: 'math',
        gradeLevel: 7,
      });
      classId = classroom.id;
    });

    it('adds a student to classroom', async () => {
      const student = await classService.addStudent(classId, { name: '小明' });

      expect(student.name).toBe('小明');
      expect(student.id).toMatch(/^student_\d+_[a-z0-9]+$/);
      expect(student.totalQuizzes).toBe(0);
      expect(student.averageScore).toBe(0);

      const classroom = await classService.getClassRoom(classId);
      expect(classroom?.students).toHaveLength(1);
      expect(classroom?.students[0].name).toBe('小明');
    });

    it('removes a student from classroom', async () => {
      const student = await classService.addStudent(classId, { name: '小華' });
      await classService.removeStudent(classId, student.id);

      const classroom = await classService.getClassRoom(classId);
      expect(classroom?.students).toHaveLength(0);
    });

    it('updates student result and calculates average score', async () => {
      const student = await classService.addStudent(classId, { name: '小英' });

      await classService.updateStudentResult(classId, student.id, 'bin-1', 80);
      let classroom = await classService.getClassRoom(classId);
      let updated = classroom?.students.find(s => s.id === student.id);
      expect(updated?.totalQuizzes).toBe(1);
      expect(updated?.averageScore).toBe(80);

      await classService.updateStudentResult(classId, student.id, 'bin-2', 100);
      classroom = await classService.getClassRoom(classId);
      updated = classroom?.students.find(s => s.id === student.id);
      expect(updated?.totalQuizzes).toBe(2);
      expect(updated?.averageScore).toBe(90);
    });

    it('throws error when adding student to non-existent classroom', async () => {
      await expect(
        classService.addStudent('non-existent', { name: '測試' })
      ).rejects.toThrow('Classroom not found');
    });
  });

  describe('Content Assignment', () => {
    let classId: string;

    beforeEach(async () => {
      classService.setTeacherIdentity('測試老師');
      await classService.init();
      const classroom = await classService.createClassRoom({
        name: '內容測試班級',
        subject: 'english',
        gradeLevel: 8,
      });
      classId = classroom.id;
    });

    it('assigns content to classroom', async () => {
      const content = await classService.assignContent(classId, {
        contentBinId: 'bin-123',
        contentType: 'quiz',
        title: '第一章測驗',
        dueDate: '2025-01-15',
      });

      expect(content.contentBinId).toBe('bin-123');
      expect(content.contentType).toBe('quiz');
      expect(content.title).toBe('第一章測驗');
      expect(content.dueDate).toBe('2025-01-15');
      expect(content.completedByStudentIds).toEqual([]);

      const classroom = await classService.getClassRoom(classId);
      expect(classroom?.assignedContent).toHaveLength(1);
    });

    it('marks content as completed by student', async () => {
      const student = await classService.addStudent(classId, { name: '小明' });
      await classService.assignContent(classId, {
        contentBinId: 'bin-456',
        contentType: 'writing',
        title: '寫作練習',
      });

      await classService.markContentCompleted(classId, 'bin-456', student.id);

      const classroom = await classService.getClassRoom(classId);
      const content = classroom?.assignedContent.find(
        c => c.contentBinId === 'bin-456'
      );
      expect(content?.completedByStudentIds).toContain(student.id);
    });
  });

  describe('Statistics Calculation', () => {
    it('calculates classroom stats correctly', async () => {
      classService.setTeacherIdentity('測試老師');
      await classService.init();

      const classroom = await classService.createClassRoom({
        name: '統計測試班級',
        subject: 'math',
        gradeLevel: 9,
      });

      const student1 = await classService.addStudent(classroom.id, {
        name: '學生1',
      });
      const student2 = await classService.addStudent(classroom.id, {
        name: '學生2',
      });

      await classService.updateStudentResult(
        classroom.id,
        student1.id,
        'bin-1',
        80
      );
      await classService.updateStudentResult(
        classroom.id,
        student2.id,
        'bin-2',
        100
      );

      await classService.assignContent(classroom.id, {
        contentBinId: 'content-1',
        contentType: 'quiz',
        title: '測驗1',
      });

      await classService.markContentCompleted(
        classroom.id,
        'content-1',
        student1.id
      );

      const updated = await classService.getClassRoom(classroom.id);
      const stats = classService.calculateClassRoomStats(updated!);

      expect(stats.totalStudents).toBe(2);
      expect(stats.activeStudentsCount).toBe(2);
      expect(stats.totalAssignments).toBe(1);
      expect(stats.completionRatePercent).toBe(50);
      expect(stats.averageScore).toBe(90);
    });

    it('handles empty classroom stats', async () => {
      classService.setTeacherIdentity('測試老師');
      await classService.init();

      const classroom = await classService.createClassRoom({
        name: '空班級',
        subject: 'english',
        gradeLevel: 7,
      });

      const stats = classService.calculateClassRoomStats(classroom);

      expect(stats.totalStudents).toBe(0);
      expect(stats.activeStudentsCount).toBe(0);
      expect(stats.totalAssignments).toBe(0);
      expect(stats.completionRatePercent).toBe(0);
      expect(stats.averageScore).toBe(0);
    });
  });

  describe('Add Student by URL', () => {
    let classId: string;

    beforeEach(async () => {
      classService.setTeacherIdentity('測試老師');
      await classService.init();
      const classroom = await classService.createClassRoom({
        name: 'URL測試班級',
        subject: 'math',
        gradeLevel: 7,
      });
      classId = classroom.id;
    });

    it('adds student from valid result URL', async () => {
      const result = await classService.addStudentResultByUrl(
        classId,
        'https://example.com/results?binId=test-bin-id'
      );

      expect(result).not.toBeNull();
      expect(result?.resultBinIds).toContain('test-bin-id');
      expect(result?.name).toBe('待確認學生');
    });

    it('returns null for invalid URL', async () => {
      const result = await classService.addStudentResultByUrl(
        classId,
        'invalid-url'
      );
      expect(result).toBeNull();
    });

    it('returns null for URL without binId', async () => {
      const result = await classService.addStudentResultByUrl(
        classId,
        'https://example.com/results'
      );
      expect(result).toBeNull();
    });

    it('returns existing student if binId already exists', async () => {
      const first = await classService.addStudentResultByUrl(
        classId,
        'https://example.com/results?binId=duplicate-bin'
      );
      const second = await classService.addStudentResultByUrl(
        classId,
        'https://example.com/results?binId=duplicate-bin'
      );

      expect(second?.id).toBe(first?.id);

      const classroom = await classService.getClassRoom(classId);
      expect(classroom?.students).toHaveLength(1);
    });
  });
});
