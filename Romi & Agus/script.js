
/* =========================================
   CUENTA REGRESIVA
========================================= */

// 26 de diciembre de 2026, 19:30 hs Uruguay (UTC-3)
const targetDate = new Date("2026-12-26T19:30:00-03:00").getTime();

function actualizarCuentaRegresiva() {
    const now = Date.now();
    const distance = targetDate - now;

    const contenedor = document.getElementById("countdown");
    if (!contenedor) return false;

    if (distance <= 0) {
        contenedor.textContent = "¡Llegó el gran día! 💍";
        return false;
    }

    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    const valores = {
        days,
        hours,
        minutes,
        seconds
    };

    Object.entries(valores).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent = String(valor).padStart(2, "0");
        }
    });

    return true;
}

if (actualizarCuentaRegresiva()) {
    const countdown = setInterval(() => {
        if (!actualizarCuentaRegresiva()) {
            clearInterval(countdown);
        }
    }, 1000);
}


/* =========================================
   GALERÍA DE FOTOGRAFÍAS
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const fotos = Array.from(
        document.querySelectorAll(
            ".galeria-personalizada .galeria-foto img"
        )
    );

    const visor = document.getElementById("visorGaleria");
    const imagenAmpliada = document.getElementById("imagenAmpliada");

    if (!visor || !imagenAmpliada || fotos.length === 0) {
        return;
    }

    const cerrar = visor.querySelector(".visor-cerrar");
    const anterior = visor.querySelector(".visor-anterior");
    const siguiente = visor.querySelector(".visor-siguiente");

    if (!cerrar || !anterior || !siguiente) return;

    let indiceActual = 0;
    let elementoAnterior = null;

    function mostrarFoto(indice) {
        indiceActual = (indice + fotos.length) % fotos.length;

        imagenAmpliada.src = fotos[indiceActual].src;
        imagenAmpliada.alt = fotos[indiceActual].alt;
    }

    function abrirVisor(indice) {
        elementoAnterior = document.activeElement;

        mostrarFoto(indice);

        visor.classList.add("activo");
        visor.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        cerrar.focus();
    }

    function cerrarVisor() {
        visor.classList.remove("activo");
        visor.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

        imagenAmpliada.removeAttribute("src");

        if (elementoAnterior) {
            elementoAnterior.focus();
        }
    }

    fotos.forEach((foto, indice) => {

        foto.addEventListener("click", () => {
            abrirVisor(indice);
        });

        foto.setAttribute("tabindex", "0");
        foto.setAttribute("role", "button");
        foto.setAttribute("aria-label", "Ampliar " + foto.alt);

        foto.addEventListener("keydown", (e) => {

            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                abrirVisor(indice);
            }

        });
    });

    siguiente.addEventListener("click", () => {
        mostrarFoto(indiceActual + 1);
    });

    anterior.addEventListener("click", () => {
        mostrarFoto(indiceActual - 1);
    });

    cerrar.addEventListener("click", cerrarVisor);

    visor.addEventListener("click", (e) => {
        if (e.target === visor) cerrarVisor();
    });

    document.addEventListener("keydown", (e) => {

        if (!visor.classList.contains("activo")) return;

        if (e.key === "Escape") {
            cerrarVisor();
        }

        if (e.key === "ArrowRight") {
            mostrarFoto(indiceActual + 1);
        }

        if (e.key === "ArrowLeft") {
            mostrarFoto(indiceActual - 1);
        }

        if (e.key === "Tab") {

            const controles = [cerrar, anterior, siguiente];
            const indice = controles.indexOf(document.activeElement);

            if (e.shiftKey && indice <= 0) {
                e.preventDefault();
                siguiente.focus();

            } else if (
                !e.shiftKey &&
                indice === controles.length - 1
            ) {
                e.preventDefault();
                cerrar.focus();
            }
        }
    });

});


/* =========================================
   FORMULARIO DE CONFIRMACIÓN
   SIN ACOMPAÑANTES
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById("formConfirmacion");

    if (!formulario) return;

    const btn = document.getElementById("enviar");
    const estado = document.getElementById("estado");

    const nombre = document.getElementById("nombre");
    const apellido = document.getElementById("apellido");
    const detalle = document.getElementById("detalle");
    const cancion = document.getElementById("cancion");
    const mensaje = document.getElementById("mensaje");

    // Obtener valor de los botones de selección
    const valor = (name) => {
        return formulario.querySelector(
            `[name="${name}"]:checked`
        )?.value || "";
    };

    // Mostrar u ocultar campos
    function mostrar(id, condicion) {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.classList.toggle("oculto", !condicion);
        }
    }

    // Actualizar campos según las respuestas
    function actualizar() {

        const asiste = valor("asiste") === "Sí";

        const tieneRestriccion =
            asiste && valor("restriccion") === "Sí";

        // Mostrar campos solo si confirma asistencia
        mostrar("camposAsistencia", asiste);

        // Mostrar detalle si tiene restricción
        mostrar("cajaDetalle", tieneRestriccion);

        // Campo obligatorio únicamente cuando corresponde
        if (detalle) {
            detalle.required = tieneRestriccion;
        }
    }

    formulario.addEventListener("change", actualizar);

    actualizar();

    // Envío del formulario
    formulario.addEventListener("submit", (e) => {

        e.preventDefault();

        actualizar();

        if (!formulario.reportValidity()) return;

        const asiste = valor("asiste") === "Sí";

        const tieneRestriccion =
            asiste && valor("restriccion") === "Sí";

        // Datos a enviar a Google Sheets
        const datos = {

            nombre: nombre.value.trim(),
            apellido: apellido.value.trim(),

            asiste: valor("asiste"),

            restriccion: asiste
                ? valor("restriccion")
                : "No",

            detalle: tieneRestriccion
                ? detalle.value.trim()
                : "",

            cancion: asiste
                ? cancion.value.trim()
                : "",

            mensaje: mensaje.value.trim()

        };

        btn.disabled = true;

        estado.className = "estado";
        estado.textContent = "Enviando confirmación...";

        // Envío mediante Google Apps Script
        if (
            typeof google === "undefined" ||
            !google.script?.run
        ) {
            estado.className = "estado error";
            estado.textContent =
                "No se pudo conectar con el sistema de confirmaciones.";

            btn.disabled = false;
            return;
        }

        google.script.run
            .withSuccessHandler(() => {

                estado.className = "estado exito";
                estado.textContent =
                    "¡Gracias! Tu respuesta quedó registrada correctamente.";

                formulario.reset();
                actualizar();

                btn.disabled = false;

            })
            .withFailureHandler((error) => {

                estado.className = "estado error";

                estado.textContent =
                    "No pudimos guardar la respuesta. Intentá nuevamente. " +
                    (error?.message || "");

                btn.disabled = false;

            })
            .guardarConfirmacion(datos);

    });

});


/* =========================================
   COPIAR CUENTAS BANCARIAS
========================================= */

async function copiarCuenta(numero, boton) {

    const textoOriginal = boton.textContent;

    try {

        await navigator.clipboard.writeText(numero);

        boton.textContent = "✓ ¡Copiado!";

        setTimeout(() => {
            boton.textContent = textoOriginal;
        }, 2000);

    } catch (error) {

        alert(
            "No se pudo copiar el número. Podés seleccionarlo manualmente."
        );

    }
}


/* =========================================
   ANIMACIONES SUAVES AL HACER SCROLL
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const elementos = document.querySelectorAll(
        "#siguiente-seccion > div, " +
        ".celebracion, " +
        ".galeria-foto, " +
        ".formulario"
    );

    // Respetar preferencias de accesibilidad
    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        return;
    }

    elementos.forEach((elemento) => {
        elemento.classList.add("revelar");
    });

    document.body.classList.add("animaciones-activas");

    const observador = new IntersectionObserver(
        (entradas) => {

            entradas.forEach((entrada) => {

                if (entrada.isIntersecting) {

                    entrada.target.classList.add("visible");

                    observador.unobserve(entrada.target);

                }

            });

        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -20% 0px"
        }
    );

    elementos.forEach((elemento) => {
        observador.observe(elemento);
    });

});