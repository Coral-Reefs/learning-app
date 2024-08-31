import generateToken04 from "./TokenGenerator.js";

const generateToken = (req, res, next) => {
  try {
    const appId = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_ID;
    const userId = req.user.clerkUserId.toString();
    const effectiveTime = 3600;
    const payload = "";
    console.log(req.user);

    if (appId && serverSecret && userId) {
      const token = generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload
      );
      return res.json({ token });
    }

    return res
      .status(400)
      .send("User ID, app ID, and server secret are required");
  } catch (e) {
    return res.status(400).json(e);
  }
};

export default generateToken;
