export const loginRules = (req, res, next) => {
  const { phone, email, password } = req.body || {};

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  if (!phone && !email) {
    return res.status(400).json({
      success: false,
      message: "Phone or email is required",
    });
  }

  next();
};
