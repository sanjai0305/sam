import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ClipboardCheck, LogOut, CheckSquare, Users, BarChart3 } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Student Management System</h1>
                        <p className="text-gray-600">Face Recognition Powered Attendance</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Student Register Card */}
                    <div
                        onClick={() => navigate('/student-register')}
                        className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 group border-t-4 border-blue-500"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-full mb-6 group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
                                <UserPlus size={48} className="text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Registration</h2>
                            <p className="text-gray-600">Register new students with face recognition</p>
                        </div>
                    </div>

                    {/* Take Attendance Card */}
                    <div
                        onClick={() => navigate('/attendance')}
                        className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 group border-t-4 border-green-500"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-full mb-6 group-hover:from-green-200 group-hover:to-green-300 transition-colors">
                                <ClipboardCheck size={48} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Take Attendance</h2>
                            <p className="text-gray-600">Mark attendance via face scan</p>
                        </div>
                    </div>

                    {/* Attendance List Card */}
                    <div
                        onClick={() => navigate('/attendance-list')}
                        className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 group border-t-4 border-purple-500"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-full mb-6 group-hover:from-purple-200 group-hover:to-purple-300 transition-colors">
                                <CheckSquare size={48} className="text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Today's Attendance</h2>
                            <p className="text-gray-600">View present/absent summary</p>
                        </div>
                    </div>

                    {/* Student Directory Card */}
                    <div
                        onClick={() => navigate('/directory')}
                        className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 group border-t-4 border-orange-500"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-full mb-6 group-hover:from-orange-200 group-hover:to-orange-300 transition-colors">
                                <Users size={48} className="text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Directory</h2>
                            <p className="text-gray-600">View and manage all students</p>
                        </div>
                    </div>

                    {/* Reports Card */}
                    <div
                        onClick={() => navigate('/reports')}
                        className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 group border-t-4 border-indigo-500"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-6 rounded-full mb-6 group-hover:from-indigo-200 group-hover:to-indigo-300 transition-colors">
                                <BarChart3 size={48} className="text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Attendance Reports</h2>
                            <p className="text-gray-600">Generate detailed reports with export</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
