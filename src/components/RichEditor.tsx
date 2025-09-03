import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import dynamique de ReactQuill pour éviter les problèmes SSR
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
});

// Import des styles Quill
import 'react-quill/dist/quill.snow.css';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  readOnly?: boolean;
}

export default function RichEditor({ 
  value, 
  onChange, 
  placeholder = "Commencez à écrire votre article...",
  height = "300px",
  readOnly = false 
}: RichEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuration des modules Quill
  const modules = {
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  if (!mounted) {
    return <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>;
  }

  return (
    <div className="rich-editor-container">
      <style jsx global>{`
        .rich-editor-container .ql-container {
          min-height: ${height};
          font-family: inherit;
        }
        
        .rich-editor-container .ql-editor {
          min-height: ${height};
          font-size: 16px;
          line-height: 1.6;
        }
        
        .rich-editor-container .ql-toolbar {
          border-top: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          background: #f8fafc;
        }
        
        .rich-editor-container .ql-container {
          border-bottom: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 8px 8px;
          background: white;
        }
        
        .rich-editor-container .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        
        .rich-editor-container .ql-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        
        .rich-editor-container .ql-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        
        .rich-editor-container .ql-editor h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        
        .rich-editor-container .ql-editor blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          background: #f8fafc;
          padding: 1em;
          border-radius: 0 8px 8px 0;
        }
        
        .rich-editor-container .ql-editor code {
          background: #f1f5f9;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: 'Monaco', 'Consolas', monospace;
        }
        
        .rich-editor-container .ql-editor pre {
          background: #1e293b;
          color: #f1f5f9;
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
        }
        
        .rich-editor-container .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
        
        .rich-editor-container .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .rich-editor-container .ql-editor a:hover {
          color: #1d4ed8;
        }
      `}</style>
      
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
} 