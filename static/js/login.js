(() => {
  const alertBox = document.getElementById("loginAlert");
  const userGrid = document.getElementById("userGrid");
  const toastHost = document.getElementById("uiToastHost");

  const pinModalEl = document.getElementById("pinModal");
  const pinForm = document.getElementById("pinForm");
  const pinInput = document.getElementById("pinInput");
  const pinSubmit = document.getElementById("pinSubmit");
  const pinModalMeta = document.getElementById("pinModalMeta");
  const pinModalAlert = document.getElementById("pinModalAlert");

  const setupPinModalEl = document.getElementById("setupPinModal");
  const setupPinForm = document.getElementById("setupPinForm");
  const setupPin = document.getElementById("setupPin");
  const setupPinConfirm = document.getElementById("setupPinConfirm");
  const setupPinSubmit = document.getElementById("setupPinSubmit");
  const setupPinAlert = document.getElementById("setupPinAlert");
  const setupPinMeta = document.getElementById("setupPinMeta");

  const pinModal = new bootstrap.Modal(pinModalEl);
  const setupPinModal = new bootstrap.Modal(setupPinModalEl);

  let usuarios = [];
  let selectedUser = null;

  function showBox(el, msg, tipo = "error") {
    el.className = `ui-alert ${tipo}`;
    el.textContent = msg;
    el.classList.remove("d-none");
  }

  function clearBox(el) {
    el.className = "ui-alert d-none";
    el.textContent = "";
  }

  function toast(mensaje, tipo = "error", titulo = "") {
    if (!toastHost) return;
    const el = document.createElement("div");
    el.className = `ui-toast ${tipo}`;
    const icon = tipo === "error" ? "!" : tipo === "warn" ? "i" : "✓";
    el.innerHTML = `
      <span class="ui-toast-badge">${icon}</span>
      <div>
        <strong>${titulo || (tipo === "error" ? "No se puede continuar" : "Listo")}</strong>
        <p></p>
      </div>
      <button type="button" class="ui-toast-close" aria-label="Cerrar">×</button>
    `;
    el.querySelector("p").textContent = mensaje;
    el.querySelector(".ui-toast-close").addEventListener("click", () => el.remove());
    toastHost.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }

  function iniciales(nombre) {
    return String(nombre || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");
  }

  function accionUsuario(u) {
    if (!u.requiere_pin) return "Entrar";
    return u.pin_asignado ? "PIN" : "Asignar PIN";
  }

  function renderUsuarios(lista) {
    userGrid.innerHTML = "";
    if (!lista.length) {
      userGrid.innerHTML =
        '<p class="login-loading">No hay usuarios. Ejecuta migrate_usuarios.sql</p>';
      return;
    }
    lista.forEach((u) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "user-pick";
      btn.dataset.rol = u.rol;
      btn.dataset.username = u.username;
      btn.innerHTML = `
        <span class="user-pick-avatar" aria-hidden="true">${iniciales(u.nombre)}</span>
        <span class="user-pick-text">
          <strong>${u.nombre}</strong>
          <span>${u.rol}${u.requiere_pin ? (u.pin_asignado ? " · PIN listo" : " · sin PIN") : ""}</span>
        </span>
        <span class="user-pick-action">${accionUsuario(u)}</span>
      `;
      btn.addEventListener("click", () => onSelectUser(u));
      userGrid.appendChild(btn);
    });
  }

  async function cargarEstado() {
    clearBox(alertBox);
    try {
      const res = await fetch("/api/auth/estado", { headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudo cargar el acceso");
      }
      usuarios = data.usuarios || [];
      renderUsuarios(usuarios);
    } catch (err) {
      userGrid.innerHTML = "";
      showBox(alertBox, err.message || "Error al cargar", "error");
      toast(err.message || "Error al cargar", "error");
    }
  }

  async function entrar(username, pin = "") {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ username, pin }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "No se pudo iniciar sesión");
    }
    return data;
  }

  function abrirSetupPin(user) {
    selectedUser = user;
    clearBox(setupPinAlert);
    setupPin.value = "";
    setupPinConfirm.value = "";
    setupPinMeta.textContent = `${user.nombre} · se asigna una sola vez`;
    setupPinModal.show();
    setTimeout(() => setupPin.focus(), 250);
  }

  function abrirIngresoPin(user) {
    selectedUser = user;
    clearBox(pinModalAlert);
    pinInput.value = "";
    pinModalMeta.textContent = `${user.nombre} · ${user.rol}`;
    pinModal.show();
    setTimeout(() => pinInput.focus(), 250);
  }

  async function onSelectUser(user) {
    clearBox(alertBox);
    selectedUser = user;

    if (!user.requiere_pin) {
      try {
        await entrar(user.username);
        showBox(alertBox, "Ingreso correcto. Redirigiendo…", "ok");
        toast("Bienvenido", "ok", "Sesión iniciada");
        window.location.href = "/";
      } catch (err) {
        showBox(alertBox, err.message, "error");
        toast(err.message, "error", "Acceso denegado");
      }
      return;
    }

    if (!user.pin_asignado) {
      abrirSetupPin(user);
      return;
    }

    abrirIngresoPin(user);
  }

  pinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearBox(pinModalAlert);
    const pin = pinInput.value.trim();
    if (!/^\d{4,8}$/.test(pin)) {
      const msg = "El PIN debe tener entre 4 y 8 dígitos.";
      showBox(pinModalAlert, msg, "error");
      toast(msg, "error", "Validación");
      return;
    }
    pinSubmit.disabled = true;
    try {
      await entrar(selectedUser.username, pin);
      pinModal.hide();
      showBox(alertBox, "Ingreso correcto. Redirigiendo…", "ok");
      toast("Bienvenido", "ok", "Sesión iniciada");
      window.location.href = "/";
    } catch (err) {
      showBox(pinModalAlert, err.message, "error");
      toast(err.message, "error", "Acceso denegado");
    } finally {
      pinSubmit.disabled = false;
    }
  });

  setupPinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearBox(setupPinAlert);
    const pin = setupPin.value.trim();
    const confirm = setupPinConfirm.value.trim();
    if (!/^\d{4,8}$/.test(pin)) {
      const msg = "El PIN debe tener entre 4 y 8 dígitos.";
      showBox(setupPinAlert, msg, "error");
      return;
    }
    if (pin !== confirm) {
      const msg = "Los PIN no coinciden.";
      showBox(setupPinAlert, msg, "error");
      return;
    }
    setupPinSubmit.disabled = true;
    try {
      const res = await fetch("/api/auth/asignar-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          username: selectedUser.username,
          pin,
          pin_confirm: confirm,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudo asignar el PIN");
      }
      selectedUser.pin_asignado = true;
      const idx = usuarios.findIndex((u) => u.username === selectedUser.username);
      if (idx >= 0) usuarios[idx].pin_asignado = true;
      renderUsuarios(usuarios);
      setupPinModal.hide();
      showBox(alertBox, `PIN de ${selectedUser.nombre} asignado. Ahora puedes ingresar.`, "ok");
      toast("PIN guardado para este usuario", "ok", "Listo");
      abrirIngresoPin(selectedUser);
    } catch (err) {
      showBox(setupPinAlert, err.message, "error");
      toast(err.message, "error");
      if (/superadmin/i.test(err.message)) {
        selectedUser.pin_asignado = true;
        const idx = usuarios.findIndex((u) => u.username === selectedUser.username);
        if (idx >= 0) usuarios[idx].pin_asignado = true;
        renderUsuarios(usuarios);
      }
    } finally {
      setupPinSubmit.disabled = false;
    }
  });

  cargarEstado();
})();
