const express = require("express");
const { obtenerJoyas } = require("./consultas");

const app = express();

app.use(express.json());

app.get("/joyas", async (req, res) => {
  try {
    const joyas = await obtenerJoyas(req.query);

    res.json(joyas);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor encendido en http://localhost:3000");
});