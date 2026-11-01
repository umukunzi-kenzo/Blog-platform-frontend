import {
  FiUser,
  FiEdit2,
  FiLogIn,
  FiUsers,
  FiUserCheck,
  FiBook,
  FiArrowUp,
  FiBarChart2,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";
import Avatar from "./Avatar";

const Sidebar = ({
  isLoggedIn,
  userInfo,
  avatarUrl,
  stats,
  popularAuthors,
  platformStats,
  onOpenProfile,
  onOpenAuthor,
  onAvatarChange,
  onLogout,
  onRegister,
  themeClass,
}) => {
  const card = `${themeClass(
    "bg-[#1a1a1a] border-[#333]",
    "bg-white border-gray-200"
  )} rounded-lg p-5 border mb-6`;

  const heading = `${themeClass("text-white", "text-gray-900")} font-medium mb-4 flex items-center`;

  const muted = themeClass("text-[#999]", "text-gray-600");

  // the four numbers shown on the profile card
  const profileStats = [
    { label: "Followers", value: stats.followersCount, icon: FiUsers },
    { label: "Following", value: stats.followingCount, icon: FiUserCheck },
    { label: "Posts", value: stats.postsCount, icon: FiBook },
    { label: "Upvotes", value: stats.totalLikes, icon: FiArrowUp },
  ];

  return (
    <aside className="hidden lg:block w-64 mr-8 flex-shrink-0">
      <div className="sticky top-24">
        {/* Profile card */}
        <div className={card}>
          <div className="flex flex-col items-center text-center mb-4">
            {isLoggedIn ? (
              // the whole picture is clickable to change it
              <label className="relative mb-4 cursor-pointer group" title="Change profile picture">
                <div className="group-hover:opacity-90 transition">
                  <Avatar
                    user={{ username: userInfo?.username, avatar: avatarUrl }}
                    size="lg"
                    themeClass={themeClass}
                  />
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-7 h-7 ${themeClass(
                    "bg-[#666] hover:bg-[#777] border-[#1a1a1a]",
                    "bg-gray-400 hover:bg-gray-500 border-white"
                  )} rounded-full flex items-center justify-center border-2 shadow-lg transition`}
                >
                  <FiEdit2 className="text-white w-3.5 h-3.5" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onAvatarChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div
                className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center border-2 ${themeClass(
                  "bg-[#333] border-[#444]",
                  "bg-gray-200 border-gray-300"
                )}`}
              >
                <FiUser className={`w-7 h-7 ${themeClass("text-white", "text-gray-900")}`} />
              </div>
            )}

            <div className={`${themeClass("text-white", "text-gray-900")} font-bold text-xl`}>
              {isLoggedIn ? userInfo?.username || "Your profile" : "Welcome"}
            </div>

            {isLoggedIn && userInfo?.bio && (
              <p className={`${muted} text-sm mt-2 line-clamp-3`}>{userInfo.bio}</p>
            )}

            {!isLoggedIn && (
              <p className={`${muted} text-sm mt-2`}>Sign in to ask, answer, and share your stories</p>
            )}
          </div>

          {isLoggedIn && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {profileStats.map((item) => (
                <div
                  key={item.label}
                  className={`p-2 rounded-lg text-center ${themeClass("bg-[#222]", "bg-gray-50")}`}
                >
                  <div className={`${themeClass("text-white", "text-gray-900")} font-semibold`}>
                    {item.value}
                  </div>
                  <div className={`${muted} text-xs flex items-center justify-center`}>
                    <item.icon className="mr-1 w-3 h-3" />
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={isLoggedIn ? onOpenProfile : onRegister}
            className={`w-full py-2 border ${themeClass(
              "border-[#444] text-[#ccc] hover:bg-[#222]",
              "border-gray-300 text-gray-700 hover:bg-gray-100"
            )} rounded transition text-sm flex items-center justify-center`}
          >
            {isLoggedIn ? (
              <>
                <FiUser className="mr-2 w-4 h-4" />
                Edit profile
              </>
            ) : (
              <>
                <FiLogIn className="mr-2 w-4 h-4" />
                Sign in
              </>
            )}
          </button>
        </div>

        {/* Popular authors */}
        <div className={card}>
          <h3 className={heading}>
            <FiUsers className="mr-2 w-4 h-4" />
            Popular authors
          </h3>

          {popularAuthors.length === 0 ? (
            <p className={`${muted} text-sm`}>No authors yet.</p>
          ) : (
            <div className="space-y-1">
              {popularAuthors.map((author) => (
                <button
                  key={author.id}
                  onClick={() => onOpenAuthor(author)}
                  className={`w-full flex items-center justify-between ${themeClass(
                    "hover:bg-[#222]",
                    "hover:bg-gray-100"
                  )} p-2 rounded transition`}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      <Avatar user={author} size="sm" themeClass={themeClass} />
                    </div>
                    <div className="text-left">
                      <div className={`${themeClass("text-white", "text-gray-900")} text-sm`}>
                        {author.username}
                      </div>
                      <div className={`${themeClass("text-[#777]", "text-gray-500")} text-xs`}>
                        {author.storyCount} {author.storyCount === 1 ? "post" : "posts"}
                      </div>
                    </div>
                  </div>
                  <FiChevronRight className={themeClass("text-[#777]", "text-gray-500")} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Platform stats */}
        <div className={card}>
          <h3 className={heading}>
            <FiBarChart2 className="mr-2 w-4 h-4" />
            Storlo in numbers
          </h3>
          <div className="space-y-3 text-sm">
            {[
              { label: "Total posts", value: platformStats.totalPosts },
              { label: "Active writers", value: platformStats.activeWriters },
              { label: "New this week", value: platformStats.thisWeek },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className={muted}>{row.label}</span>
                <span className={themeClass("text-white", "text-gray-900")}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        {isLoggedIn && (
          <button
            onClick={onLogout}
            className={`w-full py-2.5 border ${themeClass(
              "border-[#444] text-red-400 hover:bg-red-500/10 hover:border-red-500/30",
              "border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-300"
            )} transition text-sm flex items-center justify-center rounded-lg`}
          >
            <FiLogOut className="mr-2 w-4 h-4" />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;