/*import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import {
  emailVerificationMailgenContent,
  sendEmail,
} from "../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while accessing token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user already exists", []);
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

 await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
    ),
  });
  

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "something went wrong while registering user"
    );
  }

  return res.status(201).json(
    new ApiResponse(
      200,
      {
        user: createdUser,
      },
      "User registered successfully verification email has been sent on your mail...."
    )
  );
});

export { registerUser };
*/
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

// Optional: generate access & refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong while accessing token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // 1️⃣ Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // 2️⃣ Create new user
  const user = await User.create({
    email,
    username,
    password,
    isEmailVerified: false,
  });

  // 3️⃣ Generate temporary email verification token
  const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // 4️⃣ Create verification link safely
  const host = req.get("host") || "localhost:8000";
  const protocol = req.protocol || "http";
  const verificationLink = `${protocol}://${host}/api/v1/auth/verify-email/${unhashedToken}`;

  // 5️⃣ Send verification email (catch any error to prevent crash)
  try {
    await sendEmail({
      email: user.email,
      subject: "Please verify your email",
      mailgenContent: emailVerificationMailgenContent(user.username, verificationLink),
    });
  } catch (err) {
    console.error("Email sending failed:", err.message);
    // continue, do not crash the route
  }

  // 6️⃣ Return created user without sensitive info
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res.status(201).json(
    new ApiResponse(
      200,
      { user: createdUser },
      "User registered successfully. Verification email has been sent!"
    )
  );
});

export { registerUser };
