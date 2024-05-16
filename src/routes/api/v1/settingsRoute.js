export default async (router, config, logger) => {
    const { logError } = logger;
    try {
        // الحصول على كل الإعدادات
        router.get('/settings', SettingsController.getAllSettings);

        // إنشاء إعداد جديد
        router.post('/settings', SettingsController.createSetting);

        // الحصول على إعداد بواسطة المعرف
        router.get('/settings/:id', SettingsController.getSettingById);

        // تحديث إعداد بواسطة المعرف
        router.put('/settings/:id', SettingsController.updateSetting);

        // حذف إعداد بواسطة المعرف
        router.delete('/settings/:id', SettingsController.deleteSetting);
    } catch (error) {
        logError(error);
    }
}
