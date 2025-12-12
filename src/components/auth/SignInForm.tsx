import { useState } from "react";
import { useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateField = (name: string, value: string) => {
    if (name === "email") {
      if (!value.trim()) {
        setEmailError("Email is required");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError(null);
      }
    } else if (name === "password") {
      if (!value.trim()) {
        setPasswordError("Password is required");
      } else {
        setPasswordError(null);
      }
    }
  };

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't clear errors immediately to prevent blinking
    // Only clear API error, keep field errors for validation
    setApiError(null);
    setPasswordError(null);
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate all fields
    validateField("email", email);
    validateField("password", password);
    
    // Check if there are any errors
    if (!email.trim() || !password.trim()) {
      if (!email.trim()) setEmailError("Email is required");
      if (!password.trim()) setPasswordError("Password is required");
      return;
    }
    
    // Check if email format is valid
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await login({ email, password });
      
      // Check if login was successful - data should exist and be truthy
      // Even if status is 200, if data is null or empty, it means invalid credentials
      if (response && response.status === 200 && response.data && response.data !== null && response.data !== "" && String(response.data).trim() !== "") {
        // Only navigate if we have valid data (token)
        navigate("/", { replace: true });
      } else {
        // Show the error message from API (e.g., "Invalid credentials!")
        // Even if status is 200, if data is null, show error
        const errorMessage = response?.message || "Invalid email or password. Please check your credentials and try again.";
        setApiError(errorMessage);
        // Also show error below password field for better UX
        setPasswordError("Incorrect password");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err?.message || "Login failed. Please check your credentials and try again.";
      setApiError(errorMessage);
      setPasswordError("Incorrect password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Sign In
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your credentials to access your account
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
            Email
          </Label>
          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              const value = (e.target as HTMLInputElement).value;
              setEmail(value);
              if (touched.email) {
                validateField("email", value);
              }
            }}
            onBlur={() => handleBlur("email", email)}
            type="email"
            className="mt-1"
            error={!!emailError}
          />
          {touched.email && emailError && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {emailError}
            </p>
          )}
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
            Password
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                const value = (e.target as HTMLInputElement).value;
                setPassword(value);
                if (touched.password) {
                  validateField("password", value);
                }
              }}
              onBlur={() => handleBlur("password", password)}
              className="mt-1 pr-12"
              error={!!passwordError}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPassword(!showPassword);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#013365] focus:ring-offset-1 shadow-sm border border-gray-200 dark:border-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <i className="fas fa-eye-slash text-[#013365] dark:text-blue-400 text-lg"></i>
              ) : (
                <i className="fas fa-eye text-[#013365] dark:text-blue-400 text-lg"></i>
              )}
            </button>
          </div>
          {touched.password && passwordError && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {passwordError}
            </p>
          )}
        </div>
        {apiError && (
          <div className="p-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">{apiError}</p>
              <p className="text-xs mt-1 text-red-600 dark:text-red-400">Please check your email and password and try again.</p>
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#013365] to-[#014a7a] hover:from-[#014a7a] hover:to-[#013365] text-white text-sm font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help?{" "}
            <a 
              href="mailto:info@itfuturz.com" 
              className="text-[#013365] dark:text-blue-400 hover:text-[#014a7a] dark:hover:text-blue-300 font-medium underline"
            >
              Contact Support
            </a>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            info@itfuturz.com
          </p>
        </div>
      </form>
    </div>
  );
}