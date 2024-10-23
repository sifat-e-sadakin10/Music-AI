"use client";
import { useState } from "react";
import { generateMusicFromLyrics } from "./utils/musicGenerator";

export default function Home() {
  const [lyrics, setLyrics] = useState("");
  const [generatedMusic, setGeneratedMusic] = useState(null);

  const handleGenerateMusic = async () => {
    // Logic for generating music will go here
    const music = await generateMusicFromLyrics(lyrics);
    setGeneratedMusic(music);
    console.log("Generating music for:", lyrics);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI-Powered Music Generator</h1>
      <textarea
        value={lyrics}
        onChange={e => setLyrics(e.target.value)}
        rows="5"
        cols="50"
        placeholder="Enter your lyrics here..."
      />
      <br />
      <button onClick={handleGenerateMusic}>Generate Music</button>
      {generatedMusic && <audio controls src={generatedMusic}></audio>}
    </div>
  );
}
