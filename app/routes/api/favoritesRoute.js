import { Router } from 'express';
import FavoritesController from "../../controllers/api/v1/favoritesController.js";

const router = Router();

// الحصول على كل المفضلات
router.get('/favorites', FavoritesController.getAllFavorites);

// إنشاء مفضلة جديدة
router.post('/favorites', FavoritesController.createFavorite);

// الحصول على مفضلة بواسطة المعرف
router.get('/favorites/:id', FavoritesController.getFavoriteById);

// تحديث مفضلة بواسطة المعرف
router.put('/favorites/:id', FavoritesController.updateFavorite);

// حذف مفضلة بواسطة المعرف
router.delete('/favorites/:id', FavoritesController.deleteFavorite);

export default router;
