const express = require('express');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { randomUUID, getRandomValues } = require('crypto');
const { getRandomInt, getRandomName, getRandomEmail, getRandomPhone } = require('./utilsPrecarga');
const { ClienteParticulares, ContactoEmpresas, ClienteEmpresas, Jornales, Servicios, Camiones, Empleados, Telefonos, Usuarios, HistoricoUsoCamion, TelefonoPropietarios } = require('../models');

exports.precargarDatos = async () => {
  try {
    // Verificar si hay datos existentes
    const existingEmpleados = await Empleados.count();
    const existingCamiones = await Camiones.count();
    const existingUsuarios = await Usuarios.count();
    const existingTelefonos = await Telefonos.count();
    const existingHistorico = await HistoricoUsoCamion.count();
    const existingServicios = await Servicios.count();
    const existingJornales = await Jornales.count();
    const existingClienteEmpresas = await ClienteEmpresas.count();
    const existingClienteParticulares = await ClienteParticulares.count();
    const existingContactoEmpresas = await ContactoEmpresas.count();

    if (
      existingClienteEmpresas > 0 ||
      existingClienteParticulares > 0 ||
      existingContactoEmpresas > 0 ||
      existingEmpleados > 0 ||
      existingCamiones > 0 ||
      existingUsuarios > 0 ||
      existingTelefonos > 0 ||
      existingHistorico > 0 ||
      existingServicios > 0 ||
      existingJornales > 0
    ) {
      console.log('Datos ya existen. No se realizará la precarga.');
      return;
    }

    // Precargar datos de ejemplo
    await Empleados.bulkCreate([
      { nombre: 'Carolina Garcia', cedula: getRandomInt(10000000, 60000000) + '', rol: 'admin', fechaEntrada: moment('2024-06-02').toDate() },
      { nombre: 'Ana Gomez', cedula: getRandomInt(10000000, 60000000) + '', rol: 'normal', fechaEntrada: moment('2024-06-03').toDate() },
      { nombre: 'Juan Pedro', cedula: getRandomInt(10000000, 60000000) + '', rol: 'chofer', fechaEntrada: moment('2024-06-04').toDate() },
      { nombre: 'Roberto Gonzalez', cedula: getRandomInt(10000000, 60000000) + '', rol: 'chofer', fechaEntrada: moment('2024-06-05').toDate() },
      { nombre: 'Jose Rios', cedula: getRandomInt(10000000, 60000000) + '', rol: 'chofer', fechaEntrada: moment('2024-06-01').toDate() },
      { nombre: 'Pedro Varela', cedula: getRandomInt(10000000, 60000000) + '', rol: 'chofer', fechaEntrada: moment('2024-06-03').toDate() },
    ]);

    await Camiones.bulkCreate([
      { matricula: 'SBB-2310', modelo: 'Mercedes', anio: 2020, estado: 'roto' },
      { matricula: 'XYZ-789', modelo: 'Chevrolet', anio: 2019, estado: 'sano' },
      { matricula: 'ABC-123', modelo: 'Volvo', anio: 2018, estado: 'sano' },
      { matricula: 'DEF-456', modelo: 'Scania', anio: 2021, estado: 'roto' },
      { matricula: 'GHI-789', modelo: 'MAN', anio: 2017, estado: 'sano' },
      { matricula: 'JKL-012', modelo: 'Iveco', anio: 2022, estado: 'sano' },
    ]);

    await Usuarios.bulkCreate([
      { empleadoId: 1, email: 'carola@example.com', password: await bcrypt.hash('1', 10), rol: 'admin', activo: true },
      { empleadoId: 2, email: 'ana@example.com', password: await bcrypt.hash('1', 10), rol: 'normal' },
    ]);

    await ClienteEmpresas.bulkCreate([
      {
        rut: '123456789012',
        nombre: 'Empresa A',
        descripcion: 'Descripción de Empresa A',
      },
      {
        rut: '234567890123',
        nombre: 'Empresa B',
        descripcion: 'Descripción de Empresa B',
      },
      {
        rut: '345678901234',
        nombre: 'Empresa C',
        descripcion: 'Descripción de Empresa C',
      },
      {
        rut: '456789012345',
        nombre: 'Empresa D',
        descripcion: 'Descripción de Empresa D',
      },
      {
        rut: '567890123456',
        nombre: 'Empresa E',
        descripcion: 'Descripción de Empresa E',
      },
      {
        rut: '678901234567',
        nombre: 'Empresa F',
        descripcion: 'Descripción de Empresa F',
      },
      {
        rut: '789012345678',
        nombre: 'Empresa G',
        descripcion: 'Descripción de Empresa G',
      },
      {
        rut: '890123456789',
        nombre: 'Empresa H',
        descripcion: 'Descripción de Empresa H',
      },
      {
        rut: '901234567890',
        nombre: 'Empresa I',
        descripcion: 'Descripción de Empresa I',
      },
      {
        rut: '012345678901',
        nombre: 'Empresa J',
        descripcion: 'Descripción de Empresa J',
      },
    ]);

    const personasEmpresas = [];
    for (let i = 0; i < 10; i++) {
      const nombre = getRandomName();
      const email = `${nombre}@empresa.com`;
      personasEmpresas.push({
        nombre,
        cedula: getRandomInt(10000000, 60000000) + '',
        descripcion: `Descripción de ${nombre}`,
        email,
        clienteEmpresaId: getRandomInt(1, 10),
      });
    }

    await ContactoEmpresas.bulkCreate(personasEmpresas);

    const clienteParticulares = [];
    for (let i = 0; i < 10; i++) {
      const nombre = getRandomName();
      const email = `${nombre}@particular.com`;
      clienteParticulares.push({
        nombre,
        cedula: getRandomInt(10000000, 60000000) + '',
        descripcion: `Descripción de ${nombre}`,
        email,
      });
    }

    await ClienteParticulares.bulkCreate(clienteParticulares);

    await Telefonos.bulkCreate([
      { telefono: getRandomPhone('telefono'), tipo: 'telefono', extension: getRandomInt(100, 9000), empleadoId: getRandomInt(1, 5), contactoEmpresaId: null, clienteParticularId: null },
      { telefono: getRandomPhone('telefono'), tipo: 'telefono', extension: getRandomInt(100, 9000), empleadoId: getRandomInt(1, 5), contactoEmpresaId: null, clienteParticularId: null },
      { telefono: getRandomPhone('telefono'), tipo: 'telefono', extension: getRandomInt(100, 9000), empleadoId: getRandomInt(1, 5), contactoEmpresaId: null, clienteParticularId: null },
      { telefono: getRandomPhone('telefono'), tipo: 'telefono', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: null, clienteParticularId: getRandomInt(1, 5) },
      { telefono: getRandomPhone('telefono'), tipo: 'telefono', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: null, clienteParticularId: getRandomInt(1, 5) },
      { telefono: getRandomPhone('telefono'), tipo: 'telefono', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: null, clienteParticularId: getRandomInt(1, 5) },
      { telefono: getRandomPhone('telefono'), tipo: 'telefono', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: getRandomInt(1, 5), clienteParticularId: null },
      { telefono: getRandomPhone('telefono'), tipo: 'telefono', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: getRandomInt(1, 5), clienteParticularId: null },
      { telefono: getRandomPhone('telefono'), tipo: 'telefono', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: getRandomInt(1, 5), clienteParticularId: null },
      { telefono: getRandomPhone('celular'), tipo: 'celular', extension: getRandomInt(100, 9000), empleadoId: getRandomInt(1, 5), contactoEmpresaId: null, clienteParticularId: null },
      { telefono: getRandomPhone('celular'), tipo: 'celular', extension: getRandomInt(100, 9000), empleadoId: getRandomInt(1, 5), contactoEmpresaId: null, clienteParticularId: null },
      { telefono: getRandomPhone('celular'), tipo: 'celular', extension: getRandomInt(100, 9000), empleadoId: getRandomInt(1, 5), contactoEmpresaId: null, clienteParticularId: null },
      { telefono: getRandomPhone('celular'), tipo: 'celular', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: null, clienteParticularId: getRandomInt(1, 5) },
      { telefono: getRandomPhone('celular'), tipo: 'celular', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: null, clienteParticularId: getRandomInt(1, 5) },
      { telefono: getRandomPhone('celular'), tipo: 'celular', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: null, clienteParticularId: getRandomInt(1, 5) },
      { telefono: getRandomPhone('celular'), tipo: 'celular', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: getRandomInt(1, 5), clienteParticularId: null },
      { telefono: getRandomPhone('celular'), tipo: 'celular', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: getRandomInt(1, 5), clienteParticularId: null },
      { telefono: getRandomPhone('celular'), tipo: 'celular', extension: getRandomInt(100, 9000), empleadoId: null, contactoEmpresaId: getRandomInt(1, 5), clienteParticularId: null },
    ]);

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

    await Servicios.bulkCreate([
      { camionId: 1, fecha: new Date('2024-06-01'), tipo: 'arreglo', precio: 1200, descripcion: 'arreglo de pintura' },
      { camionId: 1, fecha: new Date('2020-02-01'), tipo: 'service', precio: 100, descripcion: 'pinchazo' },
      { camionId: 2, fecha: new Date('2010-02-01'), tipo: 'chequeo', precio: 0, descripcion: 'chequeo en general de todo' },
      { camionId: 3, fecha: new Date('2024-07-01'), tipo: 'service', precio: 800, descripcion: 'cambio de aceite' },
      { camionId: 4, fecha: new Date('2024-07-10'), tipo: 'arreglo', precio: 1500, descripcion: 'reparación de motor' },
      { camionId: 5, fecha: new Date('2024-08-15'), tipo: 'service', precio: 200, descripcion: 'revisión de frenos' },
      { camionId: 6, fecha: new Date('2024-09-01'), tipo: 'chequeo', precio: 0, descripcion: 'inspección general' },
      { camionId: 1, fecha: new Date('2024-10-01'), tipo: 'arreglo', precio: 300, descripcion: 'reemplazo de neumáticos' },
      { camionId: 2, fecha: new Date('2024-11-01'), tipo: 'service', precio: 250, descripcion: 'ajuste de suspensión' },
      { camionId: 3, fecha: new Date('2024-12-01'), tipo: 'chequeo', precio: 700, descripcion: 'limpieza del sistema de combustible' },
      { camionId: 4, fecha: new Date('2024-12-15'), tipo: 'pintura', precio: 1000, descripcion: 'pintura completa' },
      { camionId: 5, fecha: new Date('2024-11-20'), tipo: 'pintura', precio: 1200, descripcion: 'pintura de cabina' },
      { camionId: 6, fecha: new Date('2024-10-10'), tipo: 'arreglo', precio: 500, descripcion: 'arreglo de puertas' },
    ]);

    await Jornales.bulkCreate([
      { creadoPor: 1, empleadoId: 1, fecha: moment('2024-06-01').toDate(), entrada: '08:00:00', salida: '17:00:00', tipo: 'trabajo', horasExtra: 1 },
      { creadoPor: 1, empleadoId: 1, fecha: moment('2024-06-02').toDate(), entrada: '08:00:00', salida: '17:30:00', tipo: 'trabajo', horasExtra: 1.5 },
      { creadoPor: 1, empleadoId: 2, fecha: moment('2024-06-01').toDate(), entrada: '09:00:00', salida: '18:00:00', tipo: 'trabajo', horasExtra: 1 },
      { creadoPor: 1, empleadoId: 2, fecha: moment('2024-06-02').toDate(), entrada: '09:00:00', salida: '17:00:00', tipo: 'trabajo', horasExtra: 0 },
      { creadoPor: 1, empleadoId: 3, fecha: moment('2024-06-01').toDate(), entrada: '07:00:00', salida: '16:00:00', tipo: 'trabajo', horasExtra: 1 },
      { creadoPor: 1, empleadoId: 3, fecha: moment('2024-06-02').toDate(), entrada: '07:30:00', salida: '17:00:00', tipo: 'trabajo', horasExtra: 1.5 },
      { creadoPor: 1, empleadoId: 4, fecha: moment('2024-06-01').toDate(), entrada: '10:00:00', salida: '19:00:00', tipo: 'trabajo', horasExtra: 1 },
      { creadoPor: 1, empleadoId: 4, fecha: moment('2024-06-02').toDate(), entrada: '10:30:00', salida: '19:30:00', tipo: 'trabajo', horasExtra: 1 },
      { creadoPor: 1, empleadoId: 5, fecha: moment('2024-06-03').toDate(), entrada: '08:00:00', salida: '17:00:00', tipo: 'trabajo', horasExtra: 1 },
      { creadoPor: 1, empleadoId: 5, fecha: moment('2024-06-04').toDate(), entrada: '09:00:00', salida: '18:00:00', tipo: 'trabajo', horasExtra: 1 },
      { creadoPor: 1, empleadoId: 6, fecha: moment('2024-06-03').toDate(), entrada: '08:00:00', salida: '17:00:00', tipo: 'trabajo', horasExtra: 1 },
      { creadoPor: 1, empleadoId: 6, fecha: moment('2024-06-04').toDate(), entrada: '09:00:00', salida: '18:00:00', tipo: 'trabajo', horasExtra: 1 },
      { creadoPor: 1, empleadoId: 6, fecha: moment('2024-06-04').toDate(), tipo: 'licencia' },
    ]);

    console.log('Datos precargados con éxito.');
  } catch (error) {
    console.error('Error al precargar datos:', error);
  }
};
