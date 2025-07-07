// packages/apps/partner-support/src/app/components/auth-button.tsx
'use client';

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@metiscore/ui'; // Using our shared button

export function AuthButton() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to login page after sign out
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-gray-700 hidden sm:block">
          Welcome, {user.displayName || user.email}
        </span>
        <Button
          onClick={() => router.push('/profile')}
          className="rounded-md bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-800 shadow-sm hover:bg-blue-200 transition-colors"
          title="Profile & Privacy Settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden sm:inline ml-2">Profile</span>
        </Button>
        <Button
          onClick={handleSignOut}
          className="rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-300 transition-colors"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleSignIn} className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500">
      Partner Sign-in with Google
    </Button>
  );
}
