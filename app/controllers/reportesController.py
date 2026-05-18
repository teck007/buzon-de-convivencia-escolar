from flask import render_template, request, flash, redirect, url_for, session, jsonify
from app.models.reportes import Reporte
from app.models.alumnos import Alumnos
from app.utils.ia import query_ia
from datetime import datetime
from app import app

# Credenciales fijas para admin (sin base de datos)
ADMIN_CREDENTIALS = {
    'email': 'admin@colegio.com',
    'password': 'admin123'
}

# Página principal landing
@app.route('/')
def index():
    return render_template('index.html')


# Validar alumno antes de hacer reporte
@app.route('/validar_alumno', methods=['POST'])
def validar_alumno():
    """Valida RUT y fecha de nacimiento contra la base de datos"""
    try:
        data = request.get_json()
        rut = data.get('rut', '').strip()
        fecha_nacimiento = data.get('fecha_nacimiento', '').strip()
        
        print(f"[VALIDACION] RUT ingresado: {rut}")
        print(f"[VALIDACION] Fecha ingresada: {fecha_nacimiento}")
        
        if not rut or not fecha_nacimiento:
            return jsonify({
                'valido': False,
                'mensaje': 'Por favor complete todos los campos'
            }), 400
        
        # Limpiar RUT (remover puntos, guiones y espacios)
        rut_limpio = rut.replace('.', '').replace('-', '').replace(' ', '').upper()
        print(f"[VALIDACION] RUT limpio: {rut_limpio}")
        
        # Obtener todos los alumnos
        alumnos = Alumnos.obtener_todos()
        print(f"[VALIDACION] Total de alumnos en BD: {len(alumnos)}")
        
        # Buscar coincidencia
        for alumno in alumnos:
            if alumno.rut is None:
                continue
                
            alumno_rut = alumno.rut.replace('.', '').replace('-', '').replace(' ', '').upper()
            print(f"[VALIDACION] Comparando: {rut_limpio} == {alumno_rut}")
            
            # Comparar RUT
            if alumno_rut == rut_limpio:
                print(f"[VALIDACION] RUT coincide! Verificando fecha...")
                
                # Comparar fecha de nacimiento
                if alumno.fecha_nacimiento:
                    fecha_alumno = alumno.fecha_nacimiento.strftime('%Y-%m-%d') if hasattr(alumno.fecha_nacimiento, 'strftime') else str(alumno.fecha_nacimiento)
                    print(f"[VALIDACION] Fecha en BD: {fecha_alumno}, Fecha ingresada: {fecha_nacimiento}")
                    
                    if fecha_alumno == fecha_nacimiento:
                        # Validación exitosa
                        nombre_completo = f"{alumno.nombre} {alumno.apellidos}".strip() if alumno.nombre and alumno.apellidos else alumno.nombre or "Alumno"
                        print(f"[VALIDACION] ✓ VALIDACIÓN EXITOSA para {nombre_completo}")
                        return jsonify({
                            'valido': True,
                            'mensaje': 'Validación exitosa',
                            'nombre': nombre_completo,
                            'apellidos': alumno.apellidos or '',
                            'rut': alumno.rut
                        }), 200
                    else:
                        print(f"[VALIDACION] Fecha NO coincide")
        
        # No se encontró coincidencia
        print(f"[VALIDACION] ✗ No se encontró coincidencia")
        return jsonify({
            'valido': False,
            'mensaje': 'RUT o fecha de nacimiento no coinciden. Por favor verifique los datos.'
        }), 200
        
    except Exception as e:
        print(f"[VALIDACION] ✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'valido': False,
            'mensaje': 'Error al procesar la validación'
        }), 500

# Ver formulario de reporte
@app.route('/reporte', methods=['GET'])
def reporte():
    return render_template('reporte.html')

