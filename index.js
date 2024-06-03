const express = require('express');
const router = require('./routes');
const { db } = require('./models');

//variables de desarrollo
require('dotenv').config({ path: 'variables.env' });

const app = express();

app.use(express.json());

app.use('/api', router());
(async () => {
  try {
    await db.sync({ force: true }); // Usar { force: true } solo en desarrollo para reiniciar las tablas
    console.log(
      'DB conectada ' + new Date().getHours() + ':' + new Date().getMinutes()
    );

    const { precargarDatos } = require('./functions/precargarDatos');
    await precargarDatos(); // Precargar datos

    // Iniciar el servidor
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
