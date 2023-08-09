document.getElementById("searchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const frase = document.getElementById("frase").value;
  fetch("/buscar", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `frase=${frase}`,
  })
    .then((response) => response.json())
    .then((resultados) => {
      const resultadosDiv = document.getElementById("resultados");
      resultadosDiv.innerHTML = "";
      resultados.forEach((resultado) => {
        const consultaDiv = document.createElement("div");
        consultaDiv.innerHTML = `<h3>${
          resultado.consulta
        }:</h3><ul>${resultado.sugerencias
          .map((sugerencia) => `<li>${sugerencia}</li>`)
          .join("")}</ul>`;
        resultadosDiv.appendChild(consultaDiv);
      });
      // Habilita el botón de descarga
      document.getElementById("descargar").disabled = false;
    });
  document.getElementById("descargar").addEventListener("click", function () {
    window.location.href = "/descargar";
  });
});
