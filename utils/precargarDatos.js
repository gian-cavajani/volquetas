const express = require('express');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { randomUUID, getRandomValues } = require('crypto');
const { getRandomModelo, getRandomString, getRandomDetalleResiduos, getRandomDireccion, getRandomInt, getRandomName, getRandomEmail, getRandomPhone } = require('./utilsPrecarga');
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

    for (let i = 1; i < 20; i++) {
      //VOLQUETAS
      volquetas.push({
        numeroVolqueta: i,
        estado: i > 2 ? 'ok' : 'perdida',
        tipo: i > 18 ? 'chica' : 'grande',
      });

      //EMPRESAS
      const apellido = getRandomName('apellido');
      const nombreEmpresa = `${apellido}'s Company ${i}`;
      const rut = getRandomInt(123456789012, 934567890123) + '';
      const razonSocial = `${apellido}${i} SRL`;
      empresas.push({
        nombre: nombreEmpresa,
        rut,
        razonSocial,
        descripcion: `Descripción de ${razonSocial} con RUT: ${rut}`,
      });

      //PARTICULARES
      const nombre = getRandomName();
      const email = `${nombre}@particular.com`.replaceAll(' ', '');
      particulares.push({
        nombre,
        cedula: getRandomInt(10000000, 60000000) + '',
        descripcion: `Descripción de ${nombre}`,
        email,
      });

      //empleados
      const id = getRandomInt(1, 19);
      const mes = getRandomInt(1, 9);
      const dia = getRandomInt(10, 29);
      const fecha = `20${id < 10 ? '0' + id : id}-0${mes}-${dia}`;
      const fechaSalida = `2023-0${mes}-${dia}`;
      empleados.push({
        nombre: nombre,
        cedula: getRandomInt(10000000, 60000000) + '',
        rol: i > 6 ? 'chofer' : 'normal',
        fechaEntrada: new Date(fecha),
        fechaSalida: i > 17 ? new Date(fechaSalida) : null,
        habilitado: i > 17 ? false : true,
        direccion: getRandomDireccion('calle'),
      });

      //TELEFONOS
      const tipo = i > 10 ? 'telefono' : 'celular';
      telefonos.push({
        telefono: getRandomPhone(tipo),
        tipo,
        extension: i > 10 ? getRandomInt(100, 9000) : null,
        empleadoId: id,
        contactoEmpresaId: null,
        particularId: null,
      });

      telefonos.push({
        telefono: getRandomPhone(tipo),
        tipo,
        extension: i > 10 ? getRandomInt(100, 9000) : null,
        empleadoId: null,
        contactoEmpresaId: null,
        particularId: id,
      });
      //SERVICIOS-CAMION
      const modelo = getRandomModelo();
      const tipoServicios = ['arreglo', 'service', 'chequeo', 'pintura'];
      const tipoS1 = tipoServicios[Math.floor(Math.random() * tipoServicios.length)];
      const tipoS2 = tipoServicios[Math.floor(Math.random() * tipoServicios.length)];
      if (i < 10) {
        camiones.push({
          matricula: `${getRandomString(3)}-${getRandomInt(1000, 9999)}`,
          modelo,
          anio: getRandomInt(1960, 2024),
          estado: i < 5 ? 'sano' : 'roto',
        });
        servicios.push({
          camionId: i,
          fecha: new Date(fecha),
          tipo: tipoS1,
          precio: getRandomInt(1, 9000),
          moneda: i < 5 ? 'peso' : 'dolar',
          descripcion: `${tipoS1} de ${modelo}`,
        });
        servicios.push({
          camionId: i,
          fecha: new Date(fechaSalida),
          tipo: tipoS1,
          precio: getRandomInt(1, 9000),
          moneda: i > 5 ? 'peso' : 'dolar',
          descripcion: `${tipoS2} de ${modelo}`,
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

        //CONTACTOS-EMPRESA
        let particularId = null;
        let empresaId = null;
        if (getRandomInt(1, 10) < 5) {
          //TELEFONOS-CONTACTOSEMPRESA
          telefonos.push({
            telefono: getRandomPhone(tipo),
            tipo,
            extension: i > 10 ? getRandomInt(100, 9000) : null,
            empleadoId: null,
            contactoEmpresaId: getRandomInt(1, 57),
            particularId: null,
          });
          particularId = getRandomInt(1, 19);
          //PERMISSOS
          permisos.push({
            id: `2${i + 12}${j + 12}`,
            fechaCreacion: new Date(fechaMes),
            fechaVencimiento: `2024-0${getRandomInt(1, 9)}-30T00:00:00.000Z`,
            empresaId: getRandomInt(1, 19),
            particularId: null,
          });
        } else {
          empresaId = getRandomInt(1, 19);
          //PERMISSOS
          permisos.push({
            id: `1${i + 13}${j + 13}`,
            fechaCreacion: new Date(fechaMes),
            fechaVencimiento: `2024-0${getRandomInt(1, 9)}-30T00:00:00.000Z`,
            empresaId: null,
            particularId: getRandomInt(1, 19),
          });
        }

        if (j < 4) {
          const nombre_contactos = getRandomName();
          contactos.push({
            nombre: nombre_contactos,
            descripcion: `Descripción de ${nombre_contactos}`,
            email: `${nombre_contactos}@empresa.com`.replaceAll(' ', ''),
            empresaId: empresaId ? empresaId : particularId,
          });

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
            particularId,
            empresaId,
          });

          //OBRAS-DETALLE
          obrasDetalle.push({
            obraId: j * 1,
            detalleResiduos: getRandomDetalleResiduos(),
            residuosMezclados: Math.random() < 0.5,
            residuosReciclados: Math.random() < 0.5,
            frecuenciaSemanal: [getRandomInt(1, 3), getRandomInt(4, 7)],
            dias: 'A SOLICITUD',
            destinoFinal: 'USINA 8',
          });
        }
      }
    }

    // --------------------EMPLEADOS--------------------
    await Empleados.bulkCreate([
      { nombre: 'Carolina Garcia', cedula: getRandomInt(10000000, 60000000) + '', rol: 'admin', fechaEntrada: moment('2024-06-02').toDate() },
      { nombre: 'Ana Gomez', cedula: getRandomInt(10000000, 60000000) + '', rol: 'normal', fechaEntrada: moment('2024-06-03').toDate() },
    ]);
    await Empleados.bulkCreate(empleados);
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
      { empleadoId: 6, camionId: 5, fechaInicio: new Date('2024-09-10'), fechaFin: new Date('2024-09-20') },
      { empleadoId: 4, camionId: 5, fechaInicio: new Date('2024-11-01'), fechaFin: new Date('2024-11-10') },
      { empleadoId: 1, camionId: 6, fechaInicio: new Date('2024-10-01'), fechaFin: new Date('2024-10-20') },
      { empleadoId: 5, camionId: 6, fechaInicio: new Date('2024-11-15') },
    ]);

    // --------------------SERVICIOS-CAMION--------------------
    await Servicios.bulkCreate(servicios);
    // --------------------JORNALES--------------------
    await Jornales.bulkCreate(jornales);
    // --------------------PERMISOS--------------------
    permisos.push({
      id: 1,
      fechaCreacion: `2023-07-30T00:00:00.000Z`,
      fechaVencimiento: `2025-07-30T00:00:00.000Z`,
      empresaId: 1,
      particularId: null,
    });
    permisos.push({
      id: 663920,
      fechaCreacion: `2023-07-30T00:00:00.000Z`,
      fechaVencimiento: `2025-07-30T00:00:00.000Z`,
      empresaId: 1,
      particularId: null,
    });
    await Permisos.bulkCreate(permisos);
    // --------------------VOLQUETAS--------------------
    await Volquetas.bulkCreate(volquetas);
    // --------------------CONFIG--------------------
    await Config.create({ anio: 2024, precioSinIva: 3000, horasDeTrabajo: 8, configActiva: true });

    console.log('Datos precargados con éxito.');
  } catch (error) {
    console.error('Error al precargar datos:', error);
  }
};
