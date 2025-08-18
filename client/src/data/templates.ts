// src/data/templates.ts
import type { IQuizTemplate } from '../types/quiz'; // Make sure to add IQuizTemplate to types/quiz.ts
 // Make sure to add IQuizTemplate to types/quiz.ts

export const backgroundTemplates: IQuizTemplate[] = [
    {
        id: 0,
        name: "Purple Dream",
        preview: "/image/theme1.jpg", // Use absolute paths from the public folder
        background: "/image/theme1.jpg",
        gradient: "from-purple-900/20 via-transparent to-blue-900/20",
        sidebarGradient: "from-purple-600/90 to-purple-800/90"
    },
    {
        id: 1,
        name: "Oceanic Blue",
        preview: "/image/theme2.jpg",
        background: "/image/theme2.jpg",
        gradient: "from-blue-900/20 via-transparent to-cyan-900/20",
        sidebarGradient: "from-blue-600/90 to-blue-800/90"
    },
    // Add other themes here
];