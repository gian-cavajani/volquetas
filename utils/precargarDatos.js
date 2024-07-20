const express = require('express');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { randomUUID, getRandomValues } = require('crypto');
const precargarPedidos = require('./precargarPedidos');
const {
  fechaAleatoriaEnMesAnio,
  getRandomDate,
  getRandomModelo,
  getRandomString,
  getRandomDetalleResiduos,
  getRandomDireccion,
  getRandomInt,
  getRandomName,
  getRandomEmail,
  getRandomPhone,
} = require('./utilsPrecarga');
const {
  Config,
  Permisos,
  Obras,
  ObraDetalles,
  Particulares,
  ContactoEmpresas,
  Empresas,
  Jornales,
  Servicios,
  Camiones,
  Empleados,
  Telefonos,
  Usuarios,
  HistoricoUsoCamion,
  Volquetas,
  Cajas,
} = require('../models');

exports.precargarDatos = async () => {
  try {
    // Verificar si hay datos existentes
    const existingEmpleados = await Empleados.count();
    const existingUbicaciones = await Obras.count();
    const existingCamiones = await Camiones.count();
    const existingUsuarios = await Usuarios.count();
    const existingTelefonos = await Telefonos.count();
    const existingHistorico = await HistoricoUsoCamion.count();
    const existingServicios = await Servicios.count();
    const existingJornales = await Jornales.count();
    const existingClienteEmpresas = await Empresas.count();
    const existingClienteParticulares = await Particulares.count();
    const existingContactoEmpresas = await ContactoEmpresas.count();
    const existingObras = await Obras.count();
    const existingObraDetalles = await ObraDetalles.count();
    const existingPermisos = await Permisos.count();
    const existingvolquetas = await Volquetas.count();
    const existingCajas = await Cajas.count();

    if (
      existingClienteEmpresas > 0 ||
      existingUbicaciones > 0 ||
      existingClienteParticulares > 0 ||
      existingContactoEmpresas > 0 ||
      existingEmpleados > 0 ||
      existingCamiones > 0 ||
      existingUsuarios > 0 ||
      existingTelefonos > 0 ||
      existingHistorico > 0 ||
      existingServicios > 0 ||
      existingJornales > 0 ||
      existingObras > 0 ||
      existingPermisos > 0 ||
      existingvolquetas > 0 ||
      existingCajas > 0 ||
      existingObraDetalles > 0
    ) {
      console.log('Datos ya existen. No se realizará la precarga.');
      return;
    }

    // Precargar datos de ejemplo
    //Arrays para la precarga:
    const empresas = [];
    const particulares = [];
    const obrasData = [];
    const obrasDetalle = [];
    const contactos = [];
    const telefonos = [];
    const camiones = [];
    const empleados = [];
    const servicios = [];
    const jornales = [];
    const permisos = [];
    const volquetas = [];
    const cajas = [];

    for (let i = 1; i < 20; i++) {
      //CAJAS
      cajas.push({
        fecha: fechaAleatoriaEnMesAnio(6, 2024),
        motivo: i > 10 ? 'vale' : 'gasto',
        empleadoId: i > 10 ? getRandomInt(1, 10) : null,
        pedidoId: null,
        monto: i > 10 ? getRandomInt(-1, -14000) : getRandomInt(-1, -4000),
        descripcion: i > 10 ? 'vale para empleado' : 'gasto operativo',
        moneda: 'peso',
      });
      cajas.push({
        fecha: fechaAleatoriaEnMesAnio(6, 2024),
        motivo: i > 10 ? 'ingreso' : 'ingreso cochera',
        empleadoId: null,
        pedidoId: null,
        monto: i > 10 ? getRandomInt(1, 14000) : getRandomInt(1, 2000),
        descripcion: i > 10 ? 'ingreso nuevo en pesos' : '',
        moneda: i > 10 ? 'peso' : 'dolar',
      });

      //VOLQUETAS
      volquetas.push({
        numeroVolqueta: i,
        estado: i > 2 ? 'ok' : 'perdida',
        tipo: i > 18 ? 'chica' : 'grande',
      });

      //EMPRESAS
      const apellido = getRandomName('apellido');
      empresas.push({
        nombre: `${apellido}'s Company ${i}`,
        rut: `10000000${i}`,
        razonSocial: `${apellido}${i} SRL`,
        descripcion: `Descripción de ${apellido}${i} SRL`,
      });

      //CONTACTO EMPRESAS
      for (let j = 1; j < 3; j++) {
        const nombre_contactos = getRandomName();
        contactos.push({
          nombre: nombre_contactos,
          descripcion: `Descripción de ${nombre_contactos}`,
          email: `${nombre_contactos}@empresa.com`.replaceAll(' ', ''),
          empresaId: i,
        });
      }

      //OBRAS
      for (let j = 1; j < 5; j++) {
        //OBRAS
        const calle = getRandomDireccion('calle');
        const esquina = getRandomDireccion('calle');
        const barrio = getRandomDireccion('barrio');
        const numeroPuerta = getRandomInt(1000, 9999).toString();
        obrasData.push({
          calle,
          esquina,
          barrio,
          coordenadas: 'placeholder',
          numeroPuerta,
          descripcion: `Obra en ${calle} ${numeroPuerta}, esquina ${esquina}`,
          particularId: j < 3 ? null : i,
          empresaId: j < 3 ? i : null,
        });
      }
      //OBRAS-DETALLE
      obrasDetalle.push({
        obraId: i,
        detalleResiduos: getRandomDetalleResiduos(),
        residuosMezclados: Math.random() < 0.5,
        residuosReciclados: Math.random() < 0.5,
        frecuenciaSemanal: [getRandomInt(1, 3), getRandomInt(4, 7)],
        dias: 'A SOLICITUD',
        destinoFinal: 'USINA 8',
      });

      //PARTICULARES
      const nombre = getRandomName();
      particulares.push({
        nombre,
        cedula: getRandomInt(10000000, 60000000) + '',
        descripcion: `Descripción de ${nombre}`,
        email: `${nombre}@particular.com`.replaceAll(' ', ''),
      });

      //empleados
      empleados.push({
        nombre: nombre,
        cedula: getRandomInt(10000000, 60000000) + '',
        rol: i > 6 ? 'chofer' : 'normal',
        fechaEntrada: getRandomDate(2022),
        fechaSalida: i > 17 ? getRandomDate(2024) : null,
        habilitado: i > 17 ? false : true,
        direccion: getRandomDireccion('calle'),
      });

      //TELEFONOS
      const tipo = i > 10 ? 'telefono' : 'celular';
      telefonos.push({
        telefono: getRandomPhone(tipo),
        tipo,
        extension: i > 10 ? getRandomInt(100, 9000) : null,
        empleadoId: i,
        contactoEmpresaId: null,
        particularId: null,
      });

      telefonos.push({
        telefono: getRandomPhone(tipo),
        tipo,
        extension: i > 10 ? getRandomInt(100, 9000) : null,
        empleadoId: null,
        contactoEmpresaId: null,
        particularId: i,
      });

      telefonos.push({
        telefono: getRandomPhone(tipo),
        tipo,
        extension: i > 10 ? getRandomInt(100, 9000) : null,
        empleadoId: null,
        contactoEmpresaId: i,
        particularId: null,
      });

      //SERVICIOS-CAMION
      const modelo = getRandomModelo();
      const tipoServicios = ['arreglo', 'service', 'chequeo', 'pintura'];
      if (i < 5) {
        camiones.push({
          matricula: `${getRandomString(3)}-${getRandomInt(1000, 9999)}`,
          modelo,
          anio: getRandomInt(1960, 2024),
          estado: i < 5 ? 'sano' : 'roto',
        });

        servicios.push({
          camionId: i,
          fecha: getRandomDate(2022),
          tipo: tipoServicios[Math.floor(Math.random() * tipoServicios.length)],
          precio: getRandomInt(1, 100000),
          moneda: 'peso',
          descripcion: `servicio de ${modelo}`,
        });
        servicios.push({
          camionId: i,
          fecha: getRandomDate(2023),
          tipo: tipoServicios[Math.floor(Math.random() * tipoServicios.length)],
          precio: getRandomInt(1, 9000),
          moneda: 'dolar',
          descripcion: `servicio de ${modelo}`,
        });
      }

      //JORNALES
      const tipoJornal = ['trabajo', 'trabajo', 'licencia', 'enfermedad', 'falta'];
      for (let j = 1; j < 20; j++) {
        let fechaMes = `2024-06-`;
        if (i > 9) {
          fechaMes = fechaMes + i;
        } else {
          fechaMes = fechaMes + '0' + i;
        }

        const tipoJ = tipoJornal[Math.floor(Math.random() * tipoJornal.length)];
        let num = getRandomInt(6, 9);
        let horasExtra = getRandomInt(1, 4);
        let entrada = `0${num}:00:00`;
        let salida = `${num + 8 + horasExtra}:00:00`;
        if (tipoJ !== 'trabajo') {
          entrada = null;
          salida = null;
          horasExtra = null;
        }

        jornales.push({
          creadoPor: 1,
          empleadoId: j,
          fecha: new Date(fechaMes),
          entrada,
          salida,
          tipo: tipoJ,
          horasExtra,
        });
      }
    }
    // --------------------EMPLEADOS--------------------
    await Empleados.bulkCreate([
      { nombre: 'Carolina Garcia', cedula: getRandomInt(10000000, 60000000) + '', rol: 'admin', fechaEntrada: moment('2024-06-02').toDate() },
      { nombre: 'Ana Gomez', cedula: getRandomInt(10000000, 60000000) + '', rol: 'normal', fechaEntrada: moment('2024-06-03').toDate() },
      ...empleados,
    ]);
    // --------------------CAMIONES--------------------
    await Camiones.bulkCreate(camiones);
    // --------------------USUARIOS--------------------
    await Usuarios.bulkCreate([
      { empleadoId: 1, email: 'carola@example.com', password: await bcrypt.hash('1', 10), rol: 'admin', activo: true },
      { empleadoId: 2, email: 'ana@example.com', password: await bcrypt.hash('1', 10), rol: 'normal' },
    ]);
    // --------------------CLIENTE EMPRESA--------------------
    empresas.unshift({
      nombre: 'Volketas 10',
      rut: '1',
      razonSocial: 'Volketas 10 SRL',
    });
    await Empresas.bulkCreate(empresas);
    // --------------------CLIENTE PARTICULAR--------------------
    await Particulares.bulkCreate(particulares);
    // --------------------UBICACIONES--------------------
    obrasData.unshift({
      calle: 'calle 1',
      esquina: 'calle 2',
      barrio: 'barrio1',
      coordenadas: 'placeholder',
      numeroPuerta: 1,
      descripcion: `Obra 1`,
      particularId: null,
      empresaId: 1,
    });

    await Obras.bulkCreate(obrasData);
    await ObraDetalles.bulkCreate(obrasDetalle);
    // --------------------CONTACTO EMPRESA--------------------
    await ContactoEmpresas.bulkCreate(contactos);
    // --------------------TELEFONOS--------------------
    await Telefonos.bulkCreate(telefonos);
    // --------------------HISTORICO-USO-CAMION--------------------
    await HistoricoUsoCamion.bulkCreate([
      { empleadoId: 3, camionId: 1, fechaInicio: new Date('2024-06-01') },
      { empleadoId: 4, camionId: 1, fechaInicio: new Date('2024-08-16'), fechaFin: new Date('2024-08-30') },
      { empleadoId: 4, camionId: 2, fechaInicio: new Date('2024-06-30'), fechaFin: new Date('2024-07-30') },
      { empleadoId: 5, camionId: 2, fechaInicio: new Date('2024-07-30') },
      { empleadoId: 2, camionId: 3, fechaInicio: new Date('2024-10-05'), fechaFin: new Date('2024-10-15') },
      { empleadoId: 3, camionId: 3, fechaInicio: new Date('2024-08-01'), fechaFin: new Date('2024-08-15') },
      { empleadoId: 5, camionId: 4, fechaInicio: new Date('2024-09-01'), fechaFin: new Date('2024-09-30') },
      { empleadoId: 3, camionId: 4, fechaInicio: new Date('2024-10-20') },
    ]);

    // --------------------SERVICIOS-CAMION--------------------
    await Servicios.bulkCreate(servicios);

    // --------------------JORNALES--------------------
    await Jornales.bulkCreate(jornales);

    // --------------------PERMISOS--------------------
    for (let i = 1; i < 30; i++) {
      if (i < 20) {
        permisos.push({
          id: i,
          fechaCreacion: getRandomDate(2024),
          fechaVencimiento: getRandomDate(2025),
          empresaId: i,
          particularId: null,
        });
      } else {
        permisos.push({
          id: i,
          fechaCreacion: getRandomDate(2024),
          fechaVencimiento: getRandomDate(2025),
          empresaId: null,
          particularId: i - 19,
        });
      }
    }
    await Permisos.bulkCreate(permisos);
    // --------------------VOLQUETAS--------------------
    await Volquetas.bulkCreate(volquetas);
    // --------------------CONFIG--------------------
    await Config.create({ anio: 2024, precioSinIva: 3000, horasDeTrabajo: 8, configActiva: true });
    // --------------------CAJAS--------------------
    await Cajas.bulkCreate(cajas);

    console.log('Datos precargados con éxito.');
  } catch (error) {
    console.error('Error al precargar datos:', error);
  }
};
