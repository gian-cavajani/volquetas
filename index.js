const express = require('express');
const router = require('./routes');
const db = require('./config/db');

//Conectar a DB y sincroniza los modelos
db.sync()
  .then(() =>
    console.log(
      'DB conectada ' + new Date().getHours() + ':' + new Date().getMinutes()
    )
  )
  .catch((error) => console.log(error));

//variables de desarrollo
require('dotenv').config({ path: 'variables.env' });

const app = express();

app.use(express.json());

app.use('/api', router());

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});
