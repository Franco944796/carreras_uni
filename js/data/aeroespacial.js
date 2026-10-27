// Datos de la carrera. Para agregar otra: copiar este archivo y registrarla en data/index.js
// S(código, nombre, semestre, [correlativas], N materias aprobadas requeridas)
// direct: true = se aprueba directo, sin instancia de regular
const S = (id, name, sem, pre = [], n = 0) => ({ id, name, sem, pre, n, noCount: id.startsWith("AFC") });

export default {
  id: "aeroespacial",
  legacyKey: "correlativas-aeroespacial", // clave de la versión anterior (migración automática)
  icon: "🚀",
  bg: "space", // fondo animado de escritorio: "circuit" o "space"
  name: "Ingeniería Aeroespacial",
  plan: "Plan 2018",
  // "regular": para CURSAR alcanza con tener las correlativas regulares.
  // "approved": para cursar hay que tenerlas aprobadas. (Para APROBAR siempre se exigen aprobadas.)
  rules: { cursar: "regular" },
  // Títulos de columna. Por defecto: "N.º semestre / N.º año"
  labels: { 0: ["Nivelación", "Ingreso"], 8.5: ["Idioma", "Requisito"] },
  notes: [
    "Las AFC (Actividades de Formación Complementaria) no cuentan para los requisitos de “N materias aprobadas”.",
    "Las optativas (128 hs) y la Electiva Humanística se resumen en un nodo cada una.",
    "Matemática para Ingeniería (D1001) se aprueba directamente: no tiene instancia de regular.",
    "Las AFC se encadenan de AFC 1 a AFC 5, e Inglés (M0001) es requisito del 9.º y 10.º semestre.",
  ],
  subjects: [
{ ...S("D1001","Matemática para Ingeniería",0), direct: true },
S("A1101","Introducción a la Ingeniería Aeroespacial",1),
S("F1301","Matemática A",1,["D1001"]),
S("M1602","Gráfica para Ingeniería",1),
S("F1302","Matemática B",2,["F1301"]),
S("F1303","Física I",2,["F1301"]),
S("U1901","Química para Ingeniería",2),
S("F1304","Matemática C",3,["F1302"]),
S("F1305","Física II",3,["F1302","F1303"]),
S("F1315","Probabilidades y Estadística",3,["F1302"]),
S("C1151","Estructuras I",4,["F1303"]),
S("F1306","Matemática D",4,["F1304"]),
S("F1316","Intro. a la Programación y Análisis Numérico",4,["F1304"]),
S("M1603","Materiales",4,["D1001","U1901"]),
S("A1006","Ensayos no Destructivos",5,["F1305","M1603"]),
S("A1009","Mecánica Racional",5,["F1303","F1304"]),
S("A1102","Materiales Aeroespaciales",5,["M1603"]),
S("C1153","Estructuras II",5,["C1151","F1302","M1603"]),
S("M1604","Termodinámica",5,["F1302","F1303","U1901"]),
S("A1008","Estructuras III",6,["C1153","F1316"]),
S("A1010","Electrotecnia y Sist. Eléctricos de Aeronaves",6,["F1304","F1305"]),
S("A1011","Mecánica de los Fluidos I",6,["F1306","F1316","M1604"]),
S("A1016","Mecanismos y Sistemas de Aeronaves",6,["A1009","C1153","M1603"]),
S("AFC1","Actividades de Formación Complementaria I",6,[],10),
S("A1012","Sistemas Dinámicos",7,["A1008","A1009","F1305","F1306","F1315","F1316"]),
S("A1013","Estructuras IV",7,["A1008","A1102"]),
S("A1015","Mecánica de los Fluidos II",7,["A1011","F1315"]),
S("P1752","Economía para Ingenieros y Org. Industrial",7,[],15),
S("AFC2","Actividades de Formación Complementaria II",7,["AFC1"]),
S("ELEC","Electiva Humanística",7,[],15),
S("A1014","Estructuras V",8,["A1013"]),
S("A1017","Motores a Reacción",8,["A1015"]),
S("A1018","Aerodinámica y Mecánica de Vuelo I",8,["A1009","A1015"]),
S("A1019","Procesos de Fabricación",8,["A1102"]),
S("P1759","Ingeniería Legal y Ejercicio Profesional",8,[],20),
S("AFC3","Actividades de Formación Complementaria III",8,["AFC2"]),
S("M0001","Inglés (prueba de suficiencia)",8.5),
S("A1020","Motores Alternativos",9,["A1012","A1016","M0001","M1604"]),
S("A1021","Aerodinámica y Mecánica de Vuelo II",9,["A1012","A1018","M0001"]),
S("A1022","Mediciones e Instrumentos de Aeronaves",9,["A1010","A1016","A1017","M0001"]),
S("A1028","Aeropuertos y Operaciones de Vuelo",9,["A1017","A1018","M0001"]),
S("AFC4","Actividades de Formación Complementaria IV",9,["M0001","AFC3"]),
S("A1023","Control y Guiado",10,["A1012","A1021","A1022","M0001"]),
S("A1024","Talleres y Mantenimiento Aeronáutico",10,["M0001"],30),
S("A1026","Sistemas y Equipos de Aeronaves",10,["A1022","M0001"]),
S("A1034","Práctica Profesional Supervisada",10,["M0001"],30),
S("AFC5","Actividades de Formación Complementaria V",10,["M0001","AFC4"]),
S("OPT","Optativas (128 hs en total)",10,["M0001"],30)
  ],
};
