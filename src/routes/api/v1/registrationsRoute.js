export default async (router, config, logger) => {
    const { logError } = logger;
    try {
        // الحصول على كل التسجيلات
        router.get('/registrations', RegistrationsController.getAllRegistrations);

        // إنشاء تسجيل جديد
        router.post('/registrations', RegistrationsController.createRegistration);

        // الحصول على تسجيل بواسطة المعرف
        router.get('/registrations/:id', RegistrationsController.getRegistrationById);

        // تحديث تسجيل بواسطة المعرف
        router.put('/registrations/:id', RegistrationsController.updateRegistration);

        // حذف تسجيل بواسطة المعرف
        router.delete('/registrations/:id', RegistrationsController.deleteRegistration);
    } catch (error) {
        logError(error);
    }
}
