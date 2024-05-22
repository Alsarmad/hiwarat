export default async (router, config, logger) => {
    const { logError } = logger;
    try {
        // الحصول على كل البلاغات
        router.get('/reports', ReportsController.getAllReports);

        // إنشاء بلاغ جديد
        router.post('/reports', ReportsController.createReport);

        // الحصول على بلاغ بواسطة المعرف
        router.get('/reports/:id', ReportsController.getReportById);

        // تحديث بلاغ بواسطة المعرف
        router.put('/reports/:id', ReportsController.updateReport);

        // حذف بلاغ بواسطة المعرف
        router.delete('/reports/:id', ReportsController.deleteReport);
    } catch (error) {
        logError("An error occurred while processing the request", error);
    }
}
