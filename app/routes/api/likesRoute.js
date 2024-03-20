import { Router } from 'express';
import LikesController from "../../controllers/api/v1/likesController.js";

const router = Router();

// الحصول على كل الإعجابات
router.get('/likes', LikesController.getAllLikes);

// إنشاء إعجاب جديد
router.post('/likes', LikesController.createLike);

// الحصول على إعجاب بواسطة المعرف
router.get('/likes/:id', LikesController.getLikeById);

// تحديث إعجاب بواسطة المعرف
router.put('/likes/:id', LikesController.updateLike);

// حذف إعجاب بواسطة المعرف
router.delete('/likes/:id', LikesController.deleteLike);

export default router;
