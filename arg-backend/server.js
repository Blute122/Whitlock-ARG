require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// 1. ANTI-CHEAT: RATE LIMITING
// ==========================================
// If a team spams 10 wrong guesses in 1 minute, they are locked out for 3 minutes.
const guessLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { 
    status: "locked", 
    message: "Too many attempts detected. The system has initiated a 3-minute lockdown." 
  }
});

// ==========================================
// 2. DATABASE SCHEMAS (MongoDB via Mongoose)
// ==========================================
const crypto = require('crypto');
const TeamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  teamName: { type: String, required: true },
  loginCode: { type: String, required: true },
  currentStage: { type: Number, default: 1 },
  sessionToken: { type: String },
  diaryUnlocked: { type: [Number], default: [] }
});
const Team = mongoose.model('Team', TeamSchema);

const StageSchema = new mongoose.Schema({
  stageNumber: { type: Number, required: true, unique: true },
  correctAnswer: { type: String, required: true },  
  maxSlots: { type: Number, required: true },
  slotsTaken: { type: Number, default: 0 },
  blog: {
    title: String,
    intro: String,
    incidentDetails: String,
    timeline: [String],
    conclusion: String
  },
  puzzle: {
    prompt: String,
    hint: String
  },
  diary: {
    date: String,
    content: String
  }
});
const Stage = mongoose.model('Stage', StageSchema);
// ==========================================
// REGISTRATION: Create or Login Team
// ==========================================
app.post('/api/register', async (req, res) => {
  const { teamName, loginCode } = req.body;

  try {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    // Check if team already exists
    let team = await Team.findOne({ teamName: teamName.trim() });

    if (team) {
      // If team exists, check if the login code matches (acts as a password)
      if (team.loginCode === loginCode) {
        team.sessionToken = sessionToken;
        await team.save();
        return res.status(200).json({ status: "success", teamId: team.teamId, sessionToken, currentStage: team.currentStage, diaryUnlocked: team.diaryUnlocked });
      } else {
        return res.status(401).json({ status: "error", message: "Team name taken or wrong code." });
      }
    }

    // If it's a new team, create them
    const newTeam = new Team({
      teamId: Math.random().toString(36).substr(2, 9), // Generate a random ID
      teamName: teamName.trim(),
      loginCode: loginCode, // This is the code they'll use to stay synced
      currentStage: 1,
      sessionToken,
      diaryUnlocked: []
    });

    await newTeam.save();
    res.status(201).json({ status: "success", teamId: newTeam.teamId, sessionToken, currentStage: 1, diaryUnlocked: [] });

  } catch (error) {
    res.status(500).json({ status: "error", message: "Registration failed." });
  }
});
// ==========================================
// 3. THE MAIN GAMEPLAY ROUTE
// ==========================================
app.post('/api/submit', guessLimiter, async (req, res) => {
  const { teamId, stageNumber, answer } = req.body;
  const reqSessionToken = req.headers['sessiontoken'];
  const reqTeamId = req.headers['teamid'] || teamId; 

  try {
    // Session token verify
    const team = await Team.findOne({ teamId: reqTeamId, sessionToken: reqSessionToken });
    if (!team) return res.status(401).json({ status: "error", message: "Unauthorized." });

    // Enforce stage gate
    if (team.currentStage < stageNumber) return res.status(403).json({ status: "error", message: "Stage mismatch." });

    // A. Check if the answer is right
    const stage = await Stage.findOne({ stageNumber });
    if (!stage) return res.status(404).json({ message: "Stage not found." });

    if (answer.toLowerCase().trim() !== stage.correctAnswer.toLowerCase()) {
      return res.status(400).json({ status: "wrong", message: "Invalid passcode." });
    }

    // B. THE ATOMIC CHECK: Are there slots left?
    const updatedStage = await Stage.findOneAndUpdate(
      { stageNumber: stageNumber, slotsTaken: { $lt: stage.maxSlots } },
      { $inc: { slotsTaken: 1 } },
      { new: true }
    );

    // C. The Graveyard Redirect (No slots left)
    if (!updatedStage) {
      return res.status(403).json({ 
        status: "full", 
        message: "They got here first. You have nothing left to find." 
      });
    }

    // D. Success! Move the team forward & unlock diary
    const updatedTeam = await Team.findOneAndUpdate(
      { teamId: reqTeamId }, 
      { 
        currentStage: stageNumber + 1,
        $addToSet: { diaryUnlocked: stageNumber } 
      },
      { new: true }
    );

    return res.status(200).json({ 
      status: "success", 
      message: "Passcode accepted. Data decrypted.",
      nextStage: updatedTeam.currentStage,
      diaryUnlocked: updatedTeam.diaryUnlocked
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ status: "error", message: "Internal server anomaly." });
  }
});

// GET /api/stage/:n
app.get('/api/stage/:n', async (req, res) => {
  const n = parseInt(req.params.n);
  const reqSessionToken = req.headers['sessiontoken'];
  const reqTeamId = req.headers['teamid'];

  try {
    const team = await Team.findOne({ teamId: reqTeamId, sessionToken: reqSessionToken });
    if (!team) return res.status(401).json({ status: "error", message: "Unauthorized." });

    if (team.currentStage < n) return res.status(403).json({ status: "error", message: "Stage locked." });

    const stage = await Stage.findOne({ stageNumber: n });
    if (!stage) return res.status(404).json({ status: "error", message: "Stage not found." });

    res.status(200).json({
      status: "success",
      stageNumber: stage.stageNumber,
      blog: stage.blog,
      puzzle: stage.puzzle
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Internal server anomaly." });
  }
});

// GET /api/diary/:n
app.get('/api/diary/:n', async (req, res) => {
  const n = parseInt(req.params.n);
  const reqSessionToken = req.headers['sessiontoken'];
  const reqTeamId = req.headers['teamid'];

  try {
    const team = await Team.findOne({ teamId: reqTeamId, sessionToken: reqSessionToken });
    if (!team) return res.status(401).json({ status: "error", message: "Unauthorized." });

    if (!team.diaryUnlocked.includes(n)) return res.status(403).json({ status: "error", message: "Diary locked." });

    const stage = await Stage.findOne({ stageNumber: n });
    if (!stage) return res.status(404).json({ status: "error", message: "Stage not found." });

    res.status(200).json({
      status: "success",
      stageNumber: stage.stageNumber,
      diary: stage.diary
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Internal server anomaly." });
  }
});

// ==========================================
// 4. START THE SERVER
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    app.listen(process.env.PORT || 5000, '0.0.0.0', () => {
      console.log(`ARG Server running on port 5000`);
    });
  })
  .catch((err) => console.error("MongoDB Connection Failed:", err));