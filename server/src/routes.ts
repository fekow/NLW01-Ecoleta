import { Router } from 'express';
import { celebrate } from "celebrate";
import multer from 'multer';
import multerConfig from './config/multer';
import celebrateConfig from './config/celebrate'
import PointsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController'

const upload = multer(multerConfig)
const routes = Router();

routes.get('/items', ItemsController.index);
routes.get('/points', PointsController.index);
routes.get('/points/:id', PointsController.show);

routes.post(
  '/points',
  upload.single('image'),
  celebrate(celebrateConfig, { abortEarly: false }),
  PointsController.create); // falta pegar os erros e passar pro frontend

export default routes;
