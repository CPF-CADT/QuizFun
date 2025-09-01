import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import QuizHistory from '../components/quizz/QuizHistory';

const QuizHistoryPage: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection] = useState("quiz-history");
    const [currentTime] = useState(new Date());

    return (
        <div className="flex min-h-screen">
            <Sidebar 
                activeSection={activeSection} 
                setActiveSection={() => {}} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                currentTime={currentTime} 
            />
            
            <div className="flex-1 relative z-10">
                <QuizHistory />
            </div>
        </div>
    );
};

export default QuizHistoryPage;