
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, UserX, Users } from 'lucide-react';

const AttendanceList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, attendanceRes] = await Promise.all([
                    fetch('http://localhost:5000/api/students'),
                    fetch('http://localhost:5000/api/attendance')
                ]);

                const studentsData = await studentsRes.json();
                const attendanceData = await attendanceRes.json();

                setStudents(studentsData);
                setAttendance(attendanceData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalStudents = students.length;
    const presentCount = attendance.length;
    const absentCount = totalStudents - presentCount;

    // Enhance student data with attendance status
    const studentList = students.map(student => {
        const record = attendance.find(r => r.studentId === student._id); // Use _id from Mongo/NeDB
        return {
            ...student,
            status: record ? record.status : 'Absent',
            timestamp: record ? record.timestamp : null
        };
    });

    if (loading) return <div className="p-8">Loading attendance data...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Today's Attendance</h1>
                    <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Students</p>
                            <p className="text-3xl font-bold text-gray-800">{totalStudents}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                            <Users size={24} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Present</p>
                            <p className="text-3xl font-bold text-green-600">{presentCount}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full text-green-600">
                            <UserCheck size={24} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Absent</p>
                            <p className="text-3xl font-bold text-red-600">{absentCount}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full text-red-600">
                            <UserX size={24} />
                        </div>
                    </div>
                </div>

                {/* List Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Student Info</th>
                                    <th className="p-4 font-semibold text-gray-600">Roll No</th>
                                    <th className="p-4 font-semibold text-gray-600">Course</th>
                                    <th className="p-4 font-semibold text-gray-600">Status</th>
                                    <th className="p-4 font-semibold text-gray-600">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentList.map((student) => (
                                    <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            {student.photo ? (
                                                <img src={student.photo} alt="Student" className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-xs">
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-gray-800">{student.firstName} {student.lastName}</p>
                                                <p className="text-xs text-gray-500">{student.mobileNumber}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 font-mono text-sm">{student.rollNo || student.id}</td>
                                        <td className="p-4 text-gray-600">{student.course}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.status === 'Present'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {student.timestamp ? new Date(student.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {studentList.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500">
                                            No students registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceList;
