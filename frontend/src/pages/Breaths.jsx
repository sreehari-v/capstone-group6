import React, { useState, useContext, useCallback, useEffect, useMemo, useRef } from 'react'
import axios from 'axios'
import BreathTracker from '../components/BreathTracker/BreathTracker'
import BreathStartModal from '../components/BreathTracker/BreathStartModal'
import ToastContext from '../contexts/ToastContext.jsx'
import { io } from 'socket.io-client'

function Breaths() {
  const [showStartModal, setShowStartModal] = useState(false);
  const [trackingStarted, setTrackingStarted] = useState(false);
  const [sensorError, setSensorError] = useState(null);
  const [resetCounter, setResetCounter] = useState(0);
  const [everStarted, setEverStarted] = useState(false);
  const [sensitivity, setSensitivity] = useState(3);
  const { showToast } = useContext(ToastContext);
  const [savingSession, setSavingSession] = useState(false);
  const [saveRequested, setSaveRequested] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [savedSessionId, setSavedSessionId] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(() => ({ code: typeof window !== 'undefined' ? localStorage.getItem('sessionCode') : null, listeners: 0, role: null }));
  const [hasSensor, setHasSensor] = useState(true);
  const socketRef = useRef(null);
  const sampleBufferRef = useRef([]);

  const notify = (message, type = 'info') => {
    try {
      if (typeof showToast === 'function') showToast(message, type);
      else alert(message);
    } catch {
      alert(message);
    }
  };

  // Reconnect / re-establish socket when returning to the page.
  useEffect(() => {
    try {
      const storedCode = typeof window !== 'undefined' ? localStorage.getItem('sessionCode') : null;
      const storedRole = typeof window !== 'undefined' ? localStorage.getItem('sessionRole') : null;
      if (!storedCode && !storedRole) return;
      const s = ensureSocket();
      if (!s) return;
      // If we were a listener previously, re-join the session automatically
      if (storedRole === 'listener' && storedCode) {
        try { s.emit('join_session', { code: storedCode }); } catch (e) { console.warn('rejoin failed', e); }
      }
      // If previously a producer, re-create a session (server will generate a fresh code)
      if (storedRole === 'producer') {
        try { s.emit('create_session'); } catch (e) { console.warn('recreate session failed', e); }
      }
  } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Emit breath samples to socket for listeners
  const emitToSocket = (payload) => {
    const s = socketRef.current || ensureSocket();
    if (!s || s.disconnected) return;
    try {
      const code = sessionInfo && sessionInfo.code ? sessionInfo.code : (typeof window !== 'undefined' ? localStorage.getItem('sessionCode') : null);
      if (!code) {
        // buffer the sample(s) until we have a code
        try {
          const arr = Array.isArray(payload) ? payload.slice() : [payload];
          sampleBufferRef.current = (sampleBufferRef.current || []).concat(arr).slice(-1000);
          if (sampleBufferRef.current.length % 50 === 0) console.debug('emitToSocket: buffered samples count', sampleBufferRef.current.length);
        } catch (e) { console.warn('buffer failed', e); }
        return;
      }
      const enriched = {
        code,
        samples: Array.isArray(payload) ? payload : [payload],
        breathIn: undefined,
        breathOut: undefined,
        avgRespiratoryRate: undefined,
      };
      // include optional summary fields if present on payload
      if (typeof payload.breathIn === 'number') enriched.breathIn = payload.breathIn;
      if (typeof payload.breathOut === 'number') enriched.breathOut = payload.breathOut;
      if (typeof payload.avgRespiratoryRate === 'number') enriched.avgRespiratoryRate = payload.avgRespiratoryRate;
      console.debug('emitToSocket -> emitting breath_data', { code: enriched.code, samples: enriched.samples.length });
      s.emit('breath_data', enriched);
    } catch (e) { console.warn('emit failed', e); }
  };

  const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.REACT_APP_API_BASE || 'http://localhost:5000';

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const r = await axios.get(`${API_BASE}/api/breaths`, { withCredentials: true });
      if (r?.data?.sessions) setSessions(r.data.sessions);
    } catch (e) {
      console.debug('Failed to load breath sessions', e && e.response ? e.response.data : e);
    } finally {
      setLoadingSessions(false);
    }
  }, [API_BASE]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // detect whether the current device has DeviceMotion support
  useEffect(() => {
    try {
      // Treat a device as sensor-capable only when it's a mobile device and
      // DeviceMotion is available — this avoids showing mobile-only controls on
      // desktops/laptops which sometimes expose the API but don't provide events.
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
      let available = false;
      if (isMobile && typeof window !== 'undefined') {
        if (typeof DeviceMotionEvent !== 'undefined') available = true;
        else if ('ondevicemotion' in window) available = true;
      }
      setHasSensor(available);
    } catch {
      setHasSensor(false);
    }
  }, []);

  // Listen for session updates (dispatched by BreathTracker)
  useEffect(() => {
    const handler = (ev) => {
      const d = ev && ev.detail ? ev.detail : {};
      if (d && d.code === null) {
        setSessionInfo({ code: null, listeners: 0, role: null });
        return;
      }
      setSessionInfo((prev) => ({
        code: d.code || prev.code,
        role: d.role || prev.role,
        listeners: typeof d.listenersCount === 'number' ? d.listenersCount : (d.role === 'listener' ? Math.max(1, prev.listeners) : prev.listeners),
        streaming: typeof d.streaming === 'boolean' ? d.streaming : prev.streaming || false,
      }));
    };
    try { window.addEventListener('session:updated', handler); } catch (err) { void err; }
    return () => { try { window.removeEventListener('session:updated', handler); } catch (err) { void err; } };
  }, []);

  // Socket helpers
  const ensureSocket = () => {
    if (socketRef.current) return socketRef.current;
    try {
      const s = io(API_BASE, { withCredentials: true });
      socketRef.current = s;
      // common socket handlers
      s.on('connect', () => console.debug('socket connected', s.id));
      s.on('connect_error', (err) => console.debug('socket connect_error', err));
      s.on('disconnect', () => console.debug('socket disconnected'));
      s.on('session_created', ({ code }) => {
        try { localStorage.setItem('sessionCode', code); localStorage.setItem('sessionRole', 'producer'); } catch (e) { console.warn('localStorage set failed', e); }
        console.debug('socket session_created -> code', code);
        setShareCode(code);
        setSessionInfo((p) => ({ ...p, code, role: 'producer' }));
        window.dispatchEvent(new CustomEvent('session:updated', { detail: { code, role: 'producer', listenersCount: 0, streaming: false } }));
        if (typeof notify === 'function') notify(`Session created: ${code}`, 'success');
        setShowShareModal(true);
        // flush any buffered samples that were generated before code was available
        try {
          const buf = sampleBufferRef.current || [];
          if (buf.length) {
            console.debug('Flushing buffered samples after session_created', buf.length);
            const enriched = { code, samples: buf.slice() };
            try { s.emit('breath_data', enriched); } catch (e) { console.warn('flush emit failed', e); }
            sampleBufferRef.current = [];
          }
        } catch (e) { console.warn('flush failed', e); }
      });
  s.on('join_error', (err) => { if (typeof notify === 'function') notify(err?.message || 'Failed to join session', 'error'); });
  s.on('session_error', (err) => { if (typeof notify === 'function') notify(err?.message || 'Session error', 'error'); });
      s.on('joined', ({ code }) => {
        try { localStorage.setItem('sessionCode', code); localStorage.setItem('sessionRole', 'listener'); } catch (e) { console.warn('localStorage set failed', e); }
        setSessionInfo((p) => ({ ...p, code, role: 'listener' }));
        window.dispatchEvent(new CustomEvent('session:updated', { detail: { code, role: 'listener', listenersCount: 1, streaming: false } }));
        setJoining(false);
        if (typeof notify === 'function') notify(`Joined session ${code}`, 'success');
      });
      s.on('listener_joined', () => {
        setSessionInfo((prev) => ({ ...prev, listeners: (prev.listeners || 0) + 1 }));
        window.dispatchEvent(new CustomEvent('session:updated', { detail: { code: sessionInfo.code, role: 'producer', listenersCount: (sessionInfo.listeners || 0) + 1 } }));
      });
      s.on('listener_left', () => {
        setSessionInfo((prev) => ({ ...prev, listeners: Math.max(0, (prev.listeners || 1) - 1) }));
      });
      s.on('breath_data', (payload) => {
        console.debug('socket received breath_data:', payload && (payload.code ? `[code ${payload.code}]` : '[no-code]'), payload && (payload.samples ? payload.samples.length + ' samples' : 'no samples'));
        // forward to window so BreathTracker (listener) can receive without prop wiring
        window.dispatchEvent(new CustomEvent('socket:breath_data', { detail: payload }));
      });
      s.on('session_snapshot', (snapshot) => {
        window.dispatchEvent(new CustomEvent('socket:session_snapshot', { detail: snapshot }));
      });
      s.on('session_ended', ({ code }) => {
        window.dispatchEvent(new CustomEvent('session:ended', { detail: { code } }));
        try { localStorage.removeItem('sessionCode'); localStorage.removeItem('sessionRole'); } catch (e) { console.warn('localStorage remove failed', e); }
        setSessionInfo({ code: null, listeners: 0, role: null });
      });
      return s;
    } catch (e) {
      console.warn('socket init failed', e);
      return null;
    }
  };

  const computeSummary = (items) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let todayCount = 0, weekCount = 0, monthCount = 0;
    let totalDurationToday = 0, totalDurationWeek = 0, totalDurationMonth = 0;
    let totalBpmToday = 0, totalBpmWeek = 0, totalBpmMonth = 0;

    for (const s of items || []) {
      const st = s.startedAt ? new Date(s.startedAt) : null;
      if (!st) continue;
      const dur = Number(s.durationSeconds || 0);
      const avgBpm = Number(s.avgRespiratoryRate || 0);
      if (st >= startOfDay) { todayCount++; totalDurationToday += dur; totalBpmToday += avgBpm; }
      if (st >= weekAgo) { weekCount++; totalDurationWeek += dur; totalBpmWeek += avgBpm; }
      if (st >= monthAgo) { monthCount++; totalDurationMonth += dur; totalBpmMonth += avgBpm; }
    }

    return {
      today: { count: todayCount, avgDur: todayCount ? Math.round(totalDurationToday / todayCount) : 0, avgBpm: todayCount ? Math.round(totalBpmToday / todayCount) : 0 },
      week: { count: weekCount, avgDur: weekCount ? Math.round(totalDurationWeek / weekCount) : 0, avgBpm: weekCount ? Math.round(totalBpmWeek / weekCount) : 0 },
      month: { count: monthCount, avgDur: monthCount ? Math.round(totalDurationMonth / monthCount) : 0, avgBpm: monthCount ? Math.round(totalBpmMonth / monthCount) : 0 },
    };
  };

  const summary = computeSummary(sessions);

  const isConnected = sessionInfo && sessionInfo.code && (sessionInfo.listeners > 0 || sessionInfo.role === 'listener' || sessionInfo.streaming);

  // compute the last (or saved) session for details card
  const lastSession = useMemo(() => {
    if (!sessions || !sessions.length) return null;
    if (savedSessionId) return sessions.find(s => String(s._id) === String(savedSessionId)) || sessions[0];
    return sessions[0];
  }, [sessions, savedSessionId]);

  return (
    <div className="layout-content-container flex flex-col w-full flex-1 overflow-y-auto p-4">
      <div className="flex items-start md:items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold">Breath Tracking</h1>
      </div>

      {/* top controls removed - controls moved into the graph card below for better layout */}

  <BreathStartModal open={showStartModal} onStart={() => { setShowStartModal(false); setTrackingStarted(true); setEverStarted(true); }} onCancel={() => setShowStartModal(false)} />

      {sensorError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <h3 className="text-lg font-bold mb-2">Sensor unavailable</h3>
            <p className="mb-4">{sensorError.message || 'Motion sensor not available or permission denied.'}</p>
            <div className="flex justify-end">
              <button onClick={() => setSensorError(null)} className="btn btn-primary">OK</button>
            </div>
          </div>
        </div>
      )}

      {loadingSessions && <div className="mb-2 text-sm text-gray-500">Loading sessions...</div>}

      {/* Summary cards: Today / 7 days / 30 days */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {[
          { key: 'today', title: 'Today', data: summary.today },
          { key: 'week', title: 'Last 7 days', data: summary.week },
          { key: 'month', title: 'Last 30 days', data: summary.month }
        ].map((card) => (
          <div key={card.key} className="section-card p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">{card.title}</div>
              <div className="text-xs text-gray-500">{card.data.count} sessions</div>
            </div>
            <div className="flex items-end justify-between mt-auto">
              <div>
                <div className="text-3xl font-bold leading-none">{card.data.count}</div>
                <div className="text-xs text-gray-500">sessions</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Avg BPM</div>
                <div className="text-xl font-semibold">{card.data.avgBpm}</div>
                <div className="text-xs text-gray-500">Avg dur {card.data.avgDur}s</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Breath tracker in its own card */}
      <div className="section-card p-4 mb-4">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">Live Breath Graph</h2>
                  <div className="text-sm text-gray-500">Real-time breathing waveform and stats</div>
                </div>
              </div>
              <div className="bg-slate-50 rounded p-3">
                <BreathTracker
                  active={trackingStarted}
                  resetSignal={resetCounter}
                  sensitivity={sensitivity}
                  shouldSave={saveRequested}
                  onSaved={() => setSaveRequested(false)}
                  onStop={() => setTrackingStarted(false)}
                  onError={(err) => { setSensorError(err); setTrackingStarted(false); }}
                  onSample={emitToSocket}
                  onSave={async (session) => {
                    // Called by BreathTracker only when parent requested a save
                    console.debug('Breaths.onSave received session', session);
                    try {
                      setSavingSession(true);
                      const res = await axios.post(`${API_BASE}/api/breaths`, session, { withCredentials: true });
                      console.debug('Breaths.onSave POST response', res && res.status, res && res.data);
                      // mark saved and refresh list
                      if (res?.data?.id) setSavedSessionId(res.data.id);
                      await loadSessions();
                      setSavingSession(false);
                      notify('Breath session saved', 'success');
                    } catch (err) {
                      console.error('Failed to save breath session', err && err.response ? err.response.data : err);
                      notify('Failed to save breath session', 'error');
                      setSavingSession(false);
                    }
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="flex flex-col gap-3">
                {/* If device has a sensor (typically mobile): show tracking controls and
                    options to create or join a live session. If device has no sensor
                    (laptop/desktop) show only a join UI — this device will act as a receiver. */}
                {hasSensor ? (
                  <div>
                    <button
                      onClick={() => {
                        console.debug('Breaths: Start/Pause clicked, trackingStarted=', trackingStarted, 'everStarted=', everStarted);
                        setSavedSessionId(null);
                        if (trackingStarted) setTrackingStarted(false);
                        else if (everStarted) setTrackingStarted(true);
                        else setShowStartModal(true);
                      }}
                      className="btn btn-primary w-full"
                    >
                      {trackingStarted ? 'Pause Tracking' : 'Start Tracking'}
                    </button>

                    <div className="mt-3">
                      <div className="text-sm text-gray-600 mb-2">Live sharing</div>
                      <div className="flex gap-2">
                        <button className="btn btn-outline flex-1" onClick={() => {
                          const s = ensureSocket();
                          try { s && s.emit('create_session'); } catch (e) { console.warn('create_session emit failed', e); }
                        }}>Create code</button>

                        <div className="flex gap-2" style={{ minWidth: 0 }}>
                          <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter code" className="flex-1 border rounded px-3 py-2" />
                          <button className="btn btn-primary" onClick={async () => {
                            const code = (joinCode || '').trim().toUpperCase();
                            if (!code) { notify('Please enter a code to join', 'error'); return; }
                            setJoining(true);
                            try {
                              const s = ensureSocket();
                              if (!s) throw new Error('Socket not available');
                              s.emit('join_session', { code });
                              // we rely on the 'joined' or 'join_error' handlers in ensureSocket to update UI
                              setShowShareModal(false);
                              setJoinCode('');
                            } catch {
                              notify('Failed to join session', 'error');
                              setJoining(false);
                            }
                          }}>{joining ? 'Joining…' : 'Join'}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-medium">Join session</div>
                    <div className="flex gap-2">
                      <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter code" className="flex-1 border rounded px-3 py-2" />
                      <button className="btn btn-primary" onClick={async () => {
                        const code = (joinCode || '').trim().toUpperCase();
                        if (!code) { notify('Please enter a code to join', 'error'); return; }
                        setJoining(true);
                        try {
                            const s = ensureSocket();
                            if (!s) throw new Error('Socket not available');
                            s.emit('join_session', { code });
                            // rely on socket handlers to update session state
                            setJoinCode('');
                        } catch {
                          notify('Failed to join session', 'error');
                        } finally { setJoining(false); }
                      }}>{joining ? 'Joining…' : 'Join'}</button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">This device will receive live data when a producer streams.</div>
                  </div>
                )}

                {trackingStarted && (
                  <div className="flex gap-2">
                    <button onClick={() => { console.debug('Breaths: Reset clicked'); setResetCounter((c) => c + 1); setEverStarted(false); setTrackingStarted(false); setSavedSessionId(null); }} className="btn btn-outline flex-1">Reset</button>
                    <button onClick={() => { console.debug('Breaths: Stop & Save clicked -> request save and stop'); setSaveRequested(true); setTrackingStarted(false); }} className="btn btn-primary flex-1" disabled={savingSession}>{savingSession ? 'Saving...' : 'Stop & Save'}</button>
                  </div>
                )}

                {(hasSensor || (sessionInfo && sessionInfo.role === 'listener' && sessionInfo.streaming)) && (
                  <div>
                    <label className="text-sm text-gray-600">Sensitivity</label>
                    <input type="range" min={1} max={5} value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))} className="w-full" style={{ accentColor: '#1193d4', background: '#e7eff3', height: 6, borderRadius: 6 }} />
                  </div>
                )}

                <div>
                  <div className="p-3 bg-slate-50 rounded mb-2">
                    <div className="text-sm text-gray-600">Active Session</div>
                    {isConnected ? (
                      <>
                        <div className="text-lg font-semibold mt-1">{sessionInfo.code}</div>
                        <div className="text-xs text-gray-500">Role: {sessionInfo.role || '—'}</div>
                        <div className="text-xs text-gray-500">{sessionInfo.listeners} device{sessionInfo.listeners === 1 ? '' : 's'} listening</div>
                        <div className="mt-2 flex gap-2">
                          <button className="btn btn-sm btn-outline" onClick={async () => { try { await navigator.clipboard.writeText(sessionInfo.code); notify('Code copied', 'success'); } catch { notify('Copy failed', 'error'); } }}>Copy code</button>
                          {hasSensor && (
                            <button className="btn btn-sm btn-primary" onClick={() => { setShowShareModal(true); }}>Share</button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-600 mt-1">No active session</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">Breath tracking on iOS requires tapping <b>Start Tracking</b> to grant motion access.</div>
              </div>
            </div>
          </div>

          {showShareModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Share live session</h3>
                    <div className="text-sm text-gray-600">Invite another device or join a session using a code</div>
                  </div>
                  <button className="text-sm text-gray-500" onClick={() => setShowShareModal(false)}>✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Share box */}
                  <div className="p-4 rounded border bg-gray-50">
                    <div className="text-sm text-gray-600 mb-2">Share this code</div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="px-3 py-2 bg-white rounded text-xl font-mono tracking-widest border">{shareCode || '------'}</div>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-primary" onClick={async () => {
                          try { await navigator.clipboard.writeText(shareCode); notify('Code copied to clipboard', 'success'); } catch { notify('Copy failed', 'error'); }
                        }}>Copy code</button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Share the code with the other device to join your live session. The code expires after the session ends.</div>
                  </div>

                  {/* Join box */}
                  <div className="p-4 rounded border bg-white">
                    <div className="text-sm text-gray-600 mb-2">Join a session</div>
                    <div className="flex gap-2 mb-3">
                      <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter code" className="w-full border rounded px-3 py-2" />
                        <button className="btn btn-primary" onClick={async () => {
                        const code = (joinCode || '').trim().toUpperCase();
                        if (!code) { notify('Please enter a code to join', 'error'); return; }
                        setJoining(true);
                        try {
                          const s = ensureSocket();
                          if (!s) throw new Error('Socket not available');
                          s.emit('join_session', { code });
                          // socket 'joined' handler will update local state and notify
                          setShowShareModal(false);
                          setJoinCode('');
                        } catch {
                          notify('Failed to join session', 'error');
                        } finally { setJoining(false); }
                      }}>{joining ? 'Joining…' : 'Join'}</button>
                    </div>
                    <div className="text-xs text-gray-500">If you have a join code from another device, paste it here and click Join.</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button className="btn btn-outline" onClick={() => setShowShareModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Last session details in a dedicated card - redesigned */}
      <div className="section-card p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">Last session</h3>
            <div className="text-sm text-gray-500">Most recent session summary</div>
          </div>
          {savedSessionId && <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Saved</div>}
        </div>

        {!lastSession ? (
          <div className="text-sm text-gray-500">No sessions yet. Start a session to see details here.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Big stat tiles (only human-facing fields) */}
            <div className="bg-white/40 rounded border p-3 h-full flex flex-col justify-between">
              <div className="text-xs text-gray-500">⏱️ Duration</div>
              <div className="text-2xl font-bold mt-1">{Number(lastSession.durationSeconds || 0)}s</div>
              <div className="text-xs text-gray-500 mt-1">Started: {lastSession.startedAt ? new Date(lastSession.startedAt).toLocaleString() : '—'}</div>
            </div>

            <div className="bg-white/40 rounded border p-3 h-full flex flex-col justify-between">
              <div className="text-xs text-gray-500">❤️ Avg respiratory rate</div>
              <div className="text-2xl font-bold mt-1">{Number(lastSession.avgRespiratoryRate || 0)} bpm</div>
              <div className="text-xs text-gray-500 mt-1">Ended: {lastSession.endedAt ? new Date(lastSession.endedAt).toLocaleString() : '—'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Breaths;
