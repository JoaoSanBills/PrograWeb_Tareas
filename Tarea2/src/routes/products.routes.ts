import { Router } from "express";
import { ProductsController } from "../controllers/products.controller.js";

const router = Router();
const controller = new ProductsController();

// Rutas RESTful: el verbo HTTP define la acción, la URL solo tiene el recurso
router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.deleteLogic.bind(controller));
router.patch("/:id/price", controller.changePrice.bind(controller));

export default router;
