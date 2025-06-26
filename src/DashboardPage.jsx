import React, { useContext } from 'react';
import { AppContext } from './App'; // AppContext exported from App.jsx

// Import other components used on the dashboard
import Card from './Card'; // Reusable Card component
import Chatbot from './Chatbot'; // Chatbot component
import JournalEntry from './JournalEntry'; // Journal component
import ImageGenerator from './ImageGenerator'; // Image Generator component
import MeditationSection from './MeditationSection'; // Meditation component
import SupportSection from './SupportSection'; // Support section component

const DashboardPage = ({ onLogout }) => {
    const { userId, setMessage, auth } = useContext(AppContext);

    // Handles ending the session (for both authenticated and guest users)
    const handleEndSession = async () => {
        try {
            if (auth && auth.currentUser) {
                await auth.signOut(); // Sign out from Firebase
                setMessage('You have been signed out.');
            } else {
                setMessage('Session ended.');
            }
            onLogout(); // Navigate back to the login page
        } catch (error) {
            console.error("Error during logout:", error);
            setMessage(`Logout failed: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-6 relative z-10">
            <header className="w-full max-w-5xl text-center py-8">
                <h1 className="text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg animate-fadeInDown">
                    MindWell AI Dashboard
                </h1>
                {userId && <p className="text-gray-300 mt-4 text-xl opacity-90 animate-fadeInUp">Welcome, <span className="font-bold text-purple-300">{userId.substring(0, 8)}...</span>!</p>}

                {/* Logout/End Session button */}
                <button
                    onClick={handleEndSession}
                    className="mt-6 bg-red-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75 flex items-center justify-center mx-auto text-base"
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"></path></svg>
                    End Session
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mt-12">
                {/* Chatbot Section */}
                <Card title="Chat with AI" description="Get supportive responses and empathetic advice.">
                    <Chatbot />
                </Card>

                {/* Journal Entry Section */}
                <Card title="Voice & Text Journal" description="Record or type your thoughts with intuitive features.">
                    <JournalEntry />
                </Card>

                {/* Image Generation Section */}
                <Card title="Inspiring Images" description="Generate calming and uplifting visuals from your prompts.">
                    <ImageGenerator />
                </Card>

                {/* Meditation Section */}
                <Card title="Meditation Space" description="Find calm and focus through guided practices and timers." large={true}>
                    <MeditationSection />
                </Card>

                {/* Support Section */}
                <Card title="User Support & Resources" description="Find answers to FAQs and essential external support." large={true}>
                    <SupportSection />
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;