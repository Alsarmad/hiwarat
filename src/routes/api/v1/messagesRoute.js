export default async (router, config, logger) => {
    const { logError } = logger;
    try {
        // الحصول على كل الرسائل الخاصة
        router.get('/messages', MessagesController.getAllMessages);

        // إنشاء رسالة خاصة جديدة
        router.post('/messages', MessagesController.createMessage);

        // الحصول على رسالة خاصة بواسطة المعرف
        router.get('/messages/:id', MessagesController.getMessageById);

        // تحديث رسالة خاصة بواسطة المعرف
        router.put('/messages/:id', MessagesController.updateMessage);

        // حذف رسالة خاصة بواسطة المعرف
        router.delete('/messages/:id', MessagesController.deleteMessage);
    } catch (error) {
        logError(error);
    }
}
