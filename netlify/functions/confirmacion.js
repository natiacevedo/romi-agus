
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" })
    };
  }

  try {
    const url = process.env.GOOGLE_SCRIPT_URL;
    const clave = process.env.CLAVE_FORMULARIO;

    if (!url || !clave) {
      throw new Error("Falta configurar el servidor.");
    }

    const datos = JSON.parse(event.body || "{}");

    if (
      typeof datos.nombre !== "string" ||
      !datos.nombre.trim() ||
      typeof datos.apellido !== "string" ||
      !datos.apellido.trim() ||
      !["Sí", "No"].includes(datos.asiste)
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Faltan datos obligatorios."
        })
      };
    }

    const destino = new URL(url);
    destino.searchParams.set("clave", clave);

    const respuesta = await fetch(destino.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(datos),
      redirect: "follow"
    });

    if (!respuesta.ok) {
      throw new Error("Google no pudo procesar la solicitud.");
    }

    const resultado = await respuesta.json();

    if (!resultado.ok) {
      throw new Error(
        resultado.error || "No se pudo guardar la confirmación."
      );
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ok: true })
    };

  } catch (error) {
    console.error("Error guardando confirmación:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "No pudimos guardar la respuesta."
      })
    };
  }
};
