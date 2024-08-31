import jwt from "jsonwebtoken";
import User from "../models/User.js";

const publicKey = process.env.CLERK_JWT_KEY.replace(/\\n/g, "\n");

const auth = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ msg: "Authorization header is missing" });
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    const userId = decoded.sub;

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Failed to authenticate user", error });
  }
};

export default auth;
