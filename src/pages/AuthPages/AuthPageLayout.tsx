import React from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Side - Image (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#013365] to-[#014a7a] items-center justify-center p-8">
        <div className="max-w-lg w-full">
          <img
            src="https://img.freepik.com/premium-vector/repair-tool-house-repair-service_261524-1524.jpg?semt=ais_hybrid&w=740&q=80"
            alt="Home Repair Service"
            className="w-full h-auto object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 lg:p-10">
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
        </div>
      </div>

      {/* Theme Toggler */}
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}