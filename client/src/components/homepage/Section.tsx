import React from 'react';

const ThemesSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Customize Your Quiz Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from beautiful themes that match your style and engage your students.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-8 justify-center">
            {[1, 2,3,4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-105 w-full max-w-[600px] aspect-[2/1]"
              >
                <img
                  src={`./image/image${i}.svg`}
                  alt="Quiz Themes"
                  className="w-full h-full rounded-lg object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThemesSection;