
import { mockStudents } from '../data/mockStudents';

const STORAGE_KEY = 'sms_students';
const ATTENDANCE_KEY = 'sms_attendance';

// Student Management
export const getStudents = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockStudents));
        return mockStudents;
    }
    return JSON.parse(stored);
};

export const addStudent = (student) => {
    const students = getStudents();
    // If studentId connects to 'roll number' concept, ensure it's unique
    const newStudent = { ...student };
    const updatedStudents = [...students, newStudent];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStudents));
    return newStudent;
};

// Attendance Management
export const getAttendance = () => {
    const stored = localStorage.getItem(ATTENDANCE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const markAttendance = (studentId, status = 'Present') => {
    const records = getAttendance();
    const date = new Date().toLocaleDateString();

    // Check if already marked for today
    const existingRecordIndex = records.findIndex(
        r => r.studentId === studentId && r.date === date
    );

    const newRecord = {
        studentId,
        date,
        timestamp: new Date().toISOString(),
        status
    };

    let updatedRecords;
    if (existingRecordIndex >= 0) {
        updatedRecords = [...records];
        updatedRecords[existingRecordIndex] = newRecord; // Update existing
    } else {
        updatedRecords = [...records, newRecord]; // Add new
    }

    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updatedRecords));
    return newRecord;
};

export const getTodayAttendance = () => {
    const records = getAttendance();
    const date = new Date().toLocaleDateString();
    return records.filter(r => r.date === date);
};
