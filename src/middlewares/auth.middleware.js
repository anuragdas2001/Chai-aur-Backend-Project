import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const VerifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    console.log("token", token);

    console.log("ACCESS_TOKEN_SECRET", process.env.ACCESS_TOKEN_SECRET);

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(405, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error");
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
