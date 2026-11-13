// ============================================================
// REGISTRO DE USO DE IA
// (Reemplazá este bloque por tu propio comentario de registro de IA)
// ============================================================


// ============================================================
// 1. DATOS DE LA APLICACIÓN
// ============================================================

// Clave con la que se guardan todos los datos en localStorage
const CLAVE_ALMACENAMIENTO = "stock-datos";

// Los tres arrays principales (al arrancar están vacíos)
// categorias:  { id, nombre }
// productos:   { codigo, nombre, categoriaId, unidad, precio, stockInicial, stockActual, stockMinimo }
// movimientos: { id, codigo, tipo, motivo, cantidad, fecha, observacion }
let categorias = [];
let productos = [];
let movimientos = [];

// Carga los datos de ejemplo (todos ficticios)
function crearDatosIniciales() {
  categorias = [
    { id: 1, nombre: "Almacén" },
    { id: 2, nombre: "Lácteos" },
    { id: 3, nombre: "Limpieza" },
    { id: 4, nombre: "Bebidas" }
  ];

  // Códigos de 13 dígitos que empiezan con 779
  productos = [
    { codigo: "7790001000011", nombre: "Fideos tirabuzón 500 g", categoriaId: 1, unidad: "paquete", precio: 1450.50, stockInicial: 40, stockActual: 40, stockMinimo: 10 },
    { codigo: "7790001000028", nombre: "Arroz largo fino 1 kg",   categoriaId: 1, unidad: "paquete", precio: 1890.00, stockInicial: 25, stockActual: 25, stockMinimo: 10 },
    { codigo: "7790002000015", nombre: "Leche entera 1 L",        categoriaId: 2, unidad: "litro",   precio: 1250.00, stockInicial: 60, stockActual: 60, stockMinimo: 20 },
    { codigo: "7790002000022", nombre: "Yogur natural 190 g",     categoriaId: 2, unidad: "unidad",  precio: 780.00,  stockInicial: 8,  stockActual: 8,  stockMinimo: 12 },
    { codigo: "7790003000019", nombre: "Detergente 750 ml",       categoriaId: 3, unidad: "unidad",  precio: 2100.00, stockInicial: 15, stockActual: 15, stockMinimo: 6 },
    { codigo: "7790003000026", nombre: "Lavandina 1 L",           categoriaId: 3, unidad: "litro",   precio: 950.00,  stockInicial: 0,  stockActual: 0,  stockMinimo: 8 },
    { codigo: "7790004000013", nombre: "Agua mineral 2 L",        categoriaId: 4, unidad: "unidad",  precio: 1100.00, stockInicial: 48, stockActual: 48, stockMinimo: 24 },
    { codigo: "7790004000020", nombre: "Gaseosa cola 2,25 L",     categoriaId: 4, unidad: "unidad",  precio: 2300.00, stockInicial: 30, stockActual: 30, stockMinimo: 12 }
  ];

  movimientos = [];
}

// Guarda los tres arrays juntos en localStorage (como texto JSON)
function guardarDatos() {
  const datos = { categorias, productos, movimientos };
  localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datos));
}

// Lee los datos guardados; si no hay (o están dañados), carga los de ejemplo
function cargarDatos() {
  try {
    const texto = localStorage.getItem(CLAVE_ALMACENAMIENTO);

    if (texto) {
      const datos = JSON.parse(texto);

      // Verificamos que los tres sean arrays antes de usarlos
      if (Array.isArray(datos.categorias) &&
          Array.isArray(datos.productos) &&
          Array.isArray(datos.movimientos)) {
        categorias = datos.categorias;
        productos = datos.productos;
        movimientos = datos.movimientos;
        return;
      }
    }
  } catch (error) {
    console.error("No se pudieron leer los datos guardados:", error);
  }

  // Si llegamos acá, no había datos válidos
  crearDatosIniciales();
  guardarDatos();
}


// ============================================================
// 2. FUNCIONES AUXILIARES
// ============================================================

