import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { FiMail, FiLock, FiLogIn, FiUserPlus, FiArrowLeft } from 'react-icons/fi';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-lg border border-[#333] w-full max-w-md overflow-hidden">
        
        {/* Header with icon */}
        <div className="p-8 border-b border-[#333]">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-[#222] rounded-full flex items-center justify-center border border-[#333]">
              <FiLogIn className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h1>
          <p className="text-[#999] text-center text-sm">
            Sign in to continue to Storlo
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-[#222] border border-[#444] text-[#e5e5e5] rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-[#ccc] text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FiMail className="text-[#777] w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#222] border border-[#444] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#777] focus:outline-none focus:border-[#666] transition text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-[#ccc] text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FiLock className="text-[#777] w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#222] border border-[#444] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#777] focus:outline-none focus:border-[#666] transition text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg transition font-medium flex items-center justify-center ${
                loading
                  ? 'bg-[#222] text-[#666] cursor-not-allowed border border-[#444]'
                  : 'bg-white text-black hover:bg-[#f0f0f0]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#444] border-t-[#666] rounded-full animate-spin mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <FiLogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1a1a1a] text-[#777]">New to Storlo?</span>
            </div>
          </div>

          {/* Register Button */}
          <div>
            <a href="/register">
              <button className="w-full py-3 bg-[#222] text-white rounded-lg hover:bg-[#333] transition font-medium flex items-center justify-center border border-[#444]">
                <FiUserPlus className="w-4 h-4 mr-2" />
                Create New Account
              </button>
            </a>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="text-[#777] hover:text-white transition text-sm inline-flex items-center"
            >
              <FiArrowLeft className="w-3 h-3 mr-1" />
              Back to stories
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#222] border-t border-[#333]">
          <p className="text-[#666] text-xs text-center">
            By signing in, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;