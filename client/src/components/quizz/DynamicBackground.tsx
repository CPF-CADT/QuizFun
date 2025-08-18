// src/components/quiz/DynamicBackground.tsx
import React from 'react';
import type { IQuizTemplate } from '../../types/quiz'; // Make sure this type is defined
 // Make sure this type is defined

interface DynamicBackgroundProps {
    template: IQuizTemplate;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ template }) => (
    <div className='absolute inset-0'>
        <img
            src={template.background}
            alt="Background"
            className='absolute inset-0 object-cover w-full h-full opacity-90'
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient}`}></div>
    </div>
);

export default DynamicBackground;
