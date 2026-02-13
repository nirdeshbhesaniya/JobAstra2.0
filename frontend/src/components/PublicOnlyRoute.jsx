import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const PublicOnlyRoute = ({ children, redirectTo = '/' }) => {
    const { userToken, companyToken, isLogin, isCompanyLogin } = useContext(AppContext);

    // If user is logged in as candidate, redirect to home
    if (userToken && isLogin) {
        return <Navigate to={redirectTo} replace />;
    }

    // If user is logged in as recruiter, redirect to dashboard
    if (companyToken && isCompanyLogin) {
        return <Navigate to="/dashboard/overview" replace />;
    }

    return children;
};

export default PublicOnlyRoute;
