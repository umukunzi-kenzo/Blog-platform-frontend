import { FiBell, FiX } from "react-icons/fi";
import Avatar from "./Avatar";

// turns a date into "just now", "5m ago", "3h ago", "2d ago"
const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationsDropdown = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose,
  themeClass,
}) => {
  const border = themeClass("border-[#333]", "border-gray-200");
  const muted = themeClass("text-[#999]", "text-gray-600");

  return (
    <>
      {/* invisible layer: clicking anywhere outside closes the dropdown */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className={`fixed top-16 right-4 z-50 w-[calc(100vw-2rem)] sm:w-80 ${themeClass(
          "bg-[#1a1a1a] border-[#333]",
          "bg-white border-gray-200"
        )} border rounded-lg shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${border} flex justify-between items-center`}>
          <h3 className={`font-medium ${themeClass("text-white", "text-gray-900")}`}>
            Notifications
          </h3>
          <div className="flex items-center space-x-3 text-sm">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={onMarkAllRead}
                className={themeClass("text-[#999] hover:text-white", "text-gray-600 hover:text-gray-900")}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close notifications"
              className={themeClass("text-[#999] hover:text-white", "text-gray-600 hover:text-gray-900")}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <FiBell
                className={`w-10 h-10 ${themeClass("text-[#444]", "text-gray-300")} mx-auto mb-3`}
              />
              <p className={muted}>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification._id}
                onClick={() => onMarkRead(notification._id)}
                className={`w-full text-left p-3 border-b ${border} ${themeClass(
                  "hover:bg-[#222]",
                  "hover:bg-gray-100"
                )} ${
                  !notification.read ? themeClass("bg-[#222]/50", "bg-gray-100") : ""
                } transition`}
              >
                <div className="flex items-start">
                  <div className="mr-3">
                    <Avatar user={notification.actor} size="sm" themeClass={themeClass} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${themeClass("text-white", "text-gray-900")} text-sm`}>
                      {notification.message}
                    </p>
                    <p className={`${themeClass("text-[#777]", "text-gray-500")} text-xs mt-1`}>
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1.5 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsDropdown;