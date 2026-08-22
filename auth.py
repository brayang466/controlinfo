"""Autenticación y permisos por rol (selección de usuario + PIN maestro)."""

from functools import wraps

from flask import jsonify, redirect, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

from db import execute, fetch_all, fetch_one

ROLES = ("superadmin", "admin", "visitante")
ROLES_CON_PIN = ("superadmin", "admin")


def usuario_actual():
    uid = session.get("user_id")
    if not uid:
        return None
    return {
        "id": uid,
        "username": session.get("username"),
        "rol": session.get("rol"),
        "nombre": session.get("nombre"),
    }


def rol_actual():
    return session.get("rol")


def puede_editar_todo():
    return rol_actual() == "superadmin"


def puede_editar_horarios():
    return rol_actual() in ("superadmin", "admin")


def es_solo_lectura():
    return rol_actual() == "visitante"


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("user_id"):
            if request.path.startswith("/api/"):
                return jsonify({"error": "Debes iniciar sesión"}), 401
            return redirect(url_for("login"))
        return view(*args, **kwargs)

    return wrapped


def roles_required(*roles):
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            if not session.get("user_id"):
                if request.path.startswith("/api/"):
                    return jsonify({"error": "Debes iniciar sesión"}), 401
                return redirect(url_for("login"))
            if session.get("rol") not in roles:
                if request.path.startswith("/api/"):
                    return jsonify({"error": "No tienes permiso para esta acción"}), 403
                return jsonify({"error": "No tienes permiso para esta acción"}), 403
            return view(*args, **kwargs)

        return wrapped

    return decorator


def pin_maestro_asignado():
    row = fetch_one("SELECT id FROM pin_maestro WHERE id = 1 LIMIT 1")
    return bool(row)


def obtener_pin_hash():
    row = fetch_one("SELECT pin_hash FROM pin_maestro WHERE id = 1 LIMIT 1")
    return row["pin_hash"] if row else None


def listar_usuarios_login():
    return fetch_all(
        """
        SELECT id, username, rol, nombre
        FROM usuarios
        WHERE activo = TRUE
        ORDER BY FIELD(rol, 'superadmin', 'admin', 'visitante'), id
        """
    )


def _validar_formato_pin(pin):
    pin = str(pin or "").strip()
    if not pin.isdigit() or not (4 <= len(pin) <= 8):
        return None, "El PIN debe tener entre 4 y 8 dígitos numéricos"
    return pin, None


def asignar_pin_maestro(pin, pin_confirm):
    """Asigna el PIN maestro una sola vez. No permite reasignación."""
    if pin_maestro_asignado():
        return False, "Contacte con el superadmin para restablecer su pin"

    pin_ok, err = _validar_formato_pin(pin)
    if err:
        return False, err
    if str(pin_confirm or "").strip() != pin_ok:
        return False, "Los PIN no coinciden"

    execute(
        """
        INSERT INTO pin_maestro (id, pin_hash, asignado_en)
        VALUES (1, %s, NOW())
        """,
        (generate_password_hash(pin_ok),),
    )
    return True, None


def autenticar(username, pin):
    """
    Valida acceso por selección de usuario.
    - visitante: sin PIN
    - admin / superadmin: requieren PIN maestro ya asignado
    """
    user = fetch_one(
        """
        SELECT id, username, rol, nombre, activo
        FROM usuarios
        WHERE username = %s
        LIMIT 1
        """,
        ((username or "").strip(),),
    )
    if not user or not user.get("activo"):
        return None, "Usuario no válido"

    rol = user["rol"]
    if rol in ROLES_CON_PIN:
        if not pin_maestro_asignado():
            return None, "Debe asignar el PIN maestro antes de ingresar"
        pin_ok, err = _validar_formato_pin(pin)
        if err:
            return None, err
        pin_hash = obtener_pin_hash()
        if not pin_hash or not check_password_hash(pin_hash, pin_ok):
            return None, "PIN incorrecto"

    return {
        "id": user["id"],
        "username": user["username"],
        "rol": user["rol"],
        "nombre": user["nombre"],
    }, None


def iniciar_sesion(user):
    session.clear()
    session["user_id"] = user["id"]
    session["username"] = user["username"]
    session["rol"] = user["rol"]
    session["nombre"] = user["nombre"]
    session.permanent = True
