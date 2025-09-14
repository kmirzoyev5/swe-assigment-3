
export type StudentID = number;
export type Student = { studentID: number; studentName: string };
export type Course = string;
export type CourseGrade = { course: Course; grade: number };
export type Transcript = { student: Student; grades: CourseGrade[] };

// In-memory database
let transcripts: Transcript[] = [];
let nextStudentID: number = 1;



// initializes the database with 4 students,
// each with an empty transcript (handy for debugging)
export function initialize() {
    transcripts = [];
    nextStudentID = 1;
    const names = ["Alice", "Bob", "Charlie", "Diana"];
    for (const name of names) {
        addStudent(name);
    }
}

// returns a list of all the transcripts.
// handy for debugging
export function getAll(): Transcript[] {
    return transcripts.map(t => ({
        student: { ...t.student },
        grades: t.grades.map(g => ({ ...g }))
    }));
}

// creates an empty transcript for a student with this name,
// and returns a fresh ID number
export function addStudent(name: string): StudentID {
    const studentID = nextStudentID++;
    const student: Student = { studentID, studentName: name };
    const transcript: Transcript = { student, grades: [] };
    transcripts.push(transcript);
    return studentID;
}

// gets transcript for given ID.  Returns undefined if missing
export function getTranscript(studentID: number): Transcript | undefined {
    const t = transcripts.find(t => t.student.studentID === studentID);
    if (!t) return undefined;
    return {
        student: { ...t.student },
        grades: t.grades.map(g => ({ ...g }))
    };
}

// returns list of studentIDs matching a given name
export function getStudentIDs(studentName: string): StudentID[] {
    return transcripts
        .filter(t => t.student.studentName === studentName)
        .map(t => t.student.studentID);
}

// deletes student with the given ID from the database.
// throws exception if no such student. 
export function deleteStudent(studentID: StudentID) {
    const idx = transcripts.findIndex(t => t.student.studentID === studentID);
    if (idx === -1) throw new Error("No such student");
    transcripts.splice(idx, 1);
}

// adds a grade for the given student in the given course.
// throws error if student already has a grade in that course.
export function addGrade(studentID: StudentID, course: Course, grade: number) {
    const t = transcripts.find(t => t.student.studentID === studentID);
    if (!t) throw new Error("No such student");
    if (t.grades.some(g => g.course === course)) {
        throw new Error("Student already has a grade in this course");
    }
    t.grades.push({ course, grade });
}

// returns the grade for the given student in the given course
// throws an error if no such student or no such grade
export function getGrade(studentID: StudentID, course: Course): number {
    const t = transcripts.find(t => t.student.studentID === studentID);
    if (!t) throw new Error("No such student");
    const g = t.grades.find(g => g.course === course);
    if (!g) throw new Error("No such grade");
    return g.grade;
}
