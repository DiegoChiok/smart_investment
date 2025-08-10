"use client";

import { useState } from "react";
import Welcome from './welcome/page';
import Signup from './signup/page';

export default function Home() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div>
      {showSignup ? (
        <>
          <Signup />
          <button
            className="mt-4 text-blue-600 hover:underline"
            onClick={() => setShowSignup(false)}
          >
            Already have an account? Log In
          </button>
        </>
      ) : (
        <>
          <Welcome />
          <button
            className="mt-4 text-blue-600 hover:underline"
            onClick={() => setShowSignup(true)}
          >
            Don't have an account? Sign Up
          </button>
        </>
      )}
    </div>
  );
}
