import { useEffect } from "react";
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiShare2,
  FiBookmark,
  FiClock,
  FiCheck,
  FiPlus,
} from "react-icons/fi";
import Avatar from "./Avatar";
import CommentSection from "./CommentSection";
import UpvoteButton from "./UpvoteButton";

// isLiked / likeCount / onToggleLike are the upvote of the post
const PostModal = ({
  post,
  isLoggedIn,
  userInfo,
  isLiked,
  likeCount,
  isSaved,
  isFollowingAuthor,
  onClose,
  onEdit,
  onDelete,
  onShare,
  onToggleLike,
  onToggleSave,
  onFollow,
  onOpenAuthor,
  onRequireLogin,
  showNotification,
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

  const isOwner = Boolean(isLoggedIn && post.author?._id && post.author._id === userInfo?.id);
  const canDelete = isOwner || (isLoggedIn && userInfo?.role === "admin");
  const readTime = Math.max(1, Math.ceil(post.content.length / 500));
  const muted = themeClass("text-[#999]", "text-gray-600");
  const border = themeClass("border-[#333]", "border-gray-200");

  // style shared by the square buttons in the header
  const headerButton = `w-9 h-9 flex items-center justify-center rounded-lg transition ${themeClass(
    "bg-[#222] hover:bg-[#333] text-white",
    "bg-gray-200 hover:bg-gray-300 text-gray-900"
  )}`;

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
        )} w-full max-w-6xl h-full md:h-[90vh] md:rounded-xl overflow-hidden border flex flex-col`}
      >
        {/* Header */}
        <div className={`border-b ${border} px-4 md:px-5 py-3 flex items-center justify-between`}>
          <button
            onClick={onClose}
            className={`${themeClass(
              "text-white bg-[#333] hover:bg-[#444]",
              "text-gray-900 bg-gray-200 hover:bg-gray-300"
            )} transition flex items-center text-sm px-3 py-1.5 rounded-lg`}
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="flex items-center space-x-2">
            {isOwner && (
              <button
                onClick={() => onEdit(post)}
                className={headerButton}
                aria-label="Edit post"
                title="Edit post"
              >
                <FiEdit />
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => onDelete(post)}
                aria-label="Delete post"
                title="Delete post"
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition ${themeClass(
                  "bg-red-500/20 hover:bg-red-500/30 text-red-400",
                  "bg-red-100 hover:bg-red-200 text-red-600"
                )}`}
              >
                <FiTrash2 />
              </button>
            )}

            <button
              onClick={() => onShare(post)}
              className={headerButton}
              aria-label="Share post"
              title="Share"
            >
              <FiShare2 />
            </button>

            <button
              onClick={() => onToggleSave(post._id)}
              aria-label={isSaved ? "Remove from saved" : "Save this post"}
              title={isSaved ? "Remove from saved" : "Save this post"}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition ${
                isSaved
                  ? themeClass("bg-yellow-400/20 text-yellow-400", "bg-yellow-100 text-yellow-600")
                  : themeClass(
                      "bg-[#222] hover:bg-[#333] text-white",
                      "bg-gray-200 hover:bg-gray-300 text-gray-900"
                    )
              }`}
            >
              <FiBookmark className={isSaved ? "fill-yellow-400" : ""} />
            </button>
          </div>
        </div>

        {/* Body: the post on the left, comments on the right (below the post on phones) */}
        <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row">
          {/* Post */}
          <div className="md:flex-1 md:min-h-0 md:overflow-y-auto p-5">
            <div className="max-w-3xl mx-auto">
              {/* Author row */}
              <div className={`flex items-center justify-between mb-6 pb-5 border-b ${border}`}>
                {post.author ? (
                  <button
                    onClick={() => onOpenAuthor(post.author)}
                    className="flex items-center hover:opacity-80 transition text-left"
                  >
                    <div className="mr-3">
                      <Avatar user={post.author} size="md" themeClass={themeClass} />
                    </div>
                    <div>
                      <div className={themeClass("text-white", "text-gray-900")}>
                        {post.author.username}
                      </div>
                      <div className={`${muted} text-sm flex items-center`}>
                        <FiClock className="mr-1 w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center">
                    <div className="mr-3">
                      <Avatar user={null} size="md" themeClass={themeClass} />
                    </div>
                    <div className={muted}>Deleted user</div>
                  </div>
                )}

                {post.author && !isOwner && (
                  <button
                    onClick={() => onFollow(post.author._id, post.author.username)}
                    className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center text-sm border ${
                      isFollowingAuthor
                        ? themeClass(
                            "bg-[#222] text-[#ccc] border-[#444]",
                            "bg-gray-100 text-gray-700 border-gray-300"
                          )
                        : themeClass(
                            "bg-white text-black hover:bg-[#f0f0f0] border-transparent",
                            "bg-gray-900 text-white hover:bg-gray-800 border-transparent"
                          )
                    }`}
                  >
                    {isFollowingAuthor ? (
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

              {/* Title and content */}
              <h1
                className={`text-2xl sm:text-3xl font-bold ${themeClass(
                  "text-white",
                  "text-gray-900"
                )} mb-5`}
              >
                {post.title}
              </h1>

              <div
                className={`${themeClass(
                  "text-[#e5e5e5]",
                  "text-gray-900"
                )} leading-relaxed whitespace-pre-wrap break-words mb-6`}
              >
                {post.content}
              </div>

              {/* Upvote and read time */}
              <div className={`flex items-center space-x-4 pt-5 border-t ${border}`}>
                <UpvoteButton
                  count={likeCount}
                  isUpvoted={isLiked}
                  disabled={isOwner}
                  title={isOwner ? "You cannot upvote your own post" : "Upvote this post"}
                  onClick={() => onToggleLike(post._id)}
                  themeClass={themeClass}
                />
                <div className={`${muted} text-sm flex items-center`}>
                  <FiClock className="mr-1 w-4 h-4" />
                  {readTime} min read
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className={`md:w-2/5 md:min-h-0 border-t md:border-t-0 md:border-l ${border}`}>
            <CommentSection
              post={post}
              isLoggedIn={isLoggedIn}
              userInfo={userInfo}
              themeClass={themeClass}
              onRequireLogin={onRequireLogin}
              onOpenAuthor={onOpenAuthor}
              showNotification={showNotification}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;