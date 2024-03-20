import { Router } from 'express';
import CategoriesController from "../../controllers/api/v1/categoriesController.js";

const router = Router();

// الحصول على كل الفئات
router.get('/categories', CategoriesController.getAllCategories);

// إنشاء فئة جديدة
router.post('/categories', CategoriesController.createCategory);

// الحصول على فئة بواسطة المعرف
router.get('/categories/:id', CategoriesController.getCategoryById);

// تحديث فئة بواسطة المعرف
router.put('/categories/:id', CategoriesController.updateCategory);

// حذف فئة بواسطة المعرف
router.delete('/categories/:id', CategoriesController.deleteCategory);

export default router;
