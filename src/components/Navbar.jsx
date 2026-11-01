import {
  FiBookOpen,
  FiHome,
  FiCompass,
  FiBook,
  FiUsers,
  FiSearch,
  FiX,
  FiEdit,
  FiSun,
  FiMoon,
  FiBell,
  FiSettings,
  FiLogIn,
  FiUserPlus,
} from "react-icons/fi";
import Avatar from "./Avatar";

const Navbar = ({
  activeNav,
  onNavigate,
  isLoggedIn,
  userInfo,
  avatarUrl,
  searchQuery,
  onSearchChange,
  onWrite,
  onLogin,
  onRegister,
  isDarkMode,
  onToggleTheme,
  unreadCount,
  onToggleNotifications,
  onOpenSettings,
  onOpenProfile,
  themeClass,
}) => {
  // the links of the menu ("Following" only for logged in users)
  const navItems = [
    { id: "home", label: "Home", icon: FiHome },
    { id: "discover", label: "Discover", icon: FiCompass },
    { id: "saved", label: "Saved", icon: FiBook },
    ...(isLoggedIn ? [{ id: "following", label: "Following", icon: FiUsers }] : []),
  ];

  // style shared by the small round icon buttons
  const iconButton = `relative w-9 h-9 rounded-full flex items-center justify-center transition ${themeClass(
    "bg-[#333] hover:bg-[#444] text-white",
    "bg-gray-200 hover:bg-gray-300 text-gray-900"
  )}`;

  // the search box is used twice: in the top bar (desktop) and under it (mobile)
  const searchBox = (widthClass) => (
    <div className={`relative ${widthClass}`}>
      <FiSearch
        className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeClass(
          "text-[#777]",
          "text-gray-500"
        )}`}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search stories..."
        aria-label="Search stories"
        className={`w-full ${themeClass(
          "bg-[#222] border-[#444] text-white placeholder-[#777]",
          "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
        )} border rounded-lg pl-10 pr-9 py-2 text-sm focus:outline-none focus:border-[#666]`}
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <FiX className={themeClass("text-[#777]", "text-gray-500")} />
        </button>
      )}
    </div>
  );

  return (
    <nav
      className={`sticky top-0 z-50 ${themeClass(
        "bg-[#1a1a1a] border-[#333]",
        "bg-gray-50 border-gray-200"
      )} border-b w-full`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center gap-3">
          {/* Logo and links */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            <button
              onClick={() => onNavigate("home")}
              className={`text-xl font-bold ${themeClass("text-white", "text-gray-900")} flex items-center`}
            >
              <FiBookOpen className="mr-2 w-5 h-5" />
              Storlo
            </button>

            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`${
                    activeNav === item.id
                      ? themeClass("text-white", "text-gray-900")
                      : themeClass(
                          "text-[#ccc] hover:text-white",
                          "text-gray-600 hover:text-gray-900"
                        )
                  } transition flex items-center text-sm`}
                >
                  <item.icon className="mr-2 w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:block">{searchBox("w-48 lg:w-64")}</div>

            <button
              onClick={onWrite}
              className={`px-3 sm:px-4 py-2 ${themeClass(
                "bg-white text-black hover:bg-[#f0f0f0]",
                "bg-gray-900 text-white hover:bg-gray-800"
              )} rounded-lg transition font-medium text-sm flex items-center`}
            >
              <FiEdit className="mr-2 w-4 h-4" />
              {isLoggedIn ? "New post" : "Get started"}
            </button>

            {/* One theme button for everyone */}
            <button
              onClick={onToggleTheme}
              className={iconButton}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <FiSun /> : <FiMoon />}
            </button>

            {isLoggedIn ? (
              <>
                <button
                  onClick={onToggleNotifications}
                  className={iconButton}
                  aria-label="Notifications"
                >
                  <FiBell />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button onClick={onOpenSettings} className={iconButton} aria-label="Settings">
                  <FiSettings />
                </button>

                <button
                  onClick={onOpenProfile}
                  className="hover:opacity-80 transition"
                  aria-label="Open your profile"
                  title={userInfo?.username || "Your profile"}
                >
                  <Avatar
                    user={{ username: userInfo?.username, avatar: avatarUrl }}
                    size="md"
                    themeClass={themeClass}
                  />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className={`${themeClass(
                    "text-[#ccc] hover:text-white",
                    "text-gray-600 hover:text-gray-900"
                  )} transition text-sm flex items-center`}
                >
                  <FiLogIn className="mr-1 w-3 h-3" />
                  <span className="hidden sm:inline">Log in</span>
                </button>
                <button
                  onClick={onRegister}
                  className={`${themeClass(
                    "text-[#ccc] hover:text-white",
                    "text-gray-600 hover:text-gray-900"
                  )} transition text-sm flex items-center`}
                >
                  <FiUserPlus className="mr-1 w-3 h-3" />
                  <span className="hidden sm:inline">Sign up</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile: search box and menu tabs */}
        <div className="md:hidden mt-3 space-y-3">
          {searchBox("w-full")}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center whitespace-nowrap transition ${
                  activeNav === item.id
                    ? themeClass("bg-white text-black", "bg-gray-900 text-white")
                    : themeClass("bg-[#222] text-[#ccc]", "bg-gray-200 text-gray-700")
                }`}
              >
                <item.icon className="mr-1.5 w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;