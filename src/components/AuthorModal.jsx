import { useEffect } from "react";
import { FiX, FiBook, FiInfo, FiCalendar, FiClock, FiCheck, FiPlus } from "react-icons/fi";
import Avatar from "./Avatar";

const AuthorModal = ({
  author,
  posts,
  isOwnProfile,
  isFollowing,
  onFollow,
  onOpenPost,
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

  const border = themeClass("border-[#333]", "border-gray-200");
  const muted = themeClass("text-[#999]", "text-gray-600");

  return (
    // clicking the dark background closes the window
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center md:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${themeClass(
          "bg-[#1a1a1a] border-[#333]",
          "bg-white border-gray-200"
        )} w-full max-w-2xl h-full md:h-auto md:max-h-[85vh] md:rounded-xl overflow-hidden border flex flex-col`}
      >
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b ${border} flex items-start justify-between`}>
          <div className="flex items-center min-w-0">
            <div className="mr-4">
              <Avatar user={author} size="lg" themeClass={themeClass} />
            </div>
            <div className="min-w-0">
              <h2
                className={`text-xl sm:text-2xl font-bold ${themeClass(
                  "text-white",
                  "text-gray-900"
                )} truncate`}
              >
                {author.username || "Anonymous"}
              </h2>
              <div className="flex flex-wrap items-center mt-1 gap-x-4 gap-y-2">
                <p className={`${muted} text-sm flex items-center`}>
                  <FiBook className="mr-1 w-4 h-4" />
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                </p>

                {!isOwnProfile && (
                  <button
                    onClick={() => onFollow(author._id, author.username)}
                    className={`px-3 py-1 rounded-lg transition text-xs flex items-center ${
                      isFollowing
                        ? themeClass("bg-[#333] text-[#ccc]", "bg-gray-200 text-gray-700")
                        : themeClass(
                            "bg-white text-black hover:bg-[#f0f0f0]",
                            "bg-gray-900 text-white hover:bg-gray-800"
                          )
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <FiCheck className="mr-1 w-3 h-3" />
                        Following
                      </>
                    ) : (
                      <>
                        <FiPlus className="mr-1 w-3 h-3" />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition flex-shrink-0 ml-3 ${themeClass(
              "bg-[#222] hover:bg-[#333] text-white",
              "bg-gray-200 hover:bg-gray-300 text-gray-900"
            )}`}
          >
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Bio */}
          <div className={`p-5 sm:p-6 border-b ${border}`}>
            <h3
              className={`text-md font-semibold ${themeClass(
                "text-white",
                "text-gray-900"
              )} mb-3 flex items-center`}
            >
              <FiInfo className="mr-2 w-4 h-4" />
              About
            </h3>
            <div className={`p-4 ${themeClass("bg-[#222]", "bg-gray-50")} rounded-lg`}>
              <p
                className={`${themeClass(
                  "text-[#ccc]",
                  "text-gray-700"
                )} leading-relaxed whitespace-pre-wrap break-words`}
              >
                {author.bio || "This author hasn't written a bio yet."}
              </p>
            </div>
          </div>

          {/* Posts */}
          <div className="p-5 sm:p-6">
            <h3
              className={`text-md font-semibold ${themeClass(
                "text-white",
                "text-gray-900"
              )} mb-3 flex items-center`}
            >
              <FiBook className="mr-2 w-4 h-4" />
              Posts
            </h3>

            {posts.length === 0 ? (
              <div className="text-center py-8">
                <FiBook
                  className={`w-12 h-12 ${themeClass("text-[#444]", "text-gray-300")} mx-auto mb-3`}
                />
                <p className={muted}>No posts published yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <button
                    key={post._id}
                    onClick={() => onOpenPost(post)}
                    className={`w-full text-left p-4 ${themeClass(
                      "bg-[#222] border-[#333] hover:border-[#444] hover:bg-[#2a2a2a]",
                      "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                    )} rounded-lg border transition`}
                  >
                    <h4 className={`${themeClass("text-white", "text-gray-900")} font-medium mb-1`}>
                      {post.title}
                    </h4>
                    <div className={`flex items-center text-xs ${muted}`}>
                      <FiCalendar className="mr-1 w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      <FiClock className="mr-1 w-3 h-3" />
                      {Math.max(1, Math.ceil(post.content.length / 500))} min read
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorModal;