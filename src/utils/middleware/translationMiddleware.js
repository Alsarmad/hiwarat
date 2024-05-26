export default function translationMiddleware(translationManager, defaultLang) {
    return function (req, res, next) {
        try {
            const { query } = req;
            const { lang } = query;
            res.locals.translationManager = translationManager;
            res.locals.lang = lang ? lang : defaultLang;
            next();
        } catch (error) {
            return res.status(500).json({ message: `${error}` });
        }
    };
}