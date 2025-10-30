import React from "react";

const Features = () => {
  return (
    <main className="flex-1 pt-24">
      {/* Intro */}
      <section className="py-20 px-4 md:px-10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[var(--text-primary)]">
            Explore Our Features
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-[var(--text-secondary)]">
            Discover how CareOn helps you maintain a healthier lifestyle with intelligent tracking and personalized insights.
          </p>
        </div>
      </section>

      {/* Breath Tracking */}
      <section
        className="py-20 px-4 md:px-10 bg-[var(--background-dark)]"
        id="breath-tracking"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Breath Tracking
            </h2>
            <p className="mt-6 text-lg text-white/70">
              Connect with your breathing patterns in real-time. CareOn uses your phone’s built-in sensors to track and visualize your breath, helping you understand and improve your respiratory health.
            </p>
            <ul className="mt-6 space-y-4 text-white/90">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">check_circle</span>
                <span>Visualize your inhale and exhale rhythm live.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">check_circle</span>
                <span>Monitor your average breaths per minute (BPM).</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">check_circle</span>
                <span>Detect irregular patterns and receive breathing tips.</span>
              </li>
            </ul>
          </div>
          <div className="flex items-center justify-center">
            <img
              alt="Visualization of breath tracking on a smartphone."
              className="rounded-lg shadow-2xl w-full max-w-sm"
              height={600}
              loading="lazy"
              src="/src/assets/images/breath-smartphone.png"
              style={{ aspectRatio: "400 / 600", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* Step Tracking */}
      <section
        className="py-20 px-4 md:px-10 bg-[var(--background-light)]"
        id="step-tracking"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="flex items-center justify-center md:order-2">
            <img
              alt="A smartphone showing step tracking and daily goal progress."
              className="rounded-lg shadow-2xl w-full max-w-sm"
              height={600}
              loading="lazy"
              src="/src/assets/images/step-smartphone.png"
              style={{ aspectRatio: "400 / 600", objectFit: "cover" }}
            />
          </div>
          <div className="text-[var(--text-primary)] md:order-1">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Step Tracking
            </h2>
            <p className="mt-6 text-lg text-[var(--text-secondary)]">
              Stay active and motivated with CareOn’s step tracking feature. Track your daily steps, distance covered, and calories burned — all automatically synced with your phone’s motion sensors.
            </p>
            <ul className="mt-6 space-y-4 text-[var(--text-primary)]/90">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">check_circle</span>
                <span>Real-time step count and distance measurement.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">check_circle</span>
                <span>Set personalized daily goals and streak reminders.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">check_circle</span>
                <span>Visual progress charts to keep you motivated.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Medication Reminder */}
      <section
        className="py-20 px-4 md:px-10 bg-[var(--background-dark)]"
        id="medication-reminder"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Medication Reminder
            </h2>
            <p className="mt-6 text-lg text-white/70">
              Never miss a dose again. CareOn’s smart medication reminder ensures you take your prescriptions on time by sending personalized notifications and tracking your adherence.
            </p>
            <ul className="mt-6 space-y-4 text-white/90">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">check_circle</span>
                <span>Custom reminders for each medication and dosage time.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">check_circle</span>
                <span>Track missed and completed doses easily.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">check_circle</span>
                <span>Sync reminders with your daily health routine.</span>
              </li>
            </ul>
          </div>
          <div className="flex items-center justify-center">
            <img
              alt="A smartphone showing medication reminders and schedule notifications."
              className="rounded-lg shadow-2xl w-full max-w-sm"
              height={600}
              loading="lazy"
              src="/src/assets/images/medication-smartphone.png"
              style={{ aspectRatio: "400 / 600", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>
    </main>
  );
};
export default Features;