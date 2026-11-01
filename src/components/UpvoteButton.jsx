import { FiArrowUp } from "react-icons/fi";

const UpvoteButton = ({
  count,
  isUpvoted,
  disabled,
  onClick,
  title = "Upvote",
  themeClass,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isUpvoted ? "Remove your upvote" : title}
      aria-pressed={isUpvoted}
      title={isUpvoted ? "Remove your upvote" : title}
      className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border text-sm transition ${
        isUpvoted
          ? themeClass(
              "bg-blue-500/20 border-blue-500/40 text-blue-400",
              "bg-blue-50 border-blue-300 text-blue-600"
            )
          : disabled
          ? themeClass(
              "border-[#333] text-[#555] cursor-not-allowed",
              "border-gray-200 text-gray-400 cursor-not-allowed"
            )
          : themeClass(
              "border-[#444] text-[#ccc] hover:border-blue-500/40 hover:text-blue-400",
              "border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600"
            )
      }`}
    >
      <FiArrowUp className="w-4 h-4" />
      <span>{count}</span>
    </button>
  );
};

export default UpvoteButton;