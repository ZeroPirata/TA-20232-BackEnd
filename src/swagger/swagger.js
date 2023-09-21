const swaggerAutogen = require('swagger-autogen')({ language: 'pt-BR' });

const outputFile = './swagger_output.json';
const endpointsFiles = ['./src/routes/subtaskRoutes.ts', './src/routes/taskRoutes.ts', './src/routes/userRoutes.ts', './src/routes/statusRoutes.ts']; // Add all your route files here

swaggerAutogen(outputFile, endpointsFiles);
