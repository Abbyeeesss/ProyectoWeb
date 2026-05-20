import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as ubicacionController from "../controllers/ubicacionController.js";
import * as categoriaController from "../controllers/categoriaController.js";
import * as proveedorController from "../controllers/proveedorController.js";
import * as productoController from "../controllers/productoController.js";
import * as ventaController from "../controllers/ventaController.js";
import * as puntoReordenController from "../controllers/puntoReordenController.js";

const router = Router();

router.get("/paises", asyncHandler(ubicacionController.getPaises));
router.get("/provincias", asyncHandler(ubicacionController.getProvincias));
router.get("/ciudades", asyncHandler(ubicacionController.getCiudades));

router.get("/categorias", asyncHandler(categoriaController.list));
router.post("/categorias", asyncHandler(categoriaController.create));
router.put("/categorias/:id", asyncHandler(categoriaController.update));
router.delete("/categorias/:id", asyncHandler(categoriaController.remove));

router.get("/proveedores", asyncHandler(proveedorController.list));
router.get("/proveedores/:id", asyncHandler(proveedorController.getOne));
router.post("/proveedores", asyncHandler(proveedorController.create));
router.put("/proveedores/:id", asyncHandler(proveedorController.update));
router.delete("/proveedores/:id", asyncHandler(proveedorController.remove));

router.get("/productos", asyncHandler(productoController.list));
router.post("/productos", asyncHandler(productoController.create));
router.put("/productos/:id", asyncHandler(productoController.update));
router.delete("/productos/:id", asyncHandler(productoController.remove));

router.get("/ventas/promedio-diario", asyncHandler(ventaController.promedioDiarioPorProducto));
router.get("/ventas", asyncHandler(ventaController.historialPorRango));

router.get("/punto-reorden", asyncHandler(puntoReordenController.listar));
router.post("/punto-reorden/guardar", asyncHandler(puntoReordenController.guardar));

export default router;
