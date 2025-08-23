import React from 'react';
import { X, Download, FileText } from 'lucide-react';

const templates = [
  { 
    name: 'Standard Q&A', 
    description: 'Best for Q1, Q2... formats with A, B, C... options.', 
    url: 'https://docs.google.com/document/d/1EqsutTXBi6EfR3hkz161zb1MaKntrr2_/edit?usp=sharing&ouid=111846585569576088981&rtpof=true&sd=true',
    filename: 'Standard_Quiz_Template.docx' 
  },
  { 
    name: 'Numbered List', 
    description: 'Ideal for 1., 2... formats with a, b, c... options.', 
    url: 'https://docs.google.com/document/d/10RbZxhpeOGlLf_br-jSldfc28aQv3kD6/edit?usp=sharing&ouid=111846585569576088981&rtpof=true&sd=true',
    filename: 'Numbered_Quiz_Template.docx' 
  },
  { 
    name: 'Simple & Flexible', 
    description: 'A flexible mix of question and answer styles.', 
    url: 'https://docs.google.com/document/d/1d_3ZVHenxjQjhVpOYHHyngqQ7w1ufWBa/edit?usp=drive_link&ouid=111846585569576088981&rtpof=true&sd=true',
    filename: 'Simple_Quiz_Template.docx' 
  }
];

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Template Library</h2>
        <p className="text-gray-500 mb-6">Download a DOC template to easily format your questions for import.</p>
        
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.name} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-indigo-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-700">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
              </div>
              
              <a
                href={template.url}
                download={template.filename}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Download size={16} />
                Download DOC
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
