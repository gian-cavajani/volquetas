const express = require('express');
const bcrypt = require('bcryptjs');

const {
  Servicios,
  Camiones,
  Empleados,
  Telefonos,
  Usuarios,
  HistoricoUsoCamion,
} = require('../models');

exports.precargarDatos = async () => {
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
  ]);
  await Usuarios.bulkCreate([
    {
      empleadoId: 1,
      email: 'carola@example.com',
      password: await bcrypt.hash('1', 10),
      rol: 'admin',
      activo: true,
    },
    {
      empleadoId: 2,
      email: 'ana@example.com',
      password: await bcrypt.hash('1', 10),
      rol: 'normal',
    },
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
    {
      empleadoId: 4,
      camionId: 2,
      fechaInicio: new Date('2024-06-30'),
      fechaFin: new Date('2024-07-30'),
    },
    { empleadoId: 5, camionId: 2, fechaInicio: new Date('2024-07-30') },
  ]);
  await Servicios.bulkCreate([
    {
      camionId: 1,
      fecha: new Date('2024-06-01'),
      tipo: 'arreglo',
      precio: 1200,
      descripcion: 'arreglo de pintra',
    },
    {
      camionId: 1,
      fecha: new Date('2020-02-01'),
      tipo: 'service',
      precio: 100,
      descripcion: 'pinchazo',
    },
    {
      camionId: 2,
      fecha: new Date('2010-02-01'),
      tipo: 'chequeo',
      precio: 0,
      descripcion: 'chequeo en general de todo',
    },
  ]);

  console.log('Datos precargados con éxito');
};
