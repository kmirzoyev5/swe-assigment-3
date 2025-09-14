// --------------------
// Imports
import * as express from 'express';
import * as tm from './TranscriptManager';
import * as cors from 'cors';

// --------------------
// App and Middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// Initialize database
tm.initialize();

// --------------------
// Route Handlers

// Add a new student
function addStudent(req, res) {
	const name = req.body.name;
	if (!name) return res.status(400).json({ error: 'Missing student name' });
	const id = tm.addStudent(name);
	res.json({ studentID: id });
}

// Add a grade for a student
function addGrade(req, res) {
	const id = Number(req.params.id);
	const course = req.params.course || req.body.course;
	const grade = Number(req.body.grade);
	if (!course || isNaN(grade)) {
		return res.status(400).json({ error: 'Missing course or grade' });
	}
	try {
		tm.addGrade(id, course, grade);
		res.send('OK');
	} catch (e: any) {
		res.status(400).json({ error: e.message });
	}
}

// Get a grade for a student
function getGrade(req, res) {
	const id = Number(req.params.id);
	const course = req.params.course;
	try {
		const grade = tm.getGrade(id, course);
		res.json({ studentID: id, course, grade });
	} catch (e: any) {
		res.status(404).json({ error: e.message });
	}
}

// Get all student IDs by name
function getStudentIDs(req, res) {
	const name = req.query.name as string;
	if (!name) return res.status(400).json({ error: 'Missing name parameter' });
	const ids = tm.getStudentIDs(name);
	res.json(ids);
}

// List all students
function getAllStudentNames(req, res) {
	const transcripts = tm.getAll();
	const students = transcripts.map(t => t.student);
	res.json(students);
}

// Get a student's transcript
function getStudentTranscript(req, res) {
	const id = Number(req.params.id);
	const transcript = tm.getTranscript(id);
	if (!transcript) return res.status(404).json({ error: 'Student not found' });
	res.json(transcript);
}

// Delete a student
function deleteStudent(req, res) {
	const id = Number(req.params.id);
	try {
		tm.deleteStudent(id);
		res.status(204).send();
	} catch (e) {
		res.status(404).json({ error: 'Student not found' });
	}
}

// Update a student's name
function updateStudentName(req, res) {
	const id = Number(req.params.id);
	const { name } = req.body;
	if (!name) return res.status(400).json({ error: 'Missing student name' });
	const transcript = tm.getTranscript(id);
	if (!transcript) return res.status(404).json({ error: 'Student not found' });
	transcript.student.studentName = name;
	res.json({ studentID: id, studentName: name });
}

// Update a grade
function updateGrade(req, res) {
	const id = Number(req.params.id);
	const course = req.params.course;
	const { grade } = req.body;
	if (typeof grade !== 'number') return res.status(400).json({ error: 'Missing or invalid grade' });
	const transcript = tm.getTranscript(id);
	if (!transcript) return res.status(404).json({ error: 'Student not found' });
	const courseGrade = transcript.grades.find(g => g.course === course);
	if (!courseGrade) return res.status(404).json({ error: 'Grade not found' });
	courseGrade.grade = grade;
	res.json({ studentID: id, course, grade });
}

// Delete a grade
function deleteGrade(req, res) {
	const id = Number(req.params.id);
	const course = req.params.course;
	const transcript = tm.getTranscript(id);
	if (!transcript) return res.status(404).json({ error: 'Student not found' });
	const idx = transcript.grades.findIndex(g => g.course === course);
	if (idx === -1) return res.status(404).json({ error: 'Grade not found' });
	transcript.grades.splice(idx, 1);
	res.status(204).send();
}

// Get transcript by ID
function getTranscript(req, res) {
	const id = Number(req.params.id);
	const transcript = tm.getTranscript(id);
	if (!transcript) return res.status(404).json({ error: 'Transcript not found' });
	res.json(transcript);
}

// List all transcripts
function getAllTranscripts(req, res) {
	res.json(tm.getAll());
}

// --------------------
// Route Registrations
// Students
app.post('/students', addStudent);
app.get('/students', getAllStudentNames);
app.get('/students/:id', getStudentTranscript);
app.put('/students/:id', updateStudentName);
app.delete('/students/:id', deleteStudent);

// Grades
app.post('/students/:id/grades', addGrade);
app.get('/students/:id/grades/:course', getGrade);
app.put('/students/:id/grades/:course', updateGrade);
app.delete('/students/:id/grades/:course', deleteGrade);

// Transcripts
app.post('/transcripts', addStudent); // For compatibility with curl tests
app.get('/transcripts', getAllTranscripts);
app.get('/transcripts/:id', getTranscript);
app.post('/transcripts/:id/:course', addGrade);
app.get('/transcripts/:id/:course', getGrade);

// Student IDs by name
app.get('/studentids', getStudentIDs);

// --------------------
// Start server
const PORT = process.env.PORT || 4001;
console.log('Initial list of transcripts:');
console.log(JSON.stringify(tm.getAll(), null, 2));
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

// allow requests from any port or source.

app.use(cors())

// for parsing application/json
app.use(express.json());

// for parsing application/x-www-form-urlencoded
// converts foo=bar&baz=quux to {foo: 'bar', baz: 'quux'}
app.use(express.urlencoded({ extended: true })); 
