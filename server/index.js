const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Datastore = require("nedb-promises");
const path = require("path");

const app = express();

// ✅ PORT for Render
const PORT = process.env.PORT || 5000;

// ================== MIDDLEWARE ==================
app.use(
  cors({
    origin: "*", // later restrict to Netlify URL
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(bodyParser.json({ limit: "50mb" }));

// ================== DATABASE ==================
const dataDir = path.join(__dirname, "data");

const studentsDB = Datastore.create({
  filename: path.join(dataDir, "students.db"),
  autoload: true,
});

const attendanceDB = Datastore.create({
  filename: path.join(dataDir, "attendance.db"),
  autoload: true,
});

// ================== OTP STORAGE ==================
const otpStore = new Map();

// ================== HELPERS ==================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function calculateDistance(descriptor1, descriptor2) {
  if (!descriptor1 || !descriptor2) return Infinity;
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  return Math.sqrt(sum);
}

// ================== HEALTH CHECK ==================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend running successfully",
  });
});

// ================== OTP ROUTES ==================
app.post("/api/otp/send", async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber || mobileNumber.length < 10) {
      return res.status(400).json({ error: "Invalid mobile number" });
    }

    const existingStudent = await studentsDB.findOne({ mobileNumber });
    if (existingStudent) {
      return res.status(400).json({
        error: "Mobile number already registered",
        duplicate: true,
        field: "mobile",
      });
    }

    const otp = generateOTP();

    otpStore.set(mobileNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.log(`📱 OTP for ${mobileNumber}: ${otp}`);

    res.json({
      message: "OTP sent successfully",
      demo_otp: otp,
    });
  } catch (err) {
    res.status(500).json({ error: "OTP send failed" });
  }
});

app.post("/api/otp/verify", async (req, res) => {
  const { mobileNumber, otp } = req.body;

  const stored = otpStore.get(mobileNumber);
  if (!stored) return res.status(400).json({ error: "OTP expired" });

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(mobileNumber);
    return res.status(400).json({ error: "OTP expired" });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  otpStore.delete(mobileNumber);
  res.json({ verified: true });
});

// ================== STUDENTS ==================
app.get("/api/students", async (req, res) => {
  const { email } = req.query;
  if (email) {
    const student = await studentsDB.findOne({ email });
    if (!student) return res.status(404).json({ error: "Not found" });
    return res.json(student);
  }
  res.json(await studentsDB.find({}));
});

app.post("/api/students", async (req, res) => {
  try {
    const studentData = req.body;

    if (!studentData.firstName || !studentData.photo) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Mobile
    if (studentData.mobileNumber) {
      const s = await studentsDB.findOne({
        mobileNumber: studentData.mobileNumber,
      });
      if (s) return res.status(400).json({ error: "Mobile duplicate" });
    }

    // Roll
    if (studentData.rollNo) {
      const s = await studentsDB.findOne({ rollNo: studentData.rollNo });
      if (s) return res.status(400).json({ error: "Roll duplicate" });
    }

    // Email
    if (studentData.email) {
      const s = await studentsDB.findOne({ email: studentData.email });
      if (s) return res.status(400).json({ error: "Email duplicate" });
    }

    // Face duplicate
    if (studentData.descriptor) {
      const all = await studentsDB.find({});
      for (const s of all) {
        if (s.descriptor) {
          const d = calculateDistance(
            studentData.descriptor,
            s.descriptor
          );
          if (d < 0.6) {
            return res.status(400).json({
              error: "Face already registered",
              similarity: Math.round((1 - d) * 100) + "%",
            });
          }
        }
      }
    }

    const doc = await studentsDB.insert({
      ...studentData,
      createdAt: new Date(),
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// ================== ATTENDANCE ==================
app.post("/api/attendance", async (req, res) => {
  const { studentId, status, confidence } = req.body;
  const date = new Date().toLocaleDateString();

  const exists = await attendanceDB.findOne({ studentId, date });
  if (exists) return res.json({ message: "Already marked" });

  const record = await attendanceDB.insert({
    studentId,
    date,
    status: status || "Present",
    confidence,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json(record);
});

app.get("/api/attendance", async (req, res) => {
  const date = req.query.date || new Date().toLocaleDateString();
  res.json(await attendanceDB.find({ date }));
});

// ================== DELETE ==================
app.delete("/api/students/:id", async (req, res) => {
  await studentsDB.remove({ _id: req.params.id });
  res.json({ message: "Deleted" });
});

// ================== START ==================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
