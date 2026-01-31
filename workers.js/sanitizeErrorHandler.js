const sanitizeError = (error, language) => {
    let msg = "Unknown Error";

    // 1️⃣ normalize input
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

    // 2️⃣ C++
    if (language === "cpp") {
        const err = lines.find(l => l.toLowerCase().includes("error:"));
        return err || lines[0] || "Unknown Error";
    }

    // 3️⃣ Python
    if (language === "python") {
        const err = lines.find(l =>
            l.includes("Error:")
        );
        return err || lines[lines.length - 1] || "Unknown Error";
    }

    // 4️⃣ Node.js
    if (language === "nodejs") {
        const err = lines.find(l =>
            l.endsWith("Error") || l.includes("Error:")
        );
        return err || lines[lines.length - 1] || "Unknown Error";
    }

    return lines[0] || "Unknown Error";
};

module.exports = sanitizeError;
