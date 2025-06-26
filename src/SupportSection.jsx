import React, { useState } from 'react';

const SupportSection = () => {
    const [openSection, setOpenSection] = useState(null); // State to manage which section is open

    const toggleSection = (sectionName) => {
        setOpenSection(openSection === sectionName ? null : sectionName);
    };

    return (
        <div className="w-full text-white">
            {/* FAQ Section */}
            <div className="mb-4 bg-gray-800 rounded-lg shadow-md">
                <button
                    className="w-full text-left p-4 flex justify-between items-center bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors hover:bg-gray-600"
                    onClick={() => toggleSection('faq')}
                >
                    <h3 className="text-xl font-bold">Frequently Asked Questions (FAQ)</h3>
                    <svg className={`w-6 h-6 transform transition-transform ${openSection === 'faq' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                {openSection === 'faq' && (
                    <div className="p-4 bg-gray-800 rounded-b-lg border-t border-gray-700">
                        <h4 className="font-semibold text-lg mb-2">How do I use the Chat with AI feature?</h4>
                        <p className="mb-4 text-gray-300">
                            Simply type your message into the input box and press Enter or click the send button. You can also click the microphone icon to speak your message, and it will be transcribed into the input field. The AI is designed to offer supportive and empathetic responses.
                        </p>
                        <h4 className="font-semibold text-lg mb-2">What is the Voice Journal for?</h4>
                        <p className="mb-4 text-gray-300">
                            The Voice Journal allows you to record your thoughts and feelings using your voice. The app will transcribe your speech into text, creating a digital journal entry for your reflection. Remember, data is currently stored only for the current session.
                        </p>
                        <h4 className="font-semibold text-lg mb-2">How can I generate inspiring images?</h4>
                        <p className="mb-4 text-gray-300">
                            In the "Inspiring Images" section, type a descriptive prompt (e.g., "calm forest with soft light," "peaceful sunset over mountains") into the input field and click "Generate Image." The AI will create a visual based on your description.
                        </p>
                        <h4 className="font-semibold text-lg mb-2">My microphone isn't working. What should I do?</h4>
                        <p className="text-gray-300">
                            If you encounter a "Microphone access denied" error, please check your browser's site settings to ensure that microphone access is granted for this application. You might need to refresh the page after adjusting permissions.
                        </p>
                    </div>
                )}
            </div>

            {/* Wellness Tips Section */}
            <div className="mb-4 bg-gray-800 rounded-lg shadow-md">
                <button
                    className="w-full text-left p-4 flex justify-between items-center bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors hover:bg-gray-600"
                    onClick={() => toggleSection('tips')}
                >
                    <h3 className="text-xl font-bold">Wellness Tips</h3>
                    <svg className={`w-6 h-6 transform transition-transform ${openSection === 'tips' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                {openSection === 'tips' && (
                    <div className="p-4 bg-gray-800 rounded-b-lg border-t border-gray-700">
                        <p className="mb-4 text-gray-300">Here are some general tips for promoting mental wellness:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                            <li>**Mindful Breathing:** Take a few deep breaths when feeling overwhelmed. Inhale slowly through your nose, hold for a count, and exhale slowly through your mouth.</li>
                            <li>**Stay Connected:** Reach out to friends, family, or support groups. Sharing your feelings can be incredibly helpful.</li>
                            <li>**Regular Exercise:** Physical activity can significantly boost your mood and reduce stress. Even a short walk can make a difference.</li>
                            <li>**Balanced Diet:** Fuel your body with nutritious foods. What you eat can affect your energy levels and mood.</li>
                            <li>**Sufficient Sleep:** Aim for 7-9 hours of quality sleep per night. Sleep deprivation can impact your mental state.</li>
                            <li>**Limit Screen Time:** Take breaks from digital devices, especially before bedtime.</li>
                            <li>**Engage in Hobbies:** Dedicate time to activities you enjoy and that bring you a sense of accomplishment or relaxation.</li>
                            <li>**Practice Gratitude:** Regularly reflect on things you are thankful for. This can shift your perspective positively.</li>
                        </ul>
                    </div>
                )}
            </div>

            {/* External Resources Section */}
            <div className="bg-gray-800 rounded-lg shadow-md">
                <button
                    className="w-full text-left p-4 flex justify-between items-center bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors hover:bg-gray-600"
                    onClick={() => toggleSection('resources')}
                >
                    <h3 className="text-xl font-bold">External Resources</h3>
                    <svg className={`w-6 h-6 transform transition-transform ${openSection === 'resources' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                {openSection === 'resources' && (
                    <div className="p-4 bg-gray-800 rounded-b-lg border-t border-gray-700">
                        <p className="mb-4 text-gray-300">If you are in distress or need professional help, please reach out to these resources:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                            <li>
                                **South African Depression and Anxiety Group (SADAG)**:
                                <br />
                                <a href="https://www.sadag.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Website</a> | Helpline: 0800 21 22 23 (8am-8pm), 0800 456 789 (24hr), or SMS 31393
                            </li>
                            <li>
                                **Lifeline Southern Africa**:
                                <br />
                                <a href="https://www.lifeline.org.za/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Website</a> | Crisis Line: 0861 322 322
                            </li>
                            <li>
                                **Childline South Africa**: (for children and concerned adults)
                                <br />
                                <a href="https://www.childline.org.za/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Website</a> | Helpline: 08000 55 555
                            </li>
                            <li>
                                **National Institute of Mental Health (NIMH) - US (General Info)**:
                                <br />
                                <a href="https://www.nimh.nih.gov/health/find-help/index.shtml" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Find Help</a>
                            </li>
                        </ul>
                        <p className="mt-4 italic text-gray-400">
                            Disclaimer: MindWell AI is a support tool and not a substitute for professional medical advice, diagnosis, or treatment. If you are experiencing a mental health crisis, please contact a qualified healthcare professional or emergency services immediately.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportSection;