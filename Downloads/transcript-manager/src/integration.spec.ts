import * as client from './client/client';
import Express from 'express';
import * as http from 'http';
import transcriptServer from './server/transcriptServer';
import { AddressInfo } from 'net';
import { setBaseURL } from './client/remoteService';
import * as db from './server/transcriptManager';

/**
 * Tests for the Transcript Manager. This test suite automatically deploys a local testing server
 * and cleans it up when it's done. Each test is hermetic, as the datastore is cleared before each
 * test runs.
 */

describe('TranscriptManager Integration Tests', () => {
  let server: http.Server;

  beforeAll(async () => {
    const app = Express();
    server = http.createServer(app);
    transcriptServer(app);
    db.initialize();
    await server.listen();
    const address = server.address() as AddressInfo;
    setBaseURL(`http://localhost:${address.port}`);
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    db.initialize();
  });

  it('POST /transcripts returns 201 and an ID for valid name', async () => {
    const result = await client.addStudent('Aziza');
    expect(typeof result.studentID).toBe('number');
    expect(result.studentID).toBeGreaterThan(0);
    const ids = await client.getStudentIDs('Aziza');
    expect(ids).toContain(result.studentID);
  });

  it('POST /transcripts returns 400 when name missing or empty', async () => {
    await expect(client.addStudent('')).rejects.toThrow(/No student name specified|400/);
  });

  it('GET /transcripts/:id returns 200 with body for valid ID and 404 for missing', async () => {
    const { studentID } = await client.addStudent('Bob');
    const transcript = await client.getTranscript(studentID);
    expect(transcript.student.studentID).toBe(studentID);
    expect(transcript.student.studentName).toBe('Bob');
    // Try a definitely-missing ID
    await expect(client.getTranscript(99999)).rejects.toThrow(/404|No student with id/);
  });

  it('GET /studentids?name=… returns all IDs for the name', async () => {
    const s1 = await client.addStudent('Carol');
    const s2 = await client.addStudent('Carol');
    const ids = await client.getStudentIDs('Carol');
    expect(ids).toContain(s1.studentID);
    expect(ids).toContain(s2.studentID);
    expect(ids.length).toBeGreaterThanOrEqual(2);
  });

  it('DELETE /transcripts/:id returns 204 and actually deletes', async () => {
    const { studentID } = await client.addStudent('Dave');
    await client.deleteStudent(studentID);
    const ids = await client.getStudentIDs('Dave');
    expect(ids).not.toContain(studentID);
    await expect(client.getTranscript(studentID)).rejects.toThrow(/404|No student with id/);
  });

  it('POST /transcripts/:studentID/:course returns 201; duplicate or bad grade returns 400', async () => {
    const { studentID } = await client.addStudent('Eve');
    // Happy path
    const res = await client.addGrade(studentID, 'CS360', 95);
    expect(res).toBeDefined();
    // Duplicate course
    await expect(client.addGrade(studentID, 'CS360', 90)).rejects.toThrow(/400|already has a grade/);
    // Bad grade (empty string)
    // @ts-expect-error: purposely passing invalid grade
    await expect(client.addGrade(studentID, 'CS411', '')).rejects.toThrow(/400|Invalid grade/);
  });

  it('GET /transcripts/:studentID/:course returns the grade object { studentID, course, grade }', async () => {
    const { studentID } = await client.addStudent('Frank');
    await client.addGrade(studentID, 'CS360', 88);
    const gradeObj = await client.getGrade(studentID, 'CS360');
    expect(gradeObj).toHaveProperty('studentID', studentID);
    expect(gradeObj).toHaveProperty('course', 'CS360');
    expect(gradeObj).toHaveProperty('grade', 88);
  });
});
