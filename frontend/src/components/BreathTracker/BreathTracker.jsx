import React, { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";

export default function BreathTracker({ active = false, onError, resetSignal = 0 }) {
	// running state removed — parent controls start/pause via `active` prop
	const [status, setStatus] = useState("Place phone on chest and press Start");
	const [breathIn, setBreathIn] = useState(0);
	const [breathOut, setBreathOut] = useState(0);
	const [breathInTimes, setBreathInTimes] = useState([]);
	const [points, setPoints] = useState([]);

	const lastFiltered = useRef(0);
	const lastDir = useRef(0);
	const lastEventTime = useRef(0);
	const gravityRef = useRef(0);
	const emaMeanRef = useRef(0);
	const emaSqRef = useRef(0);
	const listenerRef = useRef(null);
	const startupTimerRef = useRef(null);

	const chartOptions = {
		chart: { id: "breath-chart", type: "area", animations: { enabled: true } , toolbar: { show: false }},
		stroke: { curve: "smooth" },
		xaxis: { type: "datetime" },
		dataLabels: { enabled: false },
	};

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
		const minThreshold = 0.01; // allow very small motions to count
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
			// const diff = filtered - lastFiltered.current; // not used directly
			lastFiltered.current = filtered;

 			// update EMA mean and mean-square for adaptive threshold
 			emaMeanRef.current = emaAlpha * filtered + (1 - emaAlpha) * emaMeanRef.current;
 			emaSqRef.current = emaAlpha * (filtered * filtered) + (1 - emaAlpha) * emaSqRef.current;
 			const variance = Math.max(0, emaSqRef.current - emaMeanRef.current * emaMeanRef.current);
 			const std = Math.sqrt(variance);
 			const adaptiveHyst = Math.max(minThreshold, std * hystMultiplier);

 			// push point at a reasonable rate
 			if (!lastEventTime.current || t - lastEventTime.current > 120) {
 				setPoints((ps) => {
 					const next = ps.concat({ x: t, y: Number(filtered.toFixed(4)) });
 					if (next.length > 400) next.shift();
 					return next;
 				});
 				lastEventTime.current = t;
 			}

 			// Zero-crossing with hysteresis detection for inhale/exhale
 			if (filtered > adaptiveHyst && lastDir.current !== 1 && t - (listenerRef.current?.lastCountTime || 0) > minInterval) {
 				setBreathIn((v) => v + 1);
 				setBreathInTimes((arr) => {
 					const next = arr.concat(t);
 					if (next.length > 200) next.shift();
 					return next;
 				});
 				lastDir.current = 1;
 				listenerRef.current = { ...listenerRef.current, lastCountTime: t };
 			}

 			if (filtered < -adaptiveHyst && lastDir.current !== -1 && t - (listenerRef.current?.lastCountTime || 0) > minInterval) {
 				setBreathOut((v) => v + 1);
 				lastDir.current = -1;
 				listenerRef.current = { ...listenerRef.current, lastCountTime: t };
 			}
		};

		window.addEventListener("devicemotion", handler, true);
		listenerRef.current = { handler };

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
		setPoints([]);
		lastFiltered.current = 0;
		lastDir.current = 0;
	}, [resetSignal]);

	const total = Math.floor((breathIn + breathOut) / 2);
	const bpm = (() => {
		const now = Date.now();
		const recent = breathInTimes.filter((ts) => ts >= now - 60000);
		return recent.length;
	})();

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
						<div className="p-3 bg-slate-100 rounded">
							<div className="text-sm">Breathing Rate</div>
							<div className="text-2xl font-bold">{bpm} BPM</div>
						</div>
					</div>

					<div className="mt-4">
						{Chart ? (
							<Chart options={chartOptions} series={[{ name: "breath", data: points.map((p) => ({ x: p.x, y: p.y })) }]} type="area" height={240} />
						) : (
							<div className="p-3 border rounded text-sm">ApexCharts not installed — install react-apexcharts & apexcharts for a realtime chart.</div>
						)}
					</div>


				</div>
			</div>
		</div>
	);
}
