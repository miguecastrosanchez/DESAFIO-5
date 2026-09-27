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

module.exports = { obtenerJoyas };