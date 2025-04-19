'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import AuthFormWrapper from '@/components/AuthFormWrapper';
import SocialAuth from '@/components/SocialAuth';
import Link from 'next/link';
import { FaEye, FaEyeSlash, FaRedo } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

type RegisterFormData = {
    username: string;
    email: string;
    nomorTelp: string;
    password: string;
    confirmPassword: string;
    captcha: string;
};

const RegisterPage = () => {
    const router = useRouter();
    const [captcha, setCaptcha] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0); // State untuk kekuatan password
    const [showPassword, setShowPassword] = useState(false); // State untuk toggle password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State untuk toggle confirm password visibility
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<RegisterFormData>();

    const password = watch('password', '');

    // Fungsi untuk menghasilkan captcha
    const generateCaptcha = useCallback(() => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let NewCaptcha = '';
        for (let i = 0; i < 6; i++) {
            NewCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptcha(NewCaptcha);
    }, []);

    // Efek untuk menghitung kekuatan password
    useEffect(() => {
        const strength = Math.min(
            (password.length > 7 ? 25 : 0) +
            (/[A-Z]/.test(password) ? 25 : 0) +
            (/[0-9]/.test(password) ? 25 : 0) +
            (/[^A-Za-z0-9]/.test(password) ? 25 : 0),
            100 // Batas maksimal kekuatan
        );
        setPasswordStrength(strength); // Update state kekuatan password
    }, [password]);

    // Efek untuk menghasilkan captcha saat komponen dimuat
    useEffect(() => {
        generateCaptcha();
        reset();
    }, [generateCaptcha, reset]);

    const onSubmit = (data: RegisterFormData) => {
        // Validasi captcha
        if (data.captcha !== captcha) {
            toast.error('Captcha tidak sesuai', { theme: 'dark' });
            return;
        }

        // Jika validasi berhasil
        toast.success('Register Berhasil', { theme: 'dark' });
        router.push('/home');
    };

    return (
        <AuthFormWrapper title='Register'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 w-full'>
                {/* Username Field */}
                <div className='space-y-2'>
                    <label htmlFor='username' className='text-sm font-medium text-gray-700'>
                        Username <span className='text-gray-500 text-xs'>(max 8 karakter)</span>
                    </label>
                    <input
                        id='username'
                        {...register('username', {
                            required: 'Username tidak boleh kosong',
                            minLength: {
                                value: 3,
                                message: 'Username minimal 3 karakter',
                            },
                            maxLength: {
                                value: 8,
                                message: 'Username maksimal 8 karakter',
                            },
                        })}
                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                            errors.username
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder='Masukkan username'
                    />
                    {errors.username && (
                        <p className='text-red-600 text-sm italic mt-1'>{errors.username.message}</p>
                    )}
                </div>

                {/* Email Field */}
                <div className='space-y-2'>
                    <label htmlFor='email' className='text-sm font-medium text-gray-700'>
                        Email
                    </label>
                    <input
                        id='email'
                        type='email'
                        {...register('email', {
                            required: 'Email wajib diisi',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Email harus memiliki format yang valid',
                            },
                        })}
                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                            errors.email
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder='Masukkan email'
                    />
                    {errors.email && (
                        <p className='text-red-600 text-sm italic mt-1'>{errors.email.message}</p>
                    )}
                </div>

                {/* Nomor Telepon Field */}
                <div className='space-y-2'>
                    <label htmlFor='nomorTelp' className='text-sm font-medium text-gray-700'>
                        Nomor Telepon
                    </label>
                    <input
                        id='nomorTelp'
                        type='text'
                        {...register('nomorTelp', {
                            required: 'Nomor telepon wajib diisi',
                            pattern: {
                                value: /^\d+$/,
                                message: 'Nomor telepon hanya boleh berisi angka',
                            },
                            minLength: {
                                value: 10,
                                message: 'Nomor telepon minimal 10 digit',
                            },
                        })}
                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                            errors.nomorTelp
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder='Masukkan nomor telepon'
                    />
                    {errors.nomorTelp && (
                        <p className='text-red-600 text-sm italic mt-1'>{errors.nomorTelp.message}</p>
                    )}
                </div>

                {/* Password Field */}
                <div className='space-y-2'>
                    <label htmlFor='password' className='text-sm font-medium text-gray-700'>
                        Password
                    </label>
                    <div className='relative'>
                        <input
                            id='password'
                            type={showPassword ? 'text' : 'password'} // Toggle jenis input
                            {...register('password', {
                                required: 'Password wajib diisi',
                                minLength: {
                                    value: 8,
                                    message: 'Password minimal 8 karakter',
                                },
                            })}
                            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                                errors.password
                                    ? 'border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                            placeholder='Masukkan password'
                        />
                        <button
                            type='button'
                            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer'
                            onClick={() => setShowPassword(!showPassword)} // Toggle visibility
                        >
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className='text-red-600 text-sm italic mt-1'>{errors.password.message}</p>
                    )}

                    {/* Password Strength Indicator */}
                    <div className='w-full bg-gray-200 rounded-full h-2.5 mt-2'>
                        <div
                            className='h-2.5 rounded-full transition-all duration-500 ease-out'
                            style={{
                                width: `${passwordStrength}%`,
                                backgroundColor:
                                    passwordStrength < 50
                                        ? 'red'
                                        : passwordStrength < 75
                                        ? 'orange'
                                        : 'green',
                            }}
                        />
                    </div>
                    <p className='text-sm text-gray-600 mt-1'>
                        Kekuatan Password: {passwordStrength}%
                    </p>
                </div>

                {/* Confirm Password Field */}
                <div className='space-y-2'>
                    <label htmlFor='confirmPassword' className='text-sm font-medium text-gray-700'>
                        Konfirmasi Password
                    </label>
                    <div className='relative'>
                        <input
                            id='confirmPassword'
                            type={showConfirmPassword ? 'text' : 'password'} // Toggle jenis input
                            {...register('confirmPassword', {
                                required: 'Konfirmasi password wajib diisi',
                                validate: (value) =>
                                    value === password || 'Password dan konfirmasi password tidak cocok',
                            })}
                            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                                errors.confirmPassword
                                    ? 'border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                            placeholder='Konfirmasi password'
                        />
                        <button
                            type='button'
                            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer'
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle visibility
                        >
                            {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className='text-red-600 text-sm italic mt-1'>{errors.confirmPassword.message}</p>
                    )}
                </div>

                {/* Captcha Field */}
                <div className='space-y-2'>
                    <div className='flex items-center space-x-3'>
                        <span className='text-sm font-medium text-gray-700'>Captcha:</span>
                        <span className='font-mono text-lg font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded'>
                            {captcha}
                        </span>
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
                        {...register('captcha', {
                            required: 'Captcha wajib diisi',
                            validate: (value) => value === captcha || 'Captcha tidak sesuai',
                        })}
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                            errors.captcha
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder='Masukkan captcha'
                    />
                    {errors.captcha && (
                        <p className='text-red-600 text-sm italic mt-1'>{errors.captcha.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type='submit'
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200'
                >
                    Register
                </button>

                {/* Social Auth */}
                <SocialAuth />
            </form>

            {/* Login Link */}
            <p className='mt-6 text-center text-sm text-gray-600'>
                Sudah punya akun?{''}
                <Link href='/auth/login' className='text-blue-600 hover:text-blue-800 font-semibold'>
                    Login
                </Link>
            </p>
        </AuthFormWrapper>
    );
};

export default RegisterPage;