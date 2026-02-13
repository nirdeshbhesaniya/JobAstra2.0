import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Copy, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CodeEditor = ({
    question,
    value,
    onChange,
    readOnly = false,
    showOutput = true
}) => {
    const [code, setCode] = useState(value || question.template || '');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState(question.programmingLanguage || 'javascript');
    const [theme, setTheme] = useState('vs-dark');
    const [copied, setCopied] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (value !== undefined) {
            setCode(value);
        }
    }, [value]);

    const handleEditorChange = (newValue) => {
        setCode(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleRunCode = async () => {
        try {
            setIsRunning(true);
            setOutput('Running code...\n');

            const response = await axios.post(`${backendUrl}/test/execute-code`, {
                code,
                language,
                testCases: question.testCases || []
            });

            if (response.data.success) {
                setOutput(response.data.output);
            } else {
                setOutput(`Error: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error executing code:', error);
            setOutput(`Execution Error: ${error.response?.data?.message || error.message}`);
            toast.error('Failed to execute code');
        } finally {
            setIsRunning(false);
        }
    };

    const handleReset = () => {
        const confirmReset = window.confirm('Are you sure you want to reset the code to the template?');
        if (confirmReset) {
            const template = question.template || '';
            setCode(template);
            if (onChange) {
                onChange(template);
            }
            setOutput('');
            toast.info('Code reset to template');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Code copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const languageOptions = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'c', label: 'C' },
        { value: 'csharp', label: 'C#' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' }
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Language:
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            disabled={readOnly || question.programmingLanguage}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
                        >
                            {languageOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Theme:
                        </label>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="vs-dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="hc-black">High Contrast</option>
                        </select>
                    </div>
                </div>

                {!readOnly && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Copy code"
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>

                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Reset to template"
                        >
                            <RotateCcw size={16} />
                            Reset
                        </button>

                        {showOutput && (
                            <button
                                onClick={handleRunCode}
                                disabled={isRunning}
                                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                <Play size={16} />
                                {isRunning ? 'Running...' : 'Run Code'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={handleEditorChange}
                    theme={theme}
                    options={{
                        readOnly: readOnly,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        contextmenu: !readOnly,
                        quickSuggestions: !readOnly,
                        suggestOnTriggerCharacters: !readOnly,
                        acceptSuggestionOnEnter: 'on',
                        bracketPairColorization: { enabled: true },
                        formatOnPaste: true,
                        formatOnType: true
                    }}
                    loading={
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-500">Loading editor...</div>
                        </div>
                    }
                />
            </div>

            {/* Output Panel */}
            {showOutput && output && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                        <AlertCircle size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Output
                        </span>
                    </div>
                    <pre className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100 overflow-auto max-h-48">
                        {output}
                    </pre>
                </div>
            )}

            {/* Test Cases Info */}
            {question.testCases && question.testCases.length > 0 && (
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                        <strong>Note:</strong> Your code will be evaluated against {question.testCases.length} test case(s).
                    </p>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;