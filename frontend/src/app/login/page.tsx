'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user, loginAsGuest, loginWithGoogleMock, loginWithGoogle, isLoading, error } = useApp();
  const [guestName, setGuestName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const router = useRouter();

  // Load Google Identity Services script dynamically if Client ID is configured
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Clean up script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // If already logged in, redirect to task board
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Render Google Sign-In Button
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!isScriptLoaded || !clientId || !(window as any).google) return;

    try {
      const google = (window as any).google;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          const success = await loginWithGoogle(response.credential);
          if (success) {
            router.push('/');
          }
        },
      });

      google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: 320, // Matches max-w-sm card layout width
        }
      );
    } catch (err) {
      console.error('Failed to initialize Google Sign-In:', err);
    }
  }, [isScriptLoaded, loginWithGoogle, router]);

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameToUse = guestName.trim() || 'Guest User';
    const success = await loginAsGuest(nameToUse);
    if (success) {
      router.push('/');
    }
  };

  const handleGoogleLogin = async () => {
    // Mock Google sign in (fallback when Client ID is not configured)
    const success = await loginWithGoogleMock(
      'Google Developer',
      'google.dev@tms.local',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=google'
    );
    if (success) {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app-bg px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-sm space-y-8 bg-card-bg p-8 rounded-2xl border border-border-color shadow-sm transition-colors duration-200">
        
        {/* Pyramid Logo - Stacked Vertically */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg 
            className="h-9 w-9 text-text-primary transition-colors"
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <polygon points="12,3 2,21 22,21" />
          </svg>
          <span className="text-xs font-semibold tracking-widest text-text-primary uppercase">Pyramid</span>
        </div>

        {/* Headings */}
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Let's get back on track</h2>
          <p className="text-xs text-text-secondary">Enter your email below to login to your account.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          
          {showNameInput ? (
            <form onSubmit={handleGuestLogin} className="space-y-3">
              <div>
                <label htmlFor="guest-name" className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Your Name
                </label>
                <input
                  id="guest-name"
                  type="text"
                  placeholder="e.g. Dexter"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-app-bg border border-border-color rounded-xl focus:outline-none focus:border-accent text-text-primary focus:ring-1 focus:ring-accent"
                  required
                  autoFocus
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 rounded-full bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-xs font-semibold transition-all duration-150 disabled:opacity-50"
                >
                  {isLoading ? 'Entering...' : 'Confirm & Continue'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNameInput(false)}
                  className="px-4 py-2 rounded-full border border-border-color text-text-secondary text-xs hover:bg-app-bg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNameInput(true)}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-full text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 focus:outline-none transition-all duration-150 shadow-sm"
            >
              Continue as Guest
            </button>
          )}

          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
            <div className="w-full flex justify-center py-1">
              <div id="google-signin-button"></div>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-border-color rounded-full text-xs font-semibold text-text-primary bg-card-bg hover:bg-app-bg transition-all duration-150"
            >
              {/* Google Icon */}
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.44 3.77v3.12h3.94c2.31-2.12 3.65-5.24 3.65-8.94z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.94-3.12c-1.1.74-2.51 1.18-4.02 1.18-3.09 0-5.7-2.08-6.64-4.89H1.38v3.22C3.36 21.36 7.42 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.36 14.26a7.2 7.2 0 0 1 0-2.52V8.52H1.38a12.01 12.01 0 0 0 0 6.96l3.98-3.22z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0 7.42 0 3.36 2.64 1.38 6.52l3.98 3.22c.94-2.81 3.55-4.89 6.64-4.89z"
                />
              </svg>
              Login with Google (Mock Mode)
            </button>
          )}

          {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <div className="p-3 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl leading-normal text-left">
              <strong>Notice:</strong> Google login is running in Mock Mode. To enable real Google Sign-In, add your <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to <code>frontend/.env.local</code>.
            </div>
          )}
        </div>

      </div>

      {/* Footer info - Placed below the Card container to match Figma */}
      <div className="text-center text-[10px] text-text-secondary mt-5 max-w-xs leading-relaxed select-none">
        By clicking continue, you agree to our{' '}
        <a href="#" className="underline hover:text-text-primary transition-colors">Terms of Service</a>{' '}
        and{' '}
        <a href="#" className="underline hover:text-text-primary transition-colors">Privacy Policy</a>.
      </div>
    </div>
  );
}
