import React, { useState } from "react";

const Science = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "How does the breath tracking work?",
      answer:
        "Our app uses advanced algorithms that analyze data from your phone's microphone and accelerometer to detect subtle movements and sounds associated with your breathing. This allows us to accurately measure your respiratory rate, depth, and rhythm without needing any special hardware.",
    },
    {
      question: "Is my data private and secure?",
      answer:
        "Absolutely. We take your privacy very seriously. All your personal health data is encrypted both in transit and at rest. We adhere to strict privacy policies and will never share your identifiable data with third parties without your explicit consent. You have full control over your information.",
    },
    {
      question: "What are the main benefits of using CareOn?",
      answer:
        "Regular use of CareOn can lead to reduced stress and anxiety, improved focus, lower blood pressure, better sleep, and increased self-awareness. Our guided exercises are based on clinically-proven techniques like diaphragmatic and resonance frequency breathing.",
    },
    {
      question: "Do I need any special equipment?",
      answer:
        "No, you don't need any special equipment to get started with CareOn. Our core breath tracking and guided exercises work with just your smartphone. For enhanced features like step tracking, you can optionally connect to popular fitness trackers you may already own.",
    },
  ];

  return (
    <>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-text-light dark:text-text-dark">
              The Science Behind{" "}
              <span className="text-primary">CareOn</span>
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-text-secondary-light dark:text-text-secondary-dark">
              Understand the technology and research that powers our platform,
              helping you achieve a state of calm and well-being.
            </p>
          </div>

          {/* Cards Section */}
          <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "fa-solid fa-wind",
                title: "Advanced Breath Tracking",
                desc: "Our proprietary sensor technology and algorithms precisely monitor your breathing patterns, capturing key metrics like respiratory rate, inhalation/exhalation ratio, and breath depth to provide real-time, actionable feedback.",
                color: "blue",
              },
              {
                icon: "fa-solid fa-microscope",
                title: "Benefits of Conscious Breathing",
                desc: "Scientific studies have shown that controlled breathing techniques can reduce stress, lower blood pressure, improve focus, and enhance overall mental and physical health. CareOn guides you through these evidence-based exercises.",
                color: "green",
              },
              {
                icon: "fa-solid fa-chart-column",
                title: "Personalized Data Insights",
                desc: "We transform raw data into easy-to-understand visualizations and reports. Track your progress over time, identify patterns, and see the tangible impact of your practice on your well-being metrics.",
                color: "purple",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-card-light dark:bg-card-dark p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div
                  className={`flex items-center justify-center h-16 w-16 rounded-full bg-${card.color}-100 dark:bg-${card.color}-900/50 mb-6`}
                >
                  <span
                    className={`material-icons text-${card.color}-500 text-3xl`}
                  >
                    <i className={card.icon}></i>
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">
                  {card.title}
                </h3>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Holistic Health Tracking */}
          <div className="mt-20 bg-card-light dark:bg-card-dark p-8 rounded-lg shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-4">
                  Holistic Health Tracking
                </h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                  Breathing is just one piece of the wellness puzzle.
                  CareOn integrates medication and step tracking to
                  give you a complete picture of your health, helping you and
                  your doctor make more informed decisions.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50">
                      <span className="material-icons text-red-500 text-xl">
                        <i className="fa-solid fa-kit-medical"></i>
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-text-light dark:text-text-dark">
                        Medication Log
                      </h4>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Effortlessly track your medication schedule and
                        adherence. See correlations between your medication
                        intake and your breathing patterns.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                      <span className="material-icons text-yellow-500 text-xl">
                        <i className="fa-solid fa-heart"></i>
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-text-light dark:text-text-dark">
                        Step Count Integration
                      </h4>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Sync with your favorite fitness tracker to monitor your
                        daily activity levels alongside your respiratory data
                        for a comprehensive view.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 md:mt-0">
                <img
                  alt="Dashboard showing integrated health data"
                  className="rounded-lg shadow-md"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEreW3yBRw16YwXlAkjEQz8qamoNTPWXxH7RTJiNvlDcU5F3C-BewFYIqoCEcQ--MREEt4_aZTWsT3edoyY7Cf41YESDVsX-3GBo4aqQHV5Xcec3wiQR6O9Wluv8Eg-EjoXhg_XXafbgIvHI784YUCENZ1eIqS3Ibs4S34I_SD93cg8xNjg4ihKy_zM_Sh3zlmZaTmYdL4RWeNE_UWVIHAkF_BPXjKb-12yptPOlGd16bWq_-lUBFzaXvQabuY7_c7JwbPMdhUfb8"
                />
              </div>
            </div>
          </div>

          {/* Training and Improvement */}
          <div className="mt-20 bg-card-light dark:bg-card-dark p-8 md:p-12 rounded-lg shadow-lg">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <img
                  alt="User practicing breathing exercises with the app"
                  className="rounded-lg shadow-md"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuACt6WKl38XYipLMF3_Ap98Df6izClJDLzaBk_LWyAcKKw1IUKEoBbcb5RI_LAXKwdQIPt53fMn8ElKm5y4C5-Oe3yZbSWQS2KUeScBOVt6TY1Lvd_q-EQG_LgbWusLUZY2Ccp-k9p2JElddam4GU1lhCi3ijRwyCx3fguFq6Fv2bMYZ2spuGEF9pGPCB-NSLnnG0K_f3ZaWGITc67huuMHt-xalneokFZGQ7LD1aq2b9RAn5RKURIgsfTKoficxIln671rAoxPu8g"
                />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-4">
                  Training and Improvement
                </h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                  CareOn is more than just a tracker, it's your
                  personal coach for better breathing. Our app provides guided
                  exercises and progressive training plans to help you master
                  your breath.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50">
                      <span className="material-icons text-primary text-xl">
                        <i className="fa-solid fa-dumbbell"></i>
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-text-light dark:text-text-dark">
                        Guided Sessions
                      </h4>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Follow along with a variety of guided breathing
                        exercises designed for different goals, from stress
                        reduction to improved athletic performance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50">
                      <span className="material-icons text-green-500 text-xl">
                        <i className="fa-solid fa-bars-progress"></i>
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-text-light dark:text-text-dark">
                        Progressive Levels
                      </h4>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        As you improve, the app challenges you with more
                        advanced techniques, ensuring you're always making
                        progress on your journey to better breathing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary-light dark:text-text-secondary-dark">
                Have questions? We've got answers. Here are some of the most
                common queries we receive.
              </p>
            </div>

            <div className="mt-12 max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md"
                >
                  <button
                    onClick={() => toggleFAQ(i)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">
                      {faq.question}
                    </h3>
                    <i className="fa-solid fa-chevron-down"></i>
                  </button>

                  {openFAQ === i && (
                    <div className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Science;
