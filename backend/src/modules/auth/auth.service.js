import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/User.js";

export async function registerUser({ name, email, password }) {
  const exists = await User.findOne({ email });
  if (exists) throw { status: 400, message: "Email already registered" };

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return { user: { id: user._id, name: user.name, email: user.email }, token };
}

export async function loginUser({ identifier, password }) {
  const user = await User.findOne({ 
    $or: [{ email: identifier }, { username: identifier }] 
  });
  if (!user) throw { status: 401, message: "Invalid credentials" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 401, message: "Invalid credentials" };

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return { user: { id: user._id, name: user.name, email: user.email, username: user.username }, token };
}
