import swaggerUi from 'swagger-ui-express';
import swaggerDoc from '../docs/swaggerDoc.json';
import { Express } from 'express';

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
};