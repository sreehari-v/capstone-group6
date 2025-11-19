import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const amountButtons = [25, 50, 100, 250];

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(""); // Clear custom amount
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(value);
    setSelectedAmount(null); // Deselect preset amounts
  };

  const handleDonate = (e) => {
    e.preventDefault();

    const finalAmount = selectedAmount || parseInt(customAmount, 10) || 0;

    // CARD NUMBER VALIDATION 16 DIGITS
    if (!/^\d{16}$/.test(cardNumber)) {
      alert("Card number must be 16 digits");
      return;
    }

    // EXPIRY VALIDATION

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      alert("Expiry must be in MM/YY format");
      return;
    }

    // CVC VALIDATION 3 DIGITS
    if (!/^\d{3}$/.test(cvc)) {
      alert("CVC must be 3 digits");
      return;
    }

    console.log("Processing donation:", finalAmount);
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
      }}
    >
      <main className="flex-grow bg-gray-50 dark:bg-gray-900">
        {/* Header Section - Updated with the first image you requested */}
        <div className="relative">
          <div className="absolute inset-0">
            <img
              className="w-full h-full object-cover object-center"
              src="../src/assets/images/Donate.jpeg"
              alt="Together We Heal - Diverse group of people and healthcare professionals"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/1200x600/6366f1/ffffff?text=Together,+We+Heal";
              }}
            />
            <div className="absolute inset-0 bg-gray-900 bg-opacity-60 mix-blend-multiply" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-48 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">
              Together, We Heal
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-200 drop-shadow-md">
              Your Gift of Medicine Saves Lives.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {/* The Power of a Pill Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-4">
              The Power of a Pill
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-text-secondary-light dark:text-text-secondary-dark">
              Imagine facing illness without the vital medication you need. For
              millions, this is a daily reality. At{" "}
              <span className="text-primary font-semibold">CareOn</span>, we
              believe access to essential medicines is a fundamental human
              right.
            </p>
          </div>

          {/* What We Do Grid */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg text-center">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto">
                <span className="material-icons text-primary text-2xl">
                  <i className="fa-solid fa-pills"></i>
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-text-light dark:text-text-dark">
                Provide Life-Saving Medication
              </h3>
              <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                For acute illnesses and emergencies, your gift provides the
                cure.
              </p>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg text-center">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 mx-auto">
                <span className="material-icons text-green-500 text-2xl">
                  <i className="fa-solid fa-hand-holding-medical"></i>
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-text-light dark:text-text-dark">
                Support Chronic Conditions
              </h3>
              <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                Ensure consistent access to essential, ongoing prescriptions.
              </p>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg text-center">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mx-auto">
                <span className="material-icons text-red-500 text-2xl">
                  <i className="fa-solid fa-truck-medical"></i>
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-text-light dark:text-text-dark">
                Supply Medical Kits
              </h3>
              <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                Equip clinics in underserved communities and disaster zones.
              </p>
            </div>
          </div>

          {/* Children's Story Section - Updated content and image */}
          <div className="mt-20 bg-card-light dark:bg-card-dark p-8 md:p-12 rounded-lg shadow-lg">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-4">
                  A Child's Chance at a Healthy Future
                </h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                  For many children, a simple fever or infection can turn into a
                  life-threatening condition without access to basic medication.
                  Your generosity provides essential medicines, giving children
                  the chance to recover, grow, and thrive.
                </p>
                <p className="text-text-light dark:text-text-dark italic font-semibold">
                  "Every child deserves the chance to be healthy and happy."
                </p>
              </div>
              <div className="order-1 md:order-2">
                <img
                  alt="Happy children receiving care or playing"
                  className="rounded-lg shadow-md w-full h-auto object-cover"
                  src="../src/assets/images/Donate-2.jpeg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/600x400/94a3b8/ffffff?text=Children's+Health";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Donation Form Section */}
          <div className="mt-20">
            <div className="max-w-2xl mx-auto bg-card-light dark:bg-card-dark p-8 md:p-12 rounded-lg shadow-2xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-center text-text-light dark:text-text-dark mb-6">
                Make a Gift of Healing Today
              </h2>
              <form onSubmit={handleDonate}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {amountButtons.map((amount) => (
                    <button
                      type="button"
                      key={amount}
                      onClick={() => handleAmountClick(amount)}
                      className={`p-4 rounded-lg font-bold text-lg transition-all ${
                        selectedAmount === amount
                          ? "bg-primary text-white ring-2 ring-primary-dark"
                          : "bg-gray-100 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="customAmount"
                    className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2"
                  >
                    Or enter a custom amount:
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      $
                    </span>
                    <input
                      type="tel"
                      id="customAmount"
                      name="customAmount"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className="w-full pl-7 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text-light dark:text-text-dark focus:ring-primary focus:border-primary"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Payment Fields Placeholder */}
                <div className="space-y-4 mb-8">
                  <div>
                    <label
                      htmlFor="card-number"
                      className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark"
                    >
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="card-number"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={16}
                      className="mt-1 w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text-light dark:text-text-dark"
                      placeholder="**** **** **** 1234"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="expiry"
                        className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark"
                      >
                        Expiry
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        value={expiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, ""); // Only numbers

                          if (val.length >= 3) {
                            val = val.slice(0, 2) + "/" + val.slice(2, 4);
                          }

                          setExpiry(val.slice(0, 5)); // MM/YY max
                        }}
                        maxLength={5}
                        className="mt-1 w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text-light dark:text-text-dark"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cvc"
                        className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark"
                      >
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        value={cvc}
                        onChange={(e) =>
                          setCvc(e.target.value.replace(/\D/g, ""))
                        }
                        maxLength={3}
                        className="mt-1 w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text-light dark:text-text-dark"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  {/* <div className="text-red-500 text-center">
                    {import.meta.env.VITE_PAYPAL_CLIENT_ID
                      ? ""
                      : "PayPal Client ID"}
                  </div> */}
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      color: "blue",
                      label: "donate",
                    }}
                    createOrder={(data, actions) => {
                      const finalAmount =
                        selectedAmount || parseInt(customAmount, 10) || 0;

                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: { value: finalAmount.toString() },
                            description: "CareOn Donation",
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const details = await actions.order.capture();
                      alert("Donation Successful: " + details.id);
                    }}
                    onError={(err) => {
                      console.error("PayPal Error:", err);
                      alert("Payment failed");
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-lg text-xl shadow-lg transition-transform transform hover:scale-105"
                >
                  Donate Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </PayPalScriptProvider>
  );
};

export default Donate;
