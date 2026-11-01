import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";
import PostModal from "../components/PostModal";
import CreatePostModal from "../components/CreatePostModal";
import ProfileModal from "../components/ProfileModal";
import AuthorModal from "../components/AuthorModal";
import SettingsModal from "../components/SettingsModal";
import NotificationsDropdown from "../components/NotificationsDropdown";
import ConfirmModal from "../components/ConfirmModal";
import RegisterPopup from "../components/RegisterPopup";
import ShareModal from "../components/ShareModal";
import {
  FiFeather,
  FiCompass,
  FiBookmark,
  FiUsers,
  FiEdit,
  FiBookOpen,
  FiArrowLeft,
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
  FiBell,
  FiTrash2,
  FiLogOut,
} from "react-icons/fi";

/* ========================
   Helpers
======================== */

// the user counts as logged in while a token is saved
// (an expired access token is renewed with the refresh token)
const hasSession = () => {
  return Boolean(localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));
};

// the texts shown at the top of each view
const VIEWS = {
  home: {
    title: "Welcome to Storlo",
    subtitle: "Ask questions, share fixes, and learn from each other.",
    icon: FiFeather,
    listTitle: "Recent posts",
  },
  discover: {
    title: "Discover",
    subtitle: "Explore the most upvoted posts from the community",
    icon: FiCompass,
    listTitle: "All posts",
  },
  saved: {
    title: "Saved posts",
    subtitle: "Posts you saved for later",
    icon: FiBookmark,
    listTitle: "Saved posts",
  },
  following: {
    title: "Following",
    subtitle: "Posts from authors you follow",
    icon: FiUsers,
    listTitle: "From people you follow",
  },
};

// the texts shown when a view has no posts
const EMPTY = {
  home: { title: "No posts yet", text: "Be the first to share a question or a fix." },
  discover: { title: "No posts yet", text: "Be the first to share something." },
  saved: { title: "No saved posts yet", text: "Save posts you want to read later." },
  following: { title: "Nothing here yet", text: "Follow some authors to see their posts here." },
};

const HomePage = () => {
  const navigate = useNavigate();

  /* ========================
     State
  ======================== */

  // posts (each post has "upvoteCount" and "isUpvoted" from the server)
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // the logged in user, with his saved posts and the authors he follows
  const [isLoggedIn, setIsLoggedIn] = useState(hasSession());
  const [userInfo, setUserInfo] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [following, setFollowing] = useState(new Set());

  // notifications (they will come from the backend later)
  const [notifications, setNotifications] = useState([]);

  // what is shown on the page
  const [activeNav, setActiveNav] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  // windows
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [sharePost, setSharePost] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  // the small message shown at the top of the page
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("blogTheme");
    return saved ? saved === "dark" : true;
  });

  const themeClass = (dark, light) => (isDarkMode ? dark : light);

  // the post shown in the reading window (always the latest version from "posts")
  const selectedPost = posts.find((post) => post._id === selectedPostId) || null;

  /* ========================
     Effects
  ======================== */

  // apply the theme to the page and remember it
  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDarkMode);
    document.body.classList.toggle("light-theme", !isDarkMode);
    localStorage.setItem("blogTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // load the user and the posts when the page opens
  useEffect(() => {
    // likes, saved posts and follows now live in the database,
    // so the old browser-only copies are removed
    ["postLikes", "savedPosts", "following"].forEach((key) => localStorage.removeItem(key));

    if (hasSession()) {
      // we first make sure the login is valid, so the posts show YOUR upvotes
      fetchUserInfo().then(fetchPosts);
    } else {
      fetchPosts();
    }

    return () => clearTimeout(toastTimer.current);
  }, []);

  /* ========================
     Loading data
  ======================== */

  const fetchPosts = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await API.get("/api/posts");
      setPosts(response.data);
    } catch (error) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await API.get("/api/auth/profile");

      // the two lists are kept in their own state, so they update fast
      const { following: followingIds, savedPosts: savedIds, ...user } = response.data.user;
      setUserInfo(user);
      setFollowing(new Set(followingIds));
      setSavedPosts(savedIds);
    } catch (error) {
      if (error.response) {
        // the server answered, so the login is no longer valid
        clearSession();
      } else {
        // no answer (slow or lost connection): keep the user logged in
        showNotification("Could not reach the server. Check your connection.", "error");
      }
    }
  };

  /* ========================
     Small helpers
  ======================== */

  const showNotification = (message, type = "info") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // returns true when the user is logged in, otherwise shows the "join" popup
  const requireLogin = () => {
    if (isLoggedIn) return true;
    setShowRegisterPopup(true);
    return false;
  };

  const clearSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setUserInfo(null);
    setNotifications([]);
    setSavedPosts([]);
    setFollowing(new Set());
    setActiveNav("home");

    // the user is gone, so no post is upvoted "by me" anymore
    setPosts((prev) => prev.map((post) => ({ ...post, isUpvoted: false })));
  };

  /* ========================
     Actions
  ======================== */

  const handleNavigate = (id) => {
    if ((id === "saved" || id === "following") && !requireLogin()) return;
    setActiveNav(id);
    setSearchQuery("");
  };

  const handleWrite = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setEditingPost(null);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setEditingPost(null);
  };

  // creates a new post, or saves the changes of the post being edited
  const handleSubmitPost = async (data) => {
    try {
      if (editingPost) {
        const response = await API.put(`/api/posts/${editingPost._id}`, data);
        setPosts(posts.map((post) => (post._id === editingPost._id ? response.data : post)));
        showNotification("Post updated successfully!", "success");
      } else {
        const response = await API.post("/api/posts", data);
        setPosts([response.data, ...posts]);
        showNotification("Post published successfully!", "success");
      }
      closeCreateModal();
    } catch (error) {
      showNotification(error.response?.data?.message || "Could not save your post", "error");
    }
  };

  const handleDeletePost = async () => {
    try {
      await API.delete(`/api/posts/${postToDelete._id}`);
      setPosts(posts.filter((post) => post._id !== postToDelete._id));
      showNotification("Post deleted successfully!", "success");
    } catch (error) {
      showNotification(error.response?.data?.message || "Could not delete the post", "error");
    } finally {
      setPostToDelete(null);
    }
  };

  // upvotes a post, or removes your upvote
  const toggleLike = async (postId) => {
    if (!requireLogin()) return;

    const post = posts.find((item) => item._id === postId);
    if (!post) return;

    if (userInfo?.id && post.author?._id === userInfo.id) {
      showNotification("You cannot upvote your own post", "info");
      return;
    }

    // changes the numbers of one post
    const applyVote = (isUpvoted, upvoteCount) => {
      setPosts((prev) =>
        prev.map((item) => (item._id === postId ? { ...item, isUpvoted, upvoteCount } : item))
      );
    };

    // show the change right away, then confirm with the server
    applyVote(!post.isUpvoted, post.upvoteCount + (post.isUpvoted ? -1 : 1));

    try {
      const response = await API.put(`/api/posts/${postId}/upvote`);
      applyVote(response.data.isUpvoted, response.data.upvoteCount);
    } catch (error) {
      // undo the change
      applyVote(post.isUpvoted, post.upvoteCount);
      showNotification(error.response?.data?.message || "Could not save your upvote", "error");
    }
  };

  // saves a post for later, or removes it from the saved posts
  const toggleSave = async (postId) => {
    if (!requireLogin()) return;

    const wasSaved = savedPosts.includes(postId);

    // adds or removes the post in the list
    const setSaved = (shouldBeSaved) => {
      setSavedPosts((prev) => {
        const withoutPost = prev.filter((id) => id !== postId);
        return shouldBeSaved ? [...withoutPost, postId] : withoutPost;
      });
    };

    // show the change right away, then confirm with the server
    setSaved(!wasSaved);

    try {
      const response = await API.put(`/api/users/saved/${postId}`);
      setSaved(response.data.isSaved);
      showNotification(
        response.data.isSaved ? "Post saved!" : "Removed from saved",
        response.data.isSaved ? "success" : "info"
      );
    } catch (error) {
      // undo the change
      setSaved(wasSaved);
      showNotification(error.response?.data?.message || "Could not save the post", "error");
    }
  };

  // follows an author, or unfollows him
  const handleFollow = async (authorId, authorUsername) => {
    if (!requireLogin()) return;

    if (authorId === userInfo?.id) {
      showNotification("You cannot follow yourself!", "info");
      return;
    }

    const wasFollowing = following.has(authorId);

    // adds or removes the author in the list
    const setFollowed = (shouldFollow) => {
      setFollowing((prev) => {
        const updated = new Set(prev);
        if (shouldFollow) {
          updated.add(authorId);
        } else {
          updated.delete(authorId);
        }
        return updated;
      });
    };

    // show the change right away, then confirm with the server
    setFollowed(!wasFollowing);

    try {
      const response = await API.put(`/api/users/follow/${authorId}`);
      setFollowed(response.data.isFollowing);
      showNotification(
        response.data.isFollowing ? `Now following ${authorUsername}` : `Unfollowed ${authorUsername}`,
        response.data.isFollowing ? "success" : "info"
      );
    } catch (error) {
      // undo the change
      setFollowed(wasFollowing);
      showNotification(error.response?.data?.message || "Could not update your follows", "error");
    }
  };

  const openAuthor = (author) => {
    if (author) setSelectedAuthor(author);
  };

  // saves the profile (the window shows the error when this fails)
  const handleSaveProfile = async (data) => {
    const response = await API.put("/api/auth/profile", data);
    const { username, email, bio } = response.data;

    setUserInfo((prev) => ({ ...prev, username, email, bio }));

    // posts show the author's name and bio, so update them too
    setPosts((prev) =>
      prev.map((post) =>
        post.author?._id === userInfo?.id
          ? { ...post, author: { ...post.author, username, bio } }
          : post
      )
    );

    setShowProfileModal(false);
    showNotification("Profile updated successfully!", "success");
  };

  // profile pictures are not connected yet
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("Please choose an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image size should be less than 5MB", "error");
      return;
    }
    showNotification("Profile pictures are coming soon", "info");
  };

  const handleLogout = () => {
    clearSession();
    setShowLogoutConfirm(false);
    setShowSettings(false);
    setShowNotifications(false);
    setSelectedPostId(null);
    showNotification("You have been logged out", "info");
  };

  const handleDeleteAccount = async () => {
    try {
      await API.delete("/api/auth/profile");
      setPosts(posts.filter((post) => post.author?._id !== userInfo?.id));
      clearSession();
      setShowDeleteAccount(false);
      setShowSettings(false);
      showNotification("Your account has been deleted", "info");
    } catch (error) {
      setShowDeleteAccount(false);
      showNotification(error.response?.data?.message || "Could not delete your account", "error");
    }
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  /* ========================
     Calculated data
  ======================== */

  // the posts shown in the list: filtered by the view and the search, then sorted
  const visiblePosts = useMemo(() => {
    let list = [...posts];

    if (activeNav === "saved") {
      list = list.filter((post) => savedPosts.includes(post._id));
    }
    if (activeNav === "following") {
      list = list.filter((post) => following.has(post.author?._id));
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.author?.username?.toLowerCase().includes(query)
      );
    }

    list.sort((a, b) => {
      // "Discover" shows the most upvoted first, the other views the newest first
      if (activeNav === "discover") {
        const voteDifference = b.upvoteCount - a.upvoteCount;
        if (voteDifference !== 0) return voteDifference;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return list;
  }, [posts, activeNav, savedPosts, following, searchQuery]);

  // the authors with their number of posts (most posts first)
  const authorStats = useMemo(() => {
    const map = new Map();

    posts.forEach((post) => {
      if (!post.author) return;
      const id = post.author._id;
      const entry = map.get(id) || {
        id,
        _id: id,
        username: post.author.username,
        bio: post.author.bio,
        storyCount: 0,
      };
      entry.storyCount += 1;
      map.set(id, entry);
    });

    return [...map.values()].sort((a, b) => b.storyCount - a.storyCount);
  }, [posts]);

  const myPosts = posts.filter((post) => userInfo?.id && post.author?._id === userInfo.id);

  const stats = {
    followersCount: userInfo?.followersCount || 0,
    followingCount: following.size,
    postsCount: myPosts.length,
    totalLikes: myPosts.reduce((sum, post) => sum + post.upvoteCount, 0),
  };

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const platformStats = {
    totalPosts: posts.length,
    activeWriters: authorStats.length,
    thisWeek: posts.filter((post) => new Date(post.createdAt).getTime() > weekAgo).length,
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const view = VIEWS[activeNav];
  const ViewIcon = view.icon;
  const muted = themeClass("text-[#999]", "text-gray-600");
  const emptyCard = themeClass("bg-[#1a1a1a] border-[#333]", "bg-gray-50 border-gray-200");

  /* ========================
     What is shown on the page
  ======================== */

  return (
    <>
      <div
        className={`min-h-screen ${themeClass(
          "bg-[#111111] text-[#e5e5e5]",
          "bg-white text-gray-900"
        )} flex flex-col`}
      >
        <Navbar
          activeNav={activeNav}
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          userInfo={userInfo}
          avatarUrl=""
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onWrite={handleWrite}
          onLogin={() => navigate("/login")}
          onRegister={() => navigate("/register")}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          unreadCount={unreadCount}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenProfile={() => setShowProfileModal(true)}
          themeClass={themeClass}
        />

        {/* Small message at the top of the page */}
        {toast && (
          <div
            role="status"
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[300] px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-sm max-w-[90vw] flex items-center ${
              toast.type === "success"
                ? themeClass(
                    "bg-green-500/10 border-green-500/30 text-green-400",
                    "bg-green-50 border-green-200 text-green-700"
                  )
                : toast.type === "error"
                ? themeClass(
                    "bg-red-500/10 border-red-500/30 text-red-400",
                    "bg-red-50 border-red-200 text-red-700"
                  )
                : themeClass(
                    "bg-blue-500/10 border-blue-500/30 text-blue-400",
                    "bg-blue-50 border-blue-200 text-blue-700"
                  )
            }`}
          >
            {toast.type === "success" && <FiCheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
            {toast.type === "error" && <FiAlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
            {toast.type === "info" && <FiBell className="w-5 h-5 mr-3 flex-shrink-0" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {showNotifications && isLoggedIn && (
          <NotificationsDropdown
            notifications={notifications}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllNotificationsRead}
            onClose={() => setShowNotifications(false)}
            themeClass={themeClass}
          />
        )}

        {/* Page content */}
        <div className="flex-1 w-full px-4 sm:px-6 py-8">
          <div className="max-w-7xl mx-auto flex">
            <Sidebar
              isLoggedIn={isLoggedIn}
              userInfo={userInfo}
              avatarUrl=""
              stats={stats}
              popularAuthors={authorStats.slice(0, 4)}
              platformStats={platformStats}
              onOpenProfile={() => setShowProfileModal(true)}
              onOpenAuthor={openAuthor}
              onAvatarChange={handleAvatarChange}
              onLogout={() => setShowLogoutConfirm(true)}
              onRegister={() => navigate("/login")}
              themeClass={themeClass}
            />

            <main className="flex-1 min-w-0">
              {/* Title of the view */}
              <div className="mb-8 flex flex-wrap justify-between items-start gap-3">
                <div>
                  <h1
                    className={`text-2xl sm:text-3xl font-bold ${themeClass(
                      "text-white",
                      "text-gray-900"
                    )} mb-2 flex items-center`}
                  >
                    <ViewIcon className="mr-3 w-6 h-6 sm:w-8 sm:h-8" />
                    {view.title}
                  </h1>
                  <p className={`${muted} text-sm sm:text-base`}>{view.subtitle}</p>
                </div>

                {(activeNav !== "home" || searchQuery) && (
                  <button
                    onClick={() => handleNavigate("home")}
                    className={`${themeClass(
                      "text-[#ccc] hover:text-white",
                      "text-gray-600 hover:text-gray-900"
                    )} transition text-sm flex items-center`}
                  >
                    <FiArrowLeft className="mr-2 w-4 h-4" />
                    Back to all posts
                  </button>
                )}
              </div>

              {/* Search result info */}
              {searchQuery && (
                <div className={`mb-6 p-4 ${emptyCard} rounded-lg border flex items-center justify-between`}>
                  <span className={`${themeClass("text-white", "text-gray-900")} text-sm flex items-center`}>
                    <FiSearch className={`${muted} mr-2 w-4 h-4`} />
                    Results for "{searchQuery}"
                  </span>
                  <span className={`${muted} text-sm`}>
                    {visiblePosts.length} {visiblePosts.length === 1 ? "post" : "posts"} found
                  </span>
                </div>
              )}

              <h2
                className={`text-lg sm:text-xl font-bold ${themeClass(
                  "text-white",
                  "text-gray-900"
                )} mb-6`}
              >
                {searchQuery ? "Search results" : view.listTitle}
              </h2>

              {/* The list of posts */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className={`animate-pulse rounded-lg border p-5 ${themeClass(
                        "bg-[#1a1a1a] border-[#333]",
                        "bg-white border-gray-200"
                      )}`}
                    >
                      <div className={`h-4 w-1/3 rounded mb-4 ${themeClass("bg-[#2a2a2a]", "bg-gray-200")}`} />
                      <div className={`h-5 w-3/4 rounded mb-3 ${themeClass("bg-[#2a2a2a]", "bg-gray-200")}`} />
                      <div className={`h-4 w-full rounded ${themeClass("bg-[#2a2a2a]", "bg-gray-200")}`} />
                    </div>
                  ))}
                </div>
              ) : loadError ? (
                <div className={`text-center py-16 ${emptyCard} rounded-lg border`}>
                  <FiAlertCircle className={`w-12 h-12 ${themeClass("text-[#444]", "text-gray-300")} mx-auto mb-4`} />
                  <h3 className={`text-xl font-bold ${themeClass("text-white", "text-gray-900")} mb-2`}>
                    Could not load the posts
                  </h3>
                  <p className={`${muted} mb-6 px-4`}>Check your connection and try again.</p>
                  <button
                    onClick={fetchPosts}
                    className={`px-6 py-2.5 ${themeClass(
                      "bg-white text-black hover:bg-[#f5f5f5]",
                      "bg-gray-900 text-white hover:bg-gray-800"
                    )} rounded-lg transition font-medium`}
                  >
                    Try again
                  </button>
                </div>
              ) : visiblePosts.length === 0 ? (
                <div className={`text-center py-16 ${emptyCard} rounded-lg border`}>
                  {searchQuery ? (
                    <FiSearch className={`w-12 h-12 ${themeClass("text-[#444]", "text-gray-300")} mx-auto mb-4`} />
                  ) : (
                    <ViewIcon className={`w-12 h-12 ${themeClass("text-[#444]", "text-gray-300")} mx-auto mb-4`} />
                  )}
                  <h3 className={`text-xl font-bold ${themeClass("text-white", "text-gray-900")} mb-2`}>
                    {searchQuery ? "No posts found" : EMPTY[activeNav].title}
                  </h3>
                  <p className={`${muted} mb-6 px-4 max-w-md mx-auto`}>
                    {searchQuery
                      ? `No posts match "${searchQuery}". Try different words.`
                      : EMPTY[activeNav].text}
                  </p>
                  {!searchQuery && (activeNav === "home" || activeNav === "discover") && (
                    <button
                      onClick={handleWrite}
                      className={`px-6 py-2.5 ${themeClass(
                        "bg-white text-black hover:bg-[#f5f5f5]",
                        "bg-gray-900 text-white hover:bg-gray-800"
                      )} rounded-lg transition font-medium inline-flex items-center`}
                    >
                      <FiEdit className="mr-2 w-4 h-4" />
                      Write the first post
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {visiblePosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      isOwnPost={Boolean(userInfo?.id && post.author?._id === userInfo.id)}
                      isSaved={savedPosts.includes(post._id)}
                      isLiked={post.isUpvoted}
                      likeCount={post.upvoteCount}
                      isFollowingAuthor={isLoggedIn && following.has(post.author?._id)}
                      onOpen={(item) => setSelectedPostId(item._id)}
                      onOpenAuthor={openAuthor}
                      onToggleLike={toggleLike}
                      onToggleSave={toggleSave}
                      themeClass={themeClass}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Footer */}
        <footer className={`mt-12 border-t ${themeClass("border-[#333]", "border-gray-200")} py-8`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <button
                onClick={() => handleNavigate("home")}
                className={`text-xl font-bold ${themeClass("text-white", "text-gray-900")} flex items-center`}
              >
                <FiBookOpen className="mr-2 w-5 h-5" />
                Storlo
              </button>
              <p className={`${themeClass("text-[#777]", "text-gray-600")} text-sm mt-1`}>
                Ask, share, and learn from each other
              </p>
            </div>
            <p className={`${themeClass("text-[#666]", "text-gray-500")} text-sm`}>
              © {new Date().getFullYear()} Storlo. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* ========================
          Windows
          (the ones shown later in this list appear on top)
      ======================== */}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          isLoggedIn={isLoggedIn}
          userInfo={userInfo}
          isLiked={selectedPost.isUpvoted}
          likeCount={selectedPost.upvoteCount}
          isSaved={savedPosts.includes(selectedPost._id)}
          isFollowingAuthor={isLoggedIn && following.has(selectedPost.author?._id)}
          onClose={() => setSelectedPostId(null)}
          onEdit={(post) => {
            setEditingPost(post);
            setShowCreateModal(true);
          }}
          onDelete={setPostToDelete}
          onShare={setSharePost}
          onToggleLike={toggleLike}
          onToggleSave={toggleSave}
          onFollow={handleFollow}
          onOpenAuthor={openAuthor}
          onRequireLogin={() => setShowRegisterPopup(true)}
          showNotification={showNotification}
          themeClass={themeClass}
        />
      )}

      {selectedAuthor && (
        <AuthorModal
          author={selectedAuthor}
          posts={posts.filter((post) => post.author?._id === selectedAuthor._id)}
          isOwnProfile={selectedAuthor._id === userInfo?.id}
          isFollowing={isLoggedIn && following.has(selectedAuthor._id)}
          onFollow={handleFollow}
          onOpenPost={(post) => {
            setSelectedAuthor(null);
            setSelectedPostId(post._id);
          }}
          onClose={() => setSelectedAuthor(null)}
          themeClass={themeClass}
        />
      )}

      {showCreateModal && (
        <CreatePostModal
          key={editingPost?._id || "new"}
          post={editingPost}
          onSubmit={handleSubmitPost}
          onClose={closeCreateModal}
          themeClass={themeClass}
        />
      )}

      {showSettings && (
        <SettingsModal
          isDarkMode={isDarkMode}
          onEditProfile={() => {
            setShowSettings(false);
            setShowProfileModal(true);
          }}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onDeleteAccount={() => setShowDeleteAccount(true)}
          onClose={() => setShowSettings(false)}
          themeClass={themeClass}
        />
      )}

      {showProfileModal && userInfo && (
        <ProfileModal
          initialData={{
            username: userInfo.username,
            email: userInfo.email,
            bio: userInfo.bio,
          }}
          avatarUrl=""
          uploadingAvatar={false}
          onAvatarChange={handleAvatarChange}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
          themeClass={themeClass}
        />
      )}

      {sharePost && (
        <ShareModal
          post={sharePost}
          onClose={() => setSharePost(null)}
          showNotification={showNotification}
          themeClass={themeClass}
        />
      )}

      {postToDelete && (
        <ConfirmModal
          icon={FiTrash2}
          title="Delete post?"
          subtitle="This action cannot be undone"
          confirmLabel="Delete forever"
          onConfirm={handleDeletePost}
          onCancel={() => setPostToDelete(null)}
          themeClass={themeClass}
        >
          <div
            className={`p-3 rounded-lg border ${themeClass(
              "bg-[#222] border-[#444]",
              "bg-gray-50 border-gray-300"
            )}`}
          >
            <p className={`${themeClass("text-white", "text-gray-900")} font-medium truncate`}>
              {postToDelete.title}
            </p>
            <p className={`${muted} text-sm mt-1`}>This will permanently delete the post.</p>
          </div>
        </ConfirmModal>
      )}

      {showLogoutConfirm && (
        <ConfirmModal
          icon={FiLogOut}
          title="Log out?"
          subtitle="Are you sure you want to log out?"
          confirmLabel="Log out"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
          themeClass={themeClass}
        >
          <p className={`${muted} text-sm`}>
            You will need to log in again to write, comment, or save posts.
          </p>
        </ConfirmModal>
      )}

      {showDeleteAccount && (
        <ConfirmModal
          icon={FiTrash2}
          title="Delete account"
          subtitle="This action cannot be undone"
          confirmLabel="Delete account"
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteAccount(false)}
          themeClass={themeClass}
        >
          <p className={`${themeClass("text-white", "text-gray-900")} text-sm mb-2`}>
            Deleting your account will:
          </p>
          <ul className={`${muted} text-sm space-y-1 ml-4 list-disc`}>
            <li>Permanently remove your profile</li>
            <li>Delete all your posts</li>
          </ul>
        </ConfirmModal>
      )}

      {showRegisterPopup && (
        <RegisterPopup
          onRegister={() => navigate("/register")}
          onLogin={() => navigate("/login")}
          onClose={() => setShowRegisterPopup(false)}
          themeClass={themeClass}
        />
      )}
    </>
  );
};

export default HomePage;