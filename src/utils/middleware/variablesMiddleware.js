export default function variablesMiddleware(config) {
    return function (req, res, next) {
        try {
            res.locals.website_name = config.website_name;
            res.locals.defaultLang = config.DEFAULTLANG;
            res.locals.version = config.version;
            res.locals.port = config.port;
            // يمكنك تحديد المتغيرات العامة الأخرى هنا
            next();
        } catch (error) {
            return res.status(500).json({ message: `${error}` });
        }
    };
}