import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

const RecruiterProtectedRoute = ({ children }) => {
    const { companyToken, isCompanyLogin } = useContext(AppContext);

    if (!companyToken || !isCompanyLogin) {
        toast.error('Please login as a recruiter to access this page');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RecruiterProtectedRoute;
