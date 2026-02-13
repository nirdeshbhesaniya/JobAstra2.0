import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
    const { userToken, isLogin } = useContext(AppContext);

    if (!userToken || !isLogin) {
        toast.error('Please login to access this page');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
