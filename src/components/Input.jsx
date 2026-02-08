
import React from 'react';

const Input = ({ label, type, placeholder, id, name, onChange, value }) => {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
                {label}
            </label>
            <input
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                onChange={onChange}
                value={value}
            />
        </div>
    );
};

export default Input;
