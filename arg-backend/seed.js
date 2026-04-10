require('dotenv').config();
const mongoose = require('mongoose');

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

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/witlock")
  .then(async () => {
    console.log("Connected to database...");
    
    await Stage.deleteMany({});
    console.log("Cleared old stages...");

    const stages = [
      { 
        stageNumber: 1, 
        correctAnswer: "savehumanity", 
        maxSlots: 999,
        blog: {
          title: "Intrusion Analysis: Node Cluster Alpha",
          intro: "An unusual access pattern was observed in the forms and identifiers processing unit.",
          incidentDetails: "During standard sweeps, multiple unauthenticated requests were traced to a physical root cluster in the main building. The footprint suggests localized access. We identified several nodes grouped tightly within the primary instructional classroom.",
          timeline: ["08:00 - Initial form deviation detected.", "11:30 - Desk cluster anomaly verified.", "14:00 - Physical note recovery attempted."],
          conclusion: "Check the local instructional node (classroom desk) for residual data traces left behind by the intruder."
        },
        puzzle: { prompt: "Identify the localized trace.", hint: "forms + identifiers + cluster / classroom → desk → note" },
        diary: { date: "February 3", content: "I shouldn't have mapped the cluster. They know I was there. I left the master key beneath the form. Whatever you do, don't W_ait." }
      },
      { 
        stageNumber: 2, 
        correctAnswer: "undefeated", 
        maxSlots: 999,
        blog: {
          title: "Audio Frequency Anomalies",
          intro: "A rogue broadcast infiltrated the primary audio stream.",
          incidentDetails: "The disruption occurred in the 18th sector sequence. We isolated the waveform and found a stark peak precisely at the 1:42 mark. Initial transcription systems flagged the 7th word in the resulting burst.",
          timeline: ["Sequence 18 isolated.", "Timestamp 1:42 flagged.", "Extraction pending."],
          conclusion: "Proceed with manual lyric extraction to bypass the automated filters."
        },
        puzzle: { prompt: "Extract the isolated term.", hint: "playlist → song → lyrics (sequence 18, 1:42, 7th word)" },
        diary: { date: "February 5", content: "They block the text, but they can't block the sound. I hid the next piece in plain sight. They think they're H_iding everything, but they missed the frequency." }
      },
      { 
        stageNumber: 3, 
        correctAnswer: "illusion", 
        maxSlots: 999,
        blog: {
          title: "Social Graph Manipulation",
          intro: "We detected unauthorized manipulation of public connection trees.",
          incidentDetails: "Several target profiles on visual media networks have been reconfigured. We are seeing coordinated bios and followers forming a specific connection loop. It appears to be a fragmented riddle distributed across the network graph.",
          timeline: ["Node fragmentation identified.", "Follower trees mapped.", "Bio extraction complete."],
          conclusion: "We need operators to combine the fragments and solve the resulting pattern to block the loop."
        },
        puzzle: { prompt: "Compile and solve the network riddle.", hint: "bios + followers + connections" },
        diary: { date: "February 8", content: "Look closely at who follows me. They each hold a piece. I_t's all connected if you know how to link the nodes together." }
      },
      { 
        stageNumber: 4, 
        correctAnswer: "mirage", 
        maxSlots: 999,
        blog: {
          title: "Data Payload Embedding",
          intro: "An image file was found containing excess byte density.",
          incidentDetails: "During standard packet inspection, a harmless visual asset was flagged. Our scanners indicate that not everything is visible. There is a secondary payload embedded within the image structure.",
          timeline: ["Image intercepted.", "Byte density anomaly detected.", "Extraction algorithm primed."],
          conclusion: "Run standard steganographic extraction to reveal the true data."
        },
        puzzle: { prompt: "Extract the unseen payload.", hint: "embedded / not visible / image" },
        diary: { date: "February 12", content: "They only see the surface. The T_ruth is always buried underneath the pixels." }
      },
      { 
        stageNumber: 5, 
        correctAnswer: "phantom", 
        maxSlots: 999,
        blog: {
          title: "Physical Topography Breach",
          intro: "Multiple sensor blackouts occurred across specific physical locations.",
          incidentDetails: "We have intercepted several eerie photographs associated with these blackout zones. Operators must visit the isolated spots to manually recover the physical data fragments left there.",
          timeline: ["Sensor grid partially failed.", "Images captured at zero-hour.", "Locations confirmed."],
          conclusion: "Visit the spots, collect the letters, and combine them into the cipher word."
        },
        puzzle: { prompt: "Reconstruct the physical cipher.", hint: "visit spots → collect letters → combine" },
        diary: { date: "February 15", content: "I had to keep moving. I left pieces of L_ife at every stop. Don't let them find the letters before you do." }
      },
      { 
        stageNumber: 6, 
        correctAnswer: "whisper", 
        maxSlots: 999,
        blog: {
          title: "Temporal Discrepancy Event",
          intro: "The official timeline of the 'Midnight Incident' has been altered.",
          incidentDetails: "Records show the breach occurred on the 14th, but the logs say the 12th. The recovery was on the 5th? This incorrect timeline was injected into the database to deliberately obfuscate the real event.",
          timeline: ["Compare against the real event.", "Reorder the numbers.", "Convert sequence to word."],
          conclusion: "Identify the logical contradiction and derive the final keyword."
        },
        puzzle: { prompt: "Correct the timeline discrepancy.", hint: "find real event → reorder/extract numbers → convert" },
        diary: { date: "February 20", content: "They can change the dates, but O_ur memories don't lie. Look at the numbers, they'll tell you what's real." }
      },
      { 
        stageNumber: 7, 
        correctAnswer: "awaken", 
        maxSlots: 999,
        blog: {
          title: "System-Wide Typographical Errors",
          intro: "We are observing formatting degradation across all archived posts.",
          incidentDetails: "Misaligned letters have been appearing structurally. This is not a glitch. It is a meta-pattern inserted recursively across the entire system. We need to collect all crooked letters to find the root command.",
          timeline: ["Pattern threshold reached.", "System destabilization imminent.", "Awaiting override."],
          conclusion: "Combine the collected meta-letters to initiate the final system override."
        },
        puzzle: { prompt: "Identify the meta-pattern.", hint: "collect all misaligned letters → combine" },
        diary: { date: "February 28", content: "It's time. You C_an see it all now. Enter the name and wake up." }
      }
    ];

    await Stage.insertMany(stages);
    console.log("✅ Answer Key uploaded successfully! You can now play the game.");
    
    process.exit(); 
  })
  .catch((err) => {
    console.error("Connection Failed:", err);
    process.exit(1);
  });