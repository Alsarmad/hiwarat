import { Router } from 'express';
import NotificationsController from "../../controllers/api/v1/notificationsController.js";

const router = Router();

// الحصول على كل الإشعارات
router.get('/notifications', NotificationsController.getAllNotifications);

// إنشاء إشعار جديد
router.post('/notifications', NotificationsController.createNotification);

// الحصول على إشعار بواسطة المعرف
router.get('/notifications/:id', NotificationsController.getNotificationById);

// تحديث إشعار بواسطة المعرف
router.put('/notifications/:id', NotificationsController.updateNotification);

// حذف إشعار بواسطة المعرف
router.delete('/notifications/:id', NotificationsController.deleteNotification);

export default router;
