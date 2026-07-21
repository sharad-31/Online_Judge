import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { Play } from 'lucide-react';
import { io } from 'socket.io-client';
import axiosInstance from '../api/axiosInstance';
import { useNavbarVisibility } from '../context/NavbarVisibilityContext.jsx';
import './CodeEditorSection.css';

const defaultCode = {
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}',
  c: '#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}',
  java: 'class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
  python: 'def main():\n    pass\n\nif __name__ == "__main__":\n    main()'
};

const monacoLangMap = { cpp: 'cpp', c: 'c', java: 'java', python: 'python' };

function CodeEditorSection({ questionId }) {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(defaultCode.cpp);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const startTimeRef = useRef(Date.now());
  const socketRef = useRef(null);
  const { showNavbar } = useNavbarVisibility();

  // Socket setup
  useEffect(() => {
    // Connect karo
    socketRef.current = io('http://localhost:5000');

    // Room join karo
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id || user?._id;
    if (userId) {
      socketRef.current.emit('join', userId);
      console.log('Socket joined room:', userId);
    }

    // Verdict listen karo
    socketRef.current.on('verdict', (data) => {
      console.log('Verdict received via WebSocket:', data);
      setResult({ verdict: data.verdict, _id: data.submissionId });
      announceVerdict(data.verdict);
      setSubmitting(false);
      showNavbar();
    });

    // Cleanup — component unmount pe disconnect
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(defaultCode[lang]);
    setResult(null);
  };

  const announceVerdict = (verdict) => {
    switch (verdict) {
      case 'AC':
        toast.success('Accepted! 🎉');
        break;
      case 'CE':
        toast.error('Compilation Error ❌');
        break;
      case 'WA':
        toast.error('Wrong Answer ❌');
        break;
      case 'TLE':
        toast.error('Time Limit Exceeded ⏳');
        break;
      case 'RE':
        toast.error('Runtime Error ⚡');
        break;
      default:
        toast.error(`Verdict: ${verdict}`);
    }
  };


  const handleSubmit = async () => {
    if (!localStorage.getItem('token')) {
      toast.error('Please login to submit code');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setResult(null);
    const toastId = toast.loading('Running your code...');

    const codingTime = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    try {
      await axiosInstance.post('/submissions', {
        questionId,
        language,
        code,
        codingTime
      });

      toast.dismiss(toastId);
      toast.loading('Processing... ⏳');
      // setSubmitting(false) nahi karenge — socket verdict pe karega

    } catch (err) {
      toast.dismiss(toastId);
      setSubmitting(false);
      if (err.response?.status === 429) {
        toast.error('Cooldown active. Please wait before resubmitting.');
      } else {
        toast.error(err.response?.data?.message || 'Submission failed.');
      }
    }
  };

  return (
    <div className="submit-panel">
      <div className="submit-header">
        <select
          className="select lang-select"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
        </select>

        <button className="btn" onClick={handleSubmit} disabled={submitting}>
          <Play size={15} />
          {submitting ? 'Running...' : 'Submit'}
            </button>
            {submitting && (
            <button 
                className="btn btn-stop"
                onClick={() => {
                    setSubmitting(false);
                    toast.dismiss();
                    toast.error('Submission cancelled');
                }}
            >
                ✕ Stop
            </button>
          )}
      </div>

      <div className="editor-wrapper">
        <Editor
          width="100%"
          height="480px"
          language={monacoLangMap[language]}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 }
          }}
        />
      </div>

      {result && (
        <div className="card result-card fade-in">
          <div className="result-header">
            <span className={`badge badge-${result.verdict}`}>{result.verdict}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeEditorSection;