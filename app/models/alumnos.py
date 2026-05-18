from app.utils.mysqlconnection import connectToMySQL

class Alumnos:
    def __init__(self, data):
        self.fecha_nacimiento = data.get('fecha_nacimiento')
        self.rut = data.get('rut')
        self.nombre = data.get('nombre')
        self.apellidos = data.get('apellidos')
    
    @classmethod
    def obtener_todos(cls):
        """Obtiene todos los alumnos de la base de datos"""
        try:
            query = "SELECT fecha_nacimiento, rut, nombre, apellidos FROM alumnos"
            resultados = connectToMySQL('db_buzon').query_db(query)
            
            if resultados is None:
                print("No se encontraron resultados")
                return []
            
            alumnos = []
            for fila in resultados:
                alumnos.append(cls(fila))
            return alumnos
        except Exception as e:
            print(f"Error al obtener alumnos: {e}")
            return [] 