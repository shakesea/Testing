'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthFormWrapper from '@/components/AuthFormWrapper';
import SocialAuth from '@/components/SocialAuth';
import Link from 'next/link';
import { FaEye, FaEyeSlash, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface LoginFormData {
    email: string;
    password: string;   
    captchaInput: string;
}

interface ErrorObject {
    email?: string;
    password?: string;
    captcha?: string;
}

const LoginPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        captchaInput: ''
    });
    const [showPassword, setShowPassword] = useState(false); // Add this new state
    const [errors, setErrors] = useState<ErrorObject>({});
    const [captcha, setCaptcha] = useState('');
    const [loginAttempts, setLoginAttempts] = useState(3);

    const generateCaptcha = useCallback(() => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let NewCaptcha = '';
        for (let i = 0; i < 6; i++) {
            NewCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptcha(NewCaptcha);
    }, []);

    useEffect(() => {
        generateCaptcha();
        setErrors({});
    }, [generateCaptcha]);

    const validateForm = (): ErrorObject => {
        const newErrors: ErrorObject = {};
        
        if (formData.email.trim() === '') {
            newErrors.email = 'Email tidak boleh kosong';
        } else if (formData.email !== '231712246@gmail.com') {
            newErrors.email = 'Email salah';
        }

        if (formData.password.trim() === '') {
            newErrors.password = 'Password tidak boleh kosong';
        } else if (formData.password !== '231712246') {
            newErrors.password = 'Password salah';
        }

        if (formData.captchaInput.trim() === '') {
            newErrors.captcha = 'Captcha tidak boleh kosong';
        } else if (formData.captchaInput !== captcha) {
            newErrors.captcha = 'Captcha invalid';
        }

        return newErrors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        if (loginAttempts > 0) {
            setLoginAttempts(prev => prev - 1);
            if (loginAttempts - 1 > 0) {
                toast.error(`Login Gagal! Sisa kesempatan: ${loginAttempts - 1}`, { 
                    theme: 'dark',
                    position: 'top-right' 
                });
            } else {
                toast.error('Kesempatan login habis!', { 
                    theme: 'dark', 
                    position: 'top-right' 
                });
            }
        }
        return;
    }


        toast.success('Login Berhasil!', { theme: 'dark' });
        router.push('/home');
    };

    const resetLoginAttempts = () => {
        setLoginAttempts(3);
        toast.info('Kesempatan login telah direset!', { 
            theme: 'dark',
            position: 'top-right'
         });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };
    
    return (
        <AuthFormWrapper title='Login'>
            <div className="text-center mb-6">
                <p className="text-sm text-gray-600">
                    Sisa Kesempatan: <span className="font-semibold">{loginAttempts}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-5 w-full'>
                <div className='space-y-2'>
                    <label htmlFor='email' className='text-sm font-medium text-gray-700'>Email</label>
                    <input
                        id='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors 
                            ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
                        placeholder='Masukan email'
                    />
                    {errors.email && (
                        <p className='text-red-600 text-sm italic mt-1'>{errors.email}</p>
                    )}
                </div>

                <div className='space-y-2'>
                    <label htmlFor="password" className='text-sm font-medium text-gray-700'>Password</label>
                    <div className='relative'>
                        <input
                            id='password'
                            type={showPassword ? 'text' : 'password'} // Modified type
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors 
                            ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
                            placeholder='Masukan password'
                        />
                        <button
                            type="button" // Prevent form submission
                            onClick={togglePasswordVisibility}
                            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer'
                        >
                            {showPassword ? (
                                <FaEyeSlash size={24} />
                            ) : (
                                <FaEye size={24} />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className='text-red-600 text-sm italic mt-1'>{errors.password}</p>
                    )}
                </div>

                <div className='flex items-center justify-between text-sm'>
                    <label className='flex items-center space-x-2'>
                        <input
                            type='checkbox'
                            className='h-4 w-4 tet-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                        />
                        <span className='text-gray-600'>Ingat saya</span>
                    </label>
                    <Link href='/auth/forgot-password' className='text-blue-600 hover:text-blue-800 font-medium'>
                        Forgot password?
                    </Link>
                </div>

                <div className='space-y-2'>
                    <div className='flex items-center space-x-3'>
                        <div className='flex items-center space-x-3'>
                            <span className='text-sm font-medium text-gray-700'>Captcha:</span>
                            <span className='font-mono text-lg font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded'>
                                {captcha}
                            </span>
                        </div>
                        <FaRedo
                            type='button'
                            className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                            onClick={generateCaptcha}
                        >
                            Refresh Captcha
                        </FaRedo>
                    </div>
                    <input
                        type='text'
                        name='captchaInput'
                        value={formData.captchaInput}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors 
                        ${errors.captcha ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
                        placeholder='Masukan captcha'
                    />
                    {errors.captcha && (
                        <p className='text-red-600 text-sm italic mt-1'>{errors.captcha}</p>
                    )}
                </div>

                <button
                    type='submit'
                    disabled={loginAttempts === 0}
                    className={`w-full ${loginAttempts === 0 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200`}
                >
                    Sign In
                </button>

                <button
                    type='button'
                    onClick={resetLoginAttempts}
                    disabled={loginAttempts > 0}
                    className={`w-full ${loginAttempts === 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'} text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200`}
                >
                    Reset Kesempatan
                </button>

                <SocialAuth />

                <p className='mt-6 text-center text-sm text-gray-600'>
                    Tidak punya akun?{''}
                    <Link href='/auth/register' className='text-blue-600 hover:text-blue-800 font-semibold'>
                        Daftar
                    </Link>
                </p>
            </form>
        </AuthFormWrapper>
    );
};

export default LoginPage;