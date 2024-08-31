import express from "express";
import isAuth from "../middleware/auth.js";
import generateToken from "../utils/token.js";
const router = express.Router();

router.get("/", isAuth, async (req, res) => {
  return res.json(req.user);
});

router.get("/generate-token", isAuth, generateToken);

export default router;
