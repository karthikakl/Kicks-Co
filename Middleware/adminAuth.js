const isAdmin = async (req, res, next) => {
    try {
        if (!req.session.admin_id) {
            next();
        } else {
            return res.redirect("/admin/adminHome")
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}


const isLoggedAdmin = async (req, res, next) => {
    try {

        if (!req.session.isLoggedAdmin) {
            return res.redirect('/admin/login');
        } else {
            return next();
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}
module.exports = {
    isAdmin,
    isLoggedAdmin
}