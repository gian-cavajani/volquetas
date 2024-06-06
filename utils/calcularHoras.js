const moment = require('moment');

function calcularHoras(jornales) {
  let horasTrabajadas = 0;
  let horasExtras = 0;

  jornales.forEach((jornal) => {
    const entrada = moment(jornal.entrada, 'HH:mm:ss');
    const salida = moment(jornal.salida, 'HH:mm:ss');
    const horas = salida.diff(entrada, 'hours', true);
    if (horas > 8) {
      horasTrabajadas += 8;
      horasExtras += horas - 8;
    } else {
      horasTrabajadas += horas;
    }
  });
  return { horasTrabajadas, horasExtras };
}

module.exports = {
  calcularHoras,
};
