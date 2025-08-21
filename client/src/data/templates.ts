// src/data/templates.ts
import type { IQuizTemplate } from '../types/quiz'; // Make sure to add IQuizTemplate to types/quiz.ts
 // Make sure to add IQuizTemplate to types/quiz.ts

export const backgroundTemplates: IQuizTemplate[] = [
    {
        id: 0,
        name: "Purple Dream",
        preview: "/image/bg-1.png", // Use absolute paths from the public folder
        background: "/image/image1.svg",
        gradient: "from-purple-900/20 via-transparent to-blue-900/20",
        sidebarGradient: "from-purple-600/90 to-purple-800/90"
    },
    {
        id: 1,
        name: "Oceanic Blue",
        preview: "/image/bg-2.jpg",
        background: "/image/bg-2.jpg",
        gradient: "from-blue-900/20 via-transparent to-cyan-900/20",
        sidebarGradient: "from-blue-600/90 to-blue-800/90"
    },
    // Add other themes here
];