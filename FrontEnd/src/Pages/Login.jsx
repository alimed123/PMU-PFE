import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import umbblogo from '../assets/umbblogo.png' // <-- Import the image


const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.username === 'inelec' && formData.password === 'inelec123') {
            setError('');
            localStorage.setItem('isLoggedIn', 'true'); // Save login state
            navigate('/dashboard'); // Redirect to dashboard
        } else {
            setError('Invalid credentials');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen flex items-center  justify-center bg-backgroundlight">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <div className="flex justify-center items-center pb-4 rounded-t-lg">
                    <img src={umbblogo} alt="Logo" className="h-16 w-16" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Login</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;