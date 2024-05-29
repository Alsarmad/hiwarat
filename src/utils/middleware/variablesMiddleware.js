export default function variablesMiddleware(config) {
    return function (req, res, next) {
        try {
            res.locals.website_name = config.website_name;
            res.locals.website_description = config.website_description;
            res.locals.defaultLang = req?.query?.lang ? req.query.lang : config.DEFAULTLANG;
            res.locals.version = config.version;
            res.locals.port = config.port;
            // يمكنك تحديد المتغيرات العامة الأخرى هنا
            next();
        } catch (error) {
            return res.status(500).json({ message: `${error}` });
        }
    };
}