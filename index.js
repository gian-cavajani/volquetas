const express = require('express');
const router = require('./routes');
const { db } = require('./models');
const cors = require('cors');

//variables de desarrollo
require('dotenv').config({ path: 'variables.env' });

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', router());

(async () => {
  try {
    await db.sync({ alter: true }); // Usar { force: true } solo en desarrollo para reiniciar las tablas
    console.log('DB conectada ' + new Date().getHours() + ':' + new Date().getMinutes());

    const { precargarDatos } = require('./utils/precargarDatos');
    await precargarDatos(); // Precargar datos

    // Iniciar el servidor
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
