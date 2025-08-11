import React from 'react';
const CreateQuiz: React.FC = () => {
    return (
        <div className='bg-white/10 backdrop-blur-md min-h-screen flex'>
            <div className='bg-purple-600 backdrop-blur-md p-8 shadow-2xl border border-white/20 w-1/5'>
            <div className='text-center mb-8 justify-center items-center flex flex-col'>
            <h1 className='text-center text-2xl text-white'>Quiz slide</h1>
            <div className ='w-16 h-16 bg-white mt-10'>
                </div>
            </div>
            </div>
        </div>
    );
};

export default CreateQuiz;