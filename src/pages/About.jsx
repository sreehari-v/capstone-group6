import React from "react";

const About = () => {
  return (
    <main className="flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-light dark:text-text-dark">
            About <span className="text-primary">CareOn</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-text-secondary-light dark:text-text-secondary-dark">
            Discover our story, our mission, and the team dedicated to
            improving your well-being through the power of breath.
          </p>
        </div>

        {/* Our Story */}
        <div className="mt-16 bg-card-light dark:bg-card-dark p-8 md:p-12 rounded-lg shadow-lg">
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
                Our Story
              </h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                CareOn was born from a simple idea: that everyone
                deserves to access the profound benefits of mindful breathing.
                Our founders, a team of health-tech innovators and wellness
                advocates, noticed a gap between ancient breathing wisdom and
                modern technology. We set out to create a tool that was not
                just powerful, but also intuitive and accessible, empowering
                individuals to take control of their mental and physical
                health, one breath at a time.
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mt-20">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-card-light dark:bg-card-dark p-8 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <span className="material-icons text-primary text-2xl">
                    <i className="fa-solid fa-trophy"></i>
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-text-light dark:text-text-dark">
                  Our Mission
                </h3>
              </div>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                To empower individuals to achieve a state of calm, focus, and
                well-being by providing accessible, science-backed tools for
                conscious breathwork. We believe in making mindfulness a
                simple, integrated part of daily life.
              </p>
            </div>

            <div className="bg-card-light dark:bg-card-dark p-8 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50">
                  <span className="material-icons text-green-500 text-2xl">
                    <i className="fa-solid fa-eye"></i>
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-text-light dark:text-text-dark">
                  Our Vision
                </h3>
              </div>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                To be the leading platform in digital respiratory wellness,
                fostering a global community that understands and harnesses
                the transformative power of the breath for a healthier,
                happier world.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">
            Meet Our Team
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary-light dark:text-text-secondary-dark">
            We are a passionate team of developers, designers, and health
            experts dedicated to your wellness journey.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Dr. Alisha Chen",
                role: "Chief Medical Officer",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAN7Zju-Xi_R_CS3zuFY390kb_Vp-tOBKL8IVKgjdQeCriKojK47wsskVlU_vW4tQltztPfBgTTVXZbzkjrO6nqEtpFCY_lGc4o8xTv5ARGQelbMltjZsnGfAmadPRg5skoB6ZwsKjozzlwB7DRQMNtEvQYZnOtuaSre-lTbD5NIyjZNDUQVHkXqptCQkzKnrSteMXGmeNCqwEZfPYFyRBOeq14Qxgf2cFZRpuk_CslKIcJXLCrNJwpVR6YjDTqmkV-nYTGnErz0fU",
              },
              {
                name: "Ben Carter",
                role: "Lead Software Engineer",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFX6Z5JadSzDeKdGPIYSrOuJTH0oNnAusyjnzOHEOWcbTUcmRBUF5w8koG9EWYCcSAGuQ-E1qCMwCJynHeBeB5i8NU5tS190X7A2v4ELzA7NRxs7Oelb2FSvPD_fhdKpfdba-ommZNFdQmI1sW60EYY-5SN5Iu7hbF83PboPkKnTpCZdGCqmjxiWWpm4nusl_r5G1oO-SpTPQoFjykpQD8XQOGcs_iKb8H2gBm_49sPyu34jluubTIET_Aede92h7TZnbHH2kT-pc",
              },
              {
                name: "Sofia Rodriguez",
                role: "Head of UX/UI Design",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGG22zmEtAKBr0M_51UtX2P8SBqmoIlu4un0IEROWw6ljH4u8wJfqAztPy664mDnheB2yyqHBz8qwndn6MXFXNLXEcJaWFmlPyTmQYGYWJPlKK1B7Zx_QowqcgLP4LC74h3TRUgqXpOYzUt-5LhTjx4FcJWENJeHBghXNY9Re61wqWhy8aCM3Vx2hinoM8av6aP7VcfuD3EfWl3J4c06eh1X5AZe3i1usO5iQQbKE-xf0NvfvhdG3nih9bMX4LGlnCT1vDKJG3epk",
              },
              {
                name: "Mike Iwinski",
                role: "Wellness Program Director",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCd7UHd4xvObjr-J0fZJPY8bC4DhrnkVuj9-SgBKf7Rc0rp8R52Tlh5v259rm9F0mxiw7s61fkj9Z8eEWWBQUZ4zPcRhnqJpLBVTEshKZ3UXkrerI8nkGMqmbWR8QjEsDUC0H1XYmFSXMSTKvtcto4AKhgWQFreR8HEES2o3qJc4GXEhCK4DIS4b_JK_WeIQYh9xrM-NB2IMslf5CcU94FXYVHsRxlbaNFmDelUQHotZHJQvXFIq-wDgm94sZa_vn_WsqwzKYN16eA",
              },
            ].map((member) => (
              <div key={member.name} className="text-center">
                <img
                  alt={`Team member ${member.name}`}
                  className="w-32 h-32 rounded-full mx-auto shadow-md"
                  src={member.img}
                />
                <h4 className="mt-4 text-lg font-semibold text-text-light dark:text-text-dark">
                  {member.name}
                </h4>
                <p className="text-primary">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Section */}
        <div className="mt-20 bg-card-light dark:bg-card-dark p-8 rounded-lg shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-4">
                Your Health, Your Data
              </h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                We are deeply committed to your well-being, and that includes
                protecting your privacy. Your trust is our most important
                asset.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50">
                    <span className="material-icons text-red-500 text-xl">
                      <i className="fa-regular fa-heart"></i>
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-text-light dark:text-text-dark">
                      Commitment to Health
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      Every feature is designed with your health as the top
                      priority, grounded in scientific research and
                      user-centric design.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                    <span className="material-icons text-yellow-500 text-xl">
                      <i className="fa-solid fa-lock"></i>
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-text-light dark:text-text-dark">
                      Data Privacy &amp; Security
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      We use state-of-the-art encryption to protect your data.
                      You are in full control, and we will never sell your
                      personal information.
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
      </div>
    </main>
  );
};

export default About;
