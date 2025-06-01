import { Router } from "express"
import { createEmployee, deleteEmployeeById, getAllEmployees, getAllUsers, getEmployeeById, updateEmployeeById } from "../controllers/employee.controller.js";
import { ownerRoute, protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/create', protectRoute, ownerRoute, createEmployee)
router.get('/all', protectRoute, getAllUsers)
router.get('/', protectRoute, getAllEmployees)
router.get('/:id', protectRoute, getEmployeeById)
router.post('/:id', protectRoute, ownerRoute, updateEmployeeById)
router.delete('/:id', protectRoute, ownerRoute, deleteEmployeeById)

export default router;