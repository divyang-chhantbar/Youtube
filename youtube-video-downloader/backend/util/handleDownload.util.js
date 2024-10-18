const express = require("express");
const { exec } = require("child_process"); // For running yt-dlp commands
const { google } = require("googleapis"); // Google API client
const { resolve } = require("path");
const cors = require('cors');


const app = express();
const PORT = 4000;
app.use(cors());

// YouTube API setup (replace YOUR_API_KEY with your actual key)
const youtube = google.youtube({
  version: "v3",
  auth: 'AIzaSyCluj5vGKQ9pKM0_WtEoD6xefE0obJ9cY8', // Replace with your YouTube API key
});

app.use(express.json());

app.post("/download", async (req, res) => {
  const { url, quality } = req.body;
  
  // Validate quality input
  const validQualities = ['144', '240', '360', '480', '720', '1080', '1440', '2160']; // Add more if needed
  if (!validQualities.includes(quality)) {
    return res.status(400).json({ error: "Invalid quality specified." });
  }

  try {
    // Get video ID from the URL
    const videoId = extractVideoId(url);
    const downloadPath = resolve(__dirname, `../downloads/${videoId}.mp4`);

    // Fetch video information using YouTube Data API
    const videoInfo = await youtube.videos.list({
      id: videoId,
      part: "snippet,contentDetails",
    });

    if (!videoInfo.data.items || videoInfo.data.items.length === 0) {
      return res.status(404).json({ error: "Video not found." });
    }

    console.log("Video Info: ", videoInfo.data.items[0].snippet);

    // Use yt-dlp to download the video
    const command = `yt-dlp -f "bestvideo[height<=${quality}]+bestaudio/best" -o "${downloadPath}/%(title)s.%(ext)s" "${url}"`;
    const downloadProcess = exec(command);

    downloadProcess.stdout.on("data", (data) => {
      console.log(`Hey divyang this is your data :  ${data}`);
    });
    

    // Track progress by listening to 'stderr'
    downloadProcess.stderr.on("data", (data) => {
      const progressMatch = data.match(/(\d+\.\d+)%/); // Example: "5.00%"
      if (progressMatch) {
        const progress = progressMatch[1];
        console.log(`Downloading: ${progress}%`);
        // Optionally send progress updates to the client
        // res.write(`Downloading: ${progress}%\n`);
      }
    });

    downloadProcess.on("close", (code) => {
      if (code === 0) {
        console.log("Download finished!");
        res.status(200).json({ message: "Download complete", filePath: downloadPath });
      } else {
        res.status(500).json({ error: "Failed to download video" });
      }
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to download video" });
  }
});

// Helper function to extract video ID from YouTube URL
function extractVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^&\n]{11})/;
  const matches = url.match(regex);
  return matches ? matches[1] : null;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
