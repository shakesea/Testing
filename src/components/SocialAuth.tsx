'use client';

import { FaGoogle, FaGithub, FaFacebook, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SocialAuth = () => {
    const handleSocialLogin = (provider: string) => {
        toast.info(`${provider} Login Berhasil!`, {
            position: 'top-right',
            icon: <FaCheck className='text-green-400' />,
        });
    };

    return (
        <div className='space-y-4'>
            <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-gray-300'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                    <span className='px-2 bg-white text-gray-500'>Atau masuk dengan</span>
                </div>
            </div>
            <div className='flex space-x-4 justify-center'>
                <button
                onClick={() => handleSocialLogin('Google')}
                className='p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
                >
                    <FaGoogle className='text-xl text-red-600' />
                </button>
                <button
                onClick={() => handleSocialLogin('Github')}
                className='p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
                >
                    <FaGithub className='text-xl text-gray-800' />
                </button>
                <button
                onClick={() => handleSocialLogin('Facebook')}
                className='p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
                >
                    <FaFacebook className='text-xl text-blue-600' />
                </button>
            </div>
        </div>
    );
};
export default SocialAuth;