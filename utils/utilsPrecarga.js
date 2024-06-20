exports.getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.getRandomName = () => {
  const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Jorge', 'Sofía', 'Luis', 'Marta', 'Fernando', 'Paula', 'Miguel', 'Elena', 'Diego', 'Lucía'];
  const apellidos = ['García', 'Rodríguez', 'Gómez', 'Fernández', 'Martínez', 'López', 'Díaz', 'Pérez', 'González', 'Sánchez'];

  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];

  return `${nombre} ${apellido}`;
};

exports.getRandomPhone = (tipo) => {
  if (tipo === 'celular') {
    return `09${this.getRandomInt(1000000, 9999999)}`;
  } else if (tipo === 'telefono') {
    return `2${this.getRandomInt(2801128, 8801128)}`;
  }
};

exports.getRandomDireccion = (opcion) => {
  const callesUruguay = [
    '18 de Julio',
    'Avenida Italia',
    'Bulevar Artigas',
    'Rambla República Argentina',
    'Bulevar España',
    'Avenida 8 de Octubre',
    'Bulevar José Batlle y Ordóñez',
    'Rambla Sur',
    'Rambla Mahatma Gandhi',
    'Avenida Luis Alberto de Herrera',
    'Avenida General Rivera',
    'Bulevar General Artigas',
    'Avenida Millán',
    'Avenida 18 de Julio',
    'Avenida Rivera',
    'Avenida San Martín',
    'Avenida 8 de Octubre',
    'Avenida Agraciada',
    'Avenida José Belloni',
    'Avenida Centenario',
  ];
  const barriosUruguay = ['Aguada', 'Atahualpa', 'Barrio Sur', 'Bella Vista', 'Belvedere', 'Buceo', 'Paso de la Arena', 'Paso Molino', 'Piedras Blancas', 'Pocitos'];
  if (opcion === 'calle') {
    const randomNumber = Math.floor(Math.random() * callesUruguay.length);
    return `${callesUruguay[randomNumber]}`;
  } else {
    const randomNumber = Math.floor(Math.random() * barriosUruguay.length);
    return `${barriosUruguay[randomNumber]}`;
  }
};

exports.getRandomDetalleResiduos = () => {
  const tipoResiduo = [
    'PAPEL, CARTÓN NO APTO PARA EL RECICLAJE, POLIETILENO, PLÁSTICO, BARRIDO, TELAS,  ORGÁNICOS',
    'RESIDOS VARIOS (PLÁSTICOS, EQUIPOS DE PROTECCIÓN PERSONAL DESCARTADOS, MANGUERAS LIMPIAS NO MÁS DE 30CM',
    'ESCOMBRO LIMPIO ROCKS',
    'LIMPIEZA DE OBRA',
    'RESIDUOS HUMEDOS EN BOLSA, POCO NAYLON Y CARTON. TROZOS DE ESCOMBRO, LADRILLO Y CERÁMICA',
    'LIMPIEZA DEPOSITOS',
    'ESCOMBRO SUCIO',
    'BARROS / TIERRA SUCIA',
    'LIMP.DEPOSITOS/CHATARRA',
    'RCD MEZCLA OBRAS OFICINAS',
    'ESCOMBRO SUCIO, MADERA Y HIERRO',
    'ESCOMBRO SUCIO Y MOBILIARION EN DESUSO',
  ];

  const randomNumber = Math.floor(Math.random() * tipoResiduo.length);
  return `${tipoResiduo[randomNumber]}`;
};
