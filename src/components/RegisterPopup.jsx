import { FiAlertCircle, FiMessageCircle, FiUser, FiEdit, FiUserPlus, FiLogIn, FiArrowLeft } from "react-icons/fi";

const RegisterPopup = ({ onRegister, onLogin, onClose, themeClass }) => {
  const benefits = [
    { icon: FiMessageCircle, text: "Answer questions and join discussions" },
    { icon: FiUser, text: "Follow your favorite authors" },
    { icon: FiEdit, text: "Ask questions and share your own fixes" },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div
        className={`${themeClass(
          "bg-[#1a1a1a] border-[#333]",
          "bg-white border-gray-200"
        )} rounded-xl border max-w-sm w-full overflow-hidden`}
      >
        {/* Header */}
        <div className={`p-5 border-b ${themeClass("border-[#333]", "border-gray-200")}`}>
          <div className="flex items-center justify-center mb-3">
            <div
              className={`w-12 h-12 ${themeClass(
                "bg-[#222] border-[#333]",
                "bg-gray-100 border-gray-300"
              )} rounded-full flex items-center justify-center border`}
            >
              <FiAlertCircle className={`w-6 h-6 ${themeClass("text-white", "text-gray-900")}`} />
            </div>
          </div>
          <h3
            className={`text-lg font-bold ${themeClass(
              "text-white",
              "text-gray-900"
            )} text-center mb-1`}
          >
            Join the Community
          </h3>
          <p className={`${themeClass("text-[#999]", "text-gray-600")} text-center text-sm`}>
            Create an account to answer questions, follow authors, and share your own stories
          </p>
        </div>

        {/* Benefits and buttons */}
        <div className="p-5">
          <div className="space-y-4 mb-5">
            {benefits.map((benefit) => (
              <div
                key={benefit.text}
                className={`flex items-center p-2 ${themeClass(
                  "bg-[#222] border-[#333]",
                  "bg-gray-100 border-gray-200"
                )} rounded-lg border`}
              >
                <benefit.icon className={`w-4 h-4 ${themeClass("text-white", "text-gray-900")} mr-2`} />
                <div className={`${themeClass("text-white", "text-gray-900")} font-medium text-sm`}>
                  {benefit.text}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <button
              onClick={onRegister}
              className={`w-full py-2.5 ${themeClass(
                "bg-white text-black hover:bg-[#f0f0f0]",
                "bg-gray-900 text-white hover:bg-gray-800"
              )} rounded-lg transition font-medium flex items-center justify-center text-sm`}
            >
              <FiUserPlus className="w-4 h-4 mr-2" />
              Create Free Account
            </button>

            <button
              onClick={onLogin}
              className={`w-full py-2.5 ${themeClass(
                "bg-[#222] text-white hover:bg-[#333]",
                "bg-gray-200 text-gray-900 hover:bg-gray-300"
              )} rounded-lg transition font-medium flex items-center justify-center text-sm`}
            >
              <FiLogIn className="w-4 h-4 mr-2" />
              Sign In to Existing Account
            </button>

            <div className="text-center pt-2">
              <button
                onClick={onClose}
                className={`w-full py-1.5 ${themeClass(
                  "text-[#999] hover:text-white",
                  "text-gray-600 hover:text-gray-900"
                )} transition text-sm flex items-center justify-center`}
              >
                <FiArrowLeft className="mr-2 w-3 h-3" />
                Back to stories
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3 ${themeClass(
            "bg-[#222] border-[#333]",
            "bg-gray-100 border-gray-200"
          )} border-t`}
        >
          <p className={`${themeClass("text-[#777]", "text-gray-500")} text-xs text-center`}>
            By joining, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPopup;