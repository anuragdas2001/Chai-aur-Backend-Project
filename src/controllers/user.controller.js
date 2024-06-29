import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import { json } from "express";
import  jwt  from "jsonwebtoken";
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const AccessToken = await user.generateAccessToken(userId);
    const RefreshToken = await user.generateRefreshToken(userId);

    user.refreshToken = RefreshToken;
    await user.save({ validateBeforeSave: false });

    return { AccessToken, RefreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  console.log("Email", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  console.log(existedUser);

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  console.log("req.files", req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  console.log("avatarLocalPath", avatarLocalPath);
  console.log("coverImageLocalPath", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Local Path is required");
  }

  // Upload avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  console.log("avatar", avatar);
  console.log("coverImage", coverImage);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(),
    password,
  });

  // Deselects or eliminates password and refreshToken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  console.log("Inside Login User");
  const { email, username, password } = req.body;
  console.log(email, username, password);
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  console.log("UserExists", user);
  if (!user) {
    throw new ApiError(404, "User does not exist !");
  }
  // const hashedPassword = await User.findOne({ password: password });
  // console.log("hashedPassword", hashedPassword);
  // console.log(user.password);
  // const plainpass = password;
  // const cypherpass = user.password;

  // console.log("plainpass", plainpass);
  // console.log("cypherpass", cypherpass);

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials !");
  }

  const { AccessToken, RefreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", AccessToken, options)
    .cookie("refreshToken", RefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, AccessToken, RefreshToken },
        "User logged In Sucessfully"
      )
    );

  // const comparepass = bcrypt.compare(
  //   plainpass,
  //   cypherpass,
  //   function (err, result) {
  //     if (err) {
  //       console.error(err);
  //       return null;
  //     }
  //     if (result) {
  //       console.log("Passwords match", password);
  //       return res
  //         .status(202)
  //         .json(new ApiResponse(201, result, "User logged in Successfully"));
  //     } else {
  //       console.log("Passwords dont match");
  //       return res
  //         .status(202)
  //         .json(new ApiResponse(402, err, "Invalid Credentials"));
  //     }
  //   }
  // );
});

const logoutUser = asyncHandler(async (req, res) => {
  // req.user._id
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
     const incomingRefreshToken =  req.body.refreshToken

     if(!incomingRefreshToken){
      throw new ApiError(401,"Unauthorized Request");
     }


   try {
    const decodedRefreshToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
      console.log("decodedRefreshToken",decodedRefreshToken);
     const user = await User.findById(decodedRefreshToken?._id);
      console.log("user",user);
     if(!user){
       throw new ApiError(401,"Unauthorized Request");
     }
 
 
     if(incomingRefreshToken !== user?.refreshToken){
       throw new ApiError(401,"Refresh token is expired or used"); 
     }
 
 
     const options = {
       httpOnly:true,
       secure:true
     }
 
   const {AccessToken,NewRefreshToken} = await generateAccessAndRefreshTokens(user?._id);
 
 
     return res.status(200)
     .cookie("accessToken", AccessToken, options)
     .cookie("refreshToken", NewRefreshToken, options)
     .json(
       new ApiResponse(
         200,
         { AccessToken, RefreshToken : NewRefreshToken },
         "Token Refreshed Successfully"
       )
     );
   } catch (error) {
    throw ApiError(401,error?.message || "Invalid refresh token");
   }




});

export { registerUser, loginUser, logoutUser ,refreshAccessToken};
