// ===== NEXUS GAMES - JAVASCRIPT FUNCIONAL =====
// API: CheapShark - https://cheapshark.com/api

// ===== VARIABLES GLOBALES =====
let juegosCache = []; // Cache de juegos cargados desde API
let juegosActuales = []; // Juegos actuales después de filtros
let paginaActual = 1;
let resultadosPorPagina = 20;
let apiBaseUrl = "https://www.cheapshark.com/api/1.0";

// ===== ELEMENTOS DEL DOM =====
const grid = document.getElementById("gridVideojuegos");
const estadoCarga = document.getElementById("estadoCarga");
const estadoError = document.getElementById("errorCarga");
const inputBusqueda = document.getElementById("inputBusqueda");
const btnBuscar = document.getElementById("btnBuscar");
const btnLimpiar = document.getElementById("btnLimpiar");
const filtroTienda = document.getElementById("filtroTienda");
const ordenamiento = document.getElementById("ordenamiento");
const paginacion = document.getElementById("paginacion");
const btnVerMas = document.getElementById("btnVerMas");
const modal = document.getElementById("modal");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const modalContent = document.getElementById("modalContent");
const progressBar = document.getElementById("progressBar");

// ===== MAPEO DE TIENDAS =====
const tiendas = {
  "1": "Steam",
  "7": "Epic Games",
  "25": "Humble Bundle"
};

// ===== FUNCIÓN: MOSTRAR BARRA DE PROGRESO =====
function mostrarProgreso() {
  progressBar.style.display = "block";
}

function ocultarProgreso() {
  progressBar.style.display = "none";
}

// ===== FUNCIÓN: CARGAR JUEGOS DE CHEAPSHARK API =====
async function cargarJuegosInicial() {
  mostrarProgreso();
  estadoCarga.style.display = "block";
  estadoError.style.display = "none";

  try {
    // Cargar juegos de las tres tiendas
    const tiendasIDs = ["1", "7", "25"]; // Steam, Epic Games, Humble Bundle
    const promesas = tiendasIDs.map((storeID) => {
      const url = `${apiBaseUrl}/deals?storeID=${storeID}&pageSize=50`;
      return fetch(url).then((response) => {
        if (!response.ok) {
          throw new Error(`Error al cargar juegos de la tienda ${storeID}`);
        }
        return response.json();
      });
    });

    // Esperar a que todas las promesas se resuelvan
    const resultados = await Promise.all(promesas);

    // Combinar los resultados de todas las tiendas
    juegosCache = resultados.flat();
    juegosActuales = [...juegosCache];
    paginaActual = 1;

    renderizarVideojuegos(obtenerJuegosPaginados());
    estadoCarga.style.display = "none";
  } catch (error) {
    console.error("Error:", error);
    estadoError.style.display = "block";
    estadoCarga.style.display = "none";
  } finally {
    ocultarProgreso();
  }
}

// ===== FUNCIÓN: BÚSQUEDA POR NOMBRE =====
async function buscarPorNombre(titulo) {
  if (!titulo.trim()) {
    juegosActuales = [...juegosCache];
    paginaActual = 1;
    renderizarVideojuegos(obtenerJuegosPaginados());
    return;
  }

  mostrarProgreso();
  estadoCarga.style.display = "block";
  estadoError.style.display = "none";

  try {
    const url = `${apiBaseUrl}/games?title=${encodeURIComponent(titulo)}&limit=60`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error en búsqueda");
    }

    const data = await response.json();

    if (data.length === 0) {
      juegosActuales = [];
      renderizarVideojuegos([]);
      estadoCarga.style.display = "none";
      return;
    }

    // Obtener detalles adicionales para cada juego encontrado
    const juegosConDetalles = await Promise.all(
      data.map(async (juego) => {
        try {
          const detallesUrl = `${apiBaseUrl}/deals?title=${encodeURIComponent(juego.external)}&exact=1`;
          const detallesResponse = await fetch(detallesUrl);
          const detalles = await detallesResponse.json();

          if (detalles && detalles.length > 0) {
            const detalle = detalles[0];
            return {
              title: detalle.title || juego.external,
              thumb: detalle.thumb || juego.thumb,
              salePrice: detalle.salePrice || "0.00",
              normalPrice: detalle.normalPrice || "N/A",
              storeID: detalle.storeID || juego.storeID,
              dealID: detalle.dealID || null,
            };
          }
        } catch (err) {
          console.error("Error obteniendo detalles adicionales:", err);
        }

        // Si no se pueden obtener detalles, devolver datos básicos
        return {
          title: juego.external || "Título Desconocido",
          thumb: juego.thumb || "https://via.placeholder.com/250x350?text=Sin+Imagen",
          salePrice: juego.cheapest || "0.00",
          normalPrice: "N/A",
          storeID: juego.storeID || "Desconocida",
          dealID: juego.cheapestDealID || null,
        };
      })
    );

    juegosActuales = juegosConDetalles;
    paginaActual = 1;
    renderizarVideojuegos(obtenerJuegosPaginados());
    estadoCarga.style.display = "none";
  } catch (error) {
    console.error("Error en búsqueda:", error);
    estadoError.style.display = "block";
    estadoCarga.style.display = "none";
  } finally {
    ocultarProgreso();
  }
}

