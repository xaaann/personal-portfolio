const express = require("express");
const router = express.Router();
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000; // Use Render's provided PORT

app.use(cors());
app.use(express.json());
app.use("/", router);

app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`));

// Ensure environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ Missing EMAIL_USER or EMAIL_PASS in environment variables.");
  process.exit(1); // Stop server if credentials are missing
}

const contactEmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Use environment variables
    pass: process.env.EMAIL_PASS
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.error("❌ Nodemailer verification failed:", error);
  } else {
    console.log("✅ Ready to Send Emails");
  }
});

router.post("/contact", (req, res) => {
  const { firstName, lastName, email, message, phone } = req.body;
  const name = `${firstName} ${lastName}`;

  if (!email || !message) {
    return res.status(400).json({ error: "Email and message are required." });
  }

  const mail = {
    from: name,
    to: process.env.EMAIL_USER, // Use environment variable
    subject: "📩 Contact Form Submission - Portfolio",
    html: `<p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Phone:</strong> ${phone || "N/A"}</p>
           <p><strong>Message:</strong> ${message}</p>`,
  };

  contactEmail.sendMail(mail, (error, info) => {
    if (error) {
      console.error("❌ Error sending email:", error);
      return res.status(500).json({ error: "Error sending email", details: error.message });
    } else {
      console.log(`✅ Email sent: ${info.response}`);
      return res.json({ code: 200, status: "Message Sent" });
    }
  });
});

