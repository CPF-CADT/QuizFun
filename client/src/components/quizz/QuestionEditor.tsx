import React from "react";
import { CheckCircle } from "lucide-react";
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
  // This prop will receive the fully built ImageUploader component
  imageUploaderComponent: React.ReactNode;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = (props) => {
  return (
    <div className="flex justify-between items-start w-full">
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Question Input Form */}
        <div className="bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-lg p-10 shadow-2xl border border-white/40 mx-auto max-w-4xl mt-10 rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            {props.isEditing
              ? `Editing Question`
              : `Question ${props.questionNumber}`}
          </h2>
          <AutoGrowTextarea
            value={props.questionText}
            onChange={(e) => props.onQuestionTextChange(e.target.value)}
            placeholder="Start typing your question..."
            className="w-full text-center text-3xl bg-transparent outline-none placeholder-gray-400 font-medium text-gray-800 border-b-2 border-gray-200 focus:border-indigo-500 transition-colors pb-4 resize-none overflow-hidden"
          />

          {/* Render the ImageUploader component passed via props */}
          <div className="mt-8 flex justify-center">
            {props.imageUploaderComponent}
          </div>
        </div>

        {/* Answer Options Grid */}
        <div className="grid grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
          {props.options.map((option, index) => (
            <div
              key={index}
              onClick={() => props.onCorrectOptionSelect(index)}
              className={`group relative bg-gradient-to-br backdrop-blur-lg p-8 shadow-xl border-2 rounded-2xl transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 cursor-pointer ${
                option.isCorrect
                  ? "from-green-100/95 to-green-50/90 border-green-400"
                  : "from-white/95 to-white/85 border-white/50 hover:border-indigo-300"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
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
                  onChange={(e) =>
                    props.onOptionTextChange(index, e.target.value)
                  }
                  placeholder={
                    props.questionType === "Multiple Choice"
                      ? `Answer ${index + 1}...`
                      : ""
                  }
                  readOnly={props.questionType === "True/False"}
                  className="w-full text-lg bg-transparent outline-none placeholder-gray-400 text-gray-700 font-medium"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Panel */}
      <QuestionConfigPanel
        questionType={props.questionType}
        onQuestionTypeChange={props.onQuestionTypeChange}
        points={props.points}
        onPointsChange={props.onPointsChange}
        timeLimit={props.timeLimit}
        onTimeLimitChange={props.onTimeLimitChange}
      />
    </div>
  );
};