export default async (router, config, logger, utils, DBManager) => {
    const { logError } = logger;
    try {

        const { translationManager, getElapsedTime } = utils;

        router.get('/', async (req, res) => {
            try {

                const options = {
                    getElapsedTime: getElapsedTime,
                };
                return res.status(200).render("forum", options);

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });
    } catch (error) {
        logError("An error occurred while processing the request", error);
    }
}