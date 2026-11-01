import { useState, useEffect } from "react";
import API from "../services/api";
import Avatar from "./Avatar";
import UpvoteButton from "./UpvoteButton";
import {
  FiMessageCircle,
  FiSend,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
} from "react-icons/fi";

const CommentSection = ({
  post,
  isLoggedIn,
  userInfo,
  themeClass,
  onRequireLogin,
  onOpenAuthor,
  showNotification,
}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // load the comments each time a different post is opened
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/api/posts/${post._id}/comments`);
        setComments(response.data);
      } catch (error) {
        showNotification("Could not load comments", "error");
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [post._id]);

  // add a new comment
  const handleAddComment = async () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await API.post(`/api/posts/${post._id}/comments`, {
        content: newComment,
      });
      setComments([response.data, ...comments]);
      setNewComment("");
      showNotification("Comment added successfully!", "success");
    } catch (error) {
      showNotification(error.response?.data?.message || "Could not add comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // upvote a comment, or remove your upvote
  const handleToggleUpvote = async (comment) => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    // changes the numbers of one comment
    const applyVote = (isUpvoted, upvoteCount) => {
      setComments((prev) =>
        prev.map((c) => (c._id === comment._id ? { ...c, isUpvoted, upvoteCount } : c))
      );
    };

    // show the change right away, then confirm with the server
    applyVote(!comment.isUpvoted, comment.upvoteCount + (comment.isUpvoted ? -1 : 1));

    try {
      const response = await API.put(`/api/comments/${comment._id}/upvote`);
      applyVote(response.data.isUpvoted, response.data.upvoteCount);
    } catch (error) {
      // undo the change
      applyVote(comment.isUpvoted, comment.upvoteCount);
      showNotification(error.response?.data?.message || "Could not save your upvote", "error");
    }
  };

  // start and stop editing a comment
  const startEditing = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  // save an edited comment
  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const response = await API.put(`/api/comments/${commentId}`, {
        content: editText,
      });
      setComments(comments.map((c) => (c._id === commentId ? response.data : c)));
      cancelEditing();
      showNotification("Comment updated!", "success");
    } catch (error) {
      showNotification(error.response?.data?.message || "Could not update comment", "error");
    }
  };

  // delete a comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await API.delete(`/api/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
      showNotification("Comment deleted", "info");
    } catch (error) {
      showNotification(error.response?.data?.message || "Could not delete comment", "error");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`p-5 border-b ${themeClass("border-[#333]", "border-gray-200")}`}>
        <h3
          className={`text-md font-bold ${themeClass("text-white", "text-gray-900")} mb-1 flex items-center`}
        >
          <FiMessageCircle className="mr-2 w-4 h-4" />
          Comments ({comments.length})
        </h3>
        <p className={themeClass("text-[#999]", "text-gray-600")}>Join the conversation</p>
      </div>

      {/* Write a comment */}
      <div className={`p-5 border-b ${themeClass("border-[#333]", "border-gray-200")}`}>
        <div className="mb-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isLoggedIn ? "Add a comment..." : "Log in to comment"}
            maxLength={5000}
            rows="2"
            disabled={!isLoggedIn}
            onClick={() => {
              if (!isLoggedIn) onRequireLogin();
            }}
            className={`w-full ${themeClass(
              "bg-[#222] border-[#444] text-white placeholder-[#777]",
              "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
            )} border rounded-lg px-3 py-2 focus:outline-none focus:border-[#666] resize-none text-sm`}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAddComment}
            disabled={submitting || (isLoggedIn && !newComment.trim())}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center text-sm ${
              !isLoggedIn
                ? themeClass(
                    "bg-[#333] text-[#999] hover:bg-[#444]",
                    "bg-gray-200 text-gray-500 hover:bg-gray-300"
                  )
                : !newComment.trim()
                ? themeClass("bg-[#222] text-[#666]", "bg-gray-100 text-gray-400")
                : themeClass(
                    "bg-white text-black hover:bg-[#f0f0f0]",
                    "bg-gray-900 text-white hover:bg-gray-800"
                  )
            }`}
          >
            <FiSend className="mr-1 w-3 h-3" />
            {!isLoggedIn ? "Login to comment" : submitting ? "Posting..." : "Post comment"}
          </button>
        </div>
      </div>

      {/* List of comments */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <p className={`text-center ${themeClass("text-[#999]", "text-gray-600")}`}>
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <div className="text-center py-6">
            <FiMessageCircle
              className={`w-10 h-10 ${themeClass("text-[#444]", "text-gray-300")} mx-auto mb-3`}
            />
            <p className={themeClass("text-[#999]", "text-gray-600")}>
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const author = comment.author;
              const isOwner = Boolean(userInfo?.id && author?._id === userInfo.id);
              const canDelete = isOwner || userInfo?.role === "admin";
              const isPostAuthor = Boolean(author?._id && author._id === post.author?._id);
              const wasEdited = comment.updatedAt !== comment.createdAt;

              const dateRow = (
                <span
                  className={`${themeClass("text-[#777]", "text-gray-500")} text-xs flex items-center`}
                >
                  <FiClock className="mr-1 w-3 h-3" />
                  {new Date(comment.createdAt).toLocaleDateString()}
                  {wasEdited && <span className="ml-1">(edited)</span>}
                </span>
              );

              return (
                <div
                  key={comment._id}
                  className={`pb-4 border-b ${themeClass("border-[#333]", "border-gray-200")} last:border-0`}
                >
                  {/* Who wrote it (the name opens their profile) */}
                  <div className="flex items-start mb-2">
                    {author ? (
                      <button
                        onClick={() => onOpenAuthor(author)}
                        aria-label={`Open the profile of ${author.username}`}
                        className="flex items-start text-left group"
                      >
                        <div className="mr-2">
                          <Avatar user={author} size="sm" themeClass={themeClass} />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span
                              className={`${themeClass(
                                "text-white",
                                "text-gray-900"
                              )} font-medium text-sm group-hover:underline`}
                            >
                              {author.username}
                            </span>
                            {isPostAuthor && (
                              <span
                                className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${themeClass(
                                  "bg-blue-500/20 text-blue-400",
                                  "bg-blue-100 text-blue-700"
                                )}`}
                              >
                                Author
                              </span>
                            )}
                          </div>
                          {dateRow}
                        </div>
                      </button>
                    ) : (
                      <>
                        <div className="mr-2">
                          <Avatar user={null} size="sm" themeClass={themeClass} />
                        </div>
                        <div>
                          <div
                            className={`${themeClass("text-[#999]", "text-gray-600")} font-medium text-sm`}
                          >
                            Deleted user
                          </div>
                          {dateRow}
                        </div>
                      </>
                    )}
                  </div>

                  {/* The text, or the edit box */}
                  {editingId === comment._id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={5000}
                        rows="3"
                        className={`w-full ${themeClass(
                          "bg-[#222] border-[#444] text-white",
                          "bg-gray-50 border-gray-300 text-gray-900"
                        )} border rounded-lg px-3 py-2 focus:outline-none focus:border-[#666] resize-none text-sm`}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={cancelEditing}
                          className={`px-3 py-1 rounded-lg text-sm flex items-center ${themeClass(
                            "bg-[#222] text-white hover:bg-[#333]",
                            "bg-gray-200 text-gray-900 hover:bg-gray-300"
                          )}`}
                        >
                          <FiX className="mr-1 w-3 h-3" />
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateComment(comment._id)}
                          className={`px-3 py-1 rounded-lg text-sm flex items-center ${themeClass(
                            "bg-white text-black hover:bg-[#f0f0f0]",
                            "bg-gray-900 text-white hover:bg-gray-800"
                          )}`}
                        >
                          <FiCheck className="mr-1 w-3 h-3" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className={`${themeClass("text-[#e5e5e5]", "text-gray-900")} text-sm leading-relaxed whitespace-pre-wrap break-words`}
                    >
                      {comment.content}
                    </p>
                  )}

                  {/* Upvote, edit and delete */}
                  {editingId !== comment._id && (
                    <div className="flex items-center mt-3 space-x-3">
                      <UpvoteButton
                        count={comment.upvoteCount}
                        isUpvoted={comment.isUpvoted}
                        disabled={isOwner}
                        title={isOwner ? "You cannot upvote your own comment" : "Upvote this comment"}
                        onClick={() => handleToggleUpvote(comment)}
                        themeClass={themeClass}
                      />

                      {isOwner && (
                        <button
                          onClick={() => startEditing(comment)}
                          className={`${themeClass(
                            "text-[#999] hover:text-white",
                            "text-gray-500 hover:text-gray-700"
                          )} transition text-xs flex items-center`}
                        >
                          <FiEdit2 className="mr-1 w-3 h-3" />
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className={`${themeClass(
                            "text-red-400 hover:text-red-300",
                            "text-red-600 hover:text-red-700"
                          )} transition text-xs flex items-center`}
                        >
                          <FiTrash2 className="mr-1 w-3 h-3" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;