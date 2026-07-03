import axios from "axios";
import { JUDGE0_LANGUAGE_MAP, isExecutable } from "../utils/judge0LanguageMap.js";

const JUDGE0_URL = "https://ce.judge0.com/submissions";

const STATUS_LABELS = {
  6: "Compilation Error",
  5: "Time Limit Exceeded",
  13: "Internal Error",
  14: "Execution Format Error",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toBase64 = (str) => Buffer.from(str ?? "", "utf-8").toString("base64");
const fromBase64 = (str) => (str ? Buffer.from(str, "base64").toString("utf-8") : "");

const submitToJudge0 = async (payload, attempt = 1) => {
  try {
    const { data } = await axios.post(
      `${JUDGE0_URL}?base64_encoded=true&wait=true`,
      payload,
      {
        headers: { "content-type": "application/json" },
        timeout: 20000,
      }
    );
    return data;
  } catch (err) {
    const status = err.response?.status;
    if ((status === 429 || status >= 500) && attempt < 2) {
      await sleep(1500);
      return submitToJudge0(payload, attempt + 1);
    }
    throw err;
  }
};

export const executeCode = async (req, res) => {
  try {
    const { language, content, stdin = "" } = req.body;

    if (!language || content === undefined) {
      return res.status(400).json({ message: "language and content are required" });
    }
    if (!isExecutable(language)) {
      return res.status(400).json({ message: `Running "${language}" files is not supported` });
    }

    const languageId = JUDGE0_LANGUAGE_MAP[language];
    if (!languageId) {
      return res.status(400).json({ message: `No Judge0 language mapping found for "${language}"` });
    }

    const data = await submitToJudge0({
      source_code: toBase64(content),
      language_id: languageId,
      stdin: toBase64(stdin),
    });

    const statusId = data.status?.id;
    const isCompileError = statusId === 6;

    return res.status(200).json({
      status: data.status?.description,
      compile: isCompileError ? { stderr: fromBase64(data.compile_output), code: 1 } : null,
      run: {
        stdout: fromBase64(data.stdout),
        stderr: fromBase64(data.stderr),
        code: statusId === 3 ? 0 : 1,
        message: STATUS_LABELS[statusId] || null,
        time: data.time,
        memory: data.memory,
      },
    });
  } catch (err) {
    const judge0Message = err.response?.data?.message || err.response?.data?.error;
    console.error("Judge0 execution error:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });

    if (err.code === "ECONNABORTED") {
      return res.status(504).json({ message: "Execution timed out" });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({ message: "The free execution instance is rate-limited right now. Please wait a moment and try again." });
    }
    return res.status(500).json({
      message: judge0Message || "Code execution failed. Please try again.",
    });
  }
};