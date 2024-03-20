import { Router } from 'express';
import SettingsController from "../../controllers/api/v1/settingsController.js";

const router = Router();

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

export default router;
