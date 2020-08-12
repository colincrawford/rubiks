// Allows showing "flash" messages either immediately or on
// the next page load
export function flashMiddleware() {
  return function (req, res, next) {
    res.locals.flash = {notices: [], warnings: []}

    // pull out the current flash messages
    if (req.session.flash) {
      if (req.session.flash.notices) {
        res.locals.flash.notices = req.session.flash.notices
      }
      if (req.session.flash.warnings) {
        res.locals.flash.warnings = req.session.flash.warnings
      }
    }

    // reset the flash values
    req.session.flash = {notices: [], warnings: []}

    // helper functions for route handlers
    req.flashNotice = function(msg) {
      req.session.flash.notices.push(msg)
    }

    req.flashWarning = function(msg) {
      req.session.flash.warnings.push(msg)
    }

    req.flashImmediateNotice = function(msg) {
      req.locals.flash.notices.push(msg)
    }

    req.flashImmediateWarning = function(msg) {
      req.locals.flash.warnings.push(msg)
    }

    next()
  }
}

