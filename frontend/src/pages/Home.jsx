import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1">
      <section className="relative flex min-h-[100vh] w-full items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0 filter blur-md"
          src="/videos/home-bg-1.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />

        <div className="z-10 flex w-full max-w-6xl flex-col items-center gap-8 text-center py-20 px-4 pt-32 md:px-10">
          {/* Gradient glass card for hero text */}
          <div className="w-full rounded-2xl border border-white/20 bg-gradient-to-br from-black/25 via-white/0 to-black/15 dark:from-black/30 dark:via-black/20 dark:to-black/15 backdrop-blur-2xl p-8 md:p-12 shadow-2xl">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
                CareOn - Your personal health coach
              </h1>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-white/90">
                Short guided breathing exercises, real-time tracking, and gentle
                reminders to help you reduce stress, walk better, and stay
                focused - all for you, on your schedule.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="flex min-w-[160px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 px-6 text-base font-bold shadow-lg bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white hover:opacity-95"
                  >
                    <span className="truncate">Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="flex min-w-[160px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 px-6 text-base font-bold shadow-lg bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white hover:opacity-95"
                  >
                    <span className="truncate">Get Started</span>
                  </Link>
                )}

                <Link
                  to="/features"
                  className="flex min-w-[160px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 px-6 text-base font-bold backdrop-blur-sm bg-white/10 text-white border border-white/20 hover:bg-white/20"
                >
                  <span className="truncate">Learn More</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--background-light)] py-20 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
              Core features for you
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mt-4 max-w-3xl mx-auto">
              Practical, privacy-first tools that help you build a simple
              breathing habit and track personal progress.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[var(--text-primary)]">
            <div className="card flex flex-col items-center text-center gap-4 px-14 py-10 rounded-lg">
              <div className="w-20 h-20 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-5xl text-[var(--primary-color)]">
                  self_improvement
                </span>
              </div>
              <h3 className="text-xl font-bold">Guided Sessions</h3>
              <p className="text-[var(--text-secondary)]">
                Short, guided exercises you can do anywhere - with visual and
                subtle haptic cues to keep you on track.
              </p>
            </div>
            <div className="card flex flex-col items-center text-center gap-4 px-14 py-10 rounded-lg">
              <div className="w-20 h-20 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-5xl text-[var(--primary-color)]">
                  insights
                </span>
              </div>
              <h3 className="text-xl font-bold">Insights & Progress</h3>
              <p className="text-[var(--text-secondary)]">
                Personal progress charts, streaks, and gentle nudges to help you
                make breathing a healthy daily habit.
              </p>
            </div>
            <div className="card flex flex-col items-center text-center gap-4 px-14 py-10 rounded-lg">
              <div className="w-20 h-20 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-5xl text-[var(--primary-color)]">
                  lock
                </span>
              </div>
              <h3 className="text-xl font-bold">Privacy-first</h3>
              <p className="text-[var(--text-secondary)]">
                Your data stays private - by default it's stored on your device,
                and you decide what to share.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--background-dark)] py-20 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              How it helps you
            </h2>
            <p className="text-lg text-white/70 mt-4 max-w-3xl mx-auto">
              A simple routine to reduce stress, increase focus, and support
              better rest — designed for daily personal use.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 text-white">
            <div className="flex flex-col items-center text-center gap-4 max-w-sm">
              <div className="w-24 h-24 rounded-full bg-[#1e293b] flex items-center justify-center mb-4 border-2 border-[var(--primary-color)]">
                <span className="material-symbols-outlined text-4xl text-[var(--primary-color)]">
                  assessment
                </span>
              </div>
              <h3 className="text-xl font-bold">1. Start in minutes</h3>
              <p className="text-white/70">
                Quick onboarding and an easy first session to get you breathing
                with confidence.
              </p>
            </div>
            <div className="hidden md:block w-16 h-1 rotate-90 md:rotate-0 bg-[var(--primary-color)] opacity-50" />
            <div className="flex flex-col items-center text-center gap-4 max-w-sm">
              <div className="w-24 h-24 rounded-full bg-[#1e293b] flex items-center justify-center mb-4 border-2 border-[var(--primary-color)]">
                <span className="material-symbols-outlined text-4xl text-[var(--primary-color)]">
                  data_object
                </span>
              </div>
              <h3 className="text-xl font-bold">2. Track & reflect</h3>
              <p className="text-white/70">
                Personal metrics and gentle summaries help you notice trends and
                celebrate small wins.
              </p>
            </div>
            <div className="hidden md:block w-16 h-1 rotate-90 md:rotate-0 bg-[var(--primary-color)] opacity-50" />
            <div className="flex flex-col items-center text-center gap-4 max-w-sm">
              <div className="w-24 h-24 rounded-full bg-[#1e293b] flex items-center justify-center mb-4 border-2 border-[var(--primary-color)]">
                <span className="material-symbols-outlined text-4xl text-[var(--primary-color)]">
                  trending_up
                </span>
              </div>
              <h3 className="text-xl font-bold">3. Feel calmer</h3>
              <p className="text-white/70">
                Consistent practice supports reduced stress, clearer thinking,
                and steadier energy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--background-light)] py-20 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
              What users say
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mt-4 max-w-3xl mx-auto">
              Real feedback from people who used CareOn to build a simple
              breathing habit.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-[var(--text-primary)]">
            <div className="card flex flex-col gap-6 p-8 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[var(--background-dark)] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-[var(--primary-color)]">
                    person
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Asha</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Product Designer
                  </p>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                "Using the 5-minute sessions in the morning helped me start the
                day calmer and more focused. Simple and consistent — exactly
                what I needed."
              </p>
            </div>
            <div className="card flex flex-col gap-6 p-8 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[var(--background-dark)] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-[var(--primary-color)]">
                    person
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Daniel</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Software Engineer
                  </p>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                "I like the progress charts — they're motivating without being
                intrusive. The privacy-first approach matters to me."
              </p>
            </div>
            <div className="card flex flex-col gap-6 p-8 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[var(--background-dark)] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-[var(--primary-color)]">
                    person
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Maya</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Graduate Student
                  </p>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                "A short breathing routine before exams helped calm my nerves.
                It's become part of my daily routine."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
