import React from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img
              width={150}
              height={30}
              src="/images/logo/Homenest-logo.png"
              alt="Logo"
              className="dark:filter dark:brightness-200"
            />
          </Link>
        </div>
        {children}
        <div className="fixed bottom-4 right-4 z-50">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}