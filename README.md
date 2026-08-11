# Paradas de Línea por Tecnología 2026

Aplicativo web interactivo con **Python (Flask)**, **MySQL** y frontend dinámico para gestionar el registro diario del reporte *PARADAS DE LÍNEA POR TECNOLOGÍA 2026*.

## Estructura del proyecto

```
ControlParadas/
├── app.py                 # Aplicación Flask y endpoints API
├── config.py              # Configuración desde variables de entorno
├── db.py                  # Conexión MySQL (mysql-connector-python)
├── schema.sql             # Script de base de datos (MySQL Workbench)
├── seed.sql               # Datos de ejemplo (Enero 2026)
├── requirements.txt
├── .env.example
├── templates/
│   └── index.html         # Vista principal (matriz + modal Bootstrap 5)
└── static/
    ├── css/style.css      # Estilos de la planilla
    └── js/main.js         # Lógica Fetch API / renderizado
```

## Requisitos

- Python 3.10+
- MySQL 8.0+ (o MySQL Workbench)
- pip

## Instalación paso a paso

### 1. Crear la base de datos

1. Abre **MySQL Workbench**.
2. Conéctate a tu servidor local.
3. Abre el archivo `schema.sql` y ejecútalo completo (**Lightning bolt** / `Ctrl+Shift+Enter`).
4. (Opcional) Ejecuta `seed.sql` para cargar datos de muestra de enero 2026.

También puedes hacerlo por terminal:

```bash
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
```

### 2. Configurar el entorno Python

```bash
cd ControlParadas
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Variables de entorno

Copia el ejemplo y ajusta usuario/contraseña de MySQL:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Edita `.env`:

```
SECRET_KEY=cambia-esta-clave
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=tu_password
MYSQL_DATABASE=control_paradas
```

### 4. Ejecutar la aplicación

```bash
python app.py
```

Abre el navegador en: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Uso

1. Selecciona el **mes** (Enero–Diciembre 2026); la tabla se refresca por Ajax.
2. Si el calendario está vacío, pulsa **Precargar 2026** (marca domingos y festivos de Colombia).
3. Haz clic en una celda de un día hábil para editar métricas (parada, producción, responsable, justificación).
4. En la fila **Horarios del personal**, cada bloque es una **semana** (lunes–domingo):
   - Clic → elige empleado + turno de trabajo
   - Puedes agregar varias filas por semana
5. En **Empleados y turnos** puedes crear, editar o desactivar el listado de personal y los turnos disponibles.
6. El **porcentaje de parada** se calcula solo:
   `(minutos_parada / (minutos_parada + minutos_produccion)) * 100`
7. Domingos y festivos se resaltan en rosado (`DOMINGO` / `FESTIVO`).

Si actualizas desde una BD antigua, ejecuta también `migrate_horarios.sql`.

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Vista principal |
| `GET` | `/api/registros?mes=1&anio=2026` | Registros del mes (JSON) |
| `POST` | `/api/registros/guardar` | Guardar/actualizar un día |
| `POST` | `/api/calendario/precargar` | Precargar año completo |

### Ejemplo `POST /api/registros/guardar`

```json
{
  "fecha_id": 2,
  "minutos_parada": 0,
  "minutos_produccion": 444,
  "responsable_proceso": "BRAYAN",
  "justificacion_parada": "",
  "detalle_horario": "Juan Admin - 7:00 AM hasta las 4:00 PM",
  "es_festivo": false
}
```

## Modelo de datos

- `dias_calendario` — fechas del año, flags `es_festivo` / `es_domingo`
- `registros_diarios` — métricas diarias; `porcentaje_parada` es columna generada
- `horarios_personal` — texto de turnos por día (el frontend agrupa bloques con `colspan`)

> Nota: `fecha_id` es `INT` y referencia `dias_calendario.id` (el campo `fecha` es `DATE` y no puede usarse como FK tipada desde un entero).
