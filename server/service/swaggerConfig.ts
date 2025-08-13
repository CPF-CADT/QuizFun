import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'QuizFun API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for QuizFun - A real-time quiz application',
    contact: {
      name: 'QuizFun Development Team',
      email: 'support@quizfun.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT}`, 
      description: 'Development server',
    },
    {
      url: 'https://api.quizfun.com',
      description: 'Production server',
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token in the format: Bearer <token>'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'Refresh token stored in HTTP-only cookie'
      }
    },
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        },
        description: 'Page number for pagination'
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10
        },
        description: 'Number of items per page (max 100)'
      },
      SearchParam: {
        name: 'search',
        in: 'query',
        schema: {
          type: 'string'
        },
        description: 'Search term for filtering results'
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Unauthorized access'
                }
              }
            }
          }
        }
      },
      NotFoundError: {
        description: 'The specified resource was not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Resource not found'
                }
              }
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Validation failed'
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Internal server error'
                },
                error: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  },
  security: [
    { bearerAuth: [] }
  ],
  tags: [
    {
      name: 'User',
      description: 'User management and authentication operations'
    },
    {
      name: 'Quiz',
      description: 'Quiz creation, management, and gameplay operations'
    },
    {
      name: 'Game',
      description: 'Real-time game session management'
    },
    {
      name: 'Service',
      description: 'Utility and service endpoints'
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: [
    './controller/*.ts',
    './routes/*.ts',
    './model/*.ts'
  ], 
};

export const swaggerSpec = swaggerJSDoc(options);
