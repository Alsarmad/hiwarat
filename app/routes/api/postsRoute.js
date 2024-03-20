import { Router } from 'express';
import PostsController from "../../controllers/api/v1/postsController.js";

const router = Router();

// الحصول على كل المنشورات
router.get('/posts', PostsController.getAllPosts);

// إنشاء منشور جديد
router.post('/posts', PostsController.createPost);

// الحصول على منشور بواسطة المعرف
router.get('/posts/:id', PostsController.getPostById);

// تحديث منشور بواسطة المعرف
router.put('/posts/:id', PostsController.updatePost);

// حذف منشور بواسطة المعرف
router.delete('/posts/:id', PostsController.deletePost);

export default router;
