import * as tone from "tone";
import { MusicRNN, sequences } from "@magenta/music";
import Sentiment from "sentiment";

const sentiment = new Sentiment();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { lyrics, mood, genre } = req.body;

    // Step 1: Analyze the sentiment of the lyrics
    const sentimentResult = sentiment.analyze(lyrics);
    const emotion = sentimentResult.comparative > 0 ? "happy" : "sad";

    // Step 2: Define basic parameters for music generation based on mood & genre
    let model;
    switch (genre) {
      case "classical":
        model = new MusicRNN(
          "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/classical"
        );
        break;
      case "rock":
        model = new MusicRNN(
          "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/rock"
        );
        break;
      default:
        model = new MusicRNN(
          "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/pop"
        );
    }

    await model.initialize();

    // Step 3: Generate a sequence based on the model and lyrics rhythm
    const seedSequence = {
      notes: lyricsToNoteSequence(lyrics),
      totalTime: 32,
      quantizationInfo: { stepsPerQuarter: 4 },
    };
    const generatedSequence = await model.continueSequence(seedSequence, 20);

    // Step 4: Synthesize the melody using Tone.js
    const synth = new tone.Synth().toDestination();
    const now = tone.now();

    generatedSequence.notes.forEach(note => {
      synth.triggerAttackRelease(
        note.pitch,
        note.quantizedStartStep,
        now + note.quantizedStartStep
      );
    });

    // Step 5: Return the generated music data (in this case, you could return a file or URL)
    res
      .status(200)
      .json({ success: true, music: { audioUrl: "path/to/generated/audio" } });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

// Helper function to convert lyrics to a basic note sequence
function lyricsToNoteSequence(lyrics) {
  const notes = lyrics.split(/\s+/).map((word, index) => ({
    pitch: 60 + (index % 12), // Example: Rotate pitches within an octave
    quantizedStartStep: index * 4, // Adjust timing based on word position
    quantizedEndStep: index * 4 + 2,
  }));
  return { notes, totalTime: notes.length * 4 };
}
