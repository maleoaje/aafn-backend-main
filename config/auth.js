require("dotenv").config();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const signInToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      image: user.image,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

const tokenForVerify = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
    },
    process.env.JWT_SECRET_FOR_VERIFY,
    { expiresIn: "15m" }
  );
};

const isAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  // console.log("authorization", req.headers);

  if (!authorization) {
    return res.status(401).send({
      message: "Authorization header is required",
    });
  }

  try {
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
};

const isAdmin = async (req, res, next) => {
  const admin = await Admin.findOne({ role: "Admin" });
  if (admin) {
    next();
  } else {
    res.status(401).send({
      message: "User is not Admin",
    });
  }
};

// Encryption setup (optional - only if ENCRYPT_PASSWORD is provided)
const secretKey = process.env.ENCRYPT_PASSWORD;
let key, iv;

if (secretKey) {
  // Ensure the secret key is exactly 32 bytes (256 bits)
  key = crypto.createHash("sha256").update(secretKey).digest();
  // Generate an initialization vector (IV)
  iv = crypto.randomBytes(16); // AES-CBC requires a 16-byte IV
}

// Helper function to encrypt data
const handleEncryptData = (data) => {
  // If encryption is not configured, return data as-is
  if (!secretKey || !key || !iv) {
    return {
      data: typeof data === "string" ? data : JSON.stringify(data),
      iv: null,
    };
  }

  // Ensure the input is a string or convert it to a string
  const dataToEncrypt = typeof data === "string" ? data : JSON.stringify(data);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encryptedData = cipher.update(dataToEncrypt, "utf8", "hex");
  encryptedData += cipher.final("hex");

  return {
    data: encryptedData,
    iv: iv.toString("hex"),
  };
};

module.exports = {
  isAuth,
  isAdmin,
  signInToken,
  tokenForVerify,
  handleEncryptData,
};
