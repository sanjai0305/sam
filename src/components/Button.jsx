
import React from 'react';

const Button = ({ children, type = 'button', onClick, className = '' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 w-full ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
