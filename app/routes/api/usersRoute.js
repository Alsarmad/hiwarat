import { Router } from 'express';
import UserController from "../../controllers/api/v1/usersController.js";
const router = Router();

// الحصول على كل المستخدمين
router.get('/users', UserController.getAllUsers);

// إنشاء مستخدم جديد
router.post('/users', UserController.createUser);

// الحصول على مستخدم بواسطة المعرف
router.get('/users/:id', UserController.getUserById);

// تحديث مستخدم بواسطة المعرف
router.put('/users/:id', UserController.updateUser);

// حذف مستخدم بواسطة المعرف
router.delete('/users/:id', UserController.deleteUser);

export default router;