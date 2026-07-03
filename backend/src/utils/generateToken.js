import jwt from "jsonwebtoken";

const generateAccessToken = (userId) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  return jwt.sign({ userId }, accessSecret, { expiresIn: "15m" });
};

const generateRefreshToken = (userId) => {
  const refreshSecret =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  return jwt.sign({ userId }, refreshSecret, { expiresIn: "7d" });
};

export { generateAccessToken, generateRefreshToken };
