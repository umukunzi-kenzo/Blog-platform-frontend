import { useState } from "react";
import { FiEdit } from "react-icons/fi";

const TITLE_MAX = 150;
const CONTENT_MAX = 20000;

// "post" is empty when writing a new post, and filled when editing one
const CreatePostModal = ({ post, onSubmit, onClose, themeClass }) => {
  const isEditing = Boolean(post);

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim() && content.trim() && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full ${themeClass(
    "bg-[#222] border-[#444] text-white placeholder-[#777]",
    "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
  )} border rounded-lg px-4 py-2 focus:outline-none focus:border-[#666] transition text-sm`;

  const counter = themeClass("text-[#777]", "text-gray-500");

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div
        className={`${themeClass(
          "bg-[#1a1a1a] border-[#333]",
          "bg-white border-gray-200"
        )} rounded-xl border w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className={`p-5 border-b ${themeClass("border-[#333]", "border-gray-200")}`}>
          <h2
            className={`text-lg font-bold ${themeClass(
              "text-white",
              "text-gray-900"
            )} mb-1 flex items-center`}
          >
            <FiEdit className="mr-2 w-5 h-5" />
            {isEditing ? "Edit post" : "Create new post"}
          </h2>
          <p className={themeClass("text-[#999]", "text-gray-600")}>
            {isEditing ? "Update your post" : "Share your thoughts with the community"}
          </p>
        </div>

        {/* Form */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label
                htmlFor="post-title"
                className={`${themeClass("text-[#ccc]", "text-gray-700")} text-sm font-medium`}
              >
                Title
              </label>
              <span className={`${counter} text-xs`}>
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX}
              autoFocus
              placeholder="Give your post a clear title"
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label
                htmlFor="post-content"
                className={`${themeClass("text-[#ccc]", "text-gray-700")} text-sm font-medium`}
              >
                Content
              </label>
              <span className={`${counter} text-xs`}>
                {content.length}/{CONTENT_MAX}
              </span>
            </div>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={CONTENT_MAX}
              rows="10"
              placeholder="Write your post here..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className={`p-5 border-t ${themeClass("border-[#333]", "border-gray-200")}`}>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 ${themeClass(
                "bg-[#222] text-white hover:bg-[#333]",
                "bg-gray-200 text-gray-900 hover:bg-gray-300"
              )} rounded-lg transition font-medium text-sm`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                canSubmit
                  ? themeClass(
                      "bg-white text-black hover:bg-[#f0f0f0]",
                      "bg-gray-900 text-white hover:bg-gray-800"
                    )
                  : themeClass(
                      "bg-[#222] text-[#666] cursor-not-allowed",
                      "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )
              }`}
            >
              {submitting
                ? isEditing
                  ? "Saving..."
                  : "Publishing..."
                : isEditing
                ? "Save changes"
                : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;