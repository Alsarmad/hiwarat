import { Router } from 'express';
import RegistrationsController from "../../controllers/api/v1/registrationsController.js";

const router = Router();

// الحصول على كل التسجيلات
router.get('/registrations', RegistrationsController.getAllRegistrations);

// إنشاء تسجيل جديد
router.post('/registrations', RegistrationsController.createRegistration);

// الحصول على تسجيل بواسطة المعرف
router.get('/registrations/:id', RegistrationsController.getRegistrationById);

// تحديث تسجيل بواسطة المعرف
router.put('/registrations/:id', RegistrationsController.updateRegistration);

// حذف تسجيل بواسطة المعرف
router.delete('/registrations/:id', RegistrationsController.deleteRegistration);

export default router;
