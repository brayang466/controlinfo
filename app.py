"""
Aplicativo Flask — PARADAS DE LÍNEA POR TECNOLOGÍA 2026
"""

from datetime import date, timedelta
from decimal import Decimal

from flask import Flask, jsonify, render_template, request
from mysql.connector import Error

from config import Config
from db import close_db, execute, fetch_all, fetch_one

MESES = (
    "",
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
)

FESTIVOS_2026 = {
    "2026-01-01": "Año Nuevo",
    "2026-01-12": "Día de los Reyes Magos",
    "2026-03-23": "Día de San José",
    "2026-04-02": "Jueves Santo",
    "2026-04-03": "Viernes Santo",
    "2026-05-01": "Día del Trabajo",
    "2026-05-18": "Ascensión del Señor",
    "2026-06-08": "Corpus Christi",
    "2026-06-15": "Sagrado Corazón",
    "2026-06-29": "San Pedro y San Pablo",
    "2026-07-20": "Independencia de Colombia",
    "2026-08-07": "Batalla de Boyacá",
    "2026-08-17": "Asunción de la Virgen",
    "2026-10-12": "Día de la Raza",
    "2026-11-02": "Todos los Santos",
    "2026-11-16": "Independencia de Cartagena",
    "2026-12-08": "Inmaculada Concepción",
    "2026-12-25": "Navidad",
}


def _es_turno_planta_texto(*textos):
    blob = " ".join(str(t or "") for t in textos).lower()
    return "planta" in blob or "f.p" in blob.replace(" ", "")


def sincronizar_responsable_planta(lunes, domingo):
    """
    Si en la semana hay un empleado con turno de Planta,
    lo asigna como Responsable del proceso en todos los días de esa semana.
    """
    def _responsable_ambito(ambito):
        row = fetch_one(
            """
            SELECT e.nombre
            FROM horarios_semana hs
            JOIN empleados e ON e.id = hs.empleado_id
            JOIN turnos_trabajo t ON t.id = hs.turno_id
            WHERE hs.fecha_inicio = %s
              AND hs.ambito = %s
              AND (
                LOWER(t.nombre) LIKE %s
                OR UPPER(REPLACE(TRIM(t.hora_fin), ' ', '')) IN ('F.P', 'FP')
              )
            ORDER BY hs.id
            LIMIT 1
            """,
            (lunes.isoformat(), ambito, "%planta%"),
        )
        if not row:
            return None
        return (row["nombre"] or "").strip().upper() or None

    resp_lv = _responsable_ambito("lun_vie")
    resp_sab = _responsable_ambito("sabado")
    if not resp_lv and not resp_sab:
        return None

    dias = fetch_all(
        """
        SELECT id, fecha FROM dias_calendario
        WHERE fecha BETWEEN %s AND %s
        ORDER BY fecha
        """,
        (lunes.isoformat(), domingo.isoformat()),
    )
    ultimo = None
    for d in dias:
        f = d["fecha"] if isinstance(d["fecha"], date) else date.fromisoformat(str(d["fecha"])[:10])
        if f.weekday() == 5:  # sábado
            responsable = resp_sab or resp_lv
        elif f.weekday() == 6:  # domingo
            continue
        else:
            responsable = resp_lv
        if not responsable:
            continue
        ultimo = responsable
        existente = fetch_one(
            "SELECT id FROM registros_diarios WHERE fecha_id = %s", (d["id"],)
        )
        if existente:
            execute(
                """
                UPDATE registros_diarios
                SET responsable_proceso = %s
                WHERE fecha_id = %s
                """,
                (responsable, d["id"]),
            )
        else:
            execute(
                """
                INSERT INTO registros_diarios (
                  fecha_id, minutos_parada, minutos_produccion, responsable_proceso
                ) VALUES (%s, 0, 0, %s)
                """,
                (d["id"], responsable),
            )
    return ultimo


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.teardown_appcontext(close_db)

    @app.route("/")
    def index():
        return render_template("index.html")

    # ------------------------------------------------------------------
    # Registros diarios
    # ------------------------------------------------------------------
    @app.get("/api/registros")
    def api_registros():
        anio = request.args.get("anio", type=int) or 2026
        mes = request.args.get("mes", type=int) or 1
        if mes < 1 or mes > 12:
            return jsonify({"error": "Mes inválido (1-12)"}), 400

        count = fetch_one(
            """
            SELECT COUNT(*) AS total FROM dias_calendario
            WHERE YEAR(fecha) = %s AND MONTH(fecha) = %s
            """,
            (anio, mes),
        )
        if not count or count["total"] == 0:
            _precargar_anio(anio)

        dias = fetch_all(
            """
            SELECT
              dc.id, dc.fecha, dc.es_festivo, dc.es_domingo, dc.descripcion_festivo,
              rd.id AS registro_id,
              COALESCE(rd.minutos_parada, 0) AS minutos_parada,
              COALESCE(rd.minutos_produccion, 0) AS minutos_produccion,
              rd.hora_inicio_proceso, rd.hora_fin_proceso,
              rd.porcentaje_parada, rd.responsable_proceso, rd.justificacion_parada,
              hp.id AS horario_id, hp.detalle_horario
            FROM dias_calendario dc
            LEFT JOIN registros_diarios rd ON rd.fecha_id = dc.id
            LEFT JOIN horarios_personal hp ON hp.fecha_id = dc.id
            WHERE YEAR(dc.fecha) = %s AND MONTH(dc.fecha) = %s
            ORDER BY dc.fecha
            """,
            (anio, mes),
        )
        columnas = [_serializar_dia(d, mes) for d in dias]
        semanas = _semanas_del_mes(columnas)

        # Si ya hay turno de Planta asignado, asegura el responsable en esos días
        for sem in semanas:
            lunes = date.fromisoformat(sem["fecha_inicio"])
            domingo = date.fromisoformat(sem["fecha_fin"])
            responsable = sincronizar_responsable_planta(lunes, domingo)
            if responsable:
                sem["responsable_proceso"] = responsable

        # Releer días por si se actualizó el responsable
        dias = fetch_all(
            """
            SELECT
              dc.id, dc.fecha, dc.es_festivo, dc.es_domingo, dc.descripcion_festivo,
              rd.id AS registro_id,
              COALESCE(rd.minutos_parada, 0) AS minutos_parada,
              COALESCE(rd.minutos_produccion, 0) AS minutos_produccion,
              rd.hora_inicio_proceso, rd.hora_fin_proceso,
              rd.porcentaje_parada, rd.responsable_proceso, rd.justificacion_parada,
              hp.id AS horario_id, hp.detalle_horario
            FROM dias_calendario dc
            LEFT JOIN registros_diarios rd ON rd.fecha_id = dc.id
            LEFT JOIN horarios_personal hp ON hp.fecha_id = dc.id
            WHERE YEAR(dc.fecha) = %s AND MONTH(dc.fecha) = %s
            ORDER BY dc.fecha
            """,
            (anio, mes),
        )
        columnas = [_serializar_dia(d, mes) for d in dias]
        semanas = _semanas_del_mes(columnas)
        for sem in semanas:
            for a in sem.get("asignaciones") or []:
                if _es_turno_planta_texto(a.get("turno_etiqueta", ""), a.get("texto", "")):
                    sem["responsable_proceso"] = (a.get("empleado_etiqueta") or "").upper()
                    break

        return jsonify(
            {
                "anio": anio,
                "mes": mes,
                "titulo": f"PARADAS DE LÍNEA POR TECNOLOGÍA {anio}",
                "mes_nombre": MESES[mes],
                "columnas": columnas,
                "semanas": semanas,
                "empleados": _listar_empleados(solo_activos=True),
                "turnos": _listar_turnos(solo_activos=True),
            }
        )

    @app.post("/api/registros/guardar")
    def api_registros_guardar():
        data = request.get_json(silent=True) or {}
        fecha_id = data.get("fecha_id")
        fecha_str = data.get("fecha")

        if fecha_id:
            dia = fetch_one(
                "SELECT id, fecha FROM dias_calendario WHERE id = %s", (int(fecha_id),)
            )
        elif fecha_str:
            dia = fetch_one(
                "SELECT id, fecha FROM dias_calendario WHERE fecha = %s", (fecha_str,)
            )
        else:
            return jsonify({"error": "Debe enviar fecha_id o fecha"}), 400

        if not dia:
            return jsonify({"error": "Fecha no encontrada en el calendario"}), 404

        fecha_id = dia["id"]
        try:
            minutos_parada = int(data.get("minutos_parada", 0) or 0)
        except (TypeError, ValueError):
            return jsonify({"error": "Minutos inválidos"}), 400

        if minutos_parada < 0:
            return jsonify({"error": "Los minutos no pueden ser negativos"}), 400

        hora_inicio = (data.get("hora_inicio_proceso") or "").strip() or None
        hora_fin = (data.get("hora_fin_proceso") or "").strip() or None
        minutos_produccion = data.get("minutos_produccion")

        if hora_inicio and hora_fin:
            try:
                minutos_produccion, _, _ = _minutos_desde_horas(hora_inicio, hora_fin)
            except ValueError as exc:
                return jsonify({"error": str(exc)}), 400
        else:
            try:
                minutos_produccion = int(minutos_produccion or 0)
            except (TypeError, ValueError):
                return jsonify({"error": "Minutos de producción inválidos"}), 400

        if minutos_produccion < 0:
            return jsonify({"error": "Los minutos no pueden ser negativos"}), 400

        responsable = (data.get("responsable_proceso") or "").strip().upper() or None
        justificacion = (data.get("justificacion_parada") or "").strip() or None
        es_festivo = data.get("es_festivo")
        descripcion_festivo = (data.get("descripcion_festivo") or "").strip() or None

        try:
            existente = fetch_one(
                "SELECT id FROM registros_diarios WHERE fecha_id = %s", (fecha_id,)
            )
            if existente:
                execute(
                    """
                    UPDATE registros_diarios
                    SET minutos_parada = %s, minutos_produccion = %s,
                        hora_inicio_proceso = %s, hora_fin_proceso = %s,
                        responsable_proceso = %s, justificacion_parada = %s
                    WHERE fecha_id = %s
                    """,
                    (
                        minutos_parada,
                        minutos_produccion,
                        hora_inicio,
                        hora_fin,
                        responsable,
                        justificacion,
                        fecha_id,
                    ),
                )
            else:
                execute(
                    """
                    INSERT INTO registros_diarios (
                      fecha_id, minutos_parada, minutos_produccion,
                      hora_inicio_proceso, hora_fin_proceso,
                      responsable_proceso, justificacion_parada
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        fecha_id,
                        minutos_parada,
                        minutos_produccion,
                        hora_inicio,
                        hora_fin,
                        responsable,
                        justificacion,
                    ),
                )

            if es_festivo is not None:
                execute(
                    """
                    UPDATE dias_calendario
                    SET es_festivo = %s, descripcion_festivo = %s
                    WHERE id = %s
                    """,
                    (bool(es_festivo), descripcion_festivo if es_festivo else None, fecha_id),
                )
        except Error as exc:
            return jsonify({"error": str(exc)}), 500

        row = fetch_one(
            """
            SELECT dc.id AS fecha_id, dc.fecha, dc.es_festivo, dc.es_domingo,
                   dc.descripcion_festivo, rd.minutos_parada, rd.minutos_produccion,
                   rd.hora_inicio_proceso, rd.hora_fin_proceso,
                   rd.porcentaje_parada, rd.responsable_proceso, rd.justificacion_parada,
                   hp.detalle_horario
            FROM dias_calendario dc
            LEFT JOIN registros_diarios rd ON rd.fecha_id = dc.id
            LEFT JOIN horarios_personal hp ON hp.fecha_id = dc.id
            WHERE dc.id = %s
            """,
            (fecha_id,),
        )
        mes_num = row["fecha"].month if isinstance(row["fecha"], date) else int(str(row["fecha"])[5:7])
        return jsonify({"ok": True, "registro": _serializar_dia(row, mes_num)})

    @app.post("/api/calendario/precargar")
    def api_precargar():
        data = request.get_json(silent=True) or {}
        anio = int(data.get("anio") or request.args.get("anio") or 2026)
        creados = _precargar_anio(anio)
        return jsonify({"ok": True, "anio": anio, "dias_creados": creados})

    # ------------------------------------------------------------------
    # Empleados
    # ------------------------------------------------------------------
    @app.get("/api/empleados")
    def api_empleados():
        todos = request.args.get("todos") == "1"
        return jsonify(_listar_empleados(solo_activos=not todos))

    @app.post("/api/empleados")
    def api_empleados_crear():
        data = request.get_json(silent=True) or {}
        nombre = (data.get("nombre") or "").strip()
        if not nombre:
            return jsonify({"error": "El nombre es obligatorio"}), 400
        existe = fetch_one(
            """
            SELECT id FROM empleados
            WHERE LOWER(nombre) = LOWER(%s) AND activo = TRUE
            """,
            (nombre,),
        )
        if existe:
            return jsonify({"error": "Ya existe un empleado con ese nombre"}), 409
        try:
            new_id = execute(
                "INSERT INTO empleados (nombre, area, activo) VALUES (%s, NULL, TRUE)",
                (nombre,),
            )
        except Error as exc:
            if getattr(exc, "errno", None) == 1062:
                return jsonify({"error": "Ya existe un empleado con ese nombre"}), 409
            return jsonify({"error": str(exc)}), 500
        return jsonify({"ok": True, "empleado": fetch_one("SELECT * FROM empleados WHERE id = %s", (new_id,))})

    @app.put("/api/empleados/<int:empleado_id>")
    def api_empleados_actualizar(empleado_id):
        data = request.get_json(silent=True) or {}
        emp = fetch_one("SELECT id FROM empleados WHERE id = %s", (empleado_id,))
        if not emp:
            return jsonify({"error": "Empleado no encontrado"}), 404
        nombre = (data.get("nombre") or "").strip()
        activo = data.get("activo")
        if not nombre:
            return jsonify({"error": "El nombre es obligatorio"}), 400
        duplicado = fetch_one(
            """
            SELECT id FROM empleados
            WHERE LOWER(nombre) = LOWER(%s) AND activo = TRUE AND id <> %s
            """,
            (nombre, empleado_id),
        )
        if duplicado:
            return jsonify({"error": "Ya existe un empleado con ese nombre"}), 409
        try:
            execute(
                """
                UPDATE empleados
                SET nombre = %s, area = NULL,
                    activo = COALESCE(%s, activo)
                WHERE id = %s
                """,
                (nombre, None if activo is None else bool(activo), empleado_id),
            )
        except Error as exc:
            if getattr(exc, "errno", None) == 1062:
                return jsonify({"error": "Ya existe un empleado con ese nombre"}), 409
            return jsonify({"error": str(exc)}), 500
        return jsonify({"ok": True, "empleado": fetch_one("SELECT * FROM empleados WHERE id = %s", (empleado_id,))})

    @app.delete("/api/empleados/<int:empleado_id>")
    def api_empleados_eliminar(empleado_id):
        """Borrado lógico (activo = false)."""
        emp = fetch_one("SELECT id FROM empleados WHERE id = %s", (empleado_id,))
        if not emp:
            return jsonify({"error": "Empleado no encontrado"}), 404
        execute("UPDATE empleados SET activo = FALSE WHERE id = %s", (empleado_id,))
        return jsonify({"ok": True})

    # ------------------------------------------------------------------
    # Turnos
    # ------------------------------------------------------------------
    @app.get("/api/turnos")
    def api_turnos():
        todos = request.args.get("todos") == "1"
        return jsonify(_listar_turnos(solo_activos=not todos))

    @app.post("/api/turnos")
    def api_turnos_crear():
        data = request.get_json(silent=True) or {}
        nombre = (data.get("nombre") or "").strip()
        hora_inicio = (data.get("hora_inicio") or "").strip()
        hora_fin = (data.get("hora_fin") or "").strip()
        if not nombre or not hora_inicio or not hora_fin:
            return jsonify({"error": "Nombre, hora inicio y hora fin son obligatorios"}), 400
        try:
            new_id = execute(
                """
                INSERT INTO turnos_trabajo (nombre, hora_inicio, hora_fin, activo)
                VALUES (%s, %s, %s, TRUE)
                """,
                (nombre, hora_inicio, hora_fin),
            )
        except Error as exc:
            return jsonify({"error": str(exc)}), 500
        return jsonify({"ok": True, "turno": fetch_one("SELECT * FROM turnos_trabajo WHERE id = %s", (new_id,))})

    @app.put("/api/turnos/<int:turno_id>")
    def api_turnos_actualizar(turno_id):
        data = request.get_json(silent=True) or {}
        tur = fetch_one("SELECT id FROM turnos_trabajo WHERE id = %s", (turno_id,))
        if not tur:
            return jsonify({"error": "Turno no encontrado"}), 404
        nombre = (data.get("nombre") or "").strip()
        hora_inicio = (data.get("hora_inicio") or "").strip()
        hora_fin = (data.get("hora_fin") or "").strip()
        activo = data.get("activo")
        if not nombre or not hora_inicio or not hora_fin:
            return jsonify({"error": "Nombre, hora inicio y hora fin son obligatorios"}), 400
        try:
            execute(
                """
                UPDATE turnos_trabajo
                SET nombre = %s, hora_inicio = %s, hora_fin = %s,
                    activo = COALESCE(%s, activo)
                WHERE id = %s
                """,
                (nombre, hora_inicio, hora_fin, None if activo is None else bool(activo), turno_id),
            )
        except Error as exc:
            return jsonify({"error": str(exc)}), 500
        return jsonify({"ok": True, "turno": fetch_one("SELECT * FROM turnos_trabajo WHERE id = %s", (turno_id,))})

    @app.delete("/api/turnos/<int:turno_id>")
    def api_turnos_eliminar(turno_id):
        tur = fetch_one("SELECT id FROM turnos_trabajo WHERE id = %s", (turno_id,))
        if not tur:
            return jsonify({"error": "Turno no encontrado"}), 404
        execute("UPDATE turnos_trabajo SET activo = FALSE WHERE id = %s", (turno_id,))
        return jsonify({"ok": True})

    # ------------------------------------------------------------------
    # Horarios semanales
    # ------------------------------------------------------------------
    @app.get("/api/horarios-semana")
    def api_horarios_semana_get():
        fecha_inicio = request.args.get("fecha_inicio")
        if not fecha_inicio:
            return jsonify({"error": "fecha_inicio es obligatoria (lunes)"}), 400
        return jsonify(_asignaciones_semana(fecha_inicio))

    @app.post("/api/horarios-semana/guardar")
    def api_horarios_semana_guardar():
        """
        Body: {
          fecha_inicio,
          asignaciones / asignaciones_lun_vie: [{empleado_id, turno_id}, ...],
          asignaciones_sabado: [{empleado_id, turno_id}, ...]
        }
        """
        data = request.get_json(silent=True) or {}
        fecha_inicio_str = data.get("fecha_inicio")
        asig_lv = data.get("asignaciones_lun_vie")
        if asig_lv is None:
            asig_lv = data.get("asignaciones") or []
        asig_sab = data.get("asignaciones_sabado") or []
        if not fecha_inicio_str:
            return jsonify({"error": "fecha_inicio es obligatoria"}), 400

        try:
            lunes = date.fromisoformat(fecha_inicio_str)
        except ValueError:
            return jsonify({"error": "fecha_inicio inválida"}), 400

        lunes = lunes - timedelta(days=lunes.weekday())
        domingo = lunes + timedelta(days=6)

        responsable = None
        try:
            execute("DELETE FROM horarios_semana WHERE fecha_inicio = %s", (lunes.isoformat(),))
            _insertar_asignaciones_semana(lunes, domingo, asig_lv, "lun_vie")
            _insertar_asignaciones_semana(lunes, domingo, asig_sab, "sabado")
            _sincronizar_texto_semana(lunes, domingo)
            responsable = sincronizar_responsable_planta(lunes, domingo)
        except Error as exc:
            return jsonify({"error": str(exc)}), 500

        return jsonify(
            {
                "ok": True,
                "fecha_inicio": lunes.isoformat(),
                "fecha_fin": domingo.isoformat(),
                "asignaciones": _asignaciones_semana(lunes.isoformat(), "lun_vie"),
                "asignaciones_lun_vie": _asignaciones_semana(lunes.isoformat(), "lun_vie"),
                "asignaciones_sabado": _asignaciones_semana(lunes.isoformat(), "sabado"),
                "responsable_proceso": responsable,
            }
        )

    return app


# ======================================================================
# Helpers
# ======================================================================

def _etiqueta_empleado(emp):
    return emp["nombre"]


def _etiqueta_turno(tur):
    return f"{tur['hora_inicio']} hasta {tur['hora_fin']}"


def _minutos_desde_horas(hora_inicio, hora_fin):
    """
    Fórmula planilla:
      duración = fin - inicio  → H:MM(:SS)
      minutos = (H * 60) + MM
    Acepta HH:MM o HH:MM:SS.
    """
    def parse(hhmmss):
        parts = str(hhmmss).strip().split(":")
        if len(parts) not in (2, 3):
            raise ValueError(f"Hora inválida: {hhmmss}")
        h, m = int(parts[0]), int(parts[1])
        s = int(parts[2]) if len(parts) == 3 else 0
        if h < 0 or h > 23 or m < 0 or m > 59 or s < 0 or s > 59:
            raise ValueError(f"Hora fuera de rango: {hhmmss}")
        return h * 3600 + m * 60 + s

    ini = parse(hora_inicio)
    fin = parse(hora_fin)
    if fin < ini:
        fin += 24 * 3600
    diff = fin - ini
    horas = diff // 3600
    mins = (diff % 3600) // 60
    return horas * 60 + mins, horas, mins


def _listar_empleados(solo_activos=True):
    sql = "SELECT id, nombre, area, activo FROM empleados"
    if solo_activos:
        sql += " WHERE activo = TRUE"
    sql += " ORDER BY nombre, area"
    rows = fetch_all(sql)
    for r in rows:
        r["activo"] = bool(r["activo"])
        r["etiqueta"] = _etiqueta_empleado(r)
    return rows


def _listar_turnos(solo_activos=True):
    sql = "SELECT id, nombre, hora_inicio, hora_fin, activo FROM turnos_trabajo"
    if solo_activos:
        sql += " WHERE activo = TRUE"
    sql += " ORDER BY nombre"
    rows = fetch_all(sql)
    for r in rows:
        r["activo"] = bool(r["activo"])
        r["etiqueta"] = f"{r['nombre']}: {_etiqueta_turno(r)}"
    return rows


def _insertar_asignaciones_semana(lunes, domingo, asignaciones, ambito):
    vistos = set()
    for item in asignaciones or []:
        try:
            emp_id = int(item.get("empleado_id"))
            tur_id = int(item.get("turno_id"))
        except (TypeError, ValueError):
            continue
        clave = (emp_id, tur_id, ambito)
        if clave in vistos:
            continue
        vistos.add(clave)
        emp = fetch_one("SELECT id FROM empleados WHERE id = %s AND activo = TRUE", (emp_id,))
        tur = fetch_one("SELECT id FROM turnos_trabajo WHERE id = %s AND activo = TRUE", (tur_id,))
        if not emp or not tur:
            continue
        execute(
            """
            INSERT INTO horarios_semana
              (fecha_inicio, fecha_fin, ambito, empleado_id, turno_id)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (lunes.isoformat(), domingo.isoformat(), ambito, emp_id, tur_id),
        )


def _asignaciones_semana(fecha_inicio, ambito=None):
    sql = """
        SELECT hs.id, hs.fecha_inicio, hs.fecha_fin, hs.ambito,
               hs.empleado_id, hs.turno_id,
               e.nombre, e.area, t.nombre AS turno_nombre,
               t.hora_inicio, t.hora_fin
        FROM horarios_semana hs
        JOIN empleados e ON e.id = hs.empleado_id
        JOIN turnos_trabajo t ON t.id = hs.turno_id
        WHERE hs.fecha_inicio = %s
    """
    params = [fecha_inicio]
    if ambito:
        sql += " AND hs.ambito = %s"
        params.append(ambito)
    sql += " ORDER BY hs.ambito, e.nombre, e.area"
    rows = fetch_all(sql, tuple(params))
    out = []
    for r in rows:
        emp = {"nombre": r["nombre"], "area": r["area"]}
        tur = {
            "nombre": r["turno_nombre"],
            "hora_inicio": r["hora_inicio"],
            "hora_fin": r["hora_fin"],
        }
        out.append(
            {
                "id": r["id"],
                "ambito": r.get("ambito") or "lun_vie",
                "fecha_inicio": r["fecha_inicio"].isoformat()
                if isinstance(r["fecha_inicio"], date)
                else str(r["fecha_inicio"])[:10],
                "fecha_fin": r["fecha_fin"].isoformat()
                if isinstance(r["fecha_fin"], date)
                else str(r["fecha_fin"])[:10],
                "empleado_id": r["empleado_id"],
                "turno_id": r["turno_id"],
                "empleado_etiqueta": _etiqueta_empleado(emp),
                "turno_nombre": r["turno_nombre"],
                "turno_etiqueta": f"{r['turno_nombre']}: {_etiqueta_turno(tur)}",
                "texto": f"{_etiqueta_empleado(emp)} - {r['turno_nombre']}: {_etiqueta_turno(tur)}",
            }
        )
    return out


def _texto_asignaciones(asig):
    return " / ".join(a["texto"] for a in asig) if asig else ""


def _sincronizar_texto_semana(lunes, domingo):
    texto_lv = _texto_asignaciones(_asignaciones_semana(lunes.isoformat(), "lun_vie"))
    texto_sab = _texto_asignaciones(_asignaciones_semana(lunes.isoformat(), "sabado"))
    dias = fetch_all(
        """
        SELECT id, fecha FROM dias_calendario
        WHERE fecha BETWEEN %s AND %s
        ORDER BY fecha
        """,
        (lunes.isoformat(), domingo.isoformat()),
    )
    for d in dias:
        f = d["fecha"] if isinstance(d["fecha"], date) else date.fromisoformat(str(d["fecha"])[:10])
        if f.weekday() == 5:
            texto = texto_sab
        elif f.weekday() == 6:
            texto = ""
        else:
            texto = texto_lv

        if texto:
            existe = fetch_one(
                "SELECT id FROM horarios_personal WHERE fecha_id = %s", (d["id"],)
            )
            if existe:
                execute(
                    "UPDATE horarios_personal SET detalle_horario = %s WHERE fecha_id = %s",
                    (texto, d["id"]),
                )
            else:
                execute(
                    "INSERT INTO horarios_personal (fecha_id, detalle_horario) VALUES (%s, %s)",
                    (d["id"], texto),
                )
        else:
            execute("DELETE FROM horarios_personal WHERE fecha_id = %s", (d["id"],))


def _responsable_de_asigs(asig):
    for a in asig:
        if _es_turno_planta_texto(
            a.get("turno_nombre"),
            a.get("turno_etiqueta"),
            a.get("texto"),
        ):
            return (a.get("empleado_etiqueta") or "").upper()
    return ""


def _semanas_del_mes(columnas):
    """Agrupa columnas del mes en semanas lunes–domingo con sus asignaciones."""
    if not columnas:
        return []

    semanas = []
    i = 0
    n = len(columnas)
    while i < n:
        fecha = date.fromisoformat(columnas[i]["fecha"])
        lunes = fecha - timedelta(days=fecha.weekday())
        domingo = lunes + timedelta(days=6)
        j = i
        while j < n:
            f = date.fromisoformat(columnas[j]["fecha"])
            if f < lunes or f > domingo:
                break
            j += 1
        asig_lv = _asignaciones_semana(lunes.isoformat(), "lun_vie")
        asig_sab = _asignaciones_semana(lunes.isoformat(), "sabado")
        semanas.append(
            {
                "inicio_idx": i,
                "colspan": j - i,
                "fecha_inicio": lunes.isoformat(),
                "fecha_fin": domingo.isoformat(),
                "etiqueta": f"{lunes.day:02d}/{lunes.month:02d} – {domingo.day:02d}/{domingo.month:02d}",
                "asignaciones": asig_lv,
                "asignaciones_lun_vie": asig_lv,
                "asignaciones_sabado": asig_sab,
                "texto": _texto_asignaciones(asig_lv),
                "responsable_proceso": _responsable_de_asigs(asig_lv),
                "responsable_sabado": _responsable_de_asigs(asig_sab),
            }
        )
        i = j
    return semanas


def _serializar_dia(d, mes=None):
    fecha = d["fecha"]
    if isinstance(fecha, date):
        fecha_iso = fecha.isoformat()
        dia = fecha.day
        mes_num = fecha.month
    else:
        fecha_iso = str(fecha)[:10]
        partes = fecha_iso.split("-")
        dia = int(partes[2])
        mes_num = int(partes[1])

    if mes is None:
        mes = mes_num

    pct = d.get("porcentaje_parada")
    if isinstance(pct, Decimal):
        pct = float(pct)
    elif pct is None:
        p = int(d.get("minutos_parada") or 0)
        pr = int(d.get("minutos_produccion") or 0)
        pct = round((p / (p + pr)) * 100, 2) if (p + pr) else 0.0

    return {
        "fecha_id": d["id"] if "id" in d else d.get("fecha_id"),
        "fecha": fecha_iso,
        "etiqueta": f"{MESES[mes]} {dia:02d}",
        "es_festivo": bool(d.get("es_festivo")),
        "es_domingo": bool(d.get("es_domingo")),
        "descripcion_festivo": d.get("descripcion_festivo"),
        "registro_id": d.get("registro_id"),
        "minutos_parada": int(d.get("minutos_parada") or 0),
        "minutos_produccion": int(d.get("minutos_produccion") or 0),
        "hora_inicio_proceso": d.get("hora_inicio_proceso") or "",
        "hora_fin_proceso": d.get("hora_fin_proceso") or "",
        "porcentaje_parada": pct,
        "responsable_proceso": d.get("responsable_proceso") or "",
        "justificacion_parada": d.get("justificacion_parada") or "",
        "horario_id": d.get("horario_id"),
        "detalle_horario": d.get("detalle_horario") or "",
    }


def _precargar_anio(anio):
    inicio = date(anio, 1, 1)
    fin = date(anio, 12, 31)
    actual = inicio
    creados = 0
    festivos = FESTIVOS_2026 if anio == 2026 else {}

    while actual <= fin:
        fecha_iso = actual.isoformat()
        es_domingo = actual.weekday() == 6
        desc = festivos.get(fecha_iso)
        es_festivo = desc is not None
        existe = fetch_one("SELECT id FROM dias_calendario WHERE fecha = %s", (fecha_iso,))
        if not existe:
            execute(
                """
                INSERT INTO dias_calendario
                  (fecha, es_festivo, es_domingo, descripcion_festivo)
                VALUES (%s, %s, %s, %s)
                """,
                (fecha_iso, es_festivo, es_domingo, desc),
            )
            creados += 1
        else:
            execute(
                """
                UPDATE dias_calendario
                SET es_domingo = %s,
                    es_festivo = CASE WHEN %s THEN TRUE ELSE es_festivo END,
                    descripcion_festivo = CASE WHEN %s THEN %s ELSE descripcion_festivo END
                WHERE fecha = %s
                """,
                (es_domingo, es_festivo, es_festivo, desc, fecha_iso),
            )
        actual += timedelta(days=1)
    return creados


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
