import { FiBookmark, FiClock, FiCheck } from "react-icons/fi";
import Avatar from "./Avatar";
import UpvoteButton from "./UpvoteButton";

// isLiked / likeCount / onToggleLike are the upvote of the post
const PostCard = ({
  post,
  isOwnPost,
  isSaved,
  isLiked,
  likeCount,
  isFollowingAuthor,
  onOpen,
  onOpenAuthor,
  onToggleLike,
  onToggleSave,
  themeClass,
}) => {
  const authorName = post.author?.username || "Anonymous";
  const readTime = Math.max(1, Math.ceil(post.content.length / 500));
  const muted = themeClass("text-[#999]", "text-gray-600");

  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      onClick={() => onOpen(post)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(post);
      }}
      role="button"
      tabIndex={0}
      className={`${themeClass(
        "bg-[#1a1a1a] border-[#333] hover:border-[#444] hover:bg-[#222]",
        "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      )} rounded-lg border p-4 sm:p-5 transition cursor-pointer`}
    >
      {/* Author and date */}
      <div className="flex items-center mb-3 text-sm">
        {post.author ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenAuthor(post.author);
            }}
            className={`flex items-center ${themeClass(
              "text-[#ccc] hover:text-white",
              "text-gray-700 hover:text-gray-900"
            )} transition`}
          >
            <Avatar user={post.author} size="sm" themeClass={themeClass} />
            <span className="ml-2 truncate max-w-[140px] sm:max-w-none">{authorName}</span>
            {isFollowingAuthor && <FiCheck className="ml-2 text-green-400 w-3 h-3" />}
          </button>
        ) : (
          <span className="flex items-center">
            <Avatar user={null} size="sm" themeClass={themeClass} />
            <span className={`ml-2 ${muted}`}>Deleted user</span>
          </span>
        )}
        <span className={`mx-2 ${muted}`}>•</span>
        <span className={muted}>{date}</span>
      </div>

      {/* Title and preview */}
      <h3 className={`text-lg font-semibold ${themeClass("text-white", "text-gray-900")} mb-2`}>
        {post.title}
      </h3>
      <p className={`${muted} text-sm leading-relaxed line-clamp-2`}>{post.content}</p>

      {/* Footer: read time, upvote, save */}
      <div className="flex items-center justify-between mt-4">
        <span className={`${themeClass("text-[#777]", "text-gray-500")} text-xs flex items-center`}>
          <FiClock className="mr-1 w-3 h-3" />
          {readTime} min read
        </span>

        <div className="flex items-center space-x-3">
          <UpvoteButton
            count={likeCount}
            isUpvoted={isLiked}
            disabled={Boolean(isOwnPost)}
            title={isOwnPost ? "You cannot upvote your own post" : "Upvote this post"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(post._id);
            }}
            themeClass={themeClass}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(post._id);
            }}
            aria-label={isSaved ? "Remove from saved" : "Save this post"}
            className={`transition ${
              isSaved
                ? "text-yellow-400"
                : themeClass(
                    "text-[#777] hover:text-yellow-400",
                    "text-gray-500 hover:text-yellow-500"
                  )
            }`}
          >
            <FiBookmark className={`w-4 h-4 ${isSaved ? "fill-yellow-400" : ""}`} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;