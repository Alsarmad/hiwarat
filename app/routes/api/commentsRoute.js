import { Router } from 'express';
import CommentsController from "../../controllers/api/v1/commentsController.js";

const router = Router();

// الحصول على كل التعليقات
router.get('/comments', CommentsController.getAllComments);

// إنشاء تعليق جديد
router.post('/comments', CommentsController.createComment);

// الحصول على تعليق بواسطة المعرف
router.get('/comments/:id', CommentsController.getCommentById);

// تحديث تعليق بواسطة المعرف
router.put('/comments/:id', CommentsController.updateComment);

// حذف تعليق بواسطة المعرف
router.delete('/comments/:id', CommentsController.deleteComment);

export default router;
