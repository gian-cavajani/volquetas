const { fechaAleatoriaEnMesAnio, getRandomDate, getRandomInt } = require('./utilsPrecarga');

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
const facturasData = [];
const cajasData = [];

//77 obras
for (let i = 1; i < 78; i++) {
  let cincoseissiete = getRandomInt(5, 7);
  let bool = cincoseissiete > 6;
  let randomFecha = fechaAleatoriaEnMesAnio(cincoseissiete, 2025);
  let fecha = new Date(randomFecha);
  let fechaMasUnDia = new Date(fecha.setDate(fecha.getDate() + 1)).toISOString();
  let randomFechaDos = fechaAleatoriaEnMesAnio(cincoseissiete - 1, 2025);
  let randomChofer = cincoseissiete + 5;

  //pedidos normales:
  pedidosData.push({
    obraId: i,
    descripcion: `Descripción del pedido nuevo numero: ${i}`, //OPCIONAL
    permisoId: null, //OPCIONAL -> se puede agregar luego (permisoId 1 pertenece a volketas 10, por lo que los particulares usan este permiso)

    //campos de PAGOPEDIDOS
    precio: '3200.50',
    pagado: false, // OPCIONAL, si no va pagado:false, si va pagado:true
    tipoPago: 'efectivo', //tipos: 'transferencia', 'efectivo', 'cheque'

    //campos de SUGERENCIA son opcionales:
    horarioSugerido: randomFecha,
    choferSugeridoId: randomChofer,
  });
  pedidosData.push({
    obraId: i,
    descripcion: `Descripción del pedido nuevo numero: ${i + 1}`, //OPCIONAL
    permisoId: null, //OPCIONAL -> se puede agregar luego (permisoId 1 pertenece a volketas 10, por lo que los particulares usan este permiso)

    //campos de PAGOPEDIDOS
    precio: `2${cincoseissiete}00`,
    pagado: false, // OPCIONAL, si no va pagado:false, si va pagado:true
    tipoPago: 'transferencia', //tipos: 'transferencia', 'efectivo', 'cheque'

    //campos de SUGERENCIA son opcionales:
    horarioSugerido: randomFechaDos,
    choferSugeridoId: randomChofer,
  });

  if (i > 35) {
    //pedidos multiples:
    pedidosMultiplesData.push({
      obraId: i,
      descripcion: `Descripción de pedidos multiples ${i}`,
      permisoId: null, //OPCIONAL -> se puede agregar luego
      cantidadMultiple: getRandomInt(2, 4), //solo debe estar en tipo multiple

      //campos de PAGOPEDIDOS
      precio: '3200.50',
      pagado: true,
      tipoPago: 'efectivo',

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
      numeroVolqueta: i + 5 < 10 ? i + 5 : null, //opcional
      tipo: 'entrega', //obligatorio, solo puede ser "entrega" o "levante"
    });

    if (bool) {
      //levantes:
      levantesData.push({
        pedidoId: i, //obligatorio
        choferId: randomChofer, //obligatorio
        horario: fechaMasUnDia, //obligatorio
        numeroVolqueta: i + 5 < 14 ? i + 5 : null, //opcional
        tipo: 'levante',
      });
    }

    //cajas
    cajasData.push({
      fecha: getRandomDate(2024),
      motivo: 'ingreso pedido',
      empleadoId: randomChofer,
      pedidoId: i,
      monto: getRandomInt(2000, 4000),
      descripcion: 'ingreso de pedido',
      moneda: 'peso',
    });
  }
}

for (let i = 1; i < 6; i += 2) {
  facturasData.push({
    pedidosIds: [i, i + 1], //obligatorio
    empresaId: 1, //obligatorio
    particularId: null, //obligatorio
    tipo: i > 2 ? 'credito' : 'contado', //obligatorio
    descripcion: `Factura para empresa 1`, //OPCIONAL
    //  "fechaPago": "2024-12-09",//OPCIONAL
    numeracion: 'A' + i, //OPCIONAL
  });
  facturasData.push({
    pedidosIds: [10 + i, 10 + i + 1], //obligatorio
    empresaId: 2, //obligatorio
    particularId: null, //obligatorio
    tipo: i > 2 ? 'recibo' : 'contado', //obligatorio
    descripcion: `Factura para empresa 2`, //OPCIONAL
    //  "fechaPago": "2024-12-09",//OPCIONAL
    numeracion: 'A' + i + 10, //OPCIONAL
  });
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
const precargarFacturas = async (token) => {
  try {
    for (const factura of facturasData) {
      const response = await axios.post('http://localhost:3000/api/facturas', factura, {
        headers: {
          Authorization: token,
        },
      });
      console.log(`Factura creado con éxito: ${response.data.id}`);
    }
  } catch (error) {
    console.error('Error al precargar Fac:', error.response ? error.response.data : error.message);
  }
};
const precargarCajas = async (token) => {
  try {
    for (const caja of cajasData) {
      const response = await axios.post('http://localhost:3000/api/cajas', caja, {
        headers: {
          Authorization: token,
        },
      });
      console.log(`Caja creada con éxito: ${response.data.id}`);
    }
  } catch (error) {
    console.error('Error al precargar CAja:', error.response ? error.response.data : error.message);
  }
};

const precargaFull = async () => {
  try {
    let token = await loginUsuario();
    await precargarPedidos(token);
    await precargarPedidosMultiples(token);
    await precargarEntregas(token);
    await precargarLevantes(token);
    await precargarFacturas(token);
    await precargarCajas(token);
  } catch (error) {}
};

// Ejecutar la precarga de pedidos
precargaFull();
