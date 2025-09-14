import * as express from 'express';
import * as tm from './TranscriptManager';
import * as cors from 'cors'

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database with 4 studentsss
tm.initialize();

// POST /transcripts - add a new student (custom for curl test)
app.post('/transcripts', (req, res) => {
	const name = req.body.name;
	if (!name) return res.status(400).json({ error: 'Missing student name' });
	const id = tm.addStudent(name);
	res.json({ studentID: id });
});

// POST /transcripts/:id/:course - add a grade for a student in a specific course
app.post('/transcripts/:id/:course', (req, res) => {
	const id = Number(req.params.id);
	const course = req.params.course;
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
});

// GET /transcripts/:id/:course - get grade for a student in a specific course
app.get('/transcripts/:id/:course', (req, res) => {
	const id = Number(req.params.id);
	const course = req.params.course;
	try {
		const grade = tm.getGrade(id, course);
		res.json({ studentID: id, course, grade });
	} catch (e: any) {
		res.status(404).json({ error: e.message });
	}
});

// GET /studentids?name=Jasur - get all student IDs for a given name
app.get('/studentids', (req, res) => {
	const name = req.query.name as string;
	if (!name) return res.status(400).json({ error: 'Missing name parameter' });
	const ids = tm.getStudentIDs(name);
	res.json(ids);
});

// GET /students - list all students
app.get('/students', (req, res) => {
	const transcripts = tm.getAll();
	const students = transcripts.map(t => t.student);
	res.json(students);
});

// POST /students - add a new student
app.post('/students', (req, res) => {
	const { name } = req.body;
	if (!name) return res.status(400).json({ error: 'Missing student name' });
	const id = tm.addStudent(name);
	res.status(201).json({ studentID: id });
});

// GET /students/:id - get a student's transcript
app.get('/students/:id', (req, res) => {
	const id = Number(req.params.id);
	const transcript = tm.getTranscript(id);
	if (!transcript) return res.status(404).json({ error: 'Student not found' });
	res.json(transcript);
});

// GET /transcripts/:id/:course - get grade for a student in a specific course
app.get('/transcripts/:id/:course', (req, res) => {
	const id = Number(req.params.id);
	const course = req.params.course;
	try {
		const grade = tm.getGrade(id, course);
		res.json({ grade });
	} catch (e: any) {
		res.status(404).json({ error: e.message });
	}
});

// DELETE /students/:id - delete a student
app.delete('/students/:id', (req, res) => {
	const id = Number(req.params.id);
	try {
		tm.deleteStudent(id);
		res.status(204).send();
	} catch (e) {
		res.status(404).json({ error: 'Student not found' });
	}
});

// POST /students/:id/grades - add a grade for a student
app.post('/students/:id/grades', (req, res) => {
	const id = Number(req.params.id);
	const { course, grade } = req.body;
	if (!course || typeof grade !== 'number') {
		return res.status(400).json({ error: 'Missing course or grade' });
	}
	try {
		tm.addGrade(id, course, grade);
		res.status(201).json({ message: 'Grade added' });
	} catch (e: any) {
		res.status(400).json({ error: e.message });
	}
});

// GET /students/:id/grades/:course - get a student's grade for a course
app.get('/students/:id/grades/:course', (req, res) => {
	const id = Number(req.params.id);
	const course = req.params.course;
	try {
		const grade = tm.getGrade(id, course);
		res.json({ grade });
	} catch (e: any) {
		res.status(404).json({ error: e.message });
	}
});


// GET /transcripts/:id - get transcript for a specific student ID
app.get('/transcripts/:id', (req, res) => {
	const id = Number(req.params.id);
	const transcript = tm.getTranscript(id);
	if (!transcript) return res.status(404).json({ error: 'Transcript not found' });
	res.json(transcript);
});

// GET /transcripts - list all transcripts
app.get('/transcripts', (req, res) => {
	res.json(tm.getAll());
});

// POST /transcripts - add a new student (custom for curl test)
app.post('/transcripts', (req, res) => {
	const name = req.body.name;
	if (!name) return res.status(400).json({ error: 'Missing student name' });
	const id = tm.addStudent(name);
	res.json({ studentID: id });
});

// POST /transcripts/:id/:course - add a grade for a student in a specific course
app.post('/transcripts/:id/:course', (req, res) => {
	const id = Number(req.params.id);
	const course = req.params.course;
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
});

// GET /transcripts/:id/:course - get grade for a student in a specific course
app.get('/transcripts/:id/:course', (req, res) => {
	const id = Number(req.params.id);
	const course = req.params.course;
	try {
		const grade = tm.getGrade(id, course);
		res.json({ studentID: id, course, grade });
	} catch (e: any) {
		res.status(404).json({ error: e.message });
	}
});

// PUT /students/:id - update a student's name
app.put('/students/:id', (req, res) => {
	const id = Number(req.params.id);
	const { name } = req.body;
	if (!name) return res.status(400).json({ error: 'Missing student name' });
	const transcript = tm.getTranscript(id);
	if (!transcript) return res.status(404).json({ error: 'Student not found' });
	transcript.student.studentName = name;
	res.json({ studentID: id, studentName: name });
});

// PUT /students/:id/grades/:course - update a grade for a student in a specific course
app.put('/students/:id/grades/:course', (req, res) => {
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
});

// DELETE /students/:id/grades/:course - delete a grade for a student in a specific course
app.delete('/students/:id/grades/:course', (req, res) => {
	const id = Number(req.params.id);
	const course = req.params.course;
	const transcript = tm.getTranscript(id);
	if (!transcript) return res.status(404).json({ error: 'Student not found' });
	const idx = transcript.grades.findIndex(g => g.course === course);
	if (idx === -1) return res.status(404).json({ error: 'Grade not found' });
	transcript.grades.splice(idx, 1);
	res.status(204).send();
});

// GET /studentids?name=Jasur - get all student IDs for a given name
app.get('/studentids', (req, res) => {
	const name = req.query.name as string;
	if (!name) return res.status(400).json({ error: 'Missing name parameter' });
	const ids = tm.getStudentIDs(name);
	res.json(ids);
});



// Start server
const PORT = process.env.PORT || 4001;
console.log('Initial list of transcripts:');
console.log(JSON.stringify(tm.getAll(), null, 2));
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});


// middleware

// allow requests from any port or source.

app.use(cors())

// for parsing application/json
app.use(express.json());

// for parsing application/x-www-form-urlencoded
// converts foo=bar&baz=quux to {foo: 'bar', baz: 'quux'}
app.use(express.urlencoded({ extended: true })); 
