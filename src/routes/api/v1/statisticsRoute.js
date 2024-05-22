export default async (router, config, logger) => {
    const { logError } = logger;
    try {
        // الحصول على كل الإحصائيات
        router.get('/statistics', StatisticsController.getAllStatistics);

        // إنشاء إحصائية جديدة
        router.post('/statistics', StatisticsController.createStatistic);

        // الحصول على إحصائية بواسطة المعرف
        router.get('/statistics/:id', StatisticsController.getStatisticById);

        // تحديث إحصائية بواسطة المعرف
        router.put('/statistics/:id', StatisticsController.updateStatistic);

        // حذف إحصائية بواسطة المعرف
        router.delete('/statistics/:id', StatisticsController.deleteStatistic);
    } catch (error) {
        logError("An error occurred while processing the request", error);
    }
}