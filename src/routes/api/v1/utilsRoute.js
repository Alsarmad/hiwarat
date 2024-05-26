export default async (router, config, logger, utils, DBManager) => {
    const { logError } = logger;
    try {

        const {
            convertToBoolean,
            getElapsedTime,
        } = utils;
        const { postsDBManager } = DBManager;
        const lang = config.defaultLang;

        router.get('/get-elapsed-time', async (req, res) => {
            try {
                const { created_at, showOnly, lang } = req.query;

                if (!created_at) {
                    return res.status(400).json({
                        "success": false,
                        "message": "created_at time not provided. Please provide a valid time to get elapsed time."
                    });
                }

                res.status(200).json({
                    success: true,
                    time: getElapsedTime(created_at, convertToBoolean(showOnly), lang ? lang : config.defaultLang)
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });
    } catch (error) {
        logError("An error occurred while processing the request", error);
    }
}
