import { Router } from 'express';
import Controller from "../../controllers/api/v1/usersControllers.js";
const router = Router();

// Define routes for Users API
router.get('/', Controller.getAllusers);
router.post('/', Controller.createUsers);
router.get('/:id', Controller.getUsersById);
router.put('/:id', Controller.updateUsers);
router.delete('/:id', Controller.deleteUsers);

export default router;