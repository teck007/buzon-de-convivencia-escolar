// Elementos del modal
const validacionModal = document.getElementById('validacionModal');
const validacionForm = document.getElementById('validacionForm');
const validacionError = document.getElementById('validacionError');
const mainContainer = document.getElementById('mainContainer');

// Mostrar el modal al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  // El modal se muestra por defecto, el formulario está oculto
  validacionModal.classList.remove('hidden');
  mainContainer.classList.add('hidden');
});

// Manejar el envío del formulario de validación
validacionForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const rut = document.getElementById('validacionRut').value.trim();
  const fechaNacimiento = document.getElementById('validacionFecha').value.trim();

  // Limpiar mensaje de error previo
  validacionError.textContent = '';
  validacionError.classList.add('validation-error-hidden');

  // Validar que no estén vacíos
  if (!rut || !fechaNacimiento) {
    mostrarError('Por favor complete todos los campos');
    return;
  }

  try {
    // Enviar validación al backend
    const response = await fetch('/validar_alumno', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rut: rut,
        fecha_nacimiento: fechaNacimiento
      })
    });

    const data = await response.json();

    if (data.valido) {
      // Validación exitosa - mostrar formulario
      validacionModal.classList.add('hidden');
      mainContainer.classList.remove('hidden');
      
      // Guardar datos en sessionStorage para pre-llenar el formulario
      sessionStorage.setItem('rutValidado', rut);
      sessionStorage.setItem('alumnoNombre', data.nombre || '');
      sessionStorage.setItem('alumnoApellidos', data.apellidos || '');
      
      // Pre-rellenar el formulario de reporte
      const nombreInput = document.getElementById('nombre');
      const rutInput = document.getElementById('rut');
      
      if (nombreInput) {
        nombreInput.value = data.nombre || '';
        nombreInput.readOnly = true; // Hacer readonly para que no lo cambien
      }
      
      if (rutInput) {
        rutInput.value = rut;
        rutInput.readOnly = true; // Hacer readonly para que no lo cambien
      }
    } else {
      // Validación falló
      mostrarError(data.mensaje || 'RUT o fecha de nacimiento no coinciden. Por favor verifique los datos.');
    }
  } catch (error) {
    console.error('Error al validar:', error);
    mostrarError('Error al conectar con el servidor. Intente de nuevo.');
  }
});

// Función para mostrar errores
function mostrarError(mensaje) {
  validacionError.textContent = mensaje;
  validacionError.classList.remove('validation-error-hidden');
}

// Función para formatear RUT automáticamente
document.getElementById('validacionRut').addEventListener('input', function(e) {
  let rut = e.target.value.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  
  const cursorPosition = e.target.selectionStart;
  
  if (rut.length > 1) {
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    let cuerpoFormateado = '';
    for (let i = 0; i < cuerpo.length; i++) {
      if (i > 0 && (cuerpo.length - i) % 3 === 0) {
        cuerpoFormateado += '.';
      }
      cuerpoFormateado += cuerpo[i];
    }
    
    const nuevoValor = cuerpoFormateado + '-' + dv;
    e.target.value = nuevoValor;
    
    setTimeout(() => {
      let nuevaPosicion = cursorPosition;
      if (cursorPosition >= cuerpo.length - 3) nuevaPosicion += 1;
      if (cursorPosition >= cuerpo.length - 6) nuevaPosicion += 1;
      
      e.target.setSelectionRange(nuevaPosicion, nuevaPosicion);
    }, 0);
  }
});
