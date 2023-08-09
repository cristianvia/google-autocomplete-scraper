const express = require("express");
const unirest = require("unirest");
const { Parser } = require("json2csv");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

let lastResults = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/buscar", (req, res) => {
  const frase = req.body.frase;
  const alfabeto = "abcdefghijklmnopqrstuvwxyz";
  const resultados = [];

  (async () => {
    for (let letra of alfabeto) {
      const consulta = frase + letra;
      const sugerencias = await getSuggestions(consulta);
      resultados.push({ consulta, sugerencias });
    }
    lastResults = resultados; // Guarda los resultados para la descarga
    res.json(resultados);
  })();
});

app.get("/descargar", (req, res) => {
  const flatResults = lastResults.flatMap((result) =>
    result.sugerencias.map((sugerencia) => ({
      consulta: result.consulta,
      sugerencia: sugerencia.replace(/<\/?[^>]+(>|$)/g, ""), // Elimina todas las etiquetas HTML
    }))
  );

  console.log("Flat Results:", flatResults); // Agrega esta línea para depurar

  if (flatResults.length === 0) {
    return res.status(400).send("No hay datos para descargar");
  }

  const json2csvParser = new Parser({ fields: ["consulta", "sugerencia"] });
  const csv = json2csvParser.parse(flatResults);

  //get filename from query
  const inputText =
    lastResults.length > 0
      ? lastResults[0].consulta.split(" ")[0]
      : "resultados";
  const filename = `resultados-${inputText}.csv`;

  res.header("Content-Type", "text/csv");
  res.attachment(filename);
  res.send(csv);
});

function getSuggestions(query) {
  return new Promise((resolve, reject) => {
    unirest
      .get("https://www.google.com/complete/search")
      .query({
        client: "psy-ab",
        q: query,
      })
      .end((result) => {
        if (result.error) reject(result.error);
        const suggestions = result.body[1].map((item) => item[0]);
        resolve(suggestions);
      });
  });
}

app.listen(port, () => {
  console.log(`Aplicación escuchando en http://localhost:${port}`);
});
