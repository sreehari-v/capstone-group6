import React, { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";

export default function BreathTracker({ active = false, onStop, onError }) {
	const [running, setRunning] = useState(false);
	const [status, setStatus] = useState("Place phone on chest and press Start");
	const [breathIn, setBreathIn] = useState(0);
	const [breathOut, setBreathOut] = useState(0);
	const [breathInTimes, setBreathInTimes] = useState([]);
	const [points, setPoints] = useState([]);

	const lastFiltered = useRef(0);
	const lastDir = useRef(0);
	const lastEventTime = useRef(0);
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
		setRunning(true);

		const alpha = 0.8;
		const threshold = 0.12;
		const minInterval = 400;

		const handler = (ev) => {
			// clear startup timer on first event
			if (startupTimerRef.current) {
				clearTimeout(startupTimerRef.current);
				startupTimerRef.current = null;
			}

			const t = Date.now();
			const acc = ev.accelerationIncludingGravity || ev.acceleration;
			if (!acc) return;

			const raw = (acc.y || 0) - (acc.z || 0);
			const filtered = alpha * lastFiltered.current + (1 - alpha) * raw;
			const diff = filtered - lastFiltered.current;
			lastFiltered.current = filtered;

			if (!lastEventTime.current || t - lastEventTime.current > 150) {
				setPoints((ps) => {
					const next = ps.concat({ x: t, y: Number(filtered.toFixed(3)) });
					if (next.length > 200) next.shift();
					return next;
				});
				lastEventTime.current = t;
			}

			if (diff > threshold && lastDir.current !== 1 && t - (listenerRef.current?.lastCountTime || 0) > minInterval) {
				setBreathIn((v) => v + 1);
				setBreathInTimes((arr) => {
					const next = arr.concat(t);
					if (next.length > 200) next.shift();
					return next;
				});
				lastDir.current = 1;
				listenerRef.current = { ...listenerRef.current, lastCountTime: t };
			}

			if (diff < -threshold && lastDir.current !== -1 && t - (listenerRef.current?.lastCountTime || 0) > minInterval) {
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
		setRunning(false);
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
		if (active) start();
		else {
			stop();
			setBreathIn(0);
			setBreathOut(0);
			setPoints([]);
			lastFiltered.current = 0;
			lastDir.current = 0;
		}
		return () => stop();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [active]);

	const total = Math.floor((breathIn + breathOut) / 2);
	const bpm = (() => {
		const now = Date.now();
		const recent = breathInTimes.filter((ts) => ts >= now - 60000);
		return recent.length;
	})();

	return (
		<div className="w-full">
			<div className="mb-2 text-sm text-gray-600">{status}</div>
			<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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

				<div>
					<div className="p-3 border rounded h-full">
						<h4 className="font-medium mb-2">Live values</h4>
						<div className="text-xs text-gray-600 mb-2">Recent filtered acceleration values (y-z)</div>
						<div style={{ maxHeight: 220, overflow: "auto" }}>
							<table className="w-full text-sm">
								<thead>
									<tr>
										<th className="text-left">Time</th>
										<th className="text-right">Value</th>
									</tr>
								</thead>
								<tbody>
									{points.slice().reverse().map((p, i) => (
										<tr key={i}>
											<td>{new Date(p.x).toLocaleTimeString()}</td>
											<td className="text-right">{p.y}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="mt-3 flex gap-2">
							{!running ? (
								<button onClick={start} className="px-3 py-2 bg-primary text-white rounded">Start</button>
							) : (
								<button
									onClick={() => {
										stop();
										onStop && onStop();
									}}
									className="px-3 py-2 border rounded"
								>
									Stop
								</button>
							)}
							<button
								onClick={() => {
									setBreathIn(0);
									setBreathOut(0);
									setPoints([]);
								}}
								className="px-3 py-2 border rounded"
							>
								Reset
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
