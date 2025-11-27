const flashMessage = (req, res, next) => {
  res.locals.errorMessage = req.session.errorMessage || null;

  delete req.session.errorMessage;

  next();
};

module.exports = flashMessage;
