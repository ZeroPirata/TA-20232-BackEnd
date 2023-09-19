const express = require('express');
const http = require('http');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');

// Create an Express application
const app = express();

// Create an HTTP server using the Express application
const server = http.createServer(app);

// Define the port to listen on
const port = process.env.PORT || 3000;

// Serve Swagger UI for API documentation
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Include route files
const subtaskRoutes = require('./routes/subtaskRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');


// Use the route files in your Express application
app.use('/api1', subtaskRoutes);
app.use('/api2', taskRoutes);
app.use('/api3', userRoutes);

// Start the server and listen on the defined port
server.listen(port, () => {
  console.log(`Listening on port ${port} (HTTP)`);
});
