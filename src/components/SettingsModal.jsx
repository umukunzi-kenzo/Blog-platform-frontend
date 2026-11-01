import { useEffect } from "react";
import { FiSettings, FiUser, FiSun, FiMoon, FiTrash2, FiChevronRight } from "react-icons/fi";

const SettingsModal = ({
  isDarkMode,
  onEditProfile,
  onToggleTheme,
  onDeleteAccount,
  onClose,
  themeClass,
}) => {
  // close the window with the Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const row = `w-full p-3 ${themeClass(
    "bg-[#222] border-[#333]",
    "bg-gray-50 border-gray-200"
  )} rounded-lg border flex items-center justify-between`;

  const title = themeClass("text-white", "text-gray-900");
  const hint = themeClass("text-[#777]", "text-gray-500");

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${themeClass(
          "bg-[#1a1a1a] border-[#333]",
          "bg-white border-gray-200"
        )} rounded-xl border w-full max-w-sm overflow-hidden`}
      >
        {/* Header */}
        <div className={`p-5 border-b ${themeClass("border-[#333]", "border-gray-200")}`}>
          <h2 className={`text-lg font-bold ${title} mb-1 flex items-center`}>
            <FiSettings className="mr-2 w-5 h-5" />
            Settings
          </h2>
          <p className={themeClass("text-[#999]", "text-gray-600")}>
            Manage your account preferences
          </p>
        </div>

        <div className="p-5">
          <div className="space-y-3">
            {/* Edit profile */}
            <button
              onClick={onEditProfile}
              className={`${row} ${themeClass("hover:bg-[#333]", "hover:bg-gray-100")} transition`}
            >
              <div className="flex items-center">
                <FiUser className={`mr-3 w-5 h-5 ${title}`} />
                <div className="text-left">
                  <div className={title}>Profile</div>
                  <div className={`${hint} text-sm`}>Username, email, bio, picture</div>
                </div>
              </div>
              <FiChevronRight className={hint} />
            </button>

            {/* Theme switch */}
            <div className={row}>
              <div className="flex items-center">
                {isDarkMode ? (
                  <FiMoon className={`mr-3 w-5 h-5 ${title}`} />
                ) : (
                  <FiSun className={`mr-3 w-5 h-5 ${title}`} />
                )}
                <div className="text-left">
                  <div className={title}>Dark mode</div>
                  <div className={`${hint} text-sm`}>{isDarkMode ? "On" : "Off"}</div>
                </div>
              </div>
              <button
                onClick={onToggleTheme}
                role="switch"
                aria-checked={isDarkMode}
                aria-label="Dark mode"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Delete account */}
            <button
              onClick={onDeleteAccount}
              className={`${row} ${themeClass(
                "hover:bg-red-500/10 hover:border-red-500/30",
                "hover:bg-red-50 hover:border-red-200"
              )} transition`}
            >
              <div className="flex items-center">
                <FiTrash2 className={`mr-3 w-5 h-5 ${themeClass("text-red-400", "text-red-600")}`} />
                <div className="text-left">
                  <div className={themeClass("text-red-400", "text-red-600")}>Delete account</div>
                  <div className={`${themeClass("text-red-400/70", "text-red-500")} text-sm`}>
                    Permanently delete your account
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className={`px-4 py-2 ${themeClass(
                "bg-white text-black hover:bg-[#f0f0f0]",
                "bg-gray-900 text-white hover:bg-gray-800"
              )} rounded-lg transition font-medium text-sm`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;