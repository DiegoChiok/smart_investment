"use client";

import React, { useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import Signup from '../signup/page';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full"
        >
          <source src="/money_vid.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="relative z-20 flex justify-end items-center min-h-screen px-8">
        <div className="bg-[rgba(75,85,99,0.8)] rounded-4xl shadow-lg p-10 w-full max-w-md py-45">
          <h2 className="flex items-center justify-center pb-10 text-6xl font-bold mb-8 font-serif text-black">Sign In</h2>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSignIn}>
            <div className="mb-4">
              <label className="mb-1 text-gray-800 block text-base font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-4 focus:ring-black"
                placeholder="user@email.com"
                required
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 text-gray-800 block text-base font-medium">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-4 focus:ring-black"
                placeholder="••••••••••"
                required
              />
            </div>

            <div className="flex justify-between items-center mb-6 text-sm font-small">
              <Link href="/forgot" className="text-gray-900 hover:underline cursor-pointer">
                Forgot Password
              </Link>
              <Link href="/signup" className="text-gray-900 hover:underline cursor-pointer">
                Sign up
              </Link>

            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-500 text-white rounded-lg hover:ring-4 hover:ring-red-500 hover:text-lg"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
