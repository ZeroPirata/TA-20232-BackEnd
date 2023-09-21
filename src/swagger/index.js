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
const statusRoutes = require('./routes/statusRoutes');
const router = require('./routes/index');


// Use the route files in your Express application
app.use('/subtask', subtaskRoutes);
app.use('/task', taskRoutes);
app.use('/user', userRoutes);
app.use('/status', statusRoutes);
app.use('/routes', router);

// Start the server and listen on the defined port
server.listen(port, () => {
  console.log(`Listening on port ${port} (HTTP)`);
});
