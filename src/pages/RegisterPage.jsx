import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { FiUser, FiMail, FiLock, FiUserPlus, FiLogIn, FiArrowLeft, FiExternalLink } from 'react-icons/fi';

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password validation function
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Check if terms are agreed to
    if (!agreeToTerms) {
      setError("You must agree to the Terms and Privacy Policy to register.");
      return;
    }
    
    // Validate password length
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    setLoading(true);

    try {
      const response = await API.post("/api/auth/register", {
        username,
        email,
        password,
      });

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Real links for Terms and Privacy Policy
  const termsLink = "#"; // Replace with actual terms page URL
  const privacyLink = "#"; // Replace with actual privacy policy URL

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-lg border border-[#333] w-full max-w-md overflow-hidden">
        
        {/* Compact Header */}
        <div className="p-6 border-b border-[#333]">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-[#222] rounded-full flex items-center justify-center border border-[#333]">
              <FiUserPlus className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white text-center mb-1">Join Storlo</h1>
          <p className="text-[#999] text-center text-sm">
            Create your account
          </p>
        </div>

        {/* Compact Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-[#222] border border-[#444] text-[#e5e5e5] rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-[#ccc] text-sm mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FiUser className="text-[#777] w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-[#222] border border-[#444] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-[#777] focus:outline-none focus:border-[#666] transition text-sm"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[#ccc] text-sm mb-1">
                Email
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
                  className="w-full bg-[#222] border border-[#444] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-[#777] focus:outline-none focus:border-[#666] transition text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[#ccc] text-sm mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FiLock className="text-[#777] w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear password error when user starts typing
                    if (error && error.includes("Password")) {
                      setError("");
                    }
                  }}
                  required
                  className={`w-full bg-[#222] border ${
                    password.length > 0 && password.length < 8 
                      ? 'border-red-500/50' 
                      : 'border-[#444]'
                  } rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-[#777] focus:outline-none focus:border-[#666] transition text-sm`}
                  placeholder="Create a password"
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-[#666] text-xs">Min. 8 characters</p>
                {password.length > 0 && password.length < 8 && (
                  <p className="text-red-400 text-xs">Too short</p>
                )}
                {password.length >= 8 && (
                  <p className="text-green-400 text-xs">✓ Good</p>
                )}
              </div>
            </div>

            {/* Terms Checkbox - FIXED ALIGNMENT */}
            <div className="mb-5">
              <div className="flex items-start">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="w-4 h-4 bg-[#333] border border-[#555] rounded focus:ring-0 focus:ring-offset-0 focus:border-[#666] text-white"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
                    <div className="text-white mb-1">
                      I agree to the following documents:
                    </div>
                    <div className="space-y-2">
                      <a 
                        href={termsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white hover:text-[#ccc] transition flex items-center text-sm"
                      >
                        <FiExternalLink className="w-3 h-3 mr-2" />
                        Terms of Service
                      </a>
                      <a 
                        href={privacyLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white hover:text-[#ccc] transition flex items-center text-sm"
                      >
                        <FiExternalLink className="w-3 h-3 mr-2" />
                        Privacy Policy
                      </a>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !agreeToTerms}
              className={`w-full py-2.5 rounded-lg transition font-medium flex items-center justify-center text-sm ${
                loading || !agreeToTerms
                  ? 'bg-[#222] text-[#666] cursor-not-allowed border border-[#444]'
                  : 'bg-white text-black hover:bg-[#f0f0f0]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#444] border-t-[#666] rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FiUserPlus className="w-4 h-4 mr-2" />
                  {agreeToTerms ? 'Create Account' : 'Agree to Terms'}
                </>
              )}
            </button>
          </form>

          {/* Compact Links */}
          <div className="mt-5 text-center">
            <p className="text-[#999] text-sm">
              Have an account?{" "}
              <a 
                href="/login" 
                className="text-white hover:text-[#ccc] transition"
              >
                Sign in
              </a>
            </p>
          </div>

          <div className="mt-3 text-center">
            <a 
              href="/" 
              className="text-[#777] hover:text-[#999] transition text-sm inline-flex items-center"
            >
              <FiArrowLeft className="w-3 h-3 mr-1" />
              Back to stories
            </a>
          </div>
        </div>

        {/* Quick Links Footer */}
        <div className="p-4 bg-[#222] border-t border-[#333]">
          <div className="flex justify-center space-x-4 text-xs">
            <a 
              href={termsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#777] hover:text-white transition"
            >
              Terms
            </a>
            <span className="text-[#555]">•</span>
            <a 
              href={privacyLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#777] hover:text-white transition"
            >
              Privacy
            </a>
            <span className="text-[#555]">•</span>
            <a 
              href="#" 
              className="text-[#777] hover:text-white transition"
            >
              Help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;