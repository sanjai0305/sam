
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
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
        console.log('Login submitted:', formData);
        // Simulate login success
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6 tracking-wide">
                    Welcome Back
                </h2>
                <form onSubmit={handleSubmit}>
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
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <div className="mt-8">
                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1 transition duration-200 shadow-lg">
                            Sign In
                        </Button>
                    </div>
                </form>
                <p className="mt-4 text-center text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <a href="/register" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
