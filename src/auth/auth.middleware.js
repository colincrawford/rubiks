function userIsAuthorized(role, allowedRoles) {
  if (!allowedRoles.length) return true
  return allowedRoles.some(r => r == role)
}

export function authGuard(allowedRoles = []) {
  return function (req, res, next) {
    if (!req.user) {
      res.redirect('/login')
      return
    }
    if (!userIsAuthorized(req.user.role, allowedRoles)) {
      res.redirect('/login')
      return
    }
    next()
  }
}
