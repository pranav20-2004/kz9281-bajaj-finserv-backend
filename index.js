const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Constants
const VALID_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const USER_DETAILS = {
  user_id: "kz9281",
  email: "kz9281@srmist.edu.in",
  roll_number: "RA2111027020113",
};

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" })); // Increased limit for base64 files

// Utility function to check file validity
const getFileDetails = (fileBase64) => {
  const matches = fileBase64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return { valid: false };

  const [mimeType, base64Data] = [matches[1], matches[2]];
  if (!VALID_MIME_TYPES.includes(mimeType)) return { valid: false };

  const fileSizeKb = Buffer.from(base64Data, "base64").length / 1024;
  return { valid: true, mimeType, fileSizeKb: fileSizeKb.toFixed(2) }; // Rounded to 2 decimal places
};

// GET endpoint
app.get("/bfhl", (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

// POST endpoint
app.post("/bfhl", (req, res) => {
  const { data, file_b64 } = req.body;

  // Validate input data
  if (!Array.isArray(data)) {
    return res.status(400).json({ is_success: false, message: "Invalid input data format." });
  }

  // Separate numbers and alphabets
  const numbers = data.filter((item) => !isNaN(item));
  const alphabets = data.filter((item) => /^[a-zA-Z]$/.test(item));
  const highest_lowercase_alphabet = alphabets
    .filter((item) => /^[a-z]$/.test(item))
    .sort()
    .slice(-1); // Get the highest lowercase alphabet

  // File validation (if file_b64 is provided)
  let file_valid = false, file_mime_type = "", file_size_kb = 0;
  if (file_b64) {
    const { valid, mimeType, fileSizeKb } = getFileDetails(file_b64);
    if (valid) {
      file_valid = true;
      file_mime_type = mimeType;
      file_size_kb = fileSizeKb;
    }
  }

  // Send response
  res.status(200).json({
    is_success: true,
    ...USER_DETAILS,
    numbers,
    alphabets,
    highest_lowercase_alphabet,
    file_valid,
    file_mime_type,
    file_size_kb,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
