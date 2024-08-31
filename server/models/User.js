import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  clerkUserId: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  image: { type: String },
});

export default mongoose.model("User", UserSchema);
