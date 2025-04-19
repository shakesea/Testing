import React, { ReactNode } from 'react';

interface AuthFormWrapperProps {
    title: string;
    children: ReactNode;
}

const AuthFormWrapper = ({ title, children }: AuthFormWrapperProps) => {
    return (
        <div className='w-full max-w-md bg-white rounded-xl shadow-lg p-8'>
            <h2 className='text-3xl font-bold text-center mb-8 text-primary'>
                {title}
            </h2>
            {children}
        </div>
    );
};

export default AuthFormWrapper;