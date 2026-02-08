
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { ArrowLeft, ScanFace, CheckCircle, XCircle } from 'lucide-react';
import Button from '../components/Button';
import { loadModels, getFaceDescriptor, arrayToDescriptor } from '../utils/faceApi';

const Attendance = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedStudent, setScannedStudent] = useState(null);
    const [isLoadingModels, setIsLoadingModels] = useState(true);
    const [matchStatus, setMatchStatus] = useState('idle'); // idle, success, failed
    const [faceMatcher, setFaceMatcher] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                await loadModels();

                // Fetch students from backend
                const response = await fetch('http://localhost:5000/api/students');
                const students = await response.json();

                // Create FaceMatcher
                const labeledDescriptors = students
                    .filter(student => student.descriptor) // Only those with descriptors
                    .map(student => {
                        const descriptor = arrayToDescriptor(student.descriptor);
                        return new faceapi.LabeledFaceDescriptors(student._id, [descriptor]); // Use _id as label
                    });

                if (labeledDescriptors.length > 0) {
                    setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6)); // 0.6 distance threshold
                }

                setIsLoadingModels(false);
            } catch (error) {
                console.error("Initialization failed:", error);
                alert("Failed to initialize face recognition. Make sure backend is running.");
            }
        };
        init();
    }, []);

    const startScan = () => {
        setIsScanning(true);
        setScannedStudent(null);
        setMatchStatus('idle');

        // Auto-capture after 2 seconds
        setTimeout(() => {
            captureAndIdentify();
        }, 2000);
    };

    const captureAndIdentify = useCallback(async () => {
        if (webcamRef.current && faceMatcher) {
            try {
                const imageSrc = webcamRef.current.getScreenshot();

                // Detect face
                const descriptor = await getFaceDescriptor(imageSrc);

                // Match
                const bestMatch = faceMatcher.findBestMatch(descriptor);

                if (bestMatch.label !== 'unknown') {
                    // Fetch full student details
                    // We stored _id as label, so we can't get full details directly from matcher
                    // Let's refetch students or we should have stored them in state. 
                    // Better: just fetch specific student details now or filter from state if we kept it.
                    // For simplicity, let's fetch matching student from backend again or store in a map.
                    // Actually, we can just save attendance now.

                    // Mark Attendance
                    const response = await fetch('http://localhost:5000/api/attendance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentId: bestMatch.label,
                            confidence: bestMatch.distance
                        })
                    });

                    const record = await response.json();

                    // To show details, we need to fetch student info. 
                    // Ideally we should have a 'students' state map. 
                    // Let's do a quick fetch of all students again or optimization later.
                    // For now, let's just fetch all students to find this one (inefficient but works for demo).
                    const studentsRes = await fetch('http://localhost:5000/api/students');
                    const allStudents = await studentsRes.json();
                    const student = allStudents.find(s => s._id === bestMatch.label);

                    if (student) {
                        setScannedStudent(student);
                        setMatchStatus('success');
                    }
                } else {
                    setMatchStatus('failed');
                    alert("Face not recognized. Please register first.");
                }

            } catch (error) {
                console.error("Scan failed:", error);
                setMatchStatus('failed');
                // alert("No face detected or recognition failed.");
            } finally {
                setIsScanning(false);
            }
        } else if (!faceMatcher) {
            alert("No registered students found to match against.");
            setIsScanning(false);
        }
    }, [webcamRef, faceMatcher]);

    if (isLoadingModels) {
        return <div className="min-h-screen flex items-center justify-center">Loading Face Recognition Engine...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Scanner Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Face Scanner</h2>

                        <div className="relative rounded-lg overflow-hidden shadow-inner bg-black w-full aspect-video flex items-center justify-center mb-6">
                            {isScanning ? (
                                <>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 border-4 border-blue-500 opacity-50 animate-pulse"></div>
                                    <div className="absolute bottom-4 bg-black bg-opacity-70 text-white px-4 py-1 rounded-full text-sm">
                                        Scanning...
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <ScanFace size={64} className="mb-2 opacity-50" />
                                    <span>Ready to Scan</span>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={startScan}
                            className={`w-full ${isScanning ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                            disabled={isScanning}
                        >
                            {isScanning ? 'Scanning...' : 'Start Face Scan'}
                        </Button>

                        {matchStatus === 'failed' && (
                            <div className="mt-4 text-red-500 flex items-center gap-2">
                                <XCircle size={20} />
                                <span>No match found</span>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Details</h2>

                        {matchStatus === 'success' && scannedStudent ? (
                            <div className="animate-fade-in space-y-6">
                                <div className="flex flex-col items-center justify-center mb-6">
                                    {scannedStudent.photo ? (
                                        <img
                                            src={scannedStudent.photo}
                                            alt="Student Face"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-green-200 mb-4"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 border-4 border-green-200 mb-4">
                                            <CheckCircle size={48} />
                                        </div>
                                    )}
                                    <div className="text-green-600 font-bold flex items-center gap-2">
                                        <CheckCircle size={20} />
                                        Verified & Present
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-sm text-gray-500 block">Full Name</span>
                                        <span className="text-xl font-bold text-gray-900">
                                            {scannedStudent.firstName} {scannedStudent.lastName}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-sm text-gray-500 block">Roll No / ID</span>
                                        <span className="text-lg font-mono text-gray-900">
                                            {scannedStudent.rollNo || scannedStudent.id}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-sm text-gray-500 block">Course</span>
                                        <span className="text-lg text-gray-900">
                                            {scannedStudent.course}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center text-green-800 font-semibold">
                                    Attendance Recorded Successfully
                                    <div className="text-xs font-normal mt-1 opacity-75">
                                        {new Date().toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                                <ScanFace size={48} className="mb-4 opacity-50" />
                                <p>Scan a face to retrieve student details and mark attendance.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
