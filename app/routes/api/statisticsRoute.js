import { Router } from 'express';
import StatisticsController from "../../controllers/api/v1/statisticsController.js";

const router = Router();

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

export default router;
