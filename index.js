const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" })); // Increase the limit to handle large base64 files

// Utility function to check file validity
const getFileDetails = (fileBase64) => {
  try {
    // Extract MIME type and base64 data
    const matches = fileBase64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return { valid: false };

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Check if the MIME type is valid
    const validMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validMimeTypes.includes(mimeType)) return { valid: false };

    // Calculate file size in kilobytes
    const fileSizeKb = Buffer.from(base64Data, "base64").length / 1024;

    return { valid: true, mimeType, fileSizeKb };
  } catch (error) {
    return { valid: false };
  }
};

// GET endpoint
app.get("/bfhl", (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

// POST endpoint
app.post("/bfhl", (req, res) => {
  const { data, file_b64 } = req.body;

  // Validate data array
  if (!Array.isArray(data)) {
    return res
      .status(400)
      .json({ is_success: false, message: "Invalid input data format." });
  }

  const user_id = "gp5901";
  const email = "gp5901@srmist.edu.in";
  const roll_number = "RA2111004020056";

  // Separate numbers and alphabets
  const numbers = data.filter((item) => !isNaN(item));
  const alphabets = data.filter((item) => /^[a-zA-Z]$/.test(item));

  // Find highest lowercase alphabet
  const lowercaseAlphabets = alphabets.filter((item) => /^[a-z]$/.test(item));
  const highest_lowercase_alphabet = lowercaseAlphabets.length
    ? [lowercaseAlphabets.sort((a, b) => b.localeCompare(a))[0]]
    : [];

  // File validation
  let file_valid = false;
  let file_mime_type = "";
  let file_size_kb = 0;

  // Check file validity if file_b64 is provided
  if (file_b64) {
    const fileDetails = getFileDetails(file_b64);
    if (fileDetails.valid) {
      file_valid = true;
      file_mime_type = fileDetails.mimeType;
      file_size_kb = fileDetails.fileSizeKb.toFixed(2); // Round to 2 decimal places
    }
  }

  // Construct response object
  res.status(200).json({
    is_success: true,
    user_id,
    email,
    roll_number,
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
  console.log(`Server is running on port ${port}`);
});
