const express = require('express');
const path = require('path');

const app = express();
// Choose a random port or a fixed one. 8080 is a good default.
const PORT = process.env.PORT || 8080;

// Serve the static files from the Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LinguaTale is running on http://localhost:${PORT}`);
  
  // Open the default browser on Windows
  const { exec } = require('child_process');
  exec(`start http://localhost:${PORT}`);
});
