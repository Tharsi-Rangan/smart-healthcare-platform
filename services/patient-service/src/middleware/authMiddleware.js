const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/apiResponse");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "Not authorized. Token missing.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId || decoded.id || decoded._id,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return sendError(res, 401, "Not authorized. Invalid token.");
  }
};

module.exports = {
  protect,
};