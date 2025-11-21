import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      const response = await login({ email, password });
      if (response.status === 200) {
        navigate("/", { replace: true });
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex flex-col">
      {/* <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Back to dashboard
        </Link>
      </div> */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Sign In
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Enter your credentials to access your account
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            type="email"
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
            >
              {showPassword ? (
                <EyeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <EyeCloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox checked={isChecked} onChange={setIsChecked} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Keep me logged in
            </span>
          </div>
          {/* <Link
            to="/reset-password"
            className="text-sm text-[#013365] hover:text-[#013365] dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot password?
          </Link> */}
        </div>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-md">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#013365] hover:bg-[#485a6ddd] text-white text-sm font-medium py-2.5 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      {/* Uncomment if you want to re-enable the signup link */}
      {/* <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-[#013365] hover:text-[#013365] dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign Up
          </Link>
        </p>
      </div> */}
    </div>
  );
}