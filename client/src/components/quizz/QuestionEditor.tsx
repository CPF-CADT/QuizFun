import React from "react";
import { CheckCircle, Loader, Check, AlertCircle, Save } from "lucide-react";
import { QuestionConfigPanel, type QuestionType } from "./QuestionConfigPanel";
import type { IOption } from "../../types/quiz";
import { AutoGrowTextarea } from "../common/AutoGrowTextarea";

interface QuestionEditorProps {
  questionText: string;
  onQuestionTextChange: (value: string) => void;
  options: IOption[];
  onOptionTextChange: (index: number, value: string) => void;
  onCorrectOptionSelect: (index: number) => void;
  questionType: QuestionType;
  onQuestionTypeChange: (type: QuestionType) => void;
  points: number;
  onPointsChange: (points: number) => void;
  timeLimit: number;
  onTimeLimitChange: (time: number) => void;
  isEditing: boolean;
  questionNumber: number;
  imageUploaderComponent: React.ReactNode;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  // New props for manual save button
  isDirty: boolean;
  isFormValid: boolean;
  onImmediateSave: () => void;
}

const AutoSaveIndicator: React.FC<{ status: QuestionEditorProps['autoSaveStatus'] }> = ({ status }) => {
    if (status === 'idle') return null;
    const content = {
        saving: { icon: <Loader className="w-4 h-4 animate-spin" />, text: "Saving...", color: "text-gray-500" },
        saved: { icon: <Check className="w-4 h-4" />, text: "All changes saved", color: "text-green-600" },
        error: { icon: <AlertCircle className="w-4 h-4" />, text: "Save Error", color: "text-red-600" },
    };
    const { icon, text, color } = content[status];
    return (
        <div className={`flex items-center gap-2 text-sm transition-opacity duration-300 ${color}`}>
            {icon}
            <span>{text}</span>
        </div>
    );
};

export const QuestionEditor: React.FC<QuestionEditorProps> = (props) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start w-full max-w-7xl mx-auto">
      {/* Main Content Area */}
      <div className="flex-1 w-full lg:pr-8">
        <div className="bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-lg p-6 sm:p-10 shadow-2xl border border-white/40 mx-auto w-full rounded-2xl">
          <div className="flex flex-wrap justify-between items-center gap-y-2 mb-6">
             <h2 className="text-xl font-semibold text-gray-700">
                {props.isEditing ? `Editing Question` : `Question ${props.questionNumber}`}
             </h2>
             <div className="flex items-center gap-4">
                <AutoSaveIndicator status={props.autoSaveStatus} />
                {/* NEW: Manual Save Button */}
                {props.isEditing && (
                    <button
                        onClick={props.onImmediateSave}
                        disabled={!props.isDirty || !props.isFormValid || props.autoSaveStatus === 'saving'}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save size={14} />
                        Save
                    </button>
                )}
             </div>
          </div>
          
          <AutoGrowTextarea
            value={props.questionText}
            onChange={(e) => props.onQuestionTextChange(e.target.value)}
            placeholder="Start typing your question..."
            className="w-full text-center text-2xl sm:text-3xl bg-transparent outline-none placeholder-gray-400 font-medium text-gray-800 border-b-2 border-gray-200 focus:border-indigo-500 transition-colors pb-4 resize-none overflow-hidden"
          />

          <div className="mt-8 flex justify-center">
            {props.imageUploaderComponent}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full">
          {props.options.map((option, index) => (
            <div
              key={index}
              onClick={() => props.onCorrectOptionSelect(index)}
              className={`group relative bg-gradient-to-br backdrop-blur-lg p-6 shadow-xl border-2 rounded-2xl transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 cursor-pointer ${
                option.isCorrect
                  ? "from-green-100/95 to-green-50/90 border-green-400"
                  : "from-white/95 to-white/85 border-white/50 hover:border-indigo-300"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all flex-shrink-0 ${
                    option.isCorrect
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 group-hover:border-indigo-400"
                  }`}
                >
                  {option.isCorrect && (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => props.onOptionTextChange(index, e.target.value)}
                  placeholder={props.questionType === "Multiple Choice" ? `Answer ${index + 1}...` : ""}
                  readOnly={props.questionType === "True/False"}
                  className="w-full text-lg bg-transparent outline-none placeholder-gray-400 text-gray-700 font-medium"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0">
        <QuestionConfigPanel
            questionType={props.questionType}
            onQuestionTypeChange={props.onQuestionTypeChange}
            points={props.points}
            onPointsChange={props.onPointsChange}
            timeLimit={props.timeLimit}
            onTimeLimitChange={props.onTimeLimitChange}
        />
      </div>
    </div>
  );
};