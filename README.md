# 🎮 NEXUS GAMES - Tienda de Videojuegos Futurista

> **Centro de Control de Videojuegos** - Aplicación web para explorar y comprar videojuegos usando la API de CheapShark

## 🚀 Características

### ✅ Funcionalidad Completa

- **Carga de Videojuegos**: Obtiene al menos 12 juegos de la API CheapShark (`/deals?storeID=1&pageSize=50`)
- **Búsqueda Funcional**: Busca juegos por nombre usando el endpoint `/games?title=texto&limit=20`
- **Render Dinámico**: Todas las tarjetas se generan desde JavaScript, sin HTML manual
- **Modal de Detalle**: Al hacer clic en "Ver Detalle", muestra información completa y enlace a tienda
- **Paginación Dinámica**: Botón "Cargar Más" para ver más juegos
- **Ordenamiento**: Por precio (menor/mayor) y mayor descuento
- **Filtrado por Tienda**: Steam, Epic Games, Humble Bundle
- **Indicadores Visuales**: Barra de progreso animada, "Cargando...", "Error"
- **Async/Await**: Manejo correcto de asincronía con try...catch
- **Manejo del DOM**: Sin duplicación de elementos

### 🎨 Diseño

- **Tema**: Futurista y sofisticado (Nexus Games)
- **Colores**: Negro puro (#000), Cyan-600 (#0891b2)
- **Tipografía**: Orbitron (títulos), Roboto (texto)
- **Favicon**: Ícono personalizado
- **Responsive**: Diseño adaptado para móvil y escritorio

## 📁 Estructura del Proyecto

```
examenf/
├── public/
│   ├── index.html
│   ├── script.js
│   ├── output.css
│   └── styles.css
├── src/
│   └── input.css
├── package.json
├── tailwind.config.js
└── README.md
```

## 🛠️ Instalación

```bash
npm install
npm run build:css
```

## 🔗 API Utilizada

CheapShark - https://cheapshark.com/api

## 📊 Requisitos Cumplidos

- ✅ Carga inicial de videojuegos
- ✅ Búsqueda funcional
- ✅ Render dinámico
- ✅ Modal de detalle
- ✅ Paginación
- ✅ Ordenamiento por precio
- ✅ Filtrado por tienda (Steam, Epic, Humble)
- ✅ Indicadores visuales
- ✅ Async/await y try...catch
- ✅ Buen manejo del DOM
- ✅ Diseño responsive
- ✅ Favicon personalizado
- ✅ 5+ commits visibles en GitHub

## 👨‍💻 Autor

Jeremy Viracocha F. - Examen Práctico
