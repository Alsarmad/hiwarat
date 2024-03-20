import { Router } from 'express';
import AdvertisementsController from "../../controllers/api/v1/advertisementsController.js";

const router = Router(); 

// الحصول على كل الإعلانات
router.get('/advertisements', AdvertisementsController.getAllAdvertisements);

// إنشاء إعلان جديد
router.post('/advertisements', AdvertisementsController.createAdvertisement);

// الحصول على إعلان بواسطة المعرف
router.get('/advertisements/:id', AdvertisementsController.getAdvertisementById);

// تحديث إعلان بواسطة المعرف
router.put('/advertisements/:id', AdvertisementsController.updateAdvertisement);

// حذف إعلان بواسطة المعرف
router.delete('/advertisements/:id', AdvertisementsController.deleteAdvertisement);

export default router;
