import { registerUser, loginUser } from "./auth.service.js";
import prisma from "../../config/db.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) { next(err); }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json(user);
  } catch (err) { next(err); }
};
