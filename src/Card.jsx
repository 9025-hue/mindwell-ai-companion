import React from 'react';

// Reusable Card Component for Dashboard Sections
const Card = ({ title, description, children, large }) => {
    return (
        <div className={`bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl rounded-3xl shadow-3xl p-7 border border-gray-700 hover:border-purple-600 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-purple-glow flex flex-col ${large ? 'md:col-span-2' : ''}`}>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-wide drop-shadow-md">{title}</h2>
            <p className="text-gray-300 mb-6 text-lg opacity-90">{description}</p>
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
};

export default Card;