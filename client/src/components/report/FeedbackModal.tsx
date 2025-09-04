// FILE: src/components/report/FeedbackModal.tsx
import React, { useState, useEffect, useCallback } from "react";
import { reportApi, type IFeedback } from "../../service/reportApi";
import { FeelingRating } from "../common/FeelingRating";
import { X, Loader, Inbox, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string | null;
}

const LIMIT = 5;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, quizId }) => {
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async (pageNum: number, id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await reportApi.getQuizFeedback(id, pageNum, LIMIT);
      const { feedbacks: newFeedbacks, totalPages } = response.data;

      setFeedbacks(prev => [...prev, ...newFeedbacks]);
      setHasMore(pageNum < totalPages);
    } catch (err) {
      setError("Could not load feedback.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load or when quiz changes
  useEffect(() => {
    if (isOpen && quizId) {
      setFeedbacks([]);
      setPage(1);
      setHasMore(true);
      fetchFeedback(1, quizId);
    }
  }, [isOpen, quizId, fetchFeedback]);

  const handleLoadMore = () => {
    if (quizId && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeedback(nextPage, quizId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex justify-center items-center z-50 p-4 bg-black/40"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative overflow-hidden"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.8, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ rotate: 90, scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </motion.button>

            {/* Title */}
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
              <Smile size={28} /> Player Feedback <Smile size={28} />
            </h2>

            {/* Feedback List */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {feedbacks.length > 0 &&
                feedbacks.map((fb, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-gradient-to-tr from-pink-50 via-purple-50 to-indigo-50 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-transform"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <FeelingRating rating={fb.rating} />
                    {fb.comment && (
                      <p className="text-gray-700 mt-2 italic leading-relaxed">
                        {fb.comment}
                      </p>
                    )}
                  </motion.div>
                ))}

              {/* Loading */}
              {loading && (
                <div className="flex justify-center py-4">
                  <Loader className="text-gray-600 w-8 h-8 animate-spin" />
                </div>
              )}

              {/* Empty State */}
              {!loading && feedbacks.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <Inbox size={48} className="mx-auto mb-3" />
                  <p className="font-medium text-lg">No feedback yet</p>
                  <p className="text-sm">Be the first to share your thoughts!</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-red-500 text-center font-medium">{error}</p>
              )}

              {/* Load More Button */}
              {!loading && hasMore && feedbacks.length > 0 && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleLoadMore}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// // FILE: src/components/report/FeedbackModal.tsx

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { reportApi, type IFeedback } from "../../service/reportApi";
// import { FeelingRating } from "../common/FeelingRating";
// import { X, Loader, Inbox } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// interface FeedbackModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   quizId: string | null;
// }

// const LIMIT = 5;

// export const FeedbackModal: React.FC<FeedbackModalProps> = ({
//   isOpen,
//   onClose,
//   quizId,
// }) => {
//   const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const fetchFeedback = useCallback(async (pageNum: number, id: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await reportApi.getQuizFeedback(id, pageNum, LIMIT);
//       const { feedbacks: newFeedbacks, totalPages } = response.data;

//       setFeedbacks((prev) =>
//         pageNum === 1 ? newFeedbacks : [...prev, ...newFeedbacks]
//       );
//       setHasMore(pageNum < totalPages);
//     } catch (err) {
//       setError("Could not load feedback.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Initial load
//   useEffect(() => {
//     if (isOpen && quizId) {
//       setFeedbacks([]);
//       setPage(1);
//       setHasMore(true);
//       fetchFeedback(1, quizId);
//     }
//   }, [isOpen, quizId, fetchFeedback]);

//   // Infinite scroll observer
//   useEffect(() => {
//     if (!containerRef.current || !hasMore || loading) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           const nextPage = page + 1;
//           setPage(nextPage);
//           if (quizId) fetchFeedback(nextPage, quizId);
//         }
//       },
//       { root: containerRef.current, threshold: 1.0 }
//     );

//     const sentinel = document.getElementById("scroll-sentinel");
//     if (sentinel) observer.observe(sentinel);

//     return () => {
//       if (sentinel) observer.unobserve(sentinel);
//     };
//   }, [feedbacks, hasMore, loading, page, quizId, fetchFeedback]);

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           className="fixed inset-0 flex justify-center items-center z-50 p-4 bg-black/40 backdrop-blur-sm"
//           onClick={onClose}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative overflow-hidden"
//              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
//             initial={{ scale: 0.8, y: 100, opacity: 0 }}
//             animate={{ scale: 1, y: 0, opacity: 1 }}
//             exit={{ scale: 0.8, y: 100, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 120, damping: 15 }}
//           >
//             {/* Close Button */}
//             <motion.button
//               onClick={onClose}
//               whileHover={{ rotate: 90, scale: 1.2 }}
//               whileTap={{ scale: 0.9 }}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               <X size={24} />
//             </motion.button>

//             {/* Title */}
//             <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
//               🎉 Player Feedback 🎉
//             </h2>

//             {/* Feedback List */}
//             <div
//               ref={containerRef}
//               className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
//             >
//               {feedbacks.length > 0 &&
//                 feedbacks.map((fb, idx) => (
//                   <motion.div
//                     key={idx}
//                     className="bg-gradient-to-tr from-pink-50 via-purple-50 to-indigo-50 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-transform"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: idx * 0.05 }}
//                   >
//                     <FeelingRating rating={fb.rating} />
//                     {fb.comment && (
//                       <p className="text-gray-700 mt-2 italic leading-relaxed">
//                         “{fb.comment}”
//                       </p>
//                     )}
//                   </motion.div>
//                 ))}

//               {/* Loading */}
//               {loading && (
//                 <div className="flex justify-center py-4">
//                   <motion.div
//                     animate={{ rotate: 360 }}
//                     transition={{
//                       repeat: Infinity,
//                       duration: 1,
//                       ease: "linear",
//                     }}
//                   >
//                     <Loader className="text-gray-600" size={28} />
//                   </motion.div>
//                 </div>
//               )}

//               {/* Sentinel for infinite scroll */}
//               <div id="scroll-sentinel" />

//               {/* Empty State */}
//               {!loading && feedbacks.length === 0 && (
//                 <motion.div
//                   className="text-center py-10 text-gray-400"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                 >
//                   <motion.div
//                     animate={{ y: [0, -5, 0] }}
//                     transition={{ repeat: Infinity, duration: 1.5 }}
//                   >
//                     <Inbox size={48} className="mx-auto mb-3" />
//                   </motion.div>
//                   <p className="font-medium text-lg">No feedback yet 🚀</p>
//                   <p className="text-sm">Be the first to share your thoughts!</p>
//                 </motion.div>
//               )}

//               {/* Error */}
//               {error && (
//                 <motion.p
//                   className="text-red-500 text-center font-medium"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                 >
//                   {error}
//                 </motion.p>
//               )}
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };
