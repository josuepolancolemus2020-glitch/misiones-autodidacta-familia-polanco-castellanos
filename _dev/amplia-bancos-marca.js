/* Lleva los cuatro bancos de la evaluación de Marca etapa 1 a 15 entradas cada
   uno, como el resto de las misiones de F.A.R.O (el generador saca 5 por forma
   y hay 30 formas). Uso: node _dev/amplia-bancos-marca.js */
const fs = require('fs');
const path = require('path');
const ARCHIVO = path.join(__dirname, '..', 'misiones', 'ruta-marca-audiencia-promesa', 'js', 'audiencia-promesa.js');

let src = fs.readFileSync(ARCHIVO, 'utf8');
const lineas = src.split(/\r?\n/);

function agrega(nombre, items) {
  const prefijo = 'const ' + nombre + '=';
  const i = lineas.findIndex(l => l.startsWith(prefijo));
  if (i === -1) throw new Error('no encontrado ' + nombre);
  const cuerpo = lineas[i].slice(prefijo.length).replace(/;\s*$/, '');
  const arr = JSON.parse(cuerpo);
  if (arr.length >= 15) { console.log(nombre + ' ya tiene ' + arr.length); return; }
  arr.push(...items);
  lineas[i] = prefijo + JSON.stringify(arr) + ';';
  console.log(nombre + ' -> ' + arr.length);
}

agrega('evalTFBank', [
  { q: 'El trabajo por hacer es para qué te contrata de verdad la persona.', a: true },
  { q: 'La identidad visual se decide antes de saber para quién es el proyecto.', a: false },
  { q: 'Una característica y un beneficio pueden ser el mismo hecho contado de dos lados.', a: true },
]);

agrega('evalMCBank', [
  { q: '¿Qué es el nicho?', o: ['a) El presupuesto de publicidad', 'b) La franja estrecha donde uno es la mejor opción', 'c) El logo registrado', 'd) La cantidad de seguidores'], a: 1 },
  { q: 'La promesa se considera bien escrita cuando…', o: ['a) Tiene más de treinta palabras', 'b) Menciona la tecnología usada', 'c) Cabe en doce palabras y es verificable', 'd) La firma un experto'], a: 2 },
  { q: '¿Qué se protege en el caso de la maestra de las nueve de la noche?', o: ['a) Que la ficha se abra e imprima en menos de tres clics', 'b) Que el logo se vea en pantalla pequeña', 'c) Que haya versión en inglés', 'd) Que se registre antes de descargar'], a: 0 },
]);

agrega('evalCPBank', [
  { q: 'Para qué te contrata de verdad la persona es el ___ por hacer.', a: 'trabajo' },
  { q: 'El logo y los colores forman la identidad ___.', a: 'visual' },
  { q: 'La audiencia que vive en la casa de otro es público ___.', a: 'prestado' },
  { q: 'Antes de entregar material a una editorial se pide el nombre del ___.', a: 'autor' },
  { q: 'Un número grande sin fuente ni fecha es un número ___.', a: 'inflado' },
]);

agrega('evalPRBank', [
  { term: 'Promesa', def: 'Lo que le cambia a la persona, en una frase verificable' },
  { term: 'Diferencia', def: 'Por qué esto y no lo que ya existe' },
  { term: 'Dolor', def: 'Lo que le duele hoy, dicho con sus palabras' },
  { term: 'Todo el mundo', def: 'La audiencia que no existe y a nadie le habla' },
  { term: 'Número inflado', def: 'La cifra grande que nadie puede verificar' },
]);

fs.writeFileSync(ARCHIVO, lineas.join('\n'), 'utf8');
console.log('listo');
