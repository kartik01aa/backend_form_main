import { RequestHandler } from "express";
import { User } from "../models/schema";
import CustomAPIError from "../errors/custom-error";
import { genSaltSync, hashSync, compareSync } from "bcrypt";
import Jwt from "jsonwebtoken";


export const registerUser: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body)

    // input passed or not
    if (!name) throw new CustomAPIError("Name required.");
    if (!email) throw new CustomAPIError("Email required.");
    if (!password) throw new CustomAPIError("Password required.");

    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const pass: RegExp =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;

    // check input for correctness
    if (!pass.test(password.toString()))
      throw new CustomAPIError(
        "Enter valid password with uppercase, lowercase, number & @"
      );
    if (!expression.test(email.toString()))
      throw new CustomAPIError("Enter valid email");

    // checking if user already exist
    const existinguser = await User.findOne({ email });

    if (existinguser) {
      throw new CustomAPIError("User already exists")
    }
    // password hashing and inserting data in Database
    const salt = genSaltSync(10);
    const hashPassword = hashSync(password.toString(), salt);
    await new User({
      name,
      email,
      password: hashPassword,
    }).save();

    return res.status(200).json({ msg: "New user registered" });
  } catch (error) {
    next(error);
  }
};

export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)

    const existinguser = await User.findOne({ email });
    //if user is not found
    if (!existinguser) {
      return res.status(407).json({ message: "User does not Exist" });
    }
    const isMatch = compareSync("" + password, existinguser.password);
    //if password doens't match
    if (!isMatch) {
      return res.status(407).json({ message: "Password not match" });
    }
    const username = existinguser.name
    const id = existinguser._id;
    let refereshToken = "",
      AccessToken = "";
      let payload = { "id" : "1"};
    refereshToken = await Jwt.sign(
      {payload, id },
      process.env.JWT_REFRESH_SECRET_KEY!,
      {
        expiresIn: "2h",noTimestamp:true
      }
    );
  
    AccessToken = await Jwt.sign({payload, id }, process.env.JWT_SECRET_KEY!, {
      expiresIn: "30m",noTimestamp:true
    });
    res.cookie("authToken", AccessToken, { httpOnly: true });
    res.cookie("refreshToken", refereshToken, { httpOnly: true })
    res.cookie("id", id, { httpOnly: false })
    res.header('authToken',AccessToken)
 

    res.status(200).json({
      refereshToken,
      AccessToken,
      username ,
      message: "User logged in successfully",
    });

  } catch (err) {
    return res.status(407).json({ message: err });
  }
};

export const logout: RequestHandler = (req, res, next) => {
  try {
    res.clearCookie("authToken");
    res.clearCookie("refreshToken");
    return res
      .status(200)
      .json({ ok: true, message: "User has been logged out" });
  } catch (err) {
    next(err);
  }
};

export const getAllUser: RequestHandler = async(req, res, next) => {
  try{
    const user = await User.find().exec();
    console.log(user);
    return res.status(200).json({user});

}catch(err){
    return res.status(407).json({message: err});
}   
};

