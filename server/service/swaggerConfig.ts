import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Tech Gear API',
    version: '1.0.0',
    description: 'API documentation',
  },
  servers: [
    {
      url: 'http://localhost:3000', 
      description: 'Development server',
    },
  ],
  components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ['./controller/*.ts'], 
};

export const swaggerSpec = swaggerJSDoc(options);
