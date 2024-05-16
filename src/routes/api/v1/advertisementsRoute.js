export default async (router, config, logger) => {
    const { logError } = logger;
    try {
        // الحصول على كل الإعلانات
        router.get('/advertisements', (req, res) => {
            const APIKEY = req.headers["Api-Key"];
            const APIUSERNAME = req.headers["Api-Username"];
            if (!APIKEY || !APIUSERNAME) return res.status(401).json({ message: 'الرجاء توفير الرؤوس "Api-Key" و "Api-Username"' });
            AdvertisementsController.getAllAdvertisements
        });

        // إنشاء إعلان جديد
        router.post('/advertisements', AdvertisementsController.createAdvertisement);

        // الحصول على إعلان بواسطة المعرف
        router.get('/advertisements/:id', AdvertisementsController.getAdvertisementById);

        // تحديث إعلان بواسطة المعرف
        router.put('/advertisements/:id', AdvertisementsController.updateAdvertisement);

        // حذف إعلان بواسطة المعرف
        router.delete('/advertisements/:id', AdvertisementsController.deleteAdvertisement);
    } catch (error) {
        logError(error);
    }
}
