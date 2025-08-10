"use client";

import React, { useState } from "react";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-500 px-4">
      <div className="bg-[rgba(75,85,99,0.8)] rounded-lg shadow-md p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-black font-serif">
          Forgot Password
        </h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {message && <p className="text-green-600 mb-4">{message}</p>}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="mb-1 text-gray-800 block text-base font-medium">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-4 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-500 text-white rounded-lg hover:ring-4 hover:ring-red-500"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
