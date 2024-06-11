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
