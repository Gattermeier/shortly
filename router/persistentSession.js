module.exports = function(app) {
  app.use(function(req, res, next) {
    var error = req.session.error;
    var message = req.session.notice;
    var success = req.session.success;

    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    if (error) res.locals.error = error;
    if (message) res.locals.notice = message;
    if (success) res.locals.success = success;

    next();
  });
}