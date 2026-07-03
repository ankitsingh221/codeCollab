import axios from "axios";
import {
  JUDGE0_LANGUAGE_MAP,
  isExecutable,
} from "../utils/judge0LanguageMap.js";

const JUDGE0_URL = "https://ce.judge0.com/submissions";

const STATUS_LABELS = {
  6: "Compilation Error",
  5: "Time Limit Exceeded",
  13: "Internal Error",
  14: "Execution Format Error",
};

export const executeCode = async (req, res) => {
  try {
    const { language, content, stdin = "" } = req.body;

    if (!language || content === undefined) {
      return res
        .status(400)
        .json({ message: "language and content are required" });
    }
    if (!isExecutable(language)) {
      return res
        .status(400)
        .json({ message: `Running "${language}" files is not supported` });
    }

    const languageId = JUDGE0_LANGUAGE_MAP[language];

    const { data } = await axios.post(
      `${JUDGE0_URL}?base64_encoded=false&wait=true`,
      {
        source_code: content,
        language_id: languageId,
        stdin,
      },
      {
        headers: { "content-type": "application/json" },
        timeout: 20000,
      },
    );

    const statusId = data.status?.id;
    const isCompileError = statusId === 6;

    return res.status(200).json({
      status: data.status?.description,
      compile: isCompileError
        ? { stderr: data.compile_output || "", code: 1 }
        : null,
      run: {
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        code: statusId === 3 ? 0 : 1,
        message: STATUS_LABELS[statusId] || null,
        time: data.time,
        memory: data.memory,
      },
    });
  } catch (err) {
    console.error("Judge0 execution error:", err.response?.data || err.message);
    if (err.code === "ECONNABORTED") {
      return res.status(504).json({ message: "Execution timed out" });
    }
    if (err.response?.status === 429) {
      return res
        .status(429)
        .json({
          message:
            "Rate limit reached on the free execution instance. Try again shortly.",
        });
    }
    return res.status(500).json({
      message:
        err.response?.data?.message || "Code execution failed. Try again.",
    });
  }
};
