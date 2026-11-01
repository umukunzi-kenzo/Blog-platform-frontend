import { useState } from "react";
import { FiUser, FiMail, FiSave, FiUpload } from "react-icons/fi";
import Avatar from "./Avatar";

const BIO_MAX = 500;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ProfileModal = ({
  initialData,
  avatarUrl,
  uploadingAvatar,
  onAvatarChange,
  onSave,
  onClose,
  themeClass,
}) => {
  const [form, setForm] = useState({
    username: initialData.username || "",
    email: initialData.email || "",
    bio: initialData.bio || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // update one field of the form
  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
    setError("");
  };

  const handleSave = async () => {
    const username = form.username.trim();
    const email = form.email.trim();

    // check the fields before sending them
    if (username.length < 3 || username.length > 30) {
      setError("Username must be between 3 and 30 characters");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setSaving(true);
    try {
      await onSave({ username, email, bio: form.bio.trim() });
    } catch (err) {
      setError(err.response?.data?.message || "Could not update your profile");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `w-full ${themeClass(
    "bg-[#222] border-[#444] text-white placeholder-[#777]",
    "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
  )} border rounded-lg py-2 focus:outline-none focus:border-[#666] transition text-sm`;

  const label = `block ${themeClass("text-[#ccc]", "text-gray-700")} text-sm mb-1`;
  const iconClass = themeClass("text-[#777]", "text-gray-500");

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div
        className={`${themeClass(
          "bg-[#1a1a1a] border-[#333]",
          "bg-white border-gray-200"
        )} rounded-xl border w-full max-w-sm overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className={`p-5 border-b ${themeClass("border-[#333]", "border-gray-200")}`}>
          <h2
            className={`text-lg font-bold ${themeClass(
              "text-white",
              "text-gray-900"
            )} mb-1 flex items-center`}
          >
            <FiUser className="mr-2 w-5 h-5" />
            Edit profile
          </h2>
          <p className={themeClass("text-[#999]", "text-gray-600")}>
            Update your account information
          </p>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {/* Profile picture */}
          <div className="flex items-center space-x-4 mb-5">
            <Avatar
              user={{ username: form.username, avatar: avatarUrl }}
              size="lg"
              themeClass={themeClass}
            />
            <div className="flex-1">
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                onChange={onAvatarChange}
                disabled={uploadingAvatar}
                className="hidden"
              />
              <label
                htmlFor="profile-picture"
                className={`block px-3 py-1.5 ${themeClass(
                  "bg-[#222] text-white hover:bg-[#333]",
                  "bg-gray-200 text-gray-900 hover:bg-gray-300"
                )} rounded-lg transition text-center cursor-pointer text-sm`}
              >
                <FiUpload className="inline w-3 h-3 mr-1" />
                {uploadingAvatar ? "Uploading..." : "Change picture"}
              </label>
              <p className={`${themeClass("text-[#777]", "text-gray-500")} text-xs mt-1`}>
                Max 5MB
              </p>
            </div>
          </div>

          {error && (
            <div
              className={`mb-4 p-3 rounded-lg border text-sm ${themeClass(
                "bg-red-500/10 border-red-500/30 text-red-400",
                "bg-red-50 border-red-200 text-red-700"
              )}`}
            >
              {error}
            </div>
          )}

          <div className="space-y-3 mb-5">
            <div>
              <label htmlFor="profile-username" className={label}>
                Username
              </label>
              <div className="relative">
                <FiUser
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`}
                />
                <input
                  id="profile-username"
                  type="text"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  maxLength={30}
                  className={`${inputClass} pl-9 pr-3`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-email" className={label}>
                Email address
              </label>
              <div className="relative">
                <FiMail
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`}
                />
                <input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={`${inputClass} pl-9 pr-3`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-bio" className={label}>
                Bio
              </label>
              <textarea
                id="profile-bio"
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows="3"
                maxLength={BIO_MAX}
                className={`${inputClass} px-3 resize-none`}
              />
              <p className={`${themeClass("text-[#777]", "text-gray-500")} text-xs text-right mt-1`}>
                {form.bio.length}/{BIO_MAX}
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 ${themeClass(
                "bg-[#222] text-white hover:bg-[#333]",
                "bg-gray-200 text-gray-900 hover:bg-gray-300"
              )} rounded-lg transition font-medium text-sm flex-1`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 ${themeClass(
                "bg-white text-black hover:bg-[#f0f0f0]",
                "bg-gray-900 text-white hover:bg-gray-800"
              )} rounded-lg transition font-medium text-sm flex-1 flex items-center justify-center`}
            >
              <FiSave className="mr-1 w-3 h-3" />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;