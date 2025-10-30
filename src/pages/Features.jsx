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
            Dive deeper into the powerful tools CareOn offers to help you
            understand and improve your breathing.
          </p>
        </div>
      </section>

      {/* Real-time Tracking */}
      <section
        className="py-20 px-4 md:px-10 bg-[var(--background-dark)]"
        id="real-time-tracking"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Real-time Tracking
            </h2>
            <p className="mt-6 text-lg text-white/70">
              See your breath in motion. Our advanced algorithm utilizes your
              phone&apos;s accelerometer and gyroscope to visualize your
              breathing patterns in real-time. This immediate feedback helps you
              connect with your body and understand your unique rhythm.
            </p>
            <ul className="mt-6 space-y-4 text-white/90">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">
                  check_circle
                </span>
                <span>Instant visual representation of your inhales and exhales.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">
                  check_circle
                </span>
                <span>Track your breaths per minute (BPM) and session duration.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">
                  check_circle
                </span>
                <span>Monitor the consistency and depth of your breathing.</span>
              </li>
            </ul>
          </div>
          <div className="flex items-center justify-center">
            <img
              alt="A visual representation of real-time breath tracking on a smartphone."
              className="rounded-lg shadow-2xl w-full max-w-sm"
              height={600}
              loading="lazy"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDYgLPonTkfbXmfg1QxyQJK9UFvNOMrXGQSkV1wt_bisX-XYwDHC4DTb6eVm3oEYAhkeFrTgST1jtAvg1q-kwKhRyWLw29LRbf7iqs5vLwDsVI-s5Q_PfUmpH4W5pp61j6tJHBP5YYKXRDNUk1rFRy13X7JcIOiHUjwPBzBkvxVu9gdpI06f2yBs6fz4uUV7Xj7YHqIbgo1xJhbFMZlRgoDIsbNefn1bmE_mH5JykU6p7OFPs3H1arDJ3GezjOeQsY84JHS7WhDx0"
              style={{ aspectRatio: "400 / 600", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* Personalized Insights */}
      <section
        className="py-20 px-4 md:px-10 bg-[var(--background-light)]"
        id="personalized-insights"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="flex items-center justify-center md:order-2">
            <img
              alt="A smartphone screen showing personalized breathing insights and progress charts."
              className="rounded-lg shadow-2xl w-full max-w-sm"
              height={600}
              loading="lazy"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCus0vovOPsuilnQ7zpW5wXrSo5exyobuUpFgNE9KT3F5etukbVi6PWMB6FLJqGaOTCyLgQLTlTkGfz-Pu2MkxDtRfNvUIqU0Hr1FyLfzLcWTCbwpr4j7gSakqRGaLaO3tTS7nFCM2UrwUV8NfaB2hzvPjDi-YgOSRN5SRYYaMEVZ9P7kFtFHpv7pgYAjx2FjdUXjR1thlCM5zf7wXcN56FQmEP0AH1PT7rmrsLb9MvmV8JmAxhE-5PDsndMSYbNw-efXeE91Ss4As"
              style={{ aspectRatio: "400 / 600", objectFit: "cover" }}
            />
          </div>
          <div className="text-[var(--text-primary)] md:order-1">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Personalized Insights
            </h2>
            <p className="mt-6 text-lg text-[var(--text-secondary)]">
              Go beyond the numbers. CareOn analyzes your tracked data to
              provide actionable insights and highlight trends over time.
              Understand how your breathing changes in different situations and
              receive tailored recommendations to foster healthier habits.
            </p>
            <ul className="mt-6 space-y-4 text-[var(--text-primary)]/90">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">
                  check_circle
                </span>
                <span>Daily, weekly, and monthly progress reports.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">
                  check_circle
                </span>
                <span>AI-powered suggestions for improvement.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">
                  check_circle
                </span>
                <span>Tag sessions to identify triggers for stress or relaxation.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Guided Breathing Exercises */}
      <section
        className="py-20 px-4 md:px-10 bg-[var(--background-dark)]"
        id="guided-exercises"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Guided Breathing Exercises
            </h2>
            <p className="mt-6 text-lg text-white/70">
              Whether you want to calm your mind, boost your energy, or prepare
              for sleep, our library of guided exercises can help. Follow along
              with audio and visual cues to practice proven breathing techniques
              designed by experts.
            </p>
            <ul className="mt-6 space-y-4 text-white/90">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">
                  check_circle
                </span>
                <span>Exercises for stress relief, focus, sleep, and more.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">
                  check_circle
                </span>
                <span>Customizable session lengths to fit your schedule.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">
                  check_circle
                </span>
                <span>Soothing soundscapes to enhance your practice.</span>
              </li>
            </ul>
          </div>
          <div className="flex items-center justify-center">
            <img
              alt="A serene image of a person meditating while using a smartphone with a guided breathing app."
              className="rounded-lg shadow-2xl w-full max-w-sm"
              height={600}
              loading="lazy"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbTQsaZOonKh26vbxK11S8TERHBxvi9LQXCSHJSFPEdgG1u-rMLxqA3t70fw6D2xW9jK01SPJrUbf2bSdz51u-wvkV1eq3IMAv_9b5xpq7nV3cv_C4rY6fYp5PqXKXAjZzSrKtsU6vJv99txvkHXGHmngPiHBR0mcCXs5VCxRaQjGYHOhbg3Wf2rmTGx10MjebzuBXom7MXDjuW4Gxgr3EK44gVRDcyOM7lyOW8hgvlsl-EwNEnQNz0Vr5u-D_6nChIEA6TSaieWs"
              style={{ aspectRatio: "400 / 600", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Features;