// ===== FUNCIÓN: OBTENER JUEGOS PAGINADOS =====
function obtenerJuegosPaginados() {
  const inicio = (paginaActual - 1) * resultadosPorPagina;
  const fin = inicio + resultadosPorPagina;
  return juegosActuales.slice(inicio, fin);
}

// ===== FUNCIÓN: CREAR TARJETA DE JUEGO =====
function crearTarjetaJuego(juego) {
  const titulo = juego.title || juego.external || "Juego Desconocido";
  const imagen = juego.thumb || "https://via.placeholder.com/250x350?text=Sin+Imagen";
  const precioNormal = juego.normalPrice ? parseFloat(juego.normalPrice).toFixed(2) : "_";
  const precioOferta = juego.salePrice ? parseFloat(juego.salePrice).toFixed(2) : precioNormal;
  const descuento = juego.savings ? Math.round(juego.savings) : null;
  const tienda = tiendas[juego.storeID] || "Tienda Desconocida";

  const card = document.createElement("div");
  card.style.cssText = `
    background-color: #0f172a;
    border: 1px solid #0891b2;
    border-radius: 0.75rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 300ms;
    cursor: pointer;
  `;

  card.innerHTML = `
    <img src="${imagen}" alt="${titulo}" style="width: 100%; height: 200px; object-fit: cover;" />
    <div style="padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; gap: 0.5rem;">
      <h3 style="font-family: 'Orbitron', sans-serif; font-size: 0.95rem; font-weight: 600; color: #ffffff; margin: 0;">${titulo}</h3>
      
      <p style="font-size: 0.75rem; color: #0891b2; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">
        ${tienda}
      </p>

      <div style="font-size: 0.875rem; color: #cbd5e1; margin: 0.5rem 0 0 0;">
        ${precioNormal !== "_" ? `<s style="color: #64748b;">$${precioNormal}</s>` : ""}
        ${precioOferta !== "_" ? `<span style="color: #06b6d4; font-weight: 600; margin-left: 0.5rem;">$${precioOferta}</span>` : ""}
        ${descuento ? `<span style="color: #10b981; font-weight: 600; margin-left: 0.5rem;">-${descuento}%</span>` : ""}
      </div>

      <button style="margin-top: auto; background-color: #0891b2; color: #000000; border: none; border-radius: 0.5rem; padding: 0.5rem 1rem; font-weight: 600; cursor: pointer; transition: all 300ms; font-size: 0.875rem;">
        Ver Detalle
      </button>
    </div>
  `;

  // Evento del botón Ver Detalle
  card.querySelector("button").addEventListener("click", () => {
    abrirModal(juego, titulo, imagen, precioNormal, precioOferta, descuento, tienda);
  });

  // Efectos hover
  card.addEventListener("mouseenter", () => {
    card.style.transform = "scale(1.05)";
    card.style.boxShadow = "0 0 30px rgba(8, 145, 178, 0.5)";
    card.style.borderColor = "#06b6d4";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "scale(1)";
    card.style.boxShadow = "none";
    card.style.borderColor = "#0891b2";
  });

  return card;
}

// ===== FUNCIÓN: RENDERIZAR VIDEOJUEGOS (RENDER DINÁMICO) =====
// REQUISITO: Generar las tarjetas desde JavaScript (no escritas manualmente en el HTML)
// REQUISITO: Buen manejo del DOM - No duplicar elementos al recargar datos
function renderizarVideojuegos(lista) {
  grid.innerHTML = ""; // Limpiar contenedor

  if (lista.length === 0) {
    grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #cbd5e1;'>No se encontraron videojuegos</p>";
    btnVerMas.style.display = "none";
    return;
  }

  lista.forEach((juego) => {
    const card = crearTarjetaJuego(juego);
    grid.appendChild(card);
  });

  // Mostrar botón "Ver Más" si hay más juegos
  const totalJuegos = juegosActuales.length;
  const juegosRenderizados = paginaActual * resultadosPorPagina;
  btnVerMas.style.display = juegosRenderizados < totalJuegos ? "block" : "none";
}

