const isAuthenticated = (req, res, next) => {
  try {
    if (!req.session.user) {
      req.session.errorMessage = "Please log in first!";
      return res.status(401).json({ redirect: "/login" });
    }
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "Authentication error" });
  }
};

const isAdmin = (req, res, next) => {
  try {
    if (!req.session.user) {
      req.session.errorMessage = "Please log in first!";
      return res.status(401).json({ redirect: "/login" });
    }

    if (!req.session.user.role !== "admin") {
      req.session.errorMessage = "Access denied! Admin's only!";
      return res.status(403).json({ redirect: "/profile" });
    }
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    return res.status(500).json({ error: "Admin verification error" });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
};
