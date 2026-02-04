const sanitizeError = (error, language) => {
  let msg = "Unknown Error";

  // 1️⃣ Normalize input
  if (typeof error === "string") {
    msg = error;
  } else if (error?.stderr) {
    msg = error.stderr.toString();
  } else if (error?.message) {
    msg = error.message;
  }

  // 2️⃣ Split into non-empty trimmed lines
  const lines = msg
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  // 3️⃣ Language-specific extraction

  if (language === "cpp") {
    // C++: pick line with "error:" or first line
    const errLine = lines.find(l => l.toLowerCase().includes("error:"));
    return errLine || lines[0] || "Compilation Error";
  }

  if (language === "python") {
    // Python: usually last line is user-friendly error
    return lines[lines.length - 1] || "Runtime Error";
  }

  if (language === "nodejs") {
    // Node.js: look for SyntaxError, ReferenceError, TypeError, etc.
    const nodeError = lines.find(l =>
      l.match(/(SyntaxError|ReferenceError|TypeError|Error)/)
    );
    return nodeError || lines[0] || "Runtime Error";
  }

  // fallback
  return lines[0] || "Unknown Error";
};

module.exports = sanitizeError;
