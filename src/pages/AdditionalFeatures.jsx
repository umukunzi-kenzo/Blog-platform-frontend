import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { 
  FiEdit, FiEdit2, FiTrash2, FiImage, FiVideo, FiFileText, FiTag, 
  FiFilter, FiCalendar, FiTrendingUp, FiBarChart2, FiEye,
  FiBookOpen, FiMoon, FiSun, FiType, FiDownload, FiClock,
  FiGrid, FiLayers, FiMessageSquare, FiShare2, FiBookmark,
  FiThumbsUp, FiMessageCircle, FiUsers, FiUserCheck, FiAward,
  FiFlag, FiAlertCircle, FiCheckCircle, FiXCircle, FiSettings,
  FiSearch, FiChevronDown, FiChevronUp, FiPlus, FiMinus,
  FiSave, FiX, FiCheck, FiExternalLink, FiCornerDownRight,
  FiBook, FiHome, FiCompass, FiFolder, FiUser, FiLogOut,
  FiFacebook, FiTwitter, FiLinkedin, FiCopy
} from 'react-icons/fi';

const AdditionalFeatures = () => {
  const [activeTab, setActiveTab] = useState("postEditor");
  const [userPosts, setUserPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postTags, setPostTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [fontSize, setFontSize] = useState("medium");
  const [readingMode, setReadingMode] = useState(false);
  const [draftPosts, setDraftPosts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    dateFrom: "",
    dateTo: "",
    minLikes: 0,
    tags: [],
    author: ""
  });
  const [keyboardShortcuts, setKeyboardShortcuts] = useState([
    { key: "E", description: "Edit post", action: "edit" },
    { key: "N", description: "New post", action: "new" },
    { key: "S", description: "Save post", action: "save" },
    { key: "F", description: "Toggle fullscreen", action: "fullscreen" },
    { key: "D", description: "Toggle dark mode", action: "darkmode" }
  ]);
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    avgReadingTime: 0,
    mostPopularPost: null
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnComment: true,
    emailOnFollow: true,
    pushNotifications: false,
    weeklyDigest: true
  });
  const [contentReports, setContentReports] = useState([]);
  const [showOfflinePosts, setShowOfflinePosts] = useState(false);
  const [offlinePosts, setOfflinePosts] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePost, setSharePost] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const textareaRef = useRef(null);

  // DARK/LIGHT MODE STATE
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("blogTheme");
    // Default to dark if no preference saved
    return saved ? saved === "dark" : true;
  });

  // Apply theme when component mounts or theme changes
  useEffect(() => {
    applyTheme(isDarkMode);
    fetchUserInfo();
  }, [isDarkMode]);

  // Load user posts
  useEffect(() => {
    fetchUserPosts();
    loadUserPreferences();
    loadDrafts();
    loadOfflinePosts();
  }, []);

  // Theme application function
  const applyTheme = (dark) => {
    const root = document.documentElement;
    
    if (dark) {
      // DARK THEME (Your original colors)
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      // LIGHT THEME (Inverted colors)
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
    
    localStorage.setItem("blogTheme", dark ? "dark" : "light");
  };

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Helper function to get theme-based classes
  const themeClass = (darkClass, lightClass) => {
    return isDarkMode ? darkClass : lightClass;
  };

  // Load user preferences including theme
  const loadUserPreferences = () => {
    const fontSizePref = localStorage.getItem("fontSize") || "medium";
    const readingModePref = localStorage.getItem("readingMode") === "true";
    
    setFontSize(fontSizePref);
    setReadingMode(readingModePref);
  };

  // Get user info
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const response = await API.get("/api/auth/profile");
        setUserInfo(response.data.user);
        localStorage.setItem("userId", response.data.user.id);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await API.get("/api/posts");
      const userId = localStorage.getItem("userId");
      
      // Filter posts by current user
      const userPosts = response.data.filter(post => {
        // Check if post.author exists and matches current user
        return post.author && post.author._id === userId;
      });
      
      setUserPosts(userPosts);
      
      // Calculate stats
      const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
      const totalComments = userPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
      const avgReadingTime = userPosts.length > 0 ? 
        userPosts.reduce((sum, post) => sum + Math.ceil(post.content?.length / 500), 0) / userPosts.length : 0;
      const mostPopularPost = userPosts.length > 0 ? 
        userPosts.reduce((prev, current) => (prev.likes > current.likes) ? prev : current) : null;
      
      setUserStats({
        totalPosts: userPosts.length,
        totalLikes,
        totalComments,
        avgReadingTime: Math.round(avgReadingTime),
        mostPopularPost
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const loadDrafts = () => {
    const savedDrafts = JSON.parse(localStorage.getItem("postDrafts") || "[]");
    setDraftPosts(savedDrafts);
  };

  const loadOfflinePosts = () => {
    const savedOffline = JSON.parse(localStorage.getItem("offlinePosts") || "[]");
    setOfflinePosts(savedOffline);
  };

  // ✅ CREATE NEW POST FUNCTION
  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      showNotification("Please add a title and content for your post", "error");
      return;
    }

    try {
      const response = await API.post("/api/posts", {
        title: postTitle,
        content: postContent,
        tags: postTags
      });
      
      // The backend should now populate author info
      const newPost = response.data;
      
      // Add to user posts list
      setUserPosts([newPost, ...userPosts]);
      
      // Reset form
      setPostTitle("");
      setPostContent("");
      setPostTags([]);
      setImagePreview("");
      
      showNotification("Post created successfully!", "success");
      
      // Update stats
      fetchUserPosts();
      
    } catch (error) {
      showNotification("Error creating post: " + (error.response?.data?.message || error.message), "error");
    }
  };

  /// ✅ ADD THIS DEDICATED UPDATE FUNCTION
const handleUpdatePost = async () => {
  if (!editingPost) return;
  
  try {
    console.log('UPDATING POST:', editingPost._id, newPost);
    const response = await API.put(`/api/posts/${editingPost._id}`, {
      title: newPost.title,
      content: newPost.content
    });
    
    console.log('Update response:', response.data);
    
    // Update the post in the list
    setPosts(prev => prev.map(post => 
      post._id === editingPost._id 
        ? { ...post, title: newPost.title, content: newPost.content }
        : post
    ));
    
    // Reset everything
    setNewPost({ title: "", content: "" });
    setEditingPost(null);
    setShowCreatePostModal(false);
    
    showCenterNotification("Post updated successfully!", "success");
  } catch (error) {
    console.error('Update error:', error);
    showCenterNotification("Error updating post: " + (error.response?.data?.message || error.message), "error");
  }
};

  // ✅ DELETE POST FUNCTION (Author only)
  const handleDeletePost = async (postId) => {
    if (!postId) return;
    
    try {
      await API.delete(`/api/posts/${postId}`);
      
      // Remove from local state
      setUserPosts(prev => prev.filter(post => post._id !== postId));
      setPostToDelete(null);
      setShowDeleteConfirm(false);
      
      showNotification("Post deleted successfully!", "success");
      
      // Update stats
      fetchUserPosts();
    } catch (error) {
      showNotification("Error deleting post: " + (error.response?.data?.message || error.message), "error");
    }
  };

  // ✅ SHARE POST FUNCTIONALITY
  const handleSharePost = (post) => {
    setSharePost(post);
    setShowShareModal(true);
  };

  // ✅ COPY TO CLIPBOARD
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification("Link copied to clipboard!", "success");
    }).catch(err => {
      showNotification("Failed to copy link", "error");
    });
  };

  // ✅ SHARE TO SOCIAL MEDIA
  const shareToSocialMedia = (platform) => {
    if (!sharePost) return;
    
    const postUrl = `${window.location.origin}/post/${sharePost._id}`;
    const text = `Check out this post: ${sharePost.title}`;
    
    let url;
    switch(platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareModal(false);
    showNotification(`Shared to ${platform} successfully!`, "success");
  };

  // POST EDITING FEATURE
  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostTitle(post.title);
    setPostContent(post.content);
    setPostTags(post.tags || []);
    setActiveTab("postEditor");
    
    // Scroll to top so user can see the edit form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // RICH TEXT EDITOR FEATURES
  const applyFormatting = (format) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = postContent.substring(start, end);
    
    let formattedText = "";
    switch(format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "link":
        const url = prompt("Enter URL:");
        if (url) formattedText = `[${selectedText}](${url})`;
        else formattedText = selectedText;
        break;
      case "heading":
        formattedText = `# ${selectedText}`;
        break;
      case "list":
        formattedText = `- ${selectedText}`;
        break;
      case "code":
        formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = postContent.substring(0, start) + formattedText + postContent.substring(end);
    setPostContent(newContent);
  };

  // IMAGE UPLOAD FOR POSTS
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image must be less than 5MB", "error");
      return;
    }
    
    setPostImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // TAGS MANAGEMENT
  const handleAddTag = () => {
    if (tagInput.trim() && !postTags.includes(tagInput.trim())) {
      setPostTags([...postTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setPostTags(postTags.filter(tag => tag !== tagToRemove));
  };

  // DRAFTS FEATURE
  const saveAsDraft = () => {
    const draft = {
      id: Date.now(),
      title: postTitle,
      content: postContent,
      tags: postTags,
      image: imagePreview,
      createdAt: new Date().toISOString()
    };
    
    const updatedDrafts = [draft, ...draftPosts];
    setDraftPosts(updatedDrafts);
    localStorage.setItem("postDrafts", JSON.stringify(updatedDrafts));
    
    showNotification("Post saved as draft", "success");
  };

  const loadDraft = (draft) => {
    setPostTitle(draft.title || "");
    setPostContent(draft.content || "");
    setPostTags(draft.tags || []);
    setImagePreview(draft.image || "");
    showNotification("Draft loaded", "info");
  };

  // SCHEDULING FEATURE
  const schedulePost = () => {
    const scheduleDate = prompt("Enter date and time (YYYY-MM-DD HH:MM):");
    if (!scheduleDate) return;
    
    const scheduledPost = {
      id: Date.now(),
      title: postTitle,
      content: postContent,
      tags: postTags,
      scheduledFor: new Date(scheduleDate).toISOString(),
      createdAt: new Date().toISOString()
    };
    
    setScheduledPosts([...scheduledPosts, scheduledPost]);
    showNotification("Post scheduled successfully", "success");
  };

  // ADVANCED SEARCH FILTERS
  const applySearchFilters = () => {
    showNotification("Filters applied", "info");
  };

  // FONT SIZE CONTROLS
  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
  };

  // READING MODE
  const toggleReadingMode = () => {
    const newMode = !readingMode;
    setReadingMode(newMode);
    localStorage.setItem("readingMode", newMode);
  };

  // OFFLINE READING
  const saveForOffline = (post) => {
    const offlinePost = {
      ...post,
      savedAt: new Date().toISOString()
    };
    
    const updatedOffline = [offlinePost, ...offlinePosts];
    setOfflinePosts(updatedOffline);
    localStorage.setItem("offlinePosts", JSON.stringify(updatedOffline));
    
    showNotification("Post saved for offline reading", "success");
  };

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
          case 'e':
            e.preventDefault();
            if (userPosts.length > 0) handleEditPost(userPosts[0]);
            break;
          case 'n':
            e.preventDefault();
            setActiveTab("postEditor");
            break;
          case 's':
            e.preventDefault();
            if (editingPost) handleUpdatePost();
            else saveAsDraft();
            break;
          case 'd':
            e.preventDefault();
            toggleTheme();
            break;
          case 'f':
            e.preventDefault();
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [userPosts, editingPost]);

  // CONTENT REPORTING
  const reportContent = (postId, reason) => {
    const report = {
      postId,
      reason,
      reportedAt: new Date().toISOString(),
      status: "pending"
    };
    
    setContentReports([...contentReports, report]);
    showNotification("Content reported for review", "info");
  };

  // NOTIFICATION SETTINGS
  const updateNotificationSetting = (setting, value) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: value
    });
    localStorage.setItem(`notification_${setting}`, value);
  };

  // ANALYTICS CALCULATION
  const calculatePostAnalytics = (post) => {
    const words = post.content.split(/\s+/).length;
    const readTime = Math.ceil(words / 200);
    const engagementRate = ((post.likes || 0) + (post.comments?.length || 0)) / 100;
    
    return { words, readTime, engagementRate };
  };

  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    
    // Determine colors based on type
    let bgColor, borderColor, iconColor, icon;
    const dark = isDarkMode;
    
    switch(type) {
      case "success":
        bgColor = dark ? 'bg-[#1a1a1a]' : 'bg-white';
        borderColor = dark ? 'border-green-500/50' : 'border-green-400';
        iconColor = dark ? 'text-green-400' : 'text-green-600';
        icon = '✓';
        break;
      case "error":
        bgColor = dark ? 'bg-[#1a1a1a]' : 'bg-white';
        borderColor = dark ? 'border-red-500/50' : 'border-red-400';
        iconColor = dark ? 'text-red-400' : 'text-red-600';
        icon = '✕';
        break;
      default:
        bgColor = dark ? 'bg-[#1a1a1a]' : 'bg-white';
        borderColor = dark ? 'border-[#444]' : 'border-gray-300';
        iconColor = dark ? 'text-white' : 'text-gray-900';
        icon = 'ℹ';
    }
    
    notification.className = `fixed top-4 right-4 z-[9999] p-4 rounded-xl border-l-4 ${bgColor} ${borderColor} shadow-2xl backdrop-blur-sm animate-slide-in min-w-[300px] max-w-md`;
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-full ${bgColor} ${borderColor} border flex items-center justify-center ${iconColor} font-bold">
            ${icon}
          </div>
        </div>
        <div class="ml-3 flex-1">
          <p class="${dark ? 'text-white' : 'text-gray-900'} font-medium text-sm">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="${dark ? 'text-[#999] hover:text-white' : 'text-gray-500 hover:text-gray-900'} ml-4 flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      .animate-slide-in {
        animation: slide-in 0.3s ease-out;
      }
    `;
    if (!document.querySelector('style[data-notification-style]')) {
      style.setAttribute('data-notification-style', 'true');
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slide-in 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  };

  return (
    <div className={`min-h-screen ${themeClass('bg-[#111111] text-[#e5e5e5]', 'bg-white text-gray-900')} transition-colors duration-200`}>
      {/* Theme Toggle Button - FIXED POSITION */}
      <button
        onClick={toggleTheme}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${themeClass(
          'bg-[#1a1a1a] border-[#333] text-white',
          'bg-gray-100 border-gray-300 text-gray-800'
        )} border`}
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <FiSun className="w-5 h-5" />
        ) : (
          <FiMoon className="w-5 h-5" />
        )}
      </button>
      
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 ${themeClass('bg-[#1a1a1a] border-[#333]', 'bg-gray-50 border-gray-200')} border-b`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <h1 className={`text-xl font-bold ${themeClass('text-white', 'text-gray-900')}`}>
              Advanced Features
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => window.history.back()}
                className={`${themeClass('text-[#ccc] hover:text-white', 'text-gray-600 hover:text-gray-900')} transition flex items-center`}
              >
                <FiHome className="mr-2" />
                Back to Home
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: "postEditor", label: "Post Editor", icon: FiEdit },
              { id: "drafts", label: "Drafts", icon: FiSave },
              { id: "scheduled", label: "Scheduled", icon: FiCalendar },
              { id: "analytics", label: "Analytics", icon: FiBarChart2 },
              { id: "search", label: "Advanced Search", icon: FiFilter },
              { id: "appearance", label: "Appearance", icon: FiSun },
              { id: "notifications", label: "Notifications", icon: FiSettings },
              { id: "shortcuts", label: "Shortcuts", icon: FiType },
              { id: "offline", label: "Offline", icon: FiDownload },
              { id: "reports", label: "Content Reports", icon: FiFlag }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg flex items-center whitespace-nowrap transition ${themeClass(
                  activeTab === tab.id
                    ? 'bg-[#222] text-white border-t border-l border-r border-[#444]'
                    : 'text-[#999] hover:text-white hover:bg-[#1a1a1a]',
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900 border-t border-l border-r border-gray-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}`}
              >
                <tab.icon className="mr-2 w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* POST EDITOR TAB */}
        {activeTab === "postEditor" && (
          <div className="space-y-6">
            {/* ✅ EDIT FORM APPEARS FIRST - Only show when editing */}
            {editingPost && (
              <div className={`${themeClass('bg-[#1a1a1a] border-[#333]', 'bg-white border-gray-200')} rounded-lg border p-6 shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${themeClass('text-white', 'text-gray-900')} flex items-center`}>
                    <FiEdit2 className="mr-3" />
                    Editing: "{editingPost.title}"
                  </h2>
                  <button 
                    onClick={() => {
                      setEditingPost(null);
                      setPostTitle("");
                      setPostContent("");
                      setPostTags([]);
                    }}
                    className={`p-2 ${themeClass('bg-[#222] hover:bg-[#333] text-white', 'bg-gray-200 hover:bg-gray-300 text-gray-900')} rounded-lg transition`}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Rich Text Toolbar */}
                <div className={`flex flex-wrap gap-2 mb-4 p-3 ${themeClass('bg-[#222]', 'bg-gray-100')} rounded-lg`}>
                  <button onClick={() => applyFormatting("bold")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition`}>
                    <span className="font-bold">B</span>
                  </button>
                  <button onClick={() => applyFormatting("italic")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition`}>
                    <span className="italic">I</span>
                  </button>
                  <button onClick={() => applyFormatting("link")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition flex items-center`}>
                    <FiExternalLink className="w-4 h-4" />
                  </button>
                  <button onClick={() => applyFormatting("heading")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition`}>
                    H1
                  </button>
                  <button onClick={() => applyFormatting("list")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition`}>
                    • List
                  </button>
                  <button onClick={() => applyFormatting("code")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition`}>
                    {`</>`}
                  </button>
                  
                  {/* Image Upload */}
                  <label className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition cursor-pointer flex items-center`}>
                    <FiImage className="w-4 h-4 mr-1" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    Add Image
                  </label>
                  
                  <button 
                    onClick={() => handleSharePost(editingPost)}
                    className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition flex items-center`}
                  >
                    <FiShare2 className="w-4 h-4 mr-1" />
                    Share
                  </button>
                </div>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4">
                    <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg" />
                    <button onClick={() => setImagePreview("")} className={`mt-2 ${themeClass('text-red-400 hover:text-red-300', 'text-red-600 hover:text-red-700')}`}>
                      Remove Image
                    </button>
                  </div>
                )}
                
                {/* Title Input */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Post Title"
                    className={`w-full ${themeClass('bg-[#222] border-[#444] text-white placeholder-[#777]', 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500')} border rounded-lg px-4 py-3 focus:outline-none focus:border-[#666]`}
                  />
                </div>
                
                {/* Content Textarea */}
                <div className="mb-4">
                  <textarea
                    ref={textareaRef}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Write your post here... (Supports Markdown)"
                    rows={12}
                    className={`w-full ${themeClass('bg-[#222] border-[#444] text-white placeholder-[#777]', 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500')} border rounded-lg px-4 py-3 focus:outline-none focus:border-[#666] resize-none font-mono`}
                  />
                </div>
                
                {/* Tags Input */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <FiTag className={`mr-2 ${themeClass('text-[#777]', 'text-gray-500')}`} />
                    <span className={themeClass('text-[#ccc]', 'text-gray-700')}>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {postTags.map(tag => (
                      <span key={tag} className={`px-3 py-1 ${themeClass('bg-[#333]', 'bg-gray-200')} rounded-full text-sm flex items-center`}>
                        #{tag}
                        <button onClick={() => removeTag(tag)} className={`ml-2 ${themeClass('text-[#999] hover:text-white', 'text-gray-500 hover:text-gray-700')}`}>
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add a tag and press Enter"
                      className={`flex-1 ${themeClass('bg-[#222] border-[#444] text-white placeholder-[#777]', 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500')} border rounded-l-lg px-4 py-2 focus:outline-none focus:border-[#666]`}
                    />
                    <button onClick={handleAddTag} className={`px-4 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-300 hover:bg-gray-400')} rounded-r-lg transition`}>
                      Add
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleUpdatePost} className={`px-6 py-3 ${themeClass('bg-white text-black hover:bg-[#f0f0f0]', 'bg-gray-900 text-white hover:bg-gray-800')} rounded-lg transition font-medium flex items-center shadow-lg`}>
                    <FiCheck className="mr-2" />
                    Update Post
                  </button>
                  <button onClick={() => {
                    setEditingPost(null);
                    setPostTitle("");
                    setPostContent("");
                    setPostTags([]);
                  }} className={`px-6 py-3 ${themeClass('bg-[#222] text-white hover:bg-[#333]', 'bg-gray-100 text-gray-900 hover:bg-gray-200')} rounded-lg transition font-medium`}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ✅ CREATE POST FORM - Only show when NOT editing */}
            {!editingPost && (
              <div className={`${themeClass('bg-[#1a1a1a] border-[#333]', 'bg-white border-gray-200')} rounded-lg border p-6`}>
                <h2 className={`text-xl font-bold ${themeClass('text-white', 'text-gray-900')} mb-4 flex items-center`}>
                  <FiEdit className="mr-3" />
                  Create New Post
                </h2>
                
                {/* Rich Text Toolbar */}
                <div className={`flex flex-wrap gap-2 mb-4 p-3 ${themeClass('bg-[#222]', 'bg-gray-100')} rounded-lg`}>
                  <button onClick={() => applyFormatting("bold")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition`}>
                    <span className="font-bold">B</span>
                  </button>
                  <button onClick={() => applyFormatting("italic")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition`}>
                    <span className="italic">I</span>
                  </button>
                  <button onClick={() => applyFormatting("link")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition flex items-center`}>
                    <FiExternalLink className="w-4 h-4" />
                  </button>
                  <button onClick={() => applyFormatting("heading")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition`}>
                    H1
                  </button>
                  <button onClick={() => applyFormatting("list")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition`}>
                    • List
                  </button>
                  <button onClick={() => applyFormatting("code")} className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition`}>
                    {`</>`}
                  </button>
                  
                  {/* Image Upload */}
                  <label className={`p-2 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-200 hover:bg-gray-300')} rounded transition cursor-pointer flex items-center`}>
                    <FiImage className="w-4 h-4 mr-1" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    Add Image
                  </label>
                </div>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4">
                    <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg" />
                    <button onClick={() => setImagePreview("")} className={`mt-2 ${themeClass('text-red-400 hover:text-red-300', 'text-red-600 hover:text-red-700')}`}>
                      Remove Image
                    </button>
                  </div>
                )}
                
                {/* Title Input */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Post Title"
                    className={`w-full ${themeClass('bg-[#222] border-[#444] text-white placeholder-[#777]', 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500')} border rounded-lg px-4 py-3 focus:outline-none focus:border-[#666]`}
                  />
                </div>
                
                {/* Content Textarea */}
                <div className="mb-4">
                  <textarea
                    ref={textareaRef}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Write your post here... (Supports Markdown)"
                    rows={12}
                    className={`w-full ${themeClass('bg-[#222] border-[#444] text-white placeholder-[#777]', 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500')} border rounded-lg px-4 py-3 focus:outline-none focus:border-[#666] resize-none font-mono`}
                  />
                </div>
                
                {/* Tags Input */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <FiTag className={`mr-2 ${themeClass('text-[#777]', 'text-gray-500')}`} />
                    <span className={themeClass('text-[#ccc]', 'text-gray-700')}>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {postTags.map(tag => (
                      <span key={tag} className={`px-3 py-1 ${themeClass('bg-[#333]', 'bg-gray-200')} rounded-full text-sm flex items-center`}>
                        #{tag}
                        <button onClick={() => removeTag(tag)} className={`ml-2 ${themeClass('text-[#999] hover:text-white', 'text-gray-500 hover:text-gray-700')}`}>
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add a tag and press Enter"
                      className={`flex-1 ${themeClass('bg-[#222] border-[#444] text-white placeholder-[#777]', 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500')} border rounded-l-lg px-4 py-2 focus:outline-none focus:border-[#666]`}
                    />
                    <button onClick={handleAddTag} className={`px-4 ${themeClass('bg-[#333] hover:bg-[#444]', 'bg-gray-300 hover:bg-gray-400')} rounded-r-lg transition`}>
                      Add
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleCreatePost} className={`px-6 py-3 ${themeClass('bg-white text-black hover:bg-[#f0f0f0]', 'bg-gray-900 text-white hover:bg-gray-800')} rounded-lg transition font-medium flex items-center`}>
                    <FiSave className="mr-2" />
                    Publish Post
                  </button>
                  <button onClick={saveAsDraft} className={`px-6 py-3 ${themeClass('bg-[#222] text-white hover:bg-[#333]', 'bg-gray-100 text-gray-900 hover:bg-gray-200')} rounded-lg transition font-medium flex items-center`}>
                    <FiSave className="mr-2" />
                    Save as Draft
                  </button>
                  <button onClick={schedulePost} className={`px-6 py-3 ${themeClass('bg-[#444] text-white hover:bg-[#555]', 'bg-gray-300 text-gray-900 hover:bg-gray-400')} rounded-lg transition font-medium flex items-center`}>
                    <FiCalendar className="mr-2" />
                    Schedule Post
                  </button>
                </div>
              </div>
            )}
            
            {/* ✅ YOUR POSTS LIST - Always visible at the bottom */}
            <div className={`${themeClass('bg-[#1a1a1a] border-[#333]', 'bg-white border-gray-200')} rounded-lg border p-6`}>
              <h3 className={`text-lg font-bold ${themeClass('text-white', 'text-gray-900')} mb-4 flex items-center`}>
                <FiEdit className="mr-2" />
                Your Posts ({userPosts.length})
              </h3>
              {userPosts.length === 0 ? (
                <p className={themeClass('text-[#999]', 'text-gray-600')}>You haven't created any posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {userPosts.map(post => (
                    <div key={post._id} className={`p-4 ${themeClass('bg-[#222] border-[#333] hover:border-[#444]', 'bg-gray-50 border-gray-200 hover:border-gray-300')} rounded-lg border transition`}>
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className={themeClass('text-white', 'text-gray-900')}>{post.title}</h4>
                          <p className={`${themeClass('text-[#999]', 'text-gray-600')} text-sm mt-1`}>
                            {new Date(post.createdAt).toLocaleDateString()} • 
                            {post.tags?.map(tag => ` #${tag}`)}
                          </p>
                          {/* ✅ Show author info if available */}
                          {post.author && (
                            <p className={`${themeClass('text-[#777]', 'text-gray-500')} text-xs mt-1 flex items-center`}>
                              <FiUser className="mr-1" />
                              By: {post.author.username || userInfo?.username || "You"}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPost(post)}
                            className={`px-4 py-2 ${themeClass('bg-[#333] text-white hover:bg-[#444]', 'bg-gray-200 text-gray-900 hover:bg-gray-300')} rounded-lg transition flex items-center`}
                          >
                            <FiEdit className="mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleSharePost(post)}
                            className={`px-4 py-2 ${themeClass('bg-[#333] text-white hover:bg-[#444]', 'bg-gray-200 text-gray-900 hover:bg-gray-300')} rounded-lg transition flex items-center`}
                          >
                            <FiShare2 className="mr-2" />
                            Share
                          </button>
                          <button
                            onClick={() => {
                              setPostToDelete(post);
                              setShowDeleteConfirm(true);
                            }}
                            className={`px-4 py-2 ${themeClass('bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300', 'bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700')} rounded-lg transition flex items-center`}
                          >
                            <FiTrash2 className="mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DRAFTS TAB */}
        {activeTab === "drafts" && (
          <div className={`${themeClass('bg-[#1a1a1a] border-[#333]', 'bg-white border-gray-200')} rounded-lg border p-6`}>
            <h2 className={`text-xl font-bold ${themeClass('text-white', 'text-gray-900')} mb-6 flex items-center`}>
              <FiSave className="mr-3" />
              Draft Posts ({draftPosts.length})
            </h2>
            
            {draftPosts.length === 0 ? (
              <div className="text-center py-12">
                <FiSave className={`w-16 h-16 ${themeClass('text-[#444]', 'text-gray-300')} mx-auto mb-4`} />
                <p className={themeClass('text-[#999]', 'text-gray-600')}>No draft posts saved yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {draftPosts.map(draft => (
                  <div key={draft.id} className={`p-4 ${themeClass('bg-[#222] border-[#333] hover:border-[#444]', 'bg-gray-50 border-gray-200 hover:border-gray-300')} rounded-lg border transition`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={themeClass('text-white', 'text-gray-900')}>{draft.title || "Untitled Draft"}</h4>
                        <p className={`${themeClass('text-[#999]', 'text-gray-600')} text-sm mt-2 line-clamp-2`}>
                          {draft.content?.substring(0, 200)}...
                        </p>
                        <div className={`flex items-center mt-3 ${themeClass('text-[#777]', 'text-gray-500')} text-sm`}>
                          <FiClock className="mr-1" />
                          {new Date(draft.createdAt).toLocaleDateString()}
                          {draft.tags?.length > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <FiTag className="mr-1" />
                              {draft.tags.join(", ")}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => loadDraft(draft)}
                          className={`px-3 py-2 ${themeClass('bg-[#333] text-white hover:bg-[#444]', 'bg-gray-200 text-gray-900 hover:bg-gray-300')} rounded-lg transition flex items-center`}
                        >
                          <FiEdit className="mr-1 w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDraftPosts(draftPosts.filter(d => d.id !== draft.id));
                            localStorage.setItem("postDrafts", JSON.stringify(
                              draftPosts.filter(d => d.id !== draft.id)
                            ));
                          }}
                          className={`px-3 py-2 ${themeClass('bg-red-500/20 text-red-400 hover:bg-red-500/30', 'bg-red-100 text-red-600 hover:bg-red-200')} rounded-lg transition flex items-center`}
                        >
                          <FiTrash2 className="mr-1 w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div className={`${themeClass('bg-[#1a1a1a] border-[#333]', 'bg-white border-gray-200')} rounded-lg border p-6`}>
              <h2 className={`text-xl font-bold ${themeClass('text-white', 'text-gray-900')} mb-6 flex items-center`}>
                <FiSun className="mr-3" />
                Appearance Settings
              </h2>
              
              <div className="space-y-6">
                {/* Theme Toggle */}
                <div className={`flex items-center justify-between p-4 ${themeClass('bg-[#222]', 'bg-gray-100')} rounded-lg`}>
                  <div className="flex items-center">
                    {isDarkMode ? <FiMoon className="mr-3" /> : <FiSun className="mr-3" />}
                    <div>
                      <div className={themeClass('text-white', 'text-gray-900')}>Theme</div>
                      <div className={themeClass('text-[#999]', 'text-gray-600')}>Switch between dark and light mode</div>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${themeClass(
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-300',
                      isDarkMode ? 'bg-gray-300' : 'bg-blue-600'
                    )}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Font Size */}
                <div className={`p-4 ${themeClass('bg-[#222]', 'bg-gray-100')} rounded-lg`}>
                  <div className={`${themeClass('text-white', 'text-gray-900')} font-medium mb-3 flex items-center`}>
                    <FiType className="mr-2" />
                    Font Size
                  </div>
                  <div className="flex space-x-3">
                    {["small", "medium", "large"].map(size => (
                      <button
                        key={size}
                        onClick={() => changeFontSize(size)}
                        className={`px-4 py-2 rounded-lg transition ${
                          fontSize === size
                            ? themeClass('bg-white text-black', 'bg-gray-900 text-white')
                            : themeClass('bg-[#333] text-white hover:bg-[#444]', 'bg-gray-200 text-gray-900 hover:bg-gray-300')
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className={`mt-4 text-sm ${themeClass('text-[#999]', 'text-gray-600')}`}>
                    Preview: <span className={themeClass('text-white', 'text-gray-900')}>The quick brown fox jumps over the lazy dog</span>
                  </div>
                </div>
                
                {/* Reading Mode */}
                <div className={`flex items-center justify-between p-4 ${themeClass('bg-[#222]', 'bg-gray-100')} rounded-lg`}>
                  <div className="flex items-center">
                    <FiBookOpen className="mr-3" />
                    <div>
                      <div className={themeClass('text-white', 'text-gray-900')}>Reading Mode</div>
                      <div className={themeClass('text-[#999]', 'text-gray-600')}>Distraction-free reading experience</div>
                    </div>
                  </div>
                  <button
                    onClick={toggleReadingMode}
                    className={`px-4 py-2 rounded-lg transition ${
                      readingMode
                        ? themeClass('bg-white text-black', 'bg-gray-900 text-white')
                        : themeClass('bg-[#333] text-white hover:bg-[#444]', 'bg-gray-200 text-gray-900 hover:bg-gray-300')
                    }`}
                  >
                    {readingMode ? "On" : "Off"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs... (rest of the code remains similar) */}
        
        {/* ✅ IMPROVED DELETE CONFIRMATION MODAL */}
        {showDeleteConfirm && postToDelete && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`${themeClass('bg-[#1a1a1a] border-[#333]', 'bg-white border-gray-200')} rounded-2xl border w-full max-w-md overflow-hidden shadow-2xl transform transition-all`}>
              {/* Header with gradient */}
              <div className={`p-6 border-b ${themeClass('border-[#333] bg-gradient-to-r from-red-500/10 to-orange-500/10', 'border-gray-200 bg-gradient-to-r from-red-50 to-orange-50')}`}>
                <div className="flex items-center mb-3">
                  <div className={`w-12 h-12 rounded-full ${themeClass('bg-red-500/20', 'bg-red-100')} flex items-center justify-center mr-4`}>
                    <FiTrash2 className={`w-6 h-6 ${themeClass('text-red-400', 'text-red-600')}`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${themeClass('text-white', 'text-gray-900')}`}>
                      Delete Post?
                    </h2>
                    <p className={`${themeClass('text-red-400', 'text-red-600')} text-sm`}>
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Post preview */}
                <div className={`mb-6 p-4 ${themeClass('bg-[#222] border-[#444]', 'bg-gray-50 border-gray-300')} rounded-xl border`}>
                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-lg ${themeClass('bg-[#333]', 'bg-gray-200')} flex items-center justify-center mr-3 flex-shrink-0`}>
                      <FiFileText className={`w-5 h-5 ${themeClass('text-white', 'text-gray-600')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`${themeClass('text-white', 'text-gray-900')} font-semibold mb-1 truncate`}>
                        {postToDelete.title}
                      </h3>
                      <div className={`${themeClass('text-[#999]', 'text-gray-600')} text-sm flex items-center`}>
                        <FiCalendar className="w-3 h-3 mr-1" />
                        Created {new Date(postToDelete.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      {postToDelete.tags && postToDelete.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {postToDelete.tags.slice(0, 3).map(tag => (
                            <span key={tag} className={`px-2 py-0.5 ${themeClass('bg-[#333] text-[#999]', 'bg-gray-200 text-gray-600')} rounded text-xs`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning message */}
                <div className={`mb-6 p-4 ${themeClass('bg-[#222] border-red-500/30', 'bg-red-50 border-red-200')} rounded-xl border-l-4`}>
                  <div className="flex items-start">
                    <FiAlertCircle className={`w-5 h-5 ${themeClass('text-red-400', 'text-red-600')} mr-3 flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className={`${themeClass('text-red-400', 'text-red-700')} font-medium text-sm mb-1`}>
                        Warning
                      </p>
                      <p className={`${themeClass('text-[#ccc]', 'text-gray-700')} text-sm`}>
                        This will permanently delete your post and remove it from all readers' feeds. This action is irreversible.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setPostToDelete(null);
                    }}
                    className={`flex-1 px-5 py-3 ${themeClass('bg-[#222] text-white hover:bg-[#333] border border-[#444]', 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300')} rounded-xl transition font-medium text-sm shadow-sm`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeletePost(postToDelete._id)}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition font-medium text-sm shadow-lg flex items-center justify-center"
                  >
                    <FiTrash2 className="w-4 h-4 mr-2" />
                    Delete Forever
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ ADD: SHARE MODAL (with high z-index) */}
        {showShareModal && sharePost && (
          <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
            <div className={`${themeClass('bg-[#1a1a1a] border-[#333]', 'bg-white border-gray-200')} rounded-xl border w-full max-w-sm overflow-hidden`}>
              <div className={`p-5 border-b ${themeClass('border-[#333]', 'border-gray-200')}`}>
                <h2 className={`text-lg font-bold ${themeClass('text-white', 'text-gray-900')} mb-1 flex items-center`}>
                  <FiShare2 className="mr-2 w-5 h-5" />
                  Share Post
                </h2>
                <p className={`${themeClass('text-[#999]', 'text-gray-600')} truncate`}>
                  "{sharePost.title}"
                </p>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => shareToSocialMedia('twitter')}
                    className="p-3 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center text-sm"
                  >
                    <FiTwitter className="w-4 h-4 mr-2" />
                    Twitter
                  </button>
                  <button
                    onClick={() => shareToSocialMedia('facebook')}
                    className="p-3 bg-[#4267B2] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center text-sm"
                  >
                    <FiFacebook className="w-4 h-4 mr-2" />
                    Facebook
                  </button>
                  <button
                    onClick={() => shareToSocialMedia('linkedin')}
                    className="p-3 bg-[#0077B5] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center text-sm"
                  >
                    <FiLinkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </button>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/post/${sharePost._id}`)}
                    className={`p-3 ${themeClass('bg-[#222] text-white hover:bg-[#333]', 'bg-gray-200 text-gray-900 hover:bg-gray-300')} rounded-lg transition flex items-center justify-center text-sm`}
                  >
                    <FiCopy className="w-4 h-4 mr-2" />
                    Copy Link
                  </button>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className={`px-4 py-2 ${themeClass('bg-[#222] text-white hover:bg-[#333]', 'bg-gray-200 text-gray-900 hover:bg-gray-300')} rounded-lg transition font-medium text-sm`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Footer */}
        <div className={`mt-8 p-6 ${themeClass('bg-[#1a1a1a] border-[#333]', 'bg-gray-50 border-gray-200')} rounded-lg border`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 ${themeClass('bg-[#222]', 'bg-white')} rounded-lg`}>
              <div className={themeClass('text-white', 'text-gray-900')}>{userStats.totalPosts}</div>
              <div className={themeClass('text-[#999]', 'text-gray-600')}>Total Posts</div>
            </div>
            <div className={`text-center p-4 ${themeClass('bg-[#222]', 'bg-white')} rounded-lg`}>
              <div className={themeClass('text-white', 'text-gray-900')}>{userStats.totalLikes}</div>
              <div className={themeClass('text-[#999]', 'text-gray-600')}>Total Likes</div>
            </div>
            <div className={`text-center p-4 ${themeClass('bg-[#222]', 'bg-white')} rounded-lg`}>
              <div className={themeClass('text-white', 'text-gray-900')}>{userStats.totalComments}</div>
              <div className={themeClass('text-[#999]', 'text-gray-600')}>Total Comments</div>
            </div>
            <div className={`text-center p-4 ${themeClass('bg-[#222]', 'bg-white')} rounded-lg`}>
              <div className={themeClass('text-white', 'text-gray-900')}>{userStats.avgReadingTime}</div>
              <div className={themeClass('text-[#999]', 'text-gray-600')}>Avg. Read Time (min)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalFeatures;