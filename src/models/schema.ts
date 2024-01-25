import { Schema, model } from "mongoose";

// Document interface
interface User {
  name: string;
  email: string;
  password: string;
}

// Schema user
const schema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User=  model("User", schema)
export {User}
