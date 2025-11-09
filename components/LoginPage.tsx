import React, { useState } from 'react';
import { getAuth, signInWithPopup } from 'firebase/auth';
import { googleProvider } from '../firebase';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    const auth = getAuth();
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-neutral-100 dark:bg-neutral-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-neutral-800">
        <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-neutral-100">
          Login to your CRM
        </h2>
        {error && <p className="text-sm text-center text-red-600">{error}</p>}
        <div className="pt-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
