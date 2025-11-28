import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ToastContext from '../contexts/ToastContext.jsx';
import AuthContext from "../contexts/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.REACT_APP_API_BASE || "http://localhost:5000";

const Settings = () => {
	const navigate = useNavigate();
	const { showToast } = useContext(ToastContext);

	const notify = (message, type = 'info') => {
		try {
			if (typeof showToast === 'function') showToast(message, type);
			else alert(message);
		} catch { alert(message); }
	};

	const [csrfToken, setCsrfToken] = useState("");
	const [profile, setProfile] = useState({ name: "", email: "", avatar: "", age: "", height: "", weight: "", gender: "" });
	const [savingProfile, setSavingProfile] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showChangePassModal, setShowChangePassModal] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const [passwordForm, setPasswordForm] = useState({ oldPass: "", newPass: "", confirm: "" });
	const [changingPass, setChangingPass] = useState(false);

	const { hardResetAuth, setUser } = useContext(AuthContext);

	useEffect(() => { localStorage.setItem("profile", JSON.stringify(profile)); }, [profile]);

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
							gender: res.data.gender || "",
						});
					if (res.data.csrfToken) { setCsrfToken(res.data.csrfToken); localStorage.setItem('csrfToken', res.data.csrfToken); }
				}
			} catch (err) {
				console.debug('Settings: load profile failed', err?.message || err);
			}
		};
		load();

		// no session listing (removed)
		return () => { mounted = false; };
	}, []);

	// session features removed

	const handleAvatarUpload = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith('image/')) { notify('Only image files allowed', 'error'); return; }
		const reader = new FileReader();
		reader.onload = () => setProfile(p => ({ ...p, avatar: reader.result }));
		reader.readAsDataURL(file);
	};

	const saveProfile = async (e) => {
		e?.preventDefault();
		setSavingProfile(true);
		try {
			const payload = { ...profile };
			if (payload.age !== "" && payload.age !== undefined) payload.age = Number(payload.age);
			if (payload.height !== "" && payload.height !== undefined) payload.height = Number(payload.height);
			if (payload.weight !== "" && payload.weight !== undefined) payload.weight = Number(payload.weight);
			const r = await axios.put(`${API_BASE}/api/auth/profile`, payload, { withCredentials: true, headers: { 'X-CSRF-Token': csrfToken || localStorage.getItem('csrfToken') } });
			// Update global auth user so UI (DashNav, etc.) reflects changes immediately
			if (r?.data) {
				try { setUser(r.data); } catch { /* ignore if context setter missing */ }
				setProfile({
					name: r.data.name || "",
					email: r.data.email || "",
					avatar: r.data.avatar || "",
					age: r.data.age ?? "",
					height: r.data.height ?? "",
					weight: r.data.weight ?? "",
					gender: r.data.gender || "",
				});
			}
			notify('Profile updated', 'success');
		} catch (err) {
			console.debug('Profile update failed', err?.message);
			notify('Failed to update profile', 'error');
		}
		setSavingProfile(false);
		setShowEditModal(false);
	};

	const handleChangePassword = async (e) => {
		e?.preventDefault();
		if (passwordForm.newPass.length < 6) return notify('New password must be at least 6 characters', 'error');
			if (passwordForm.newPass !== passwordForm.confirm) return notify('Passwords must match', 'error');
			setChangingPass(true);
			try {
				await axios.post(`${API_BASE}/api/auth/change-password`, passwordForm, { withCredentials: true, headers: { 'X-CSRF-Token': csrfToken || localStorage.getItem('csrfToken') } });
				notify('Password changed', 'success');
				setPasswordForm({ oldPass: "", newPass: "", confirm: "" });
			} catch (err) { console.error(err); notify('Failed to change password', 'error'); }
			setChangingPass(false);
	};

	const handleDelete = async () => {
  if (!window.confirm("Delete account permanently?")) return;

  try {
			// Prevent the global auth loader from immediately re-checking while delete is in-flight
			try { localStorage.setItem('suppressAuthFetch', '1'); } catch (e) { console.debug('suppressAuthFetch write failed', e); }
    await axios.delete(`${API_BASE}/api/auth/delete`, {
      withCredentials: true,
      headers: { "X-CSRF-Token": csrfToken || localStorage.getItem("csrfToken") }
    });

    notify("Account deleted", "success");

    // Critical: reset global auth BEFORE navigating
    hardResetAuth();

    navigate("/"); // go home cleanly
  } catch (err) {
    console.error(err);
    notify("Failed to delete account", "error");
  }
};

	// session features removed

	return (
		<div className="layout-content-container flex flex-col w-full flex-1 overflow-y-auto p-4">
			<div className="mb-4">
				<h1 className="text-2xl font-bold">Settings</h1>
				<div className="text-sm text-gray-500">Manage your profile, preferences, and account.</div>
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				<section className="bg-white rounded shadow p-6 overflow-hidden">
					<div className="md:flex md:items-center md:gap-6">
						<div className="flex items-center gap-4">
							<div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden">
								{profile.avatar ? (
									<img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
								) : (
									<img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=${(profile.gender === 'female' ? 'ec4899' : profile.gender === 'male' ? '3b82f6' : profile.gender === 'prefer_not_to_say' ? '6b7280' : '10b981')}&color=ffffff&size=128`} alt="Default avatar" className="w-full h-full object-cover" />
								)}
							</div>
							<div>
								<div className="text-lg font-semibold">{profile.name || '—'}</div>
								<div className="text-sm text-gray-500">{profile.email || '—'}</div>
							</div>
						</div>
						<div className="mt-4 md:mt-0 md:ml-auto flex items-center gap-2">
							<button className="px-3 py-2 bg-white border rounded shadow-sm text-sm" onClick={() => setShowEditModal(true)}>Edit Profile</button>
							<button className="px-3 py-2 bg-white border rounded shadow-sm text-sm" onClick={() => setShowChangePassModal(true)}>Change Password</button>
						</div>
					</div>
					<div className="mt-6 grid grid-cols-2 gap-3">
						<div className="bg-slate-50 p-3 rounded text-center">
							<div className="text-xs text-gray-500">Age</div>
							<div className="text-lg font-medium text-slate-800">{profile.age || '—'}</div>
						</div>
						<div className="bg-slate-50 p-3 rounded text-center">
							<div className="text-xs text-gray-500">Gender</div>
							<div className="text-lg font-medium text-slate-800">{profile.gender ? (profile.gender === 'prefer_not_to_say' ? 'Prefer not to say' : profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)) : '—'}</div>
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
					<div className="mt-4 border-t pt-4"><button className="text-red-600" onClick={handleDelete}>Delete Account</button></div>
				</section>

				{/* Security section removed */}

				<section className="bg-white rounded shadow p-6 md:col-span-2">
					<h3 className="font-semibold mb-3">About</h3>
					<div className="text-sm">App Version: 1.0.0</div>
					<div className="mt-2 flex gap-4"><a href="#" className="text-blue-600">Terms & Conditions</a><a href="#" className="text-blue-600">Privacy Policy</a><a href="mailto:support@example.com" className="text-blue-600">Contact Support</a></div>
				</section>
			</div>

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
							<div className="mb-3 grid grid-cols-2 gap-3">
								<div>
									<label className="block text-sm mb-1">Age</label>
									<input type="number" min="0" step="1" className="w-full p-2 border rounded" value={profile.age ?? ''} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
								</div>
								<div>
									<label className="block text-sm mb-1">Gender</label>
									<select className="w-full p-2 border rounded" value={profile.gender ?? ''} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
										<option value="">Not specified</option>
										<option value="male">Male</option>
										<option value="female">Female</option>
										<option value="other">Other</option>
										<option value="prefer_not_to_say">Prefer not to say</option>
									</select>
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
								<button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded inline-flex items-center justify-center" disabled={savingProfile} aria-busy={savingProfile}>
									{savingProfile ? (
										<span className="inline-flex items-center gap-2" role="status" aria-live="polite">
											<span className="inline-block rounded-full animate-spin" style={{ width: 16, height: 16, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} aria-hidden="true" />
											<span>Saving</span>
										</span>
									) : (
										'Save'
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

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
								<button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded inline-flex items-center justify-center" disabled={changingPass} aria-busy={changingPass}>
									{changingPass ? (
										<span className="inline-flex items-center gap-2" role="status" aria-live="polite">
											<span className="inline-block rounded-full animate-spin" style={{ width: 16, height: 16, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} aria-hidden="true" />
											<span>Changing</span>
										</span>
									) : (
										'Change Password'
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"><div className="bg-white rounded w-full max-w-sm p-6"><h3 className="text-lg font-semibold mb-3">Delete Account</h3><p className="text-sm text-gray-600">This action is permanent. Are you sure you want to delete your account?</p><div className="flex gap-2 justify-end mt-4"><button className="px-3 py-2 bg-slate-100 rounded" onClick={() => setShowDeleteConfirm(false)}>Cancel</button><button className="px-3 py-2 bg-red-600 text-white rounded" onClick={() => { setShowDeleteConfirm(false); handleDelete(); }}>Delete</button></div></div></div>
			)}
		</div>
	);
};

export default Settings;
