"use client";

import React, { useState } from 'react';
import { auth } from '../../firebase';  
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await signOut(auth); 
      router.push('/welcome'); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-500 px-4">

      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full"
        >
          <source src="/money_vid.mp4" type="video/mp4" />
          Video Not supported
        </video>
      </div>

      <div className="relative z-20 max-w-md w-full bg-[rgba(75,85,99,0.8)] rounded-lg shadow-md p-8 py-20">
        <h2 className="text-5xl font-bold mb-6 text-center text-black font-serif pb-5">Create an Account!</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="mb-4">
              <label className="mb-1 text-gray-800 block text-base font-medium">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-4 focus:ring-black"
              />
          </div>

          <div className="mb-4">
              <label className="mb-1 text-gray-800 block text-base font-medium">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                className="w-full px-3 py-2 border rounded-md focus:ring-4 focus:ring-black"
              />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-500 text-white rounded-lg hover:ring-4 hover:ring-red-500 hover:text-lg"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
