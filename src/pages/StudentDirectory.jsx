
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Search, User } from 'lucide-react';

const StudentDirectory = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/students');
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            try {
                const response = await fetch(`http://localhost:5000/api/students/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setStudents(students.filter(student => student._id !== id));
                    alert('Student deleted successfully');
                } else {
                    alert('Failed to delete student');
                }
            } catch (error) {
                console.error("Error deleting student:", error);
                alert('Error deleting student');
            }
        }
    };

    const filteredStudents = students.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        const rollNo = (student.rollNo || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || rollNo.includes(term);
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

                <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Directory</h1>
                        <p className="text-gray-500">Manage registered students</p>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or roll no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </header>

                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">Loading students...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map(student => (
                            <div key={student._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-6 flex flex-col items-center">
                                    <div className="relative mb-4">
                                        {student.photo ? (
                                            <img
                                                src={student.photo}
                                                alt={`${student.firstName} ${student.lastName}`}
                                                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 text-center mb-1">
                                        {student.firstName} {student.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-mono mb-4">{student.rollNo || student.id}</p>

                                    <div className="w-full space-y-2 text-sm text-gray-600 mb-6">
                                        <div className="flex justify-between">
                                            <span>Course:</span>
                                            <span className="font-medium">{student.course}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Mobile:</span>
                                            <span className="font-medium">{student.mobileNumber || '-'}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(student._id)}
                                        className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors w-full justify-center border border-red-200"
                                    >
                                        <Trash2 size={18} />
                                        Delete Student
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredStudents.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                No students found matching your search.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDirectory;
