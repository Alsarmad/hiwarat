import { Router } from 'express';
import HashtagsController from "../../controllers/api/v1/hashtagsController.js";

const router = Router();

// الحصول على كل الهاشتاجات
router.get('/hashtags', HashtagsController.getAllHashtags);

// إنشاء هاشتاج جديد
router.post('/hashtags', HashtagsController.createHashtag);

// الحصول على هاشتاج بواسطة المعرف
router.get('/hashtags/:id', HashtagsController.getHashtagById);

// تحديث هاشتاج بواسطة المعرف
router.put('/hashtags/:id', HashtagsController.updateHashtag);

// حذف هاشتاج بواسطة المعرف
router.delete('/hashtags/:id', HashtagsController.deleteHashtag);

export default router;
