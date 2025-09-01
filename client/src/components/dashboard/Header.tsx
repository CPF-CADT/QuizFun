import React from 'react';
import { PlusCircle, ArrowRight, BarChart3, Menu, FileText, BookOpen, Bug } from 'lucide-react';

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
  onNewQuizClick: () => void;
  onShowTemplatesClick: () => void;
  onPDFImportClick: () => void;
  onBugReportClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  setSidebarOpen,
  onNewQuizClick,
  onPDFImportClick,
  onShowTemplatesClick,
  onBugReportClick
}) => {
  return (
    <>
      {/* Mobile header - now more prominent */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-20">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Fun Quiz
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Desktop/Mobile content section with better mobile spacing */}
      <div className="mb-6 lg:mb-12 px-4 lg:ml-10 lg:px-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-5xl font-bold mb-2 lg:mb-3">
              <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-gray-600 text-base lg:text-lg xl:text-xl">Ready to inspire minds today?</p>
          </div>
        </div>

        {/* Responsive button grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 lg:gap-4">
          <button
            onClick={onNewQuizClick}
            className="group col-span-1 sm:col-span-2 lg:col-span-1 px-4 lg:px-6 xl:px-8 py-3 lg:py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl lg:rounded-2xl font-semibold shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-center lg:justify-start">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Quiz
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </button>

          <button
            onClick={onPDFImportClick}
            className="group px-4 lg:px-6 xl:px-8 py-3 lg:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl lg:rounded-2xl font-semibold shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/40 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-center lg:justify-start">
              <FileText className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Import from PDF</span>
              <span className="sm:hidden">Import PDF</span>
            </div>
          </button>

          <button
            onClick={onShowTemplatesClick}
            className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 text-gray-700 rounded-xl lg:rounded-2xl font-semibold hover:border-violet-300 hover:text-violet-700 hover:shadow-lg hover:bg-white transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-center lg:justify-start">
              <BookOpen className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">View Templates</span>
              <span className="sm:hidden">Templates</span>
            </div>
          </button>

          <button className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 text-gray-700 rounded-xl lg:rounded-2xl font-semibold hover:border-violet-300 hover:text-violet-700 hover:shadow-lg hover:bg-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center lg:justify-start">
              <BarChart3 className="w-5 h-5 mr-2" />
              Report
            </div>
          </button>

          <button
            onClick={onBugReportClick}
            className="group px-4 lg:px-6 xl:px-8 py-3 lg:py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl lg:rounded-2xl font-semibold shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/40 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-center lg:justify-start">
              <Bug className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Report a Bug</span>
              <span className="sm:hidden">Bug Report</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;