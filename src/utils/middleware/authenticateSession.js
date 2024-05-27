export default function authenticateSession(sessionManager) {
    return function (req, res, next) {
        try {
            const sessionId = req.cookies.sessionId;
            const session = sessionManager.getSession(sessionId);

            if (session) {
                req.session = session ? session : null;
                res.locals.session = session ? session : null;;
            } else {
                req.session = null;
                res.locals.session = null;
            }
            next();
        } catch (error) {
            return res.status(500).json({ message: `${error}` });
        }
    };
}