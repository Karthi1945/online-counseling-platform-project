import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { createServer as createViteServer } from "vite";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "counselor_data.json");

// Initial seed data
const defaultCounselors = [
  {
    id: "sarah_jenkins",
    name: "Dr. Sarah Jenkins",
    role: "Licensed Clinical Psychologist",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    serviceType: "Mental Health",
    bio: "Empowering individuals to overcome anxiety, depression, and life transitions using Cognitive Behavioral Therapy (CBT) and Mindfulness. With over 10 years of clinical experience, Sarah provides a warm, safe, and collaborative space for healing.",
    rating: 4.9,
    price: 125,
    specialties: ["CBT", "Anxiety Disorder", "Depression Support", "Mindfulness-Based Therapy"],
    availability: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"],
    reviewsCount: 48
  },
  {
    id: "michael_carter",
    name: "Michael Carter, LMFT",
    role: "Marriage & Family Therapist",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    serviceType: "Relationship Advice",
    bio: "Dedicated to helping couples rebuild emotional connection, improve communication, and resolve deep-seated conflicts. Michael helps families establish healthy patterns, recover from intimacy issues, and cultivate long-term closeness.",
    rating: 4.8,
    price: 115,
    specialties: ["Couples Counseling", "Conflict Resolution", "Family Systems", "Pre-marital Therapy"],
    availability: ["10:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"],
    reviewsCount: 36
  },
  {
    id: "elena_rostova",
    name: "Elena Rostova, M.S.",
    role: "Career Counselor & Burnout Specialist",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
    serviceType: "Career Counseling",
    bio: "Helping modern professionals navigate complex career transitions, overcome chronic workplace burnout, and discover fulfilling life alignments. Elena fuses personal development coaching with concrete career-growth strategy.",
    rating: 4.7,
    price: 95,
    specialties: ["Career Transitions", "Burnout Prevention", "Leadership Strategy", "Resume & Interview Coaching"],
    availability: ["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"],
    reviewsCount: 22
  },
  {
    id: "david_park",
    name: "David Park, LCSW",
    role: "Integrative Wellness Therapist",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
    serviceType: "Mental Health",
    bio: "Taking an integrative, holistic approach that addresses the mind, body, and emotional balance. David specializes in stress management techniques, addiction recovery coaching, and cultivating emotional resilience.",
    rating: 4.9,
    price: 110,
    specialties: ["Stress Management", "Addiction Recovery", "Emotion-Focused Therapy", "Holistic Wellness"],
    availability: ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"],
    reviewsCount: 51
  }
];

const defaultAppointments = [
  {
    id: "apt_1",
    clientId: "default_client",
    clientName: "Alex Mercer",
    clientEmail: "alex.mercer@gmail.com",
    counselorId: "sarah_jenkins",
    counselorName: "Dr. Sarah Jenkins",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    time: "11:00 AM",
    serviceType: "Mental Health",
    status: "upcoming",
    price: 125,
    paymentId: "pay_txn_1",
    notes: "I've been feeling increased workflow anxiety recently."
  },
  {
    id: "apt_2",
    clientId: "default_client",
    clientName: "Alex Mercer",
    clientEmail: "alex.mercer@gmail.com",
    counselorId: "elena_rostova",
    counselorName: "Elena Rostova, M.S.",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0], // 2 days ago
    time: "02:00 PM",
    serviceType: "Career Counseling",
    status: "completed",
    price: 95,
    paymentId: "pay_txn_2",
    notes: "Initial consultation for career change goals."
  }
];

const defaultSessionNotes = [
  {
    id: "note_1",
    appointmentId: "apt_2",
    clientId: "default_client",
    clientName: "Alex Mercer",
    counselorId: "elena_rostova",
    counselorName: "Elena Rostova, M.S.",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    notes: "Alex is looking to transition from Software Support to Frontend Engineering. We identified several key skill gaps, and drew up a 3-month action plan. Alex has struggles with self-doubt but has shown substantial initiative.",
    attachments: [
      { name: "Frontend_Career_Roadmap.pdf", size: "245 KB", url: "#" }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

const defaultMessages = [
  {
    id: "msg_1",
    senderId: "sarah_jenkins",
    senderName: "Dr. Sarah Jenkins",
    senderRole: "counselor",
    recipientId: "default_client",
    text: "Hello Alex, I look forward to our session tomorrow at 11:00 AM. Let me know if you would like me to prepare any specific resources on anxiety management.",
    timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    id: "msg_2",
    senderId: "default_client",
    senderName: "Alex Mercer",
    senderRole: "client",
    recipientId: "sarah_jenkins",
    text: "Thank you Dr. Sarah! Yes, some calming exercises for when workload gets high would be fantastic.",
    timestamp: new Date(Date.now() - 1800000).toISOString() // 30 mins ago
  }
];

const defaultEmails = [
  {
    id: "em_1",
    senderName: "Dr. Sarah Jenkins",
    senderEmail: "sarah.jenkins@counselsync.health",
    recipientName: "Alex Mercer",
    recipientEmail: "alex.mercer@gmail.com",
    subject: "Intake forms & Prep for our first session",
    body: "Hi Alex,\n\nWelcome to our network! I have reviewed your booking details and look forward to meeting you. Before our call, please write down 2-3 focus points you are most hoping to address. Feel free to use the client dashboard panel if you have any questions.\n\nWarm regards,\nDr. Sarah Jenkins",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    counselorId: "sarah_jenkins"
  }
];

const defaultTransactions = [
  {
    id: "pay_txn_1",
    appointmentId: "apt_1",
    clientName: "Alex Mercer",
    amount: 125,
    cardLast4: "4242",
    status: "success",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "pay_txn_2",
    appointmentId: "apt_2",
    clientName: "Alex Mercer",
    amount: 95,
    cardLast4: "1881",
    status: "success",
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Helper to load/save database
function loadDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading database file, using defaults:", err);
  }
  const defaultDb = {
    counselors: defaultCounselors,
    appointments: defaultAppointments,
    sessionNotes: defaultSessionNotes,
    messages: defaultMessages,
    emails: defaultEmails,
    transactions: defaultTransactions
  };
  saveDb(defaultDb);
  return defaultDb;
}

function saveDb(db) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}

// REST API Endpoints

// GET all counselors
app.get("/api/counselors", (req, res) => {
  const db = loadDb();
  res.json(db.counselors);
});

// Update counselor profiles
app.put("/api/counselors/:id", (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const db = loadDb();
  const index = db.counselors.findIndex((c) => c.id === id);
  if (index !== -1) {
    db.counselors[index] = { ...db.counselors[index], ...updatedData };
    saveDb(db);
    res.json(db.counselors[index]);
  } else {
    res.status(404).json({ error: "Counselor not found" });
  }
});

// GET all appointments
app.get("/api/appointments", (req, res) => {
  const db = loadDb();
  res.json(db.appointments);
});

// Create appointment + auto payment transaction
app.post("/api/appointments", (req, res) => {
  const {
    counselorId,
    counselorName,
    clientName,
    clientEmail,
    date,
    time,
    serviceType,
    price,
    notes,
    cardName,
    cardNumber,
    cardExpiry,
    cardCvv
  } = req.body;

  if (!counselorId || !clientName || !clientEmail || !date || !time || !serviceType || !price) {
    res.status(400).json({ error: "Missing required booking details" });
    return;
  }

  const db = loadDb();
  const appointmentId = "apt_" + Math.random().toString(36).substr(2, 9);
  const paymentId = "pay_txn_" + Math.random().toString(36).substr(2, 9);

  // Check card simulation (any valid layout)
  const cardLast4 = cardNumber ? cardNumber.slice(-4) : "1234";

  const newAppointment = {
    id: appointmentId,
    clientId: "default_client", // demo behaves as same client simple session
    clientName,
    clientEmail,
    counselorId,
    counselorName,
    date,
    time,
    serviceType,
    status: "upcoming",
    price,
    paymentId,
    notes: notes || ""
  };

  const newTransaction = {
    id: paymentId,
    appointmentId,
    clientName,
    amount: price,
    cardLast4,
    status: "success",
    createdAt: new Date().toISOString()
  };

  db.appointments.push(newAppointment);
  db.transactions.push(newTransaction);

  // Send an automatic intake confirmation email (simulated)
  const autoEmail = {
    id: "em_" + Math.random().toString(36).substr(2, 9),
    senderName: counselorName,
    senderEmail: `${counselorId.replace("_", ".")}@counselsync.health`,
    recipientName: clientName,
    recipientEmail: clientEmail,
    subject: `Intake Confirmation: Your session on ${date} at ${time}`,
    body: `Hi ${clientName},\n\nYour session has been successfully booked with ${counselorName} for ${serviceType}.\n\nDate: ${date}\nTime: ${time}\nAmount Paid: $${price}\n\nYou can access real-time chat with me on the Counselor and Client Platform, and join our secure video session at the scheduled hour.\n\nWarm regards,\n${counselorName}`,
    date: new Date().toISOString().split("T")[0],
    counselorId
  };
  db.emails.push(autoEmail);

  saveDb(db);
  res.status(201).json({ appointment: newAppointment, transaction: newTransaction });
});

// Update appointment status
app.patch("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const db = loadDb();
  const index = db.appointments.findIndex((a) => a.id === id);
  if (index !== -1) {
    if (status) db.appointments[index].status = status;
    if (notes !== undefined) db.appointments[index].notes = notes;
    saveDb(db);
    res.json(db.appointments[index]);
  } else {
    res.status(404).json({ error: "Appointment not found" });
  }
});

// GET custom notes
app.get("/api/notes", (req, res) => {
  const db = loadDb();
  res.json(db.sessionNotes);
});

// Create note
app.post("/api/notes", (req, res) => {
  const { appointmentId, clientId, clientName, counselorId, counselorName, date, notes, attachments } = req.body;
  if (!notes) {
    res.status(400).json({ error: "Please provide clinical notes text" });
    return;
  }

  const db = loadDb();
  const newNote = {
    id: "note_" + Math.random().toString(36).substr(2, 9),
    appointmentId: appointmentId || "independent_session",
    clientId: clientId || "default_client",
    clientName: clientName || "Anonymous Client",
    counselorId,
    counselorName,
    date: date || new Date().toISOString().split("T")[0],
    notes,
    attachments: attachments || [],
    createdAt: new Date().toISOString()
  };

  db.sessionNotes.push(newNote);

  // If this belongs to an appointment, mark it completed
  if (appointmentId) {
    const aptIdx = db.appointments.findIndex(a => a.id === appointmentId);
    if (aptIdx !== -1) {
      db.appointments[aptIdx].status = "completed";
    }
  }

  saveDb(db);
  res.status(201).json(newNote);
});

// GET chat messages
app.get("/api/messages", (req, res) => {
  const db = loadDb();
  res.json(db.messages);
});

// POST message
app.post("/api/messages", (req, res) => {
  const { senderId, senderName, senderRole, recipientId, text, attachmentName } = req.body;
  if (!text && !attachmentName) {
    res.status(400).json({ error: "Message must contain text or attachments" });
    return;
  }

  const db = loadDb();
  const newMessage = {
    id: "msg_" + Math.random().toString(36).substr(2, 9),
    senderId,
    senderName,
    senderRole,
    recipientId,
    text: text || "",
    timestamp: new Date().toISOString(),
    attachmentName
  };

  db.messages.push(newMessage);
  saveDb(db);
  res.status(201).json(newMessage);
});

// GET emails
app.get("/api/emails", (req, res) => {
  const db = loadDb();
  res.json(db.emails);
});

// POST email
app.post("/api/emails", (req, res) => {
  const { senderName, senderEmail, recipientName, recipientEmail, subject, body, counselorId } = req.body;
  if (!body || !subject || !recipientEmail) {
    res.status(400).json({ error: "Email subject, body and recipient are required" });
    return;
  }

  const db = loadDb();
  const newEmail = {
    id: "em_" + Math.random().toString(36).substr(2, 9),
    senderName,
    senderEmail,
    recipientName,
    recipientEmail,
    subject,
    body,
    date: new Date().toISOString().split("T")[0],
    counselorId: counselorId || "sarah_jenkins"
  };

  db.emails.push(newEmail);
  saveDb(db);
  res.status(201).json(newEmail);
});

// GET payment transactions
app.get("/api/transactions", (req, res) => {
  const db = loadDb();
  res.json(db.transactions);
});

// Mock File upload returning mock attachment meta
app.post("/api/upload-file", (req, res) => {
  const randomNames = ["Resource_Checklist.pdf", "Anxiety_Guide.pdf", "Career_Strengths_Assessment.xlsx", "Relational_Skills_Sheet.docx"];
  const randomSize = ["180 KB", "420 KB", "1.2 MB", "85 KB"];
  const selectIdx = Math.floor(Math.random() * randomNames.length);

  res.json({
    success: true,
    name: randomNames[selectIdx],
    size: randomSize[selectIdx],
    url: "#"
  });
});

// RESET database to initial seeds
app.post("/api/reset", (req, res) => {
  const defaultDb = {
    counselors: defaultCounselors,
    appointments: defaultAppointments,
    sessionNotes: defaultSessionNotes,
    messages: defaultMessages,
    emails: defaultEmails,
    transactions: defaultTransactions
  };
  saveDb(defaultDb);
  res.json({ status: "reset_successful", db: defaultDb });
});

// Serve Vite or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
