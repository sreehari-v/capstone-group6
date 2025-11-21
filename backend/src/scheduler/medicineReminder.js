import cron from "node-cron";
import Medicine from "../models/Medicine.js";
import User from "../models/user.model.js";
import { sendMail } from "../utils/mailer.js";

// Runs every minute
cron.schedule("* * * * *", async () => {
  try {
    console.log("Checking medication reminders...");

    // Get all medicines + user details
    const medicines = await Medicine.find().populate("user", "name email");

    const now = new Date();
    const nowHHMM = now.toTimeString().slice(0, 5); // "HH:MM"

    for (const med of medicines) {
      const [hour, minute] = med.time.split(":").map(Number);

      // Calculate reminder time = medicine time - 1 hour
      const reminderDate = new Date();
      reminderDate.setHours(hour - 1, minute, 0, 0);

      const reminderHHMM = reminderDate.toTimeString().slice(0, 5);

      if (nowHHMM === reminderHHMM) {
        console.log(`📧 Sending reminder for medicine: ${med.name}`);

        const userName = med.user.name;
        const userEmail = med.user.email;

        await sendMail({
          to: userEmail,
          subject: `⏰ Medication Reminder for ${med.name}`,
          html: `
                    <h2>Hello ${userName},</h2>
                    <p>This is your reminder that your medication time is coming soon.</p>
                    <p><strong>Medicine:</strong> ${med.name}</p>
                    <p><strong>Dosage:</strong> ${med.dosage}</p>
                    <p><strong>Schedule:</strong> ${med.schedule}</p>
                    <p><strong>Medicine Time:</strong> ${med.time}</p>
                    <p><strong>Before Food:</strong> ${med.beforeFood ? "Yes" : "No"}</p>
                    <br />
                    <p>Please take your medication on time.</p>
                    <p>– CareOn Team</p>
                `,
        });
      }
    }
  } catch (error) {
    console.error("Reminder Cron Error:", error);
  }
});
