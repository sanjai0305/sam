import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { ArrowLeft, Camera, RefreshCw, Smartphone, Shield } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { loadModels, getFaceDescriptor, descriptorToArray } from '../utils/faceApi';

const StudentRegister = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isLoadingModels, setIsLoadingModels] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobileNumber: '',
        dob: '',
        rollNo: '',
        email: '',
        course: ''
    });

    useEffect(() => {
        const initModels = async () => {
            try {
                await loadModels();
                setIsLoadingModels(false);
            } catch (error) {
                console.error("Failed to load models:", error);
                alert("Failed to load face recognition models. Please refresh.");
            }
        };
        initModels();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFetchByEmail = async () => {
        if (!formData.email) {
            alert('Please enter an email address to search.');
            return;
        }

        setIsFetching(true);
        try {
            const response = await fetch(`http://localhost:5000/api/students?email=${formData.email}`);
            const data = await response.json();

            if (response.ok) {
                // Populate form with fetched data
                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    mobileNumber: data.mobileNumber || '',
                    dob: data.dob || '',
                    rollNo: data.rollNo || '',
                    email: data.email || '',
                    course: data.course || ''
                });
                if (data.photo) {
                    setImgSrc(data.photo);
                }
                alert('Student data fetched successfully!');
            } else {
                alert(data.error || 'Student not found.');
            }
        } catch (error) {
            console.error("Error fetching student:", error);
            alert('Failed to fetch student data.');
        } finally {
            setIsFetching(false);
        }
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        setIsCameraOpen(false);
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
        setIsCameraOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imgSrc) {
            alert('Please capture a face photo first!');
            return;
        }

        setIsProcessing(true);
        try {
            const descriptor = await getFaceDescriptor(imgSrc);
            const descriptorArray = descriptorToArray(descriptor);

            const studentData = {
                ...formData,
                photo: imgSrc,
                id: formData.rollNo || `STU-${Date.now()}`,
                descriptor: descriptorArray
            };

            const response = await fetch('http://localhost:5000/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle duplicate registration errors
                if (data.duplicate) {
                    let errorMessage = '🚫 Duplicate Registration Detected!\n\n';

                    if (data.field === 'mobile') {
                        errorMessage += `This mobile number is already registered.\n`;
                        if (data.existingStudent) {
                            errorMessage += `Registered to: ${data.existingStudent.name}\n`;
                            errorMessage += `Roll No: ${data.existingStudent.rollNo}`;
                        }
                    } else if (data.field === 'rollNo') {
                        errorMessage += `This roll number is already taken.`;
                    } else if (data.field === 'email') {
                        errorMessage += `This email is already registered.`;
                    } else if (data.field === 'face') {
                        errorMessage += `This face is already registered in the system!\n`;
                        if (data.existingStudent) {
                            errorMessage += `\nMatched with: ${data.existingStudent.name}\n`;
                            errorMessage += `Roll No: ${data.existingStudent.rollNo}\n`;
                            errorMessage += `Similarity: ${data.existingStudent.similarity}`;
                        }
                        errorMessage += `\n\n⚠️ Each person can only register once.`;
                    }

                    alert(errorMessage);
                } else {
                    alert(data.error || 'Registration failed');
                }
                return;
            }

            alert('✅ Student Registered Successfully with Face ID!');
            navigate('/dashboard');

        } catch (error) {
            console.error(error);
            alert(error.message || 'Registration failed. Try simpler face photo.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoadingModels) {
        return <div className="min-h-screen flex items-center justify-center">Loading Face Recognition Models...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Register New Student</h2>

                    {/* Face Capture Section */}
                    <div className="mb-8 flex flex-col items-center">
                        {imgSrc ? (
                            <div className="relative">
                                <img src={imgSrc} alt="Captured face" className="rounded-lg shadow-md max-w-xs border-4 border-green-500" />
                                <button
                                    onClick={retake}
                                    className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                                    title="Retake Photo"
                                >
                                    <RefreshCw size={20} className="text-gray-700" />
                                </button>
                            </div>
                        ) : isCameraOpen ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative rounded-lg overflow-hidden shadow-md max-w-xs bg-black">
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full"
                                    />
                                </div>
                                <Button onClick={capture} className="w-auto flex items-center gap-2">
                                    <Camera size={20} />
                                    Capture Photo
                                </Button>
                            </div>
                        ) : (
                            <div
                                onClick={() => setIsCameraOpen(true)}
                                className="w-64 h-48 bg-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-400"
                            >
                                <Camera size={48} className="text-gray-500 mb-2" />
                                <span className="text-gray-600 font-medium">Click to Enable Camera</span>
                            </div>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                            {isProcessing ? "Processing face data..." : (imgSrc ? "Face captured successfully" : "Face scan required for registration")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="First Name" type="text" placeholder="John" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            <Input label="Last Name" type="text" placeholder="Doe" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        </div>

                        {/* Mobile Number without OTP Verification */}
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Smartphone size={18} className="text-blue-600" />
                                Mobile Number
                            </label>

                            <div className="flex gap-2 mb-3">
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit mobile"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    maxLength="10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                            <Input label="Student Roll Number" type="text" placeholder="Roll No (e.g., 2024CS001)" name="rollNo" value={formData.rollNo} onChange={handleChange} required />
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input label="Email" type="email" placeholder="john.doe@example.com" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="flex items-end mb-1">
                                <button
                                    type="button"
                                    onClick={handleFetchByEmail}
                                    disabled={isFetching}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors h-[42px]"
                                >
                                    {isFetching ? 'Fetching...' : 'Fetch Details'}
                                </button>
                            </div>
                        </div>
                        <Input label="Course" type="text" placeholder="Computer Science" name="course" value={formData.course} onChange={handleChange} required />

                        <div className="mt-8">
                            <Button type="submit" disabled={isProcessing}>
                                {isProcessing ? 'Registering...' : 'Register Student'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentRegister;
