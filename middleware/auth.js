export function ensureAuth(req, res, next) {
    if (!req.session?.user) {
        return res.redirect("/login");
    }
    next();
}

