import React from 'react';
import { useParams } from 'react-router-dom';
import TestAttempts from '../components/TestAttempts';

const TestAttemptsPage = () => {
    const { testId } = useParams();
    
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Attempts</h1>
                    <p className="text-gray-600">Review and evaluate candidate test submissions</p>
                </div>
                <TestAttempts testId={testId} />
            </div>
        </div>
    );
};

export default TestAttemptsPage;