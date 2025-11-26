import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main className="flex-1">
      <section className="relative flex min-h-[600px] w-full items-center justify-center py-20 px-4 pt-32 md:px-10">
        <div className="z-10 flex w-full max-w-6xl flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-[var(--text-primary)]">
            Optimize Your Team's Performance Through Mindful Breathing
          </h1>
          <p className="max-w-3xl text-lg text-[var(--text-secondary)]">
            Care on provides organizations with advanced tools to monitor
            employee well-being, reduce stress, and enhance focus through
            data-driven insights and personalized breathing programs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="flex min-w-[160px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 px-6 button-primary text-base font-bold shadow-lg"
            >
              <span className="truncate">Get Started</span>
            </Link>

            <Link
              to="/features"
              className="flex min-w-[160px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 px-6 button-secondary text-base font-bold backdrop-blur-sm"
            >
              <span className="truncate">Learn More</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex min-w-[160px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 px-6 button-secondary text-base font-bold backdrop-blur-sm"
            >
              <span className="truncate">Dashboard (Test)</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--background-light)] py-20 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
              Key Features for Professionals
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mt-4 max-w-3xl mx-auto">
              Equip your workforce with tools designed for efficiency, clarity,
              and sustained productivity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[var(--text-primary)]">
            <div className="card flex flex-col items-center text-center gap-4 p-8 rounded-lg">
              <span className="material-symbols-outlined text-5xl text-[var(--primary-color)]">
                bar_chart
              </span>
              <h3 className="text-xl font-bold">Advanced Analytics</h3>
              <p className="text-[var(--text-secondary)]">
                Gain deep insights into individual and team breathing patterns
                with detailed, exportable reports.
              </p>
            </div>
            <div className="card flex flex-col items-center text-center gap-4 p-8 rounded-lg">
              <span className="material-symbols-outlined text-5xl text-[var(--primary-color)]">
                integration_instructions
              </span>
              <h3 className="text-xl font-bold">Seamless Integration</h3>
              <p className="text-[var(--text-secondary)]">
                Integrate Care on with your existing HR and wellness platforms
                effortlessly.
              </p>
            </div>
            <div className="card flex flex-col items-center text-center gap-4 p-8 rounded-lg">
              <span className="material-symbols-outlined text-5xl text-[var(--primary-color)]">
                security
              </span>
              <h3 className="text-xl font-bold">Data Security & Privacy</h3>
              <p className="text-[var(--text-secondary)]">
                Your data is protected with enterprise-grade security and strict
                privacy protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--background-dark)] py-20 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              How It Enhances Your Organization
            </h2>
            <p className="text-lg text-white/70 mt-4 max-w-3xl mx-auto">
              A streamlined approach to employee well-being and performance
              optimization.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 text-white">
            <div className="flex flex-col items-center text-center gap-4 max-w-sm">
              <div className="w-24 h-24 rounded-full bg-[#1e293b] flex items-center justify-center mb-4 border-2 border-[var(--primary-color)]">
                <span className="material-symbols-outlined text-4xl text-[var(--primary-color)]">
                  assessment
                </span>
              </div>
              <h3 className="text-xl font-bold">1. Assessment & Setup</h3>
              <p className="text-white/70">
                Deploy Care on to your team and configure relevant tracking
                parameters.
              </p>
            </div>
            <div className="hidden md:block w-16 h-1 rotate-90 md:rotate-0 bg-[var(--primary-color)] opacity-50" />
            <div className="flex flex-col items-center text-center gap-4 max-w-sm">
              <div className="w-24 h-24 rounded-full bg-[#1e293b] flex items-center justify-center mb-4 border-2 border-[var(--primary-color)]">
                <span className="material-symbols-outlined text-4xl text-[var(--primary-color)]">
                  data_object
                </span>
              </div>
              <h3 className="text-xl font-bold">2. Data Collection & Analysis</h3>
              <p className="text-white/70">
                The platform securely collects and analyzes breathing data for
                actionable insights.
              </p>
            </div>
            <div className="hidden md:block w-16 h-1 rotate-90 md:rotate-0 bg-[var(--primary-color)] opacity-50" />
            <div className="flex flex-col items-center text-center gap-4 max-w-sm">
              <div className="w-24 h-24 rounded-full bg-[#1e293b] flex items-center justify-center mb-4 border-2 border-[var(--primary-color)]">
                <span className="material-symbols-outlined text-4xl text-[var(--primary-color)]">
                  trending_up
                </span>
              </div>
              <h3 className="text-xl font-bold">3. Performance Improvement</h3>
              <p className="text-white/70">
                Implement tailored interventions and track improvements in
                employee well-being and productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--background-light)] py-20 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
              Trusted by Leading Organizations
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mt-4 max-w-3xl mx-auto">
              See how forward-thinking companies are leveraging Care on.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-[var(--text-primary)]">
            <div className="card flex flex-col gap-6 p-8 rounded-lg">
              <div className="flex items-center gap-4">
                <img alt="Company logo placeholder" className="h-10 w-auto" src="[IMAGE_PLACEHOLDER_3]" />
                <div>
                  <h3 className="text-lg font-bold">Innovatech Solutions</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Tech & Development</p>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                "Implementing Care on led to a noticeable decrease in reported
                stress levels and a rise in overall team engagement. The
                analytics are invaluable for strategic HR planning."
              </p>
            </div>
            <div className="card flex flex-col gap-6 p-8 rounded-lg">
              <div className="flex items-center gap-4">
                <img alt="Company logo placeholder" className="h-10 w-auto" src="[IMAGE_PLACEHOLDER_4]" />
                <div>
                  <h3 className="text-lg font-bold">Global Finance Group</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Financial Services</p>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                "In a high-pressure environment, Care on has become an essential
                tool. It helps our employees manage stress effectively, leading
                to improved focus and decision-making."
              </p>
            </div>
            <div className="card flex flex-col gap-6 p-8 rounded-lg">
              <div className="flex items-center gap-4">
                <img alt="Company logo placeholder" className="h-10 w-auto" src="[IMAGE_PLACEHOLDER_5]" />
                <div>
                  <h3 className="text-lg font-bold">HealthForward</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Healthcare Provider</p>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                "We integrated Care on as part of our corporate wellness
                initiative. The positive impact on employee mental health and
                productivity has exceeded our expectations."
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