// Deja el texto en minúsculas, sin tildes y sin espacios sobrantes
// (así "Lácteos" y "lacteos " se consideran el mismo nombre)
function normalizarTexto(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Devuelve un id nuevo: el mayor que existe más 1
function generarId(lista) {
  let mayor = 0;
  for (const elemento of lista) {
    if (elemento.id > mayor) {
      mayor = elemento.id;
    }
  }
  return mayor + 1;
}

// Cuenta cuántos productos pertenecen a una categoría
function contarProductosDeCategoria(idCategoria) {
  return productos.filter(function (producto) {
    return producto.categoriaId === idCategoria;
  }).length;
}


// ============================================================
// 3. LÓGICA DE CATEGORÍAS (alta, edición y baja)
// ============================================================

// Revisa el nombre. Devuelve el mensaje de error, o "" si está todo bien.
// idIgnorado sirve al editar: la categoría no se compara consigo misma.
function validarNombreCategoria(nombre, idIgnorado = null) {
  const nombreLimpio = nombre.trim();

  if (nombreLimpio === "") {
    return "El nombre de la categoría es obligatorio.";
  }

  const repetida = categorias.some(function (categoria) {
    return categoria.id !== idIgnorado &&
           normalizarTexto(categoria.nombre) === normalizarTexto(nombreLimpio);
  });

  if (repetida) {
    return "Ya existe una categoría con ese nombre.";
  }

  return "";
}

// ALTA: devuelve true si se pudo agregar
function agregarCategoria(nombre) {
  const error = validarNombreCategoria(nombre);
  if (error !== "") {
    alert(error);
    return false;
  }

  categorias.push({ id: generarId(categorias), nombre: nombre.trim() });
  guardarDatos();
  return true;
}

// EDICIÓN: devuelve true si se pudo modificar
function editarCategoria(id, nombreNuevo) {
  const error = validarNombreCategoria(nombreNuevo, id);
  if (error !== "") {
    alert(error);
    return false;
  }

  const categoria = categorias.find(function (c) {
    return c.id === id;
  });
  categoria.nombre = nombreNuevo.trim();
  guardarDatos();
  return true;
}

// BAJA: devuelve true si se eliminó
function eliminarCategoria(id) {
  // No se puede borrar si tiene productos
  const cantidad = contarProductosDeCategoria(id);
  if (cantidad > 0) {
    alert("No se puede eliminar: la categoría tiene " + cantidad +
          (cantidad === 1 ? " producto." : " productos."));
    return false;
  }

  if (!confirm("¿Seguro que querés eliminar esta categoría?")) {
    return false;
  }

  categorias = categorias.filter(function (categoria) {
    return categoria.id !== id;
  });
  guardarDatos();
  return true;
}


// ============================================================
// 4. PANTALLA DE CATEGORÍAS
// ============================================================

// Elementos del HTML que vamos a usar
const formularioCategoria = document.getElementById("formularioCategoria");
const campoCategoriaNombre = document.getElementById("categoriaNombre");
const listaCategorias = document.getElementById("listaCategorias");
const botonGuardarCategoria = formularioCategoria.querySelector("button[type='submit']");

// Guarda el id de la categoría que se está editando (null = estamos agregando)
let idCategoriaEnEdicion = null;

// Creamos por JS el botón "Cancelar" (aparece solo al editar)
const botonCancelarCategoria = document.createElement("button");
botonCancelarCategoria.type = "button";
botonCancelarCategoria.textContent = "Cancelar";
botonCancelarCategoria.hidden = true;
formularioCategoria.appendChild(botonCancelarCategoria);

// Dibuja la lista de categorías en pantalla
function mostrarCategorias() {
  listaCategorias.innerHTML = ""; // vaciamos la lista

  if (categorias.length === 0) {
    const vacio = document.createElement("li");
    vacio.textContent = "Todavía no hay categorías.";
    listaCategorias.appendChild(vacio);
    return;
  }

  for (const categoria of categorias) {
    const item = document.createElement("li");

    // Nombre y cantidad de productos
    const cantidad = contarProductosDeCategoria(categoria.id);
    const texto = document.createElement("span");
    texto.textContent = categoria.nombre + " (" + cantidad +
                        (cantidad === 1 ? " producto)" : " productos)");

    // Botones de acción (guardan el id y la acción en atributos data-)
    const acciones = document.createElement("span");

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.textContent = "✏️ Editar";
    botonEditar.dataset.accion = "editar";
    botonEditar.dataset.id = categoria.id;

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.textContent = "🗑️ Eliminar";
    botonEliminar.dataset.accion = "eliminar";
    botonEliminar.dataset.id = categoria.id;

    acciones.appendChild(botonEditar);
    acciones.appendChild(botonEliminar);

    item.appendChild(texto);
    item.appendChild(acciones);
    listaCategorias.appendChild(item);
  }
}

// Pone el formulario en modo "editar"
function iniciarEdicionCategoria(id) {
  const categoria = categorias.find(function (c) {
    return c.id === id;
  });

  idCategoriaEnEdicion = id;
  campoCategoriaNombre.value = categoria.nombre;
  botonGuardarCategoria.textContent = "Guardar cambios";
  botonCancelarCategoria.hidden = false;
  campoCategoriaNombre.focus();
}

// Vuelve el formulario al modo "agregar"
function cancelarEdicionCategoria() {
  idCategoriaEnEdicion = null;
  formularioCategoria.reset();
  botonGuardarCategoria.textContent = "Agregar categoría";
  botonCancelarCategoria.hidden = true;
}

// Al enviar el formulario: agrega o edita según el modo
formularioCategoria.addEventListener("submit", function (evento) {
  evento.preventDefault(); // evita que la página se recargue

  let salioBien;
  if (idCategoriaEnEdicion === null) {
    salioBien = agregarCategoria(campoCategoriaNombre.value);
  } else {
    salioBien = editarCategoria(idCategoriaEnEdicion, campoCategoriaNombre.value);
  }

  if (salioBien) {
    cancelarEdicionCategoria();
    mostrarCategorias();
  }
});

botonCancelarCategoria.addEventListener("click", cancelarEdicionCategoria);

// Un solo "oído" en la lista para los botones Editar y Eliminar de todas las filas
listaCategorias.addEventListener("click", function (evento) {
  const boton = evento.target.closest("button");
  if (!boton) {
    return; // el clic no fue sobre un botón
  }

  const id = Number(boton.dataset.id);

  if (boton.dataset.accion === "editar") {
    iniciarEdicionCategoria(id);
  } else if (boton.dataset.accion === "eliminar") {
    if (eliminarCategoria(id)) {
      // Si justo estábamos editando esa categoría, cancelamos la edición
      if (idCategoriaEnEdicion === id) {
        cancelarEdicionCategoria();
      }
      mostrarCategorias();
    }
  }
});


// ============================================================
// 5. ARRANQUE DE LA APLICACIÓN
// ============================================================
cargarDatos();
mostrarCategorias();