# Crear reporte
@app.route('/reporte', methods=['POST'])
def crear_reporte():
    # Datos para reporte
    nombre = request.form.get('nombre')
    rut = request.form.get('rut')
    curso = request.form.get('curso')
    correo = request.form.get('correo')
    categoria = request.form.get('tipoReporte')
    descripcion = request.form.get('declaracion')
    
    # Validaciones
    if not all([nombre, rut, curso, categoria, descripcion]):
        flash('Por favor complete todos los campos requeridos', 'error')     
        return redirect(url_for('reporte'))

    # Obtener prioridad sugerida por IA
    ia_prioridad = query_ia(descripcion)
    
    # Normalizar valor devuelto por IA
    if ia_prioridad in ('alta', 'media', 'baja', 'spam'):
        prioridad = ia_prioridad
    else:
        prioridad = 'baja'
    
    # Validar que el reporte no sea spam
    if prioridad == "spam":
        flash('Reporte identificado como no relevante. Si es un error, por favor contacte al administrador.', 'info')
        return redirect(url_for('reporte'))
    try:
        Reporte.guardar_reporte(nombre, rut, curso, correo, categoria, descripcion, prioridad, False)
    except Exception as e:
        flash(f'Error al guardar el reporte: {str(e)}', 'error')
        return redirect(url_for('reporte'))
    flash('Reporte enviado exitosamente. Será revisado pronto.', 'success')
    # Redirigir a la página de inicio
    return redirect(url_for('index'))

@app.route('/admin')
def admin():
    """Panel de administración (solo con login)"""
    if 'admin_logged_in' not in session:
        flash('Debe iniciar sesión como administrador', 'error')
        return redirect(url_for('login'))
    try:
        reportes = Reporte.obtener_todos()
        reportes.sort(key=lambda x: x.created_at, reverse=True)
        return render_template('admin.html', reportes=reportes)
    except Exception as e:
        flash(f'Error al cargar los reportes: {str(e)}', 'error')
        return render_template('admin.html', reportes=[])


@app.route('/detalle_reporte/<int:reporte_id>')
def detalle_reporte(reporte_id):
    """Ver detalles completos de un reporte"""
    if 'admin_logged_in' not in session:
        flash('Debe iniciar sesión como administrador', 'error')
        return redirect(url_for('login'))
    try:
        reporte = Reporte.obtener_por_id(reporte_id)
        if not reporte:
            flash('Reporte no encontrado', 'error')
            return redirect(url_for('admin'))
        return render_template('detalle_reporte.html', reporte=reporte)
    except Exception as e:
        flash(f'Error al cargar el reporte: {str(e)}', 'error')
        return redirect(url_for('admin'))


# Página de login solo para administrativos
@app.route('/login', methods=['GET', 'POST'])
def login():
    # Si ya está logueado, redirigir al admin
    if 'admin_logged_in' in session:
        return redirect(url_for('admin'))
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        if not all([email, password]):
            flash('Por favor complete email y contraseña', 'error')
            return render_template('login.html')
        # Verificar credenciales fijas
        if email == ADMIN_CREDENTIALS['email'] and password == ADMIN_CREDENTIALS['password']:
            session['admin_logged_in'] = True
            session['user_name'] = 'Administrador'
            flash('Bienvenido Administrador', 'success')
            return redirect(url_for('admin'))
        else:
            flash('Credenciales incorrectas', 'error')
    return render_template('login.html')


# Cerrar sesión
@app.route('/logout')
def logout():
    session.clear()
    flash('Sesión cerrada correctamente', 'success')
    return redirect(url_for('index'))


# Cambiar estado de un reporte
@app.route('/cambiar_estado/<int:reporte_id>/<nuevo_estado>')
def cambiar_estado(reporte_id, nuevo_estado):
    if 'admin_logged_in' not in session:
        flash('Acceso denegado', 'error')
        return redirect(url_for('login'))
    try:
        if Reporte.actualizar_estado(reporte_id, nuevo_estado):
            flash(f'Estado actualizado a {nuevo_estado}', 'success')
        else:
            flash('Error al actualizar estado', 'error')
    except Exception as e:
        flash(f'Error: {str(e)}', 'error')
    return redirect(url_for('admin'))