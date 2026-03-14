import { registerUser, loginUser } from "./auth.service.js";
import { User } from "../../models/User.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const result = await loginUser({ identifier, password });
    res.json(result);
  } catch (err) { next(err); }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    res.json(user);
  } catch (err) { next(err); }
};
