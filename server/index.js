const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Datastore = require('nedb-promises');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Database Initialization
const studentsDB = Datastore.create({ filename: path.join(__dirname, 'data/students.db'), autoload: true });
const attendanceDB = Datastore.create({ filename: path.join(__dirname, 'data/attendance.db'), autoload: true });

// In-memory OTP storage
const otpStore = new Map();

// Helper function to generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to calculate euclidean distance between face descriptors
function calculateDistance(descriptor1, descriptor2) {
    if (!descriptor1 || !descriptor2) return Infinity;
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    return Math.sqrt(sum);
}

// Routes

// OTP: Send OTP to mobile number
app.post('/api/otp/send', async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (!mobileNumber || mobileNumber.length < 10) {
            return res.status(400).json({ error: 'Invalid mobile number' });
        }

        // Check if mobile number already registered
        const existingStudent = await studentsDB.findOne({ mobileNumber });
        if (existingStudent) {
            return res.status(400).json({
                error: 'This mobile number is already registered',
                duplicate: true,
                field: 'mobile'
            });
        }

        const otp = generateOTP();

        otpStore.set(mobileNumber, {
            otp: otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        console.log(`📱 OTP for ${mobileNumber}: ${otp}`);

        res.json({
            message: 'OTP sent successfully',
            demo_otp: otp
        });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// OTP: Verify OTP
app.post('/api/otp/verify', async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;

        if (!mobileNumber || !otp) {
            return res.status(400).json({ error: 'Mobile number and OTP are required' });
        }

        const storedData = otpStore.get(mobileNumber);

        if (!storedData) {
            return res.status(400).json({ error: 'OTP not found or expired' });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(mobileNumber);
            return res.status(400).json({ error: 'OTP has expired' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        otpStore.delete(mobileNumber);

        res.json({
            message: 'OTP verified successfully',
            verified: true
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// 1. Get all students or by email
app.get('/api/students', async (req, res) => {
    try {
        const { email } = req.query;

        if (email) {
            const student = await studentsDB.findOne({ email });
            if (!student) {
                return res.status(404).json({ error: 'Student not found with this email' });
            }
            return res.json(student);
        }

        const students = await studentsDB.find({});
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// 2. Register a new student with DUPLICATE PREVENTION
app.post('/api/students', async (req, res) => {
    try {
        const studentData = req.body;

        if (!studentData.firstName || !studentData.photo) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // DUPLICATE CHECK 1: Mobile Number
        if (studentData.mobileNumber) {
            const existingByMobile = await studentsDB.findOne({ mobileNumber: studentData.mobileNumber });
            if (existingByMobile) {
                return res.status(400).json({
                    error: 'Mobile number already registered',
                    duplicate: true,
                    field: 'mobile',
                    existingStudent: {
                        name: `${existingByMobile.firstName} ${existingByMobile.lastName}`,
                        rollNo: existingByMobile.rollNo
                    }
                });
            }
        }

        // DUPLICATE CHECK 2: Roll Number
        if (studentData.rollNo) {
            const existingByRoll = await studentsDB.findOne({ rollNo: studentData.rollNo });
            if (existingByRoll) {
                return res.status(400).json({
                    error: 'Roll number already registered',
                    duplicate: true,
                    field: 'rollNo'
                });
            }
        }

        // DUPLICATE CHECK 3: Email
        if (studentData.email) {
            const existingByEmail = await studentsDB.findOne({ email: studentData.email });
            if (existingByEmail) {
                return res.status(400).json({
                    error: 'Email already registered',
                    duplicate: true,
                    field: 'email'
                });
            }
        }

        // DUPLICATE CHECK 4: Face Descriptor Similarity
        if (studentData.descriptor && studentData.descriptor.length > 0) {
            const allStudents = await studentsDB.find({});
            const FACE_SIMILARITY_THRESHOLD = 0.6; // Same face if distance < 0.6

            for (const student of allStudents) {
                if (student.descriptor && student.descriptor.length > 0) {
                    const distance = calculateDistance(studentData.descriptor, student.descriptor);

                    if (distance < FACE_SIMILARITY_THRESHOLD) {
                        return res.status(400).json({
                            error: 'This face is already registered in the system',
                            duplicate: true,
                            field: 'face',
                            existingStudent: {
                                name: `${student.firstName} ${student.lastName}`,
                                rollNo: student.rollNo,
                                similarity: Math.round((1 - distance) * 100) + '%'
                            }
                        });
                    }
                }
            }
        }

        // All checks passed, create student
        const newStudent = await studentsDB.insert({
            ...studentData,
            createdAt: new Date(),
        });

        console.log(`✅ New student registered: ${newStudent.firstName} ${newStudent.lastName}`);
        res.status(201).json(newStudent);

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register student' });
    }
});

// 3. Mark Attendance
app.post('/api/attendance', async (req, res) => {
    try {
        const { studentId, status, confidence } = req.body;
        const date = new Date().toLocaleDateString();

        const existing = await attendanceDB.findOne({ studentId, date });

        if (existing) {
            return res.json({ message: 'Attendance already marked', record: existing });
        }

        const student = await studentsDB.findOne({ _id: studentId });
        if (!student) {
            const studentByCustomId = await studentsDB.findOne({ id: studentId });
            if (!studentByCustomId) return res.status(404).json({ error: 'Student not found' });
        }

        const newRecord = {
            studentId,
            date,
            status: status || 'Present',
            confidence,
            timestamp: new Date().toISOString(),
        };

        const doc = await attendanceDB.insert(newRecord);
        res.status(201).json(doc);
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

// 4. Get Attendance Records
app.get('/api/attendance', async (req, res) => {
    try {
        const { date } = req.query;
        let query = {};

        if (date) {
            query.date = date;
        } else {
            query.date = new Date().toLocaleDateString();
        }

        const records = await attendanceDB.find(query);
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// 5. Delete Student
app.delete('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await studentsDB.remove({ _id: id }, {});
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`✅ OTP System: Demo mode (OTPs logged to console)`);
    console.log(`✅ Duplicate Prevention: Active (Mobile, Roll No, Email, Face)`);
});
