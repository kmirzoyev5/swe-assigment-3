
import * as db from './transcriptManager';
import { StudentID, Transcript } from './transcriptManager';

describe('TranscriptManager Unit Tests', () => {
  beforeEach(() => {
    db.initialize();
  });

  describe('addStudent()', () => {
    it('returns a numeric ID and stores the student', () => {
      const id = db.addStudent('Alice');
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
      const ids = db.getStudentIDs('Alice');
      expect(ids).toContain(id);
      const transcript = db.getTranscript(id);
      expect(transcript).toBeDefined();
      expect(transcript.grades).toEqual([]);
    });

    it('Different students get different IDs, even with same name', () => {
      const id1 = db.addStudent('Bob');
      const id2 = db.addStudent('Bob');
      expect(id1).not.toBe(id2);
      const ids = db.getStudentIDs('Bob');
      expect(ids).toContain(id1);
      expect(ids).toContain(id2);
    });
  });

  describe('getTranscript()', () => {
    it('returns undefined for missing ID', () => {
      const result = db.getTranscript(9999);
      expect(result).toBeUndefined();
    });
  });

  describe('deleteStudent()', () => {
    it('removes only the requested student and throws for missing', () => {
      const id1 = db.addStudent('Carol');
      const id2 = db.addStudent('Dave');
      db.deleteStudent(id1);
      const ids = db.getStudentIDs('Carol');
      expect(ids).not.toContain(id1);
      expect(db.getStudentIDs('Dave')).toContain(id2);
      expect(() => db.deleteStudent(id1)).toThrow();
    });
  });

  describe('addGrade()', () => {
    it('happy path and duplicate course rejection', () => {
      const id = db.addStudent('Eve');
      db.addGrade(id, 'CS360', 95);
      db.addGrade(id, 'CS411', 85);
      const transcript = db.getTranscript(id);
      expect(transcript.grades).toEqual([
        { course: 'CS360', grade: 95 },
        { course: 'CS411', grade: 85 },
      ]);
      expect(() => db.addGrade(id, 'CS360', 90)).toThrow();
    });
  });

  describe('getGrade()', () => {
    it('returns correct numeric grade and errors for missing student/course', () => {
      const id = db.addStudent('Frank');
      db.addGrade(id, 'CS360', 88);
      expect(db.getGrade(id, 'CS360')).toBe(88);
      expect(() => db.getGrade(id, 'CS411')).toThrow();
      expect(() => db.getGrade(9999, 'CS360')).toThrow();
    });
  });
});
