import User from "../models/User.js";
import bcrypt from "bcryptjs";


const getProfile = async (req, res) => {
  return res.status(200).json({ user: req.user.toSafeObject() });
};


const updateProfile = async (req, res) => {
  try {
    const { name, avatarUrl, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password required to set a new password" });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    return res.status(200).json({ user: user.toSafeObject() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error updating profile" });
  }
};

export  { getProfile, updateProfile };