const bcrypt = require('bcryptjs');
const moment = require('moment');
const { randomUUID, getRandomValues } = require('crypto');
const { getRandomModelo, getRandomString, getRandomDetalleResiduos, getRandomDireccion, getRandomInt, getRandomName, getRandomEmail, getRandomPhone } = require('./utilsPrecarga');

const axios = require('axios');

const loginUsuario = async () => {
  try {
    const response = await axios.post(`http://localhost:3000/api/usuarios/login`, { email: 'carola@example.com', password: '1' });
    let data = await response.data;
    return data.token;
  } catch (error) {
    console.log('error al iniciar sesion', error);
  }
};

const pedidosData = [];
const pedidosMultiplesData = [];
const entregasData = [];
const levantesData = [];

for (let i = 1; i < 40; i++) {
  let randomObra = getRandomInt(1, 50);
  let randomFecha = `2024-${getRandomInt(10, 12)}-${getRandomInt(10, 29)}T${getRandomInt(10, 19)}:00:00`;
  let bool = randomObra > 20;
  let randomChofer = getRandomInt(9, 14);
  let movimiento;

  //pedidos normales:
  pedidosData.push({
    obraId: randomObra,
    descripcion: `Descripción del pedido nuevo numero: ${i}`, //OPCIONAL
    permisoId: null, //OPCIONAL -> se puede agregar luego (permisoId 1 pertenece a volketas 10, por lo que los particulares usan este permiso)

    //campos de PAGOPEDIDOS
    precio: '3200.50',
    pagado: bool, // OPCIONAL, si no va pagado:false, si va pagado:true
    tipoPago: bool ? 'efectivo' : 'transferencia', //tipos: 'transferencia', 'efectivo', 'cheque'

    //campos de SUGERENCIA son opcionales:
    horarioSugerido: randomFecha,
    choferSugeridoId: randomChofer,
  });

  if (i > 35) {
    //pedidos multiples:
    pedidosMultiplesData.push({
      obraId: randomObra,
      descripcion: `Descripción de pedidos multiples ${i}`,
      permisoId: null, //OPCIONAL -> se puede agregar luego
      cantidadMultiple: getRandomInt(2, 4), //solo debe estar en tipo multiple

      //campos de PAGOPEDIDOS
      precio: '3200.50',
      pagado: bool,
      tipoPago: bool ? 'efectivo' : 'transferencia',

      //campos de SUGERENCIA son opcionales, en pedido multiple todos tendran la misma sugerencia de entrega:
      horarioSugerido: randomFecha,
      choferSugeridoId: randomChofer,
    });
  } else {
    //entregas:
    entregasData.push({
      pedidoId: i, //obligatorio
      choferId: randomChofer, //obligatorio
      horario: randomFecha, //obligatorio
      numeroVolqueta: i < 20 ? i : null, //opcional
      tipo: 'entrega', //obligatorio, solo puede ser "entrega" o "levante"
      // "tipo": "levante"
    });

    if (bool) {
      //levantes:
      levantesData.push({
        pedidoId: i, //obligatorio
        choferId: randomChofer, //obligatorio
        horario: randomFecha, //obligatorio
        numeroVolqueta: i < 20 ? i : null, //opcional
        tipo: 'levante',
      });
    }
  }
}

// Función para precargar pedidos
const precargarPedidos = async (token) => {
  try {
    for (const pedido of pedidosData) {
      const response = await axios.post('http://localhost:3000/api/pedidos/nuevo', pedido, {
        headers: {
          Authorization: token,
        },
      });
      console.log(`Pedido creado con éxito: ${response.data.nuevoPedido.id}`);
    }
  } catch (error) {
    console.error('Error al precargar pedidos:', error.response ? error.response.data : error.message);
  }
};
const precargarPedidosMultiples = async (token) => {
  try {
    for (const pedido of pedidosMultiplesData) {
      const response = await axios.post('http://localhost:3000/api/pedidos/multiple', pedido, {
        headers: {
          Authorization: token,
        },
      });
      console.log(`Pedido Multiple creado con éxito: ${response.data.map((p) => p.id)}`);
    }
  } catch (error) {
    console.error('Error al precargar pedidos multiples:', error.response ? error.response.data : error.message);
  }
};

const precargarEntregas = async (token) => {
  try {
    for (const movimiento of entregasData) {
      const response = await axios.post('http://localhost:3000/api/movimientos', movimiento, {
        headers: {
          Authorization: token,
        },
      });
      console.log(`Entrega creada con éxito: ${response.data.id}`);
    }
  } catch (error) {
    console.error('Error al precargar Entregas:', error.response ? error.response.data : error.message);
  }
};
const precargarLevantes = async (token) => {
  try {
    for (const movimiento of levantesData) {
      const response = await axios.post('http://localhost:3000/api/movimientos', movimiento, {
        headers: {
          Authorization: token,
        },
      });
      console.log(`Levante creado con éxito: ${response.data.id}`);
    }
  } catch (error) {
    console.error('Error al precargar Levantes:', error.response ? error.response.data : error.message);
  }
};

const precargaFull = async () => {
  try {
    let token = await loginUsuario();
    await precargarPedidos(token);
    await precargarPedidosMultiples(token);
    await precargarEntregas(token);
    await precargarLevantes(token);
  } catch (error) {}
};

// Ejecutar la precarga de pedidos
precargaFull();
