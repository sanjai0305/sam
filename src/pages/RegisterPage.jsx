
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add registration logic here
        alert('Registration simulated! Check console for data.');
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6 tracking-wide">
                    Create Account
                </h2>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Username"
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <Input
                        label="Password"
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />

                    <div className="mt-8">
                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1 transition duration-200 shadow-lg">
                            Sign Up
                        </Button>
                    </div>
                </form>
                <p className="mt-4 text-center text-gray-600 text-sm">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
