const sanitizeError = (error, language) => {
  let msg = "Unknown Error";

  if (typeof error === "string") {
    msg = error;
  } else if (error?.stderr) {
    msg = error.stderr.toString();
  } else if (error?.message) {
    msg = error.message;
  }

  const lines = msg
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);


  if (language === "cpp") {
    const errLine = lines.find(l => l.toLowerCase().includes("error:"));
    return errLine || lines[0] || "Compilation Error";
  }

  if (language === "python") {
    return lines[lines.length - 1] || "Runtime Error";
  }

  if (language === "nodejs") {
    const nodeError = lines.find(l =>
      l.match(/(SyntaxError|ReferenceError|TypeError|Error)/)
    );
    return nodeError || lines[0] || "Runtime Error";
  }

  return lines[0] || "Unknown Error";
};

module.exports = sanitizeError;
