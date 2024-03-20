import { Router } from 'express';
import RelationshipsController from "../../controllers/api/v1/relationshipsController.js";

const router = Router();

// الحصول على كل العلاقات بين المستخدمين
router.get('/relationships', RelationshipsController.getAllRelationships);

// إنشاء علاقة جديدة بين المستخدمين
router.post('/relationships', RelationshipsController.createRelationship);

// الحصول على علاقة بين المستخدمين بواسطة المعرف
router.get('/relationships/:id', RelationshipsController.getRelationshipById);

// تحديث علاقة بين المستخدمين بواسطة المعرف
router.put('/relationships/:id', RelationshipsController.updateRelationship);

// حذف علاقة بين المستخدمين بواسطة المعرف
router.delete('/relationships/:id', RelationshipsController.deleteRelationship);

export default router;
