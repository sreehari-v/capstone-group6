import React, { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";

export default function BreathTracker({ active = false, onError, resetSignal = 0, sensitivity = 3 }) {
	// running state removed — parent controls start/pause via `active` prop
	const [status, setStatus] = useState("Place phone on chest and press Start");
	const [breathIn, setBreathIn] = useState(0);
	const [breathOut, setBreathOut] = useState(0);
	const [, setBreathInTimes] = useState([]);
	const [points, setPoints] = useState([]);
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

	const total = Math.floor((breathIn + breathOut) / 2);

	// rate color mapping and chart options
	const rateColors = getRateColors(bpm);

	const chartOptions = {
		chart: {
			id: 'breath-chart',
			animations: { enabled: true },
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
