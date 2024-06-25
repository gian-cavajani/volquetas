exports.getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.getRandomName = (partial) => {
  const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Jorge', 'Sofía', 'Luis', 'Marta', 'Fernando', 'Paula', 'Miguel', 'Elena', 'Diego', 'Lucía'];
  const apellidos = [
    'Smith',
    'Johnson',
    'Williams',
    'Jones',
    'Brown',
    'Davis',
    'Miller',
    'Wilson',
    'Moore',
    'Taylor',
    'Anderson',
    'Thomas',
    'Jackson',
    'White',
    'Harris',
    'Martin',
    'Thompson',
    'Garcia',
    'Martinez',
    'Robinson',
    'Clark',
    'Rodriguez',
    'Lewis',
    'Lee',
    'Walker',
    'Hall',
    'Allen',
    'Young',
    'Hernandez',
    'King',
    'García',
    'Rodríguez',
    'Gómez',
    'Fernández',
    'Martínez',
    'López',
    'Díaz',
    'Pérez',
    'González',
    'Sánchez',
  ];

  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];

  if (partial === 'apellido') {
    return apellido;
  } else if (partial === 'nombre') {
    return nombre;
  } else {
    return `${nombre} ${apellido}`;
  }
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
exports.getRandomModelo = () => {
  const modelosCamiones = [
    'Volvo FH16',
    'Scania R450',
    'Mercedes-Benz Actros',
    'MAN TGX',
    'DAF XF',
    'Iveco Stralis',
    'Renault T High',
    'Peterbilt 579',
    'Kenworth T680',
    'Freightliner Cascadia',
    'Mack Anthem',
    'Western Star 5700XE',
    'Hino 500',
    'Isuzu Giga',
    'Mitsubishi Fuso Super Great',
    'UD Quon',
    'Tata Prima',
    'Ashok Leyland Captain',
    'International Lonestar',
    'Volvo VNL',
    'Hyundai Xcient',
    'Mercedes-Benz Arocs',
    'Kenworth W900',
    'Mack Pinnacle',
    'Scania S730',
  ];

  const randomNumber = Math.floor(Math.random() * modelosCamiones.length);
  return `${modelosCamiones[randomNumber]}`;
};

const getRandomLetter = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
  return letters[Math.floor(Math.random() * letters.length)];
};

exports.getRandomString = (cantidad) => {
  let result = '';
  for (let i = 0; i < cantidad; i++) {
    result += getRandomLetter();
  }
  return result;
};
