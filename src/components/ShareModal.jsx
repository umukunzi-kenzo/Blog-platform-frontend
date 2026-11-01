import { FiShare2, FiTwitter, FiFacebook, FiLinkedin, FiCopy } from "react-icons/fi";

const ShareModal = ({ post, onClose, showNotification, themeClass }) => {
  const postUrl = `${window.location.origin}/post/${post._id}`;
  const text = `Check out this post: ${post.title}`;

  // copy the link to the clipboard
  const copyLink = () => {
    navigator.clipboard
      .writeText(postUrl)
      .then(() => showNotification("Link copied to clipboard!", "success"))
      .catch(() => showNotification("Failed to copy link", "error"));
  };

  // open the share window of a social network
  const shareTo = (platform) => {
    let url;

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      default:
        return;
    }

    window.open(url, "_blank", "width=600,height=400");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
      <div
        className={`${themeClass(
          "bg-[#1a1a1a] border-[#333]",
          "bg-white border-gray-200"
        )} rounded-xl border w-full max-w-sm overflow-hidden`}
      >
        {/* Header */}
        <div className={`p-5 border-b ${themeClass("border-[#333]", "border-gray-200")}`}>
          <h2
            className={`text-lg font-bold ${themeClass(
              "text-white",
              "text-gray-900"
            )} mb-1 flex items-center`}
          >
            <FiShare2 className="mr-2 w-5 h-5" />
            Share Post
          </h2>
          <p className={`${themeClass("text-[#999]", "text-gray-600")} truncate`}>"{post.title}"</p>
        </div>

        {/* Buttons */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => shareTo("twitter")}
              className="p-3 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center text-sm"
            >
              <FiTwitter className="w-4 h-4 mr-2" />
              Twitter
            </button>
            <button
              onClick={() => shareTo("facebook")}
              className="p-3 bg-[#4267B2] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center text-sm"
            >
              <FiFacebook className="w-4 h-4 mr-2" />
              Facebook
            </button>
            <button
              onClick={() => shareTo("linkedin")}
              className="p-3 bg-[#0077B5] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center text-sm"
            >
              <FiLinkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </button>
            <button
              onClick={copyLink}
              className={`p-3 ${themeClass(
                "bg-[#222] text-white hover:bg-[#333]",
                "bg-gray-200 text-gray-900 hover:bg-gray-300"
              )} rounded-lg transition flex items-center justify-center text-sm`}
            >
              <FiCopy className="w-4 h-4 mr-2" />
              Copy Link
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 ${themeClass(
                "bg-[#222] text-white hover:bg-[#333]",
                "bg-gray-200 text-gray-900 hover:bg-gray-300"
              )} rounded-lg transition font-medium text-sm`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;