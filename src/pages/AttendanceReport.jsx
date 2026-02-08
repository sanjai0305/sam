import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, FileText } from 'lucide-react';

const AttendanceReport = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            const [studentsRes, attendanceRes] = await Promise.all([
                fetch('http://localhost:5000/api/students'),
                fetch(`http://localhost:5000/api/attendance?date=${selectedDate}`)
            ]);

            const studentsData = await studentsRes.json();
            const attendanceData = await attendanceRes.json();

            setStudents(studentsData);
            setAttendance(attendanceData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Roll No', 'Course', 'Status', 'Time'];
        const rows = studentList.map(student => [
            `${student.firstName} ${student.lastName}`,
            student.rollNo || student.id,
            student.course,
            student.status,
            student.timestamp ? new Date(student.timestamp).toLocaleTimeString() : '-'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${selectedDate.replace(/\//g, '-')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const totalStudents = students.length;
    const presentCount = attendance.length;
    const absentCount = totalStudents - presentCount;

    const studentList = students.map(student => {
        const record = attendance.find(r => r.studentId === student._id || r.studentId === student.id);
        return {
            ...student,
            status: record ? record.status : 'Absent',
            timestamp: record ? record.timestamp : null
        };
    });

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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Report</h1>
                            <p className="text-gray-500">Filter and export attendance records</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="date"
                                    value={new Date(selectedDate).toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value).toLocaleDateString())}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <Download size={20} />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-md text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Total Students</p>
                                <p className="text-4xl font-bold">{totalStudents}</p>
                            </div>
                            <FileText size={40} className="opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-md text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium mb-1">Present</p>
                                <p className="text-4xl font-bold">{presentCount}</p>
                            </div>
                            <div className="text-6xl font-bold opacity-20">{totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl shadow-md text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium mb-1">Absent</p>
                                <p className="text-4xl font-bold">{absentCount}</p>
                            </div>
                            <div className="text-6xl font-bold opacity-20">{totalStudents > 0 ? Math.round((absentCount / totalStudents) * 100) : 0}%</div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Student</th>
                                    <th className="p-4 font-semibold text-gray-600">Roll No</th>
                                    <th className="p-4 font-semibold text-gray-600">Course</th>
                                    <th className="p-4 font-semibold text-gray-600">Status</th>
                                    <th className="p-4 font-semibold text-gray-600">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentList.map((student) => (
                                    <tr key={student._id || student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            {student.photo ? (
                                                <img src={student.photo} alt="Student" className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-xs">
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-800">{student.firstName} {student.lastName}</span>
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
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReport;
