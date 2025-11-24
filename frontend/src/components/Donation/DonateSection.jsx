import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import jsPDF from "jspdf";
import "./DonateSection.css";

const DonateSection = () => {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");

  const amounts = [25, 50, 100, 250];

  const handlePreset = (amt) => {
    setSelectedAmount(amt);
    setCustomAmount("");
  };

  const handleCustom = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    setSelectedAmount(null);
  };

  const donationAmount = selectedAmount || Number(customAmount) || 0;

  // Generate PDF Receipt
  const generatePDF = (details) => {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("CareOn Donation Receipt", 20, 20);

    pdf.setFontSize(12);
    pdf.text(`Date: ${new Date().toLocaleString()}`, 20, 40);
    pdf.text(`Donor Email: ${details.payer.email_address}`, 20, 50);
    pdf.text(`Amount Donated: $${details.purchase_units[0].amount.value}`, 20, 60);
    pdf.text(`Transaction ID: ${details.id}`, 20, 70);

    pdf.text("Thank you for your generous contribution to CareOn!", 20, 90);

    pdf.save("Donation_Receipt.pdf");
  };

  return (
    <div className="donate-wrapper">
      <h2 className="donate-title">Make a Gift of Healing Today</h2>

      {/* Preset Amount Buttons */}
      <div className="donate-grid">
        {amounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => handlePreset(amt)}
            className={`donate-amount-btn ${selectedAmount === amt ? "active" : ""}`}
          >
            ${amt}
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="donate-custom">
        <label>Or enter a custom amount:</label>
        <div className="donate-custom-input">
          <span>$</span>
          <input
            type="text"
            value={customAmount}
            onChange={handleCustom}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* PayPal Section */}
      <div className="mt-8">
        <PayPalScriptProvider
          options={{
            "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
          }}
        >
          <PayPalButtons
            style={{ layout: "vertical", color: "blue", shape: "rect", label: "donate" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: donationAmount.toString(),
                    },
                    description: "CareOn Donation",
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              const details = await actions.order.capture();

              // Save donation in backend
              await fetch("http://localhost:5000/api/donations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  amount: details.purchase_units[0].amount.value,
                  orderId: details.id,
                  captureId: details.purchase_units[0].payments.captures[0].id,
                  payerEmail: details.payer.email_address,
                  status: details.status,
                }),
              });

              // Generate PDF
              generatePDF(details);

              alert("🎉 Donation Successful! Receipt downloaded.");
            }}
            onError={(err) => {
              console.error("PayPal Error:", err);
              alert("Something went wrong with your donation.");
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
};

export default DonateSection;
