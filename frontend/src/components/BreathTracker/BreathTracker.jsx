import React, { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { io as ioClient } from "socket.io-client";

export default function BreathTracker({ active = false, onError, resetSignal = 0, sensitivity = 3 }) {
	// running state removed — parent controls start/pause via `active` prop
	const [status, setStatus] = useState("Place phone on chest and press Start");
	const [breathIn, setBreathIn] = useState(0);
	const [breathOut, setBreathOut] = useState(0);
	const [, setBreathInTimes] = useState([]);
	const [points, setPoints] = useState([]);
	const pointsRef = useRef([]);
	const breathInRef = useRef(0);
	const breathOutRef = useRef(0);
	const inhaleTimesRef = useRef([]);
	const exhaleTimesRef = useRef([]);
	const cycleTimesRef = useRef([]);
	const pairedIndexRef = useRef(0);
	const [bpm, setBpm] = useState(0);
	const bpmRef = useRef(0);
	const bpmTimerRef = useRef(null);

	const lastFiltered = useRef(0);
	const lastDir = useRef(0);
	const lastEventTime = useRef(0);
	const gravityRef = useRef(0);
	const emaMeanRef = useRef(0);
	const emaSqRef = useRef(0);
	const listenerRef = useRef(null);
	const startupTimerRef = useRef(null);
	const socketRef = useRef(null);
	const sessionCodeRef = useRef(null);
	const isProducerRef = useRef(false);
	// expose minimal UI state for later wiring (silence unused-variable lint)
	const [__unused_remoteMode, __unused_setRemoteMode] = useState(false);
	const [__unused_connectedCode, __unused_setConnectedCode] = useState(null);
	const [__unused_listenersCount, __unused_setListenersCount] = useState(0);
	const [__unused_producerId, __unused_setProducerId] = useState(null);
	const broadcastRef = useRef(null);
	const [joinCode, setJoinCode] = useState("");
	const [joinPending, setJoinPending] = useState(false);
	const joinTimeoutRef = useRef(null);
	const incomingBufferRef = useRef([]); // buffer incoming breath_data on listeners

	// periodically flush incoming buffer to update UI in batches (reduces re-renders)
	useEffect(() => {
		const interval = setInterval(() => {
			const buf = incomingBufferRef.current;
			if (!buf || buf.length === 0) return;
			// consume buffer
			incomingBufferRef.current = [];

			// take the last payload as authoritative for aggregate counters
			const last = buf[buf.length - 1];

			// update counts and bpm once per flush
			if (typeof last.breathIn === 'number') setBreathIn(last.breathIn);
			if (typeof last.breathOut === 'number') setBreathOut(last.breathOut);
			if (typeof last.bpm === 'number') setBpm(Math.round(last.bpm));

			// append points in bulk
			const newPoints = [];
			for (let p of buf) {
				if (p.point) newPoints.push({ x: p.point.x || p.t, y: p.point.y || 0 });
			}
			if (newPoints.length > 0) {
				setPoints((ps) => {
					const merged = ps.concat(newPoints);
					if (merged.length > 400) return merged.slice(merged.length - 400);
					return merged;
				});
			}
		}, 200);
		return () => clearInterval(interval);
	}, []);

	// Initialize socket connection once
	useEffect(() => {
		const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
		try {
			socketRef.current = ioClient(API_BASE, { withCredentials: true });
			socketRef.current.on("connect", () => console.debug("ws: connected", socketRef.current.id));

			socketRef.current.on("session_created", ({ code }) => {
				sessionCodeRef.current = code;
				isProducerRef.current = true;
				setStatus(`Sharing live data — code ${code}`);
			});

				socketRef.current.on("joined", ({ code }) => {
				// this device joined as listener
				sessionCodeRef.current = code;
				isProducerRef.current = false;
					setStatus(`Connected to ${code} — showing remote data`);
					setJoinPending(false);
					if (joinTimeoutRef.current) {
						clearTimeout(joinTimeoutRef.current);
						joinTimeoutRef.current = null;
					}
				setBpm((b) => b);
			});

				socketRef.current.on("join_error", ({ message }) => {
					setJoinPending(false);
					if (joinTimeoutRef.current) {
						clearTimeout(joinTimeoutRef.current);
						joinTimeoutRef.current = null;
					}
					setStatus(message || "Session not found or full");
				});

			socketRef.current.on("breath_data", (payload) => {
				// only apply when this device is a listener
				if (isProducerRef.current) return;
				if (!payload) return;
				// push payload into a small buffer — we'll batch UI updates to avoid jank
				incomingBufferRef.current.push(payload);
			});

			// session snapshot (initial state)
			socketRef.current.on("session_snapshot", (snapshot) => {
				if (!snapshot) return;
				if (snapshot.breathIn) setBreathIn(snapshot.breathIn);
				if (snapshot.breathOut) setBreathOut(snapshot.breathOut);
				if (snapshot.bpm) setBpm(Math.round(snapshot.bpm));
				if (snapshot.points && Array.isArray(snapshot.points)) setPoints(snapshot.points.slice(-400));
			});

			// producer asked to provide snapshot for a specific listener
			socketRef.current.on("request_snapshot", ({ to }) => {
				if (!to) return;
				const snapshot = {
					breathIn: breathInRef.current,
					breathOut: breathOutRef.current,
					bpm: bpmRef.current,
					points: pointsRef.current.slice(-400),
				};
				socketRef.current.emit("session_snapshot", { to, snapshot });
			});


		} catch (e) {
			console.warn("ws init failed", e);
		}

		return () => {
			try { socketRef.current?.disconnect(); } catch { /* ignore */ }
		};
	}, []);

	const createSession = () => {
		if (!socketRef.current) return setStatus("WebSocket not connected");
		socketRef.current.emit("create_session");
	};

	const joinSession = () => {
			if (!socketRef.current) return setStatus("WebSocket not connected");
			if (!joinCode || !/^[0-9]{6}$/.test(joinCode)) return setStatus("Enter a valid 6-digit code to join");
				setJoinPending(true);
				setStatus("Joining session...");
				socketRef.current.emit("join_session", { code: joinCode });
				// fallback: if no response in 6s, clear pending and show message
				if (joinTimeoutRef.current) clearTimeout(joinTimeoutRef.current);
				joinTimeoutRef.current = setTimeout(() => {
					// timeout: still pending
					setJoinPending(false);
					setStatus("Join timed out — please try again");
					joinTimeoutRef.current = null;
				}, 6000);
	};

	const getRateColors = (bpmVal) => {
		if (!bpmVal || bpmVal <= 0) return { bg: '#f1f5f9', color: '#0f172a' }; // neutral slate-100
		if (bpmVal < 8) return { bg: '#fee2e2', color: '#991b1b' }; // <8 Dangerously low - Red
		if (bpmVal >= 8 && bpmVal <= 11) return { bg: '#fff4e6', color: '#92400e' }; // 8-11 Lower than normal - Orange
		if (bpmVal >= 12 && bpmVal <= 20) return { bg: '#d1fae5', color: '#065f46' }; // 12-20 Normal - Green
		if (bpmVal >= 21 && bpmVal <= 24) return { bg: '#fef3c7', color: '#92400e' }; // 21-24 Slightly elevated - Yellow
		if (bpmVal >= 25 && bpmVal <= 30) return { bg: '#fff4e6', color: '#92400e' }; // 25-30 High - Orange
		// >30 Danger - Red
		return { bg: '#fee2e2', color: '#991b1b' };
	}

	const start = async () => {
		setStatus("Requesting sensor permission...");
		console.debug("BreathTracker: start() called, active sensor check starting");

		if (typeof window === "undefined" || (typeof DeviceMotionEvent === "undefined" && !("ondevicemotion" in window))) {
			const msg = "Device motion is not supported on this device/browser.";
			setStatus(msg);
			console.warn("BreathTracker: no DeviceMotion support ->", msg);
			onError && onError({ code: "nosensor", message: msg });
			return;
		}

		try {
			if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
				const resp = await DeviceMotionEvent.requestPermission();
				if (resp !== "granted") {
					const msg = "Permission denied for motion sensors";
					setStatus(msg);
					console.warn("BreathTracker: permission denied ->", msg);
					onError && onError({ code: "permission", message: msg });
					return;
				}
			}
		} catch {
			// ignore
		}

		setStatus("Listening for chest motion — keep phone on your chest");

		// Signal processing & detection params tuned for small chest motion
		const gravityAlpha = 0.98; // slow low-pass to estimate gravity
		const motionAlpha = 0.5; // smoothing for motion signal
		const emaAlpha = 0.05; // for adaptive mean/std estimation
		const minThreshold = 0.002; // base minimum threshold (lower allows much smaller motions)
		const hystMultiplier = 1.25; // hysteresis multiplier on std
		const minInterval = 300; // minimum ms between counts

		const handler = (ev) => {
			// clear startup timer on first event
			if (startupTimerRef.current) {
				clearTimeout(startupTimerRef.current);
				startupTimerRef.current = null;
			}

 			const t = Date.now();
 			const acc = ev.accelerationIncludingGravity || ev.acceleration;
 			if (!acc) return;

 			// pick the axis most likely to reflect chest motion (prefer Y)
 			const rawAxis = (acc.y !== undefined && acc.y !== null) ? acc.y : (acc.x !== undefined && acc.x !== null) ? acc.x : (acc.z || 0);

 			// estimate gravity (slow LP) and remove to get motion
 			gravityRef.current = gravityAlpha * gravityRef.current + (1 - gravityAlpha) * rawAxis;
 			const motion = rawAxis - gravityRef.current;

			// smooth motion signal
			const filtered = motionAlpha * lastFiltered.current + (1 - motionAlpha) * motion;

			// apply sensitivity gain (user-controlled). sensitivity defaults to 3 -> gain 1
			// gain is exponential so higher slider values increase sensitivity significantly
			const gain = Math.pow(1.6, (sensitivity - 3));
			const scaled = filtered * gain;
			// const diff = filtered - lastFiltered.current; // not used directly
			lastFiltered.current = filtered;

			// update EMA mean and mean-square for adaptive threshold (use scaled signal)
			emaMeanRef.current = emaAlpha * scaled + (1 - emaAlpha) * emaMeanRef.current;
			emaSqRef.current = emaAlpha * (scaled * scaled) + (1 - emaAlpha) * emaSqRef.current;
 			const variance = Math.max(0, emaSqRef.current - emaMeanRef.current * emaMeanRef.current);
 			const std = Math.sqrt(variance);
 			const adaptiveHyst = Math.max(minThreshold, std * hystMultiplier);

 			// push point at a reasonable rate
			if (!lastEventTime.current || t - lastEventTime.current > 120) {
				setPoints((ps) => {
					const next = ps.concat({ x: t, y: Number(scaled.toFixed(4)) });
					if (next.length > 400) next.shift();
					if (ps.length === 0) console.debug('BreathTracker: first plotted point', next[0]);
					return next;
				});
 				lastEventTime.current = t;
 			}

 			// Zero-crossing with hysteresis detection for inhale/exhale
			if (scaled > adaptiveHyst && lastDir.current !== 1 && t - (listenerRef.current?.lastCountTime || 0) > minInterval) {
				// inhale detected
				setBreathIn((v) => v + 1);
				setBreathInTimes((arr) => {
					const next = arr.concat(t);
					if (next.length > 200) next.shift();
					return next;
				});
				inhaleTimesRef.current.push(t);
				// try to form breath cycles (pair by sequence index)
				while (pairedIndexRef.current < inhaleTimesRef.current.length && pairedIndexRef.current < exhaleTimesRef.current.length) {
					const iT = inhaleTimesRef.current[pairedIndexRef.current];
					const eT = exhaleTimesRef.current[pairedIndexRef.current];
					const cycleT = Math.max(iT, eT);
					cycleTimesRef.current.push(cycleT);
					pairedIndexRef.current++;
					if (cycleTimesRef.current.length > 200) cycleTimesRef.current.shift();
				}
				lastDir.current = 1;
				listenerRef.current = { ...listenerRef.current, lastCountTime: t };
			}

			if (scaled < -adaptiveHyst && lastDir.current !== -1 && t - (listenerRef.current?.lastCountTime || 0) > minInterval) {
				// exhale detected
				setBreathOut((v) => v + 1);
				exhaleTimesRef.current.push(t);
				// try to form breath cycles
				while (pairedIndexRef.current < inhaleTimesRef.current.length && pairedIndexRef.current < exhaleTimesRef.current.length) {
					const iT = inhaleTimesRef.current[pairedIndexRef.current];
					const eT = exhaleTimesRef.current[pairedIndexRef.current];
					const cycleT = Math.max(iT, eT);
					cycleTimesRef.current.push(cycleT);
					pairedIndexRef.current++;
					if (cycleTimesRef.current.length > 200) cycleTimesRef.current.shift();
				}
				lastDir.current = -1;
				listenerRef.current = { ...listenerRef.current, lastCountTime: t };
			}
		};

		window.addEventListener("devicemotion", handler, true);
		listenerRef.current = { handler };

		// If socket exists and this device created a session, start acting as producer
		if (socketRef.current && isProducerRef.current && sessionCodeRef.current) {
			console.debug("BreathTracker: producer broadcasting start snapshot");
			socketRef.current.emit("session_snapshot", { snapshot: { breathIn, breathOut, points, bpm }, to: null });
		}

		// start BPM calculator (runs while tracking)
		if (bpmTimerRef.current) clearInterval(bpmTimerRef.current);
		bpmTimerRef.current = setInterval(() => {
			try {
				const now = Date.now();
				const windowMs = 60000; // analyze last 60s
				const recent = (cycleTimesRef.current || []).filter((ts) => ts >= now - windowMs);
				if (recent.length < 2) {
					// not enough completed breaths (cycles)
					bpmRef.current = Math.max(0, (bpmRef.current * 0.85));
					setBpm(Math.round(bpmRef.current));
					return;
				}
				// compute mean interval between cycles using first..last
				const first = recent[0];
				const last = recent[recent.length - 1];
				const intervals = recent.length - 1;
				if (intervals <= 0 || last <= first) {
					bpmRef.current = Math.max(0, (bpmRef.current * 0.85));
					setBpm(Math.round(bpmRef.current));
					return;
				}
				const meanMs = (last - first) / intervals; // average ms per breath
				const instantBpm = 60000 / meanMs;
				// smooth via EMA on bpmRef
				const alpha = 0.25;
				bpmRef.current = alpha * instantBpm + (1 - alpha) * bpmRef.current;
				setBpm(Math.round(bpmRef.current));
			} catch {
				// ignore calculation errors
			}
		}, 1000);

		// start broadcast interval for producer
		try {
			if (broadcastRef.current) clearInterval(broadcastRef.current);
			broadcastRef.current = setInterval(() => {
				if (!socketRef.current || !sessionCodeRef.current) return;
				if (!isProducerRef.current) return;
				socketRef.current.emit("breath_data", {
					code: sessionCodeRef.current,
					t: Date.now(),
					breathIn,
					breathOut,
					bpm,
					point: points.length ? points[points.length - 1] : null,
				});
			}, 800);
		} catch {
			// ignore
		}

		// If no devicemotion events arrive within 2s, assume sensor not available
		console.debug("BreathTracker: setting startup timer for 2000ms waiting for devicemotion events");
		startupTimerRef.current = setTimeout(() => {
			const msg = "No motion events received — device may not have motion sensors or permission was blocked.";
			setStatus(msg);
			console.warn("BreathTracker: startup timeout ->", msg);
			// cleanup
			stop();
			onError && onError({ code: "nosensor", message: msg });
		}, 2000);

		// nothing else here
	};

	const stop = () => {
		setStatus("Stopped");
		if (listenerRef.current?.handler) {
			window.removeEventListener("devicemotion", listenerRef.current.handler, true);
			listenerRef.current = null;
		}
		if (startupTimerRef.current) {
			clearTimeout(startupTimerRef.current);
			startupTimerRef.current = null;
		}
		// stop bpm timer if running
		if (bpmTimerRef.current) {
			clearInterval(bpmTimerRef.current);
			bpmTimerRef.current = null;
		}
		// stop broadcast interval if running
		try {
			if (broadcastRef.current) {
				clearInterval(broadcastRef.current);
				broadcastRef.current = null;
			}
		} catch {
			// ignore
		}
	};

	useEffect(() => {
		// Start or stop listening based on parent `active` prop.
		// DO NOT clear the collected data when pausing — parent Reset triggers clear via resetSignal.
		if (active) start();
		else stop();
		return () => stop();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [active]);

	// Reset when parent signals via resetSignal (incrementing counter)
	useEffect(() => {
		setBreathIn(0);
		setBreathOut(0);
		setBreathInTimes([]);
		inhaleTimesRef.current = [];
		exhaleTimesRef.current = [];
		cycleTimesRef.current = [];
		pairedIndexRef.current = 0;
		setPoints([]);
		lastFiltered.current = 0;
		lastDir.current = 0;
		setBpm(0);
		bpmRef.current = 0;
	}, [resetSignal]);

	// keep refs in sync with state for snapshot/requests
	useEffect(() => { breathInRef.current = breathIn; }, [breathIn]);
	useEffect(() => { breathOutRef.current = breathOut; }, [breathOut]);
	useEffect(() => { pointsRef.current = points; }, [points]);

	const total = Math.floor((breathIn + breathOut) / 2);

	// rate color mapping and chart options
	const rateColors = getRateColors(bpm);

	const chartOptions = {
		chart: {
			id: 'breath-chart',
			// disable heavy animations to keep real-time rendering smooth on listeners
			animations: { enabled: false },
			toolbar: { show: false },
			zoom: { enabled: false },
			// keep full chart decorations (axes/grid) visible for context
			sparkline: { enabled: false },
		},
		xaxis: {
			type: 'datetime',
			labels: { show: true },
			axisTicks: { show: true },
			axisBorder: { show: true },
		},
		yaxis: {
			labels: { show: true },
			axisTicks: { show: true },
			axisBorder: { show: true },
			decimalsInFloat: 4,
		},
		stroke: { curve: 'smooth', width: 3, colors: ['#1193d4'] },
		fill: { opacity: 0 },
		markers: { size: 0, hover: { size: 0 } },
		dataLabels: { enabled: false },
		// keep tooltip enabled for interactive inspection but do not show persistent labels
		tooltip: { enabled: true, x: { format: 'HH:mm:ss' }, shared: false, followCursor: true },
		legend: { show: false },
		grid: { show: true },
	};


	return (
		<div className="w-full">
			<div className="mb-2 text-sm text-gray-600">{status}</div>
			<div className="flex items-center justify-center gap-2 mt-2">
				<button
					onClick={createSession}
					className="px-3 py-1 bg-primary text-white rounded-md text-sm"
				>
					Share live
				</button>
				<input
					value={joinCode}
					onChange={(e) => setJoinCode(e.target.value)}
					placeholder="123456"
					className="w-28 text-center px-2 py-1 border rounded-md text-sm"
				/>
				<button
					onClick={joinSession}
					disabled={joinPending}
					className={`px-3 py-1 text-white rounded-md text-sm ${joinPending ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600'}`}
				>
					{joinPending ? 'Joining...' : 'Join'}
					</button>
			</div>
			<div className="mt-4 grid grid-cols-1 gap-4">
				<div>
					<div className="grid grid-cols-4 gap-2 text-center">
						<div className="p-3 bg-slate-100 rounded">
							<div className="text-sm">Breath In</div>
							<div className="text-2xl font-bold">{breathIn}</div>
						</div>
						<div className="p-3 bg-slate-100 rounded">
							<div className="text-sm">Breath Out</div>
							<div className="text-2xl font-bold">{breathOut}</div>
						</div>
						<div className="p-3 bg-slate-100 rounded">
							<div className="text-sm">Total</div>
							<div className="text-2xl font-bold">{total}</div>
						</div>
						<div className="p-3 rounded" style={{ backgroundColor: rateColors.bg, color: rateColors.color }}>
							<div className="text-sm">Breathing Rate</div>
							<div className="text-2xl font-bold">{bpm} BPM</div>
						</div>
					</div>

					<div className="mt-4">
						{Chart ? (
							<Chart options={chartOptions} series={[{ name: "breath", data: points.map((p) => ({ x: p.x, y: p.y })), color: '#1193d4' }]} type="area" height={240} />
						) : (
							<div className="p-3 border rounded text-sm">ApexCharts not installed — install react-apexcharts & apexcharts for a realtime chart.</div>
						)}
					</div>



				</div>
			</div>
		</div>
	);
}
