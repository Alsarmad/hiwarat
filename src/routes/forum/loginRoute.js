export default async (router, config, logger, utils, DBManager) => {
    const { logError } = logger;
    try {

        const {
            translationManager,
            checkUserAuthentication,
            sessionManager
        } = utils;
        const { usersDBManager } = DBManager;
        
        const lang = config.defaultLang;

        router.get('/login', async (req, res) => {
            try {

                const session = req?.session;
                if (session) {
                    return res.redirect("/");
                }

                const options = {};
                return res.status(200).render("login", options);

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        router.post('/login', async (req, res) => {
            try {

                const { body } = req;
                const session = req?.session;
                if (session) {
                    return res.status(200).json({
                        message: translationManager.translate('logged_in_successfully', {}, lang),
                        session: session
                    });
                }
                // التحقق من المصادقة باستخدام اسم المستخدم وكلمة المرور
                const authResult = await checkUserAuthentication({ username: body?.username, password: body?.password });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                const sessionId = sessionManager.createSession({
                    ...authResult.user
                });

                res.cookie('sessionId', sessionId, {
                    httpOnly: true
                });

                return res.status(200).json({
                    success: true,
                    user: authResult.user
                });

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // LOGOUT PAGE
        router.get('/logout', async (req, res) => {
            try {
                const session = req?.session;
                if (session) {
                    const sessionId = req.cookies.sessionId;
                    sessionManager.destroySession(sessionId);
                    res.clearCookie('sessionId');
                    return res.redirect("/");
                } else {
                    return res.redirect("/login");
                }

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

    } catch (error) {
        logError("An error occurred while processing the request", error);
    }
}