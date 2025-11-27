import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ToastContext from "../contexts/ToastContext.jsx";
import AuthContext from "../contexts/AuthContext.jsx";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.REACT_APP_API_BASE ||
  "http://localhost:5000";

const Settings = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);

  const notify = (message, type = "info") => {
    try {
      if (typeof showToast === "function") showToast(message, type);
      else alert(message);
    } catch {
      alert(message);
    }
  };

  const [csrfToken, setCsrfToken] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    age: "",
    height: "",
    weight: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPass: "",
    newPass: "",
    confirm: "",
  });
  const [changingPass, setChangingPass] = useState(false);

  const { hardResetAuth } = useContext(AuthContext);

  useEffect(() => {
    localStorage.setItem("profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/auth/me`, {
          withCredentials: true,
        });
        if (mounted && res?.data) {
          setProfile({
            name: res.data.name || "",
            email: res.data.email || "",
            avatar: res.data.avatar || "",
            age: res.data.age ?? "",
            height: res.data.height ?? "",
            weight: res.data.weight ?? "",
          });
          if (res.data.csrfToken) {
            setCsrfToken(res.data.csrfToken);
            localStorage.setItem("csrfToken", res.data.csrfToken);
          }
        }
      } catch (err) {
        console.debug("Settings: load profile failed", err?.message || err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Only image files allowed", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setProfile((p) => ({
        ...p,
        avatar: reader.result,
      }));
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e) => {
    e?.preventDefault();
    setSavingProfile(true);
    try {
      const payload = { ...profile };
      if (payload.age !== "" && payload.age !== undefined)
        payload.age = Number(payload.age);
      if (payload.height !== "" && payload.height !== undefined)
        payload.height = Number(payload.height);
      if (payload.weight !== "" && payload.weight !== undefined)
        payload.weight = Number(payload.weight);

      await axios.put(`${API_BASE}/api/auth/profile`, payload, {
        withCredentials: true,
        headers: {
          "X-CSRF-Token": csrfToken || localStorage.getItem("csrfToken"),
        },
      });
      notify("Profile updated", "success");
    } catch (err) {
      console.debug("Profile update failed", err?.message);
      notify("Failed to update profile", "error");
    }
    setSavingProfile(false);
    setShowEditModal(false);
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();
    if (passwordForm.newPass.length < 6)
      return notify("New password must be at least 6 characters", "error");
    if (passwordForm.newPass !== passwordForm.confirm)
      return notify("Passwords must match", "error");
    setChangingPass(true);
    try {
      await axios.post(`${API_BASE}/api/auth/change-password`, passwordForm, {
        withCredentials: true,
        headers: {
          "X-CSRF-Token": csrfToken || localStorage.getItem("csrfToken"),
        },
      });
      notify("Password changed", "success");
      setPasswordForm({ oldPass: "", newPass: "", confirm: "" });
    } catch (err) {
      console.error(err);
      notify("Failed to change password", "error");
    }
    setChangingPass(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete account permanently?")) return;

    try {
      try {
        localStorage.setItem("suppressAuthFetch", "1");
      } catch (e) {
        console.debug("suppressAuthFetch write failed", e);
      }
      await axios.delete(`${API_BASE}/api/auth/delete`, {
        withCredentials: true,
        headers: {
          "X-CSRF-Token": csrfToken || localStorage.getItem("csrfToken"),
        },
      });

      notify("Account deleted", "success");
      hardResetAuth();
      navigate("/");
    } catch (err) {
      console.error(err);
      notify("Failed to delete account", "error");
    }
  };

  return (
    <div
      className="
        layout-content-container flex flex-col w-full flex-1 overflow-y-auto
        p-4
        bg-[var(--background-light)]
        text-[var(--text-primary)]
        dark:bg-[#000000ff]
        dark:text-slate-200
      "
    >
      <div className="mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
        <div className="text-sm text-gray-500 dark:text-slate-400">
          Manage your profile, preferences, and account.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <section className="bg-white rounded shadow p-0 overflow-hidden border border-gray-200 dark:bg-[#1e293b] dark:border-gray-600">
          <div className="p-6 md:flex md:items-center md:gap-6">
            <div className="flex-shrink-0 flex items-center justify-center">
              <img
                src={profile.avatar || "/avatar-placeholder.png"}
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover border-2 border-white shadow"
              />
            </div>
            <div className="mt-4 md:mt-0 md:flex-1">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {profile.name || "—"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-300">
                    {profile.email || "—"}
                  </div>
                </div>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <button
                    className="
                      px-3 py-2 bg-white border rounded shadow-sm text-sm
                      text-slate-800
                      hover:bg-slate-50
                      dark:bg-[#000000ff] dark:border-gray-600
                      dark:text-slate-200 dark:hover:bg-[#111827]
                    "
                    onClick={() => setShowEditModal(true)}
                  >
                    Edit Profile
                  </button>
                  <button
                    className="
                      px-3 py-2 bg-white border rounded shadow-sm text-sm
                      text-slate-800
                      hover:bg-slate-50
                      dark:bg-[#000000ff] dark:border-gray-600
                      dark:text-slate-200 dark:hover:bg-[#111827]
                    "
                    onClick={() => setShowChangePassModal(true)}
                  >
                    Change Password
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded text-center dark:bg-[#111827]">
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    Age
                  </div>
                  <div className="text-lg font-medium text-slate-800 dark:text-white">
                    {profile.age || "—"}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded text-center dark:bg-[#111827]">
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    Height
                  </div>
                  <div className="text-lg font-medium text-slate-800 dark:text-white">
                    {profile.height ? `${profile.height} cm` : "—"}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded text-center dark:bg-[#111827]">
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    Weight
                  </div>
                  <div className="text-lg font-medium text-slate-800 dark:text-white">
                    {profile.weight ? `${profile.weight} kg` : "—"}
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  className="text-red-600 dark:text-red-400"
                  onClick={handleDelete}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* About / Other */}
        <section className="bg-white rounded shadow p-6 md:col-span-2 border border-gray-200 dark:bg-[#1e293b] dark:border-gray-600">
          <h3 className="font-semibold mb-3 dark:text-white">About</h3>
          <div className="text-sm text-gray-700 dark:text-slate-300">
            App Version: 1.0.0
          </div>
          <div className="mt-2 flex gap-4 flex-wrap">
            <a href="#" className="text-blue-600 dark:text-blue-400 text-sm">
              Terms &amp; Conditions
            </a>
            <a href="#" className="text-blue-600 dark:text-blue-400 text-sm">
              Privacy Policy
            </a>
            <a
              href="mailto:support@example.com"
              className="text-blue-600 dark:text-blue-400 text-sm"
            >
              Contact Support
            </a>
          </div>
        </section>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#1e293b] dark:text-slate-200 rounded w-full max-w-lg p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">
                Edit Profile
              </h3>
              <button
                className="text-gray-600 dark:text-slate-300"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={saveProfile}>
              <div className="mb-3">
                <label className="block text-sm mb-1">Name</label>
                <input
                  className="w-full p-2 border rounded bg-white dark:bg-[#000000ff] dark:border-gray-600 dark:text-slate-200"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Email</label>
                <input
                  className="w-full p-2 border rounded bg-white dark:bg-[#000000ff] dark:border-gray-600 dark:text-slate-200"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Avatar</label>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} />
              </div>
              <div className="mb-3 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1">Age</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full p-2 border rounded bg-white dark:bg-[#000000ff] dark:border-gray-600 dark:text-slate-200"
                    value={profile.age ?? ""}
                    onChange={(e) =>
                      setProfile({ ...profile, age: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full p-2 border rounded bg-white dark:bg-[#000000ff] dark:border-gray-600 dark:text-slate-200"
                    value={profile.height ?? ""}
                    onChange={(e) =>
                      setProfile({ ...profile, height: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full p-2 border rounded bg-white dark:bg-[#000000ff] dark:border-gray-600 dark:text-slate-200"
                    value={profile.weight ?? ""}
                    onChange={(e) =>
                      setProfile({ ...profile, weight: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  className="px-3 py-2 bg-slate-100 rounded dark:bg-[#111827] dark:text-slate-200"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#1e293b] dark:text-slate-200 rounded w-full max-w-md p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">
                Change Password
              </h3>
              <button
                className="text-gray-600 dark:text-slate-300"
                onClick={() => setShowChangePassModal(false)}
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                handleChangePassword(e);
                setShowChangePassModal(false);
              }}
            >
              <div className="mb-2">
                <label className="block text-sm">Current password</label>
                <input
                  type="password"
                  value={passwordForm.oldPass}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPass: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded bg-white dark:bg-[#000000ff] dark:border-gray-600 dark:text-slate-200"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm">New password</label>
                <input
                  type="password"
                  value={passwordForm.newPass}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPass: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded bg-white dark:bg-[#000000ff] dark:border-gray-600 dark:text-slate-200"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Confirm password</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirm: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded bg-white dark:bg-[#000000ff] dark:border-gray-600 dark:text-slate-200"
                />
              </div>
              <div className="flex gap-2 justify-end mt-3">
                <button
                  type="button"
                  className="px-3 py-2 bg-slate-100 rounded dark:bg-[#111827] dark:text-slate-200"
                  onClick={() => setShowChangePassModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  disabled={changingPass}
                >
                  {changingPass ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm (still used if you want a custom confirm instead of window.confirm) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#1e293b] dark:text-slate-200 rounded w-full max-w-sm p-6 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold mb-3 dark:text-white">
              Delete Account
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              This action is permanent. Are you sure you want to delete your
              account?
            </p>
            <div className="flex gap-2 justify-end mt-4">
              <button
                className="px-3 py-2 bg-slate-100 rounded dark:bg-[#111827] dark:text-slate-200"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDelete();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
