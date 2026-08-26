"""Autenticación y permisos por rol (selección de usuario + PIN por usuario)."""

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


def listar_usuarios_login():
    return fetch_all(
        """
        SELECT id, username, rol, nombre, pin_hash
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


def _obtener_usuario(username):
    return fetch_one(
        """
        SELECT id, username, rol, nombre, activo, pin_hash
        FROM usuarios
        WHERE username = %s
        LIMIT 1
        """,
        ((username or "").strip(),),
    )


def asignar_pin_usuario(username, pin, pin_confirm):
    """Asigna el PIN de un usuario (admin/superadmin) una sola vez."""
    user = _obtener_usuario(username)
    if not user or not user.get("activo"):
        return False, "Usuario no válido"
    if user["rol"] not in ROLES_CON_PIN:
        return False, "Este usuario no usa PIN"
    if user.get("pin_hash"):
        return False, "Contacte con el superadmin para restablecer su pin"

    pin_ok, err = _validar_formato_pin(pin)
    if err:
        return False, err
    if str(pin_confirm or "").strip() != pin_ok:
        return False, "Los PIN no coinciden"

    execute(
        """
        UPDATE usuarios
        SET pin_hash = %s, pin_asignado_en = NOW()
        WHERE id = %s AND pin_hash IS NULL
        """,
        (generate_password_hash(pin_ok), user["id"]),
    )
    # Verifica que sí quedó asignado (evita carrera / reasignación)
    actualizado = fetch_one(
        "SELECT pin_hash FROM usuarios WHERE id = %s LIMIT 1",
        (user["id"],),
    )
    if not actualizado or not actualizado.get("pin_hash"):
        return False, "Contacte con el superadmin para restablecer su pin"
    return True, None


def autenticar(username, pin):
    """
    Valida acceso por selección de usuario.
    - visitante: sin PIN
    - admin / superadmin: PIN propio ya asignado
    """
    user = _obtener_usuario(username)
    if not user or not user.get("activo"):
        return None, "Usuario no válido"

    rol = user["rol"]
    if rol in ROLES_CON_PIN:
        if not user.get("pin_hash"):
            return None, "Debe asignar su PIN antes de ingresar"
        pin_ok, err = _validar_formato_pin(pin)
        if err:
            return None, err
        if not check_password_hash(user["pin_hash"], pin_ok):
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