// ===== FUNCIÓN: ABRIR MODAL CON DETALLE =====
// REQUISITO: Modal de detalle - Mostrar nombre, imagen, precio normal, precio en oferta y enlace a tienda
function abrirModal(juego, titulo, imagen, precioNormal, precioOferta, descuento, tienda) {
  const enlaceTienda = juego.dealID ? `https://www.cheapshark.com/redirect/deal/${juego.dealID}` : "#";

  modalContent.innerHTML = `
    <img src="${imagen}" alt="${titulo}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 1rem;" />
    
    <h2 style="font-family: 'Orbitron', sans-serif; color: #0891b2; font-size: 1.5rem; margin-bottom: 0.5rem; text-transform: uppercase;">${titulo}</h2>
    
    <p style="color: #cbd5e1; font-size: 0.875rem; margin-bottom: 1rem;">
      <strong>Tienda:</strong> ${tienda}
    </p>

    <div style="background-color: #1e293b; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
      <p style="color: #cbd5e1; margin: 0.5rem 0;">
        <strong>Precio Normal:</strong> 
        ${precioNormal !== "_" ? `<span style="color: #64748b;"><s>$${precioNormal}</s></span>` : "<span>No disponible</span>"}
      </p>
      <p style="color: #06b6d4; margin: 0.5rem 0; font-size: 1.25rem; font-weight: 600;">
        <strong>Precio en Oferta:</strong> $${precioOferta}
      </p>
      ${descuento ? `<p style="color: #10b981; margin: 0.5rem 0; font-weight: 600;">
        <strong>Descuento:</strong> -${descuento}%
      </p>` : ""}
    </div>

    <a href="${enlaceTienda}" target="_blank" style="display: inline-block; background-color: #0891b2; color: #000000; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: all 300ms;">
      Ver en ${tienda} →
    </a>
  `;

  modal.style.display = "flex";
}

// ===== FUNCIÓN: CERRAR MODAL =====
function cerrarModal() {
  modal.style.display = "none";
}

// ===== FUNCIÓN: FILTRAR POR TIENDA =====
function aplicarFiltros() {
  let juegosFiltrando = [...juegosCache];

  // Filtro por tienda (storeID)
  const tiendaSeleccionada = filtroTienda.value;
  if (tiendaSeleccionada) {
    juegosFiltrando = juegosFiltrando.filter((juego) => juego.storeID == tiendaSeleccionada);
  }

  // Ordenamiento por precio
  const ordenSeleccionado = ordenamiento.value;
  if (ordenSeleccionado === "precio-asc") {
    juegosFiltrando.sort((a, b) => parseFloat(a.salePrice || a.normalPrice || 0) - parseFloat(b.salePrice || b.normalPrice || 0));
  } else if (ordenSeleccionado === "precio-desc") {
    juegosFiltrando.sort((a, b) => parseFloat(b.salePrice || b.normalPrice || 0) - parseFloat(a.salePrice || a.normalPrice || 0));
  } else if (ordenSeleccionado === "descuento") {
    juegosFiltrando.sort((a, b) => (b.savings || 0) - (a.savings || 0));
  }

  juegosActuales = juegosFiltrando;
  paginaActual = 1;
  renderizarVideojuegos(obtenerJuegosPaginados());
}

// ===== FUNCTION: CARGAR MÁS JUEGOS (PAGINACIÓN DINÁMICA) =====
// REQUISITO: Paginación o botón "Ver más"
function cargarMasJuegos() {
  paginaActual++;
  const nuevosPaginados = obtenerJuegosPaginados();
  
  nuevosPaginados.forEach((juego) => {
    const card = crearTarjetaJuego(juego);
    grid.appendChild(card);
  });

  // Actualizar visibilidad del botón
  const totalJuegos = juegosActuales.length;
  const juegosRenderizados = paginaActual * resultadosPorPagina;
  btnVerMas.style.display = juegosRenderizados < totalJuegos ? "block" : "none";
}

// ===== EVENT LISTENERS =====
// Búsqueda funcional - Solo por botón y Enter
btnBuscar.addEventListener("click", () => {
  buscarPorNombre(inputBusqueda.value);
});

inputBusqueda.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    buscarPorNombre(inputBusqueda.value);
  }
});

// Limpiar búsqueda
btnLimpiar.addEventListener("click", () => {
  inputBusqueda.value = "";
  juegosActuales = [...juegosCache];
  paginaActual = 1;
  ordenamiento.value = "";
  filtroTienda.value = "";
  renderizarVideojuegos(obtenerJuegosPaginados());
});

// Filtros y ordenamiento
filtroTienda.addEventListener("change", aplicarFiltros);
ordenamiento.addEventListener("change", aplicarFiltros);

// Cambiar resultados por página
paginacion.addEventListener("change", (e) => {
  resultadosPorPagina = parseInt(e.target.value);
  paginaActual = 1;
  renderizarVideojuegos(obtenerJuegosPaginados());
});

// Cargar más juegos
btnVerMas.addEventListener("click", cargarMasJuegos);

// Cerrar modal
btnCerrarModal.addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    cerrarModal();
  }
});

// ===== REQUISITO: Uso de async/await y try...catch - Correcta implementación de asincronía =====
// Cargar videojuegos al iniciar
cargarJuegosInicial();
