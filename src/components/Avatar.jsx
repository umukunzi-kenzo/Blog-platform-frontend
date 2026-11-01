const sizes = {
  sm: "w-7 h-7 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-2xl",
};

const Avatar = ({ user, size = "md", themeClass }) => {
  const initial = user?.username?.charAt(0).toUpperCase() || "A";
  const sizeClass = sizes[size];

  // when the user has a profile picture, show it
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username || "User"}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  // otherwise show the first letter of the username
  return (
    <div
      className={`${sizeClass} ${themeClass(
        "bg-[#333] text-white",
        "bg-gray-200 text-gray-900"
      )} rounded-full flex items-center justify-center font-medium flex-shrink-0`}
    >
      {initial}
    </div>
  );
};

export default Avatar;