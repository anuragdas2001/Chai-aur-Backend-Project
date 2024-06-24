import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
