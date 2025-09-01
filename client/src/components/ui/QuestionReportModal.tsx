// src/components/ui/QuestionReportModal.tsx

import React, { useState } from "react";
import { X, Flag, Send } from "lucide-react";
import { quizApi, type IReportQuestionPayload } from "../../service/quizApi"; // Adjust path if needed

interface QuestionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  question: { id: string; text: string };
}

const reportReasons: { id: IReportQuestionPayload["reason"]; label: string }[] =
  [
    { id: "incorrect_answer", label: "The correct answer is wrong" },
    { id: "unclear_wording", label: "The question is confusing or unclear" },
    { id: "typo", label: "There is a typo in the question/answers" },
    { id: "inappropriate_content", label: "This content is inappropriate" },
    { id: "other", label: "Other issue" },
  ];

export const QuestionReportModal: React.FC<QuestionReportModalProps> = ({
  isOpen,
  onClose,
  quizId,
  question,
}) => {
  const [selectedReason, setSelectedReason] = useState<
    IReportQuestionPayload["reason"] | null
  >(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setError("Please select a reason for your report.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await quizApi.reportQuestion({
        quizId,
        questionId: question.id,
        reason: selectedReason,
        comment,
      });
      setSuccess("Report submitted successfully! Thank you.");
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to submit report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setComment("");
    setError("");
    setSuccess("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-white/20 rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Flag className="text-red-400" /> Report Question
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-400 mb-2">You are reporting:</p>
        <p className="bg-black/20 p-3 rounded-lg text-gray-200 font-medium truncate mb-6">
          {question.text}
        </p>

        {success ? (
          <div className="text-center p-4 bg-green-500/20 text-green-300 rounded-lg">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mb-4">
              {reportReasons.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                    selectedReason === reason.id
                      ? "bg-indigo-500/30 border-indigo-400"
                      : "bg-gray-700/50 border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id)}
                    required
                  />
                  <span className="ml-3 text-white">{reason.label}</span>
                </label>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional: Add more details here..."
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition mb-4"
              rows={3}
            />

            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} /> Submit Report
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
