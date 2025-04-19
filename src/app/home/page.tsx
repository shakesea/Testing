'use client'

import React from 'react';
import Game1 from '@/components/Game1';

export default function Home() {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen min-w-screen'>
            <h1 className='text-4xl font-bold mb-4 text-white'>
                Selamat Datang!
            </h1>
            <Game1 />
        </div>
    );
}