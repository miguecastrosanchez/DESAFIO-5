const format = require("pg-format");
//conectar con la base de datos en postgreSQL
const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "dobby7",
  database: "joyas",
  port: 5432,
});

//rows es el arreglo de objetos que contiene los datos de la tabla inventario, en este caso con las joyas encontradas. 
//separar order_by en campo y dirección, y calcular la paginación con OFFSET.
const obtenerJoyas = async ({
  limits = 10,
  page = 1,
  order_by = "id_ASC",
}) => {

  const [campo, direccion] = order_by.split("_");

  const offset = (page - 1) * limits;

  const consulta = format(
    "SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s",
    campo,
    direccion,
    limits,
    offset
  );

  const { rows } = await pool.query(consulta);

  return rows;
};

//HATEOAS (Hypermedia as the Engine of Application State) es un principio de diseño de API REST que permite a los clientes interactuar con la API a través de enlaces proporcionados en las respuestas. En este caso, la función prepararHATEOAS toma un arreglo de joyas y devuelve un objeto que incluye información sobre el total de joyas, el stock total y un arreglo de resultados con enlaces a cada joya individual.
const prepararHATEOAS = (joyas) => {

  const results = joyas.map((joya) => {
    return {
      name: joya.nombre,
      href: `/joyas/joya/${joya.id}`,
    };
  });

  const totalJoyas = joyas.length;

  const stockTotal = joyas.reduce(
    (total, joya) => total + joya.stock,
    0
  );

  const HATEOAS = {
    totalJoyas,
    stockTotal,
    results,
  };

  return HATEOAS;
};

//FILTROS 
const obtenerJoyasPorFiltros = async ({
  precio_min,
  precio_max,
  categoria,
  metal,
}) => {

  let filtros = [];
  const values = [];

  const agregarFiltro = (campo, comparador, valor) => {

    values.push(valor);

    const posicion = values.length;

    filtros.push(`${campo} ${comparador} $${posicion}`);
  };

  if (precio_min) {
    agregarFiltro("precio", ">=", precio_min);
  }

  if (precio_max) {
    agregarFiltro("precio", "<=", precio_max);
  }

  if (categoria) {
    agregarFiltro("categoria", "=", categoria);
  }

  if (metal) {
    agregarFiltro("metal", "=", metal);
  }

  let consulta = "SELECT * FROM inventario";

  if (filtros.length > 0) {

    consulta += ` WHERE ${filtros.join(" AND ")}`;

  }

  const { rows } = await pool.query(consulta, values);

  return rows;
};

module.exports = { obtenerJoyas, prepararHATEOAS, obtenerJoyasPorFiltros };