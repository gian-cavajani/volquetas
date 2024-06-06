const express = require('express');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const { Jornales, Servicios, Camiones, Empleados, Telefonos, Usuarios, HistoricoUsoCamion } = require('../models');

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

    if (existingEmpleados > 0 || existingCamiones > 0 || existingUsuarios > 0 || existingTelefonos > 0 || existingHistorico > 0 || existingServicios > 0 || existingJornales > 0) {
      console.log('Datos ya existen. No se realizará la precarga.');
      return;
    }

    // Precargar datos de ejemplo
    await Empleados.bulkCreate([
      { nombre: 'Carolina Garcia', cedula: 12345678, rol: 'admin' },
      { nombre: 'Ana Gomez', cedula: 87654321, rol: 'normal' },
      { nombre: 'Juan Pedro', cedula: 17654321, rol: 'chofer' },
      { nombre: 'Roberto Gonzalez', cedula: 47654321, rol: 'chofer' },
      { nombre: 'Jose Varela', cedula: 27654321, rol: 'chofer' },
      { nombre: 'Pedro Varela', cedula: 23652321, rol: 'chofer' },
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

    await Telefonos.bulkCreate([
      { telefono: '099119922', empleadoId: 1 },
      { telefono: '097300129', empleadoId: 1 },
      { telefono: '099445432', empleadoId: 2 },
      { telefono: '099354308', empleadoId: 3 },
      { telefono: '099354708', empleadoId: 4 },
      { telefono: '091344308', empleadoId: 5 },
      { telefono: '099332308', empleadoId: 5 },
      { telefono: '091233208', empleadoId: 6 },
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
      { usuarioId: 1, empleadoId: 1, fecha: moment('2024-06-01').toDate(), entrada: '08:00:00', salida: '17:00:00', horasExtra: 1 },
      { usuarioId: 1, empleadoId: 1, fecha: moment('2024-06-02').toDate(), entrada: '08:00:00', salida: '17:30:00', horasExtra: 1.5 },
      { usuarioId: 1, empleadoId: 2, fecha: moment('2024-06-01').toDate(), entrada: '09:00:00', salida: '18:00:00', horasExtra: 1 },
      { usuarioId: 1, empleadoId: 2, fecha: moment('2024-06-02').toDate(), entrada: '09:00:00', salida: '17:00:00', horasExtra: 0 },
      { usuarioId: 1, empleadoId: 3, fecha: moment('2024-06-01').toDate(), entrada: '07:00:00', salida: '16:00:00', horasExtra: 1 },
      { usuarioId: 1, empleadoId: 3, fecha: moment('2024-06-02').toDate(), entrada: '07:30:00', salida: '17:00:00', horasExtra: 1.5 },
      { usuarioId: 1, empleadoId: 4, fecha: moment('2024-06-01').toDate(), entrada: '10:00:00', salida: '19:00:00', horasExtra: 1 },
      { usuarioId: 1, empleadoId: 4, fecha: moment('2024-06-02').toDate(), entrada: '10:30:00', salida: '19:30:00', horasExtra: 1 },
      { usuarioId: 1, empleadoId: 5, fecha: moment('2024-06-03').toDate(), entrada: '08:00:00', salida: '17:00:00', horasExtra: 1 },
      { usuarioId: 1, empleadoId: 5, fecha: moment('2024-06-04').toDate(), entrada: '09:00:00', salida: '18:00:00', horasExtra: 1 },
      { usuarioId: 1, empleadoId: 6, fecha: moment('2024-06-03').toDate(), entrada: '08:00:00', salida: '17:00:00', horasExtra: 1 },
      { usuarioId: 1, empleadoId: 6, fecha: moment('2024-06-04').toDate(), entrada: '09:00:00', salida: '18:00:00', horasExtra: 1 },
    ]);

    console.log('Datos precargados con éxito.');
  } catch (error) {
    console.error('Error al precargar datos:', error);
  }
};
