import React from "react";
import { Mail } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  error: string | null;
}

export default function LoginScreen({ onLogin, isLoggingIn, error }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Mail className="h-6 w-6" id="login-logo" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Email Marketing Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Sign in with your custom Gmail account to manage campaigns
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-600 text-center mb-6">
                Connect your business Gmail account to send high-deliverability promotional emails to your subscribers.
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-700 text-center">{error}</p>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="gsi-material-button w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                id="google-signin-btn"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper flex items-center justify-center space-x-3">
                  <div className="gsi-material-button-icon flex items-center justify-center">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="h-5 w-5"
                      style={{ display: "block" }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-medium text-slate-700">
                    {isLoggingIn ? "Signing in..." : "Sign in with Google"}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
