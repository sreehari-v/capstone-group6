import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ToastContext from '../contexts/ToastContext.jsx';
// Use Vite env var (VITE_API_BASE). Fall back to legacy REACT_APP_API_BASE for safety.
const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.REACT_APP_API_BASE || "http://localhost:5000";

const Settings = () => {
  const navigate = useNavigate();

  /* -------------------- Profile State -------------------- */
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("profile")) || {
        name: "",
        email: "",
        avatar: "",
        age: "",
        height: "",
        weight: "",
      };
    } catch {
      return { name: "", email: "", avatar: "", age: "", height: "", weight: "" };
    }
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /* -------------------- Password State -------------------- */
  const [passwordForm, setPasswordForm] = useState({
    oldPass: "",
    newPass: "",
    confirm: "",
  });
  const [changingPass, setChangingPass] = useState(false);


  /* -------------------- Fake Sessions (replace with API later) -------------------- */
  const [sessions] = useState([
    { id: 1, device: "Chrome · Windows", lastActive: "2 min ago" },
  ]);

  /* -------------------- Persist Local Storage -------------------- */
  useEffect(() => {
    localStorage.setItem("profile", JSON.stringify(profile));
  }, [profile]);

  // Load profile from server if available
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/auth/me`, { withCredentials: true });
        if (mounted && res?.data) {
          setProfile({
            name: res.data.name || "",
            email: res.data.email || "",
            avatar: res.data.avatar || "",
            age: res.data.age ?? "",
            height: res.data.height ?? "",
            weight: res.data.weight ?? "",
          });
        }
      } catch {
        // ignore - user may be unauthenticated
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const { showToast } = useContext(ToastContext);
  const notify = (message, type = 'info') => {
    try {
      if (typeof showToast === 'function') {
        showToast(message, type);
      } else {
        // fallback for environments where provider isn't mounted
        // keep alert so users still see feedback
        alert(message);
      }
    } catch (err) {
      console.error('notify failed', err);
      alert(message);
    }
  };

  /* -------------------- Secure Avatar Upload -------------------- */
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile({ ...profile, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  /* -------------------- Save Profile -------------------- */
  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      // Convert numeric fields before sending (if provided)
      const payload = { ...profile };
      if (payload.age !== "" && payload.age !== undefined) payload.age = Number(payload.age);
      if (payload.height !== "" && payload.height !== undefined) payload.height = Number(payload.height);
      if (payload.weight !== "" && payload.weight !== undefined) payload.weight = Number(payload.weight);

  await axios.put(`${API_BASE}/api/auth/profile`, payload, { withCredentials: true });
  notify('Profile updated', 'success');
    } catch (e) {
  console.debug("Profile update failed", e?.message);
  notify('Failed to update profile', 'error');
    }

    setSavingProfile(false);
    setShowEditModal(false);
  };

  /* -------------------- Change Password -------------------- */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPass.length < 6)
      return alert("New password must be at least 6 characters");

    if (passwordForm.newPass !== passwordForm.confirm)
      return alert("Passwords must match");

    setChangingPass(true);

    try {
      await axios.post(`${API_BASE}/api/auth/change-password`, passwordForm, {
        withCredentials: true,
      });
  notify('Password changed', 'success');
      setPasswordForm({ oldPass: "", newPass: "", confirm: "" });
    } catch (e) {
      console.error(e);
  notify('Failed to change password', 'error');
    }

    setChangingPass(false);
  };

  /* -------------------- Delete Account -------------------- */
  const handleDelete = async () => {
  if (!window.confirm("Delete account permanently?")) return;

    try {
  await axios.delete(`${API_BASE}/api/auth/delete`, { withCredentials: true });
      localStorage.clear();
  notify('Account deleted', 'success');
      navigate("/");
    } catch (e) {
      console.error(e);
  notify('Failed to delete account', 'error');
    }
  };

  /* -------------------- Logout All Sessions -------------------- */
  const logoutAll = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/logout-all`, {}, { withCredentials: true });
  notify('Logged out everywhere', 'success');
    } catch (e) {
      console.error(e);
  notify('Failed to log out everywhere', 'error');
    }
  };

  return (
    <div className="layout-content-container flex flex-col w-full flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="text-sm text-gray-500">
          Manage your profile, preferences, and account.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* -------------------- Profile Section -------------------- */}
        <section className="bg-white rounded shadow p-0 overflow-hidden">
          <div className="p-6 md:flex md:items-center md:gap-6">
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="relative">
                <img
                  src={profile.avatar || "/public/avatar-placeholder.png"}
                  alt="avatar"
                  className="w-28 h-28 rounded-full object-cover border-2 border-white shadow"
                />
              </div>
            </div>

            <div className="mt-4 md:mt-0 md:flex-1">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{profile.name || '—'}</div>
                  <div className="text-sm text-gray-500">{profile.email || '—'}</div>
                </div>

                <div className="flex gap-2 mt-1">
                  <button
                    className="px-3 py-2 bg-white border rounded shadow-sm text-sm"
                    onClick={() => setShowEditModal(true)}
                  >
                    Edit Profile
                  </button>
                  <button
                    className="px-3 py-2 bg-white border rounded shadow-sm text-sm"
                    onClick={() => setShowChangePassModal(true)}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded text-center">
                  <div className="text-xs text-gray-500">Age</div>
                  <div className="text-lg font-medium text-slate-800">{profile.age || '—'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded text-center">
                  <div className="text-xs text-gray-500">Height</div>
                  <div className="text-lg font-medium text-slate-800">{profile.height ? `${profile.height} cm` : '—'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded text-center">
                  <div className="text-xs text-gray-500">Weight</div>
                  <div className="text-lg font-medium text-slate-800">{profile.weight ? `${profile.weight} kg` : '—'}</div>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <button className="text-red-600" onClick={handleDelete}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* App Settings removed per request */}

        {/* -------------------- Security Section -------------------- */}
        <section className="bg-white rounded shadow p-6">
          <h3 className="font-semibold mb-3">Security</h3>

          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.device}</div>
                  <div className="text-sm text-gray-500">
                    Last active {s.lastActive}
                  </div>
                </div>
                <button className="px-3 py-1 bg-slate-100 rounded">
                  Log Out
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              className="px-3 py-2 bg-red-600 text-white rounded"
              onClick={logoutAll}
            >
              Log Out of All Devices
            </button>
          </div>
        </section>

        {/* -------------------- About Section -------------------- */}
        <section className="bg-white rounded shadow p-6 md:col-span-2">
          <h3 className="font-semibold mb-3">About</h3>
          <div className="text-sm">App Version: 1.0.0</div>
          <div className="mt-2 flex gap-4">
            <a href="#" className="text-blue-600">
              Terms & Conditions
            </a>
            <a href="#" className="text-blue-600">
              Privacy Policy
            </a>
            <a href="mailto:support@example.com" className="text-blue-600">
              Contact Support
            </a>
          </div>
        </section>

        {/* Modals rendered at the end of the component */}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button className="text-gray-600" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={saveProfile}>
              <div className="mb-3">
                <label className="block text-sm mb-1">Name</label>
                <input className="w-full p-2 border rounded" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Email</label>
                <input className="w-full p-2 border rounded" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Avatar</label>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} />
              </div>
              <div className="mb-3 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1">Age</label>
                  <input type="number" min="0" step="1" className="w-full p-2 border rounded" value={profile.age ?? ''} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Height (cm)</label>
                  <input type="number" min="0" step="1" className="w-full p-2 border rounded" value={profile.height ?? ''} onChange={(e) => setProfile({ ...profile, height: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Weight (kg)</label>
                  <input type="number" min="0" step="0.1" className="w-full p-2 border rounded" value={profile.weight ?? ''} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" className="px-3 py-2 bg-slate-100 rounded" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button className="text-gray-600" onClick={() => setShowChangePassModal(false)}>✕</button>
            </div>
            <form onSubmit={(e) => { handleChangePassword(e); setShowChangePassModal(false); }}>
              <div className="mb-2">
                <label className="block text-sm">Current password</label>
                <input type="password" value={passwordForm.oldPass} onChange={(e) => setPasswordForm({ ...passwordForm, oldPass: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div className="mb-2">
                <label className="block text-sm">New password</label>
                <input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Confirm password</label>
                <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full p-2 border rounded" />
              </div>
                <div className="flex gap-2 justify-end mt-3">
                  <button type="button" className="px-3 py-2 bg-slate-100 rounded" onClick={() => setShowChangePassModal(false)}>Cancel</button>
                  <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded" disabled={changingPass}>{changingPass ? 'Changing...' : 'Change Password'}</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-3">Delete Account</h3>
            <p className="text-sm text-gray-600">This action is permanent. Are you sure you want to delete your account?</p>
            <div className="flex gap-2 justify-end mt-4">
              <button className="px-3 py-2 bg-slate-100 rounded" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={() => { setShowDeleteConfirm(false); handleDelete(); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
