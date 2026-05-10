import { Router } from "express";
import * as ubicacionController from "../controllers/ubicacionController.js";
import * as categoriaController from "../controllers/categoriaController.js";
import * as proveedorController from "../controllers/proveedorController.js";
import * as productoController from "../controllers/productoController.js";

const router = Router();

router.get("/paises", ubicacionController.getPaises);
router.get("/provincias", ubicacionController.getProvincias);
router.get("/ciudades", ubicacionController.getCiudades);

router.get("/categorias", categoriaController.list);
router.post("/categorias", categoriaController.create);
router.put("/categorias/:id", categoriaController.update);
router.delete("/categorias/:id", categoriaController.remove);

router.get("/proveedores", proveedorController.list);
router.get("/proveedores/:id", proveedorController.getOne);
router.post("/proveedores", proveedorController.create);
router.put("/proveedores/:id", proveedorController.update);
router.delete("/proveedores/:id", proveedorController.remove);

router.get("/productos", productoController.list);
router.post("/productos", productoController.create);
router.put("/productos/:id", productoController.update);
router.delete("/productos/:id", productoController.remove);

export default router;
