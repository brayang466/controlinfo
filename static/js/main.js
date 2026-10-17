(() => {
  const puedeEditarTodo = document.body.dataset.puedeEditarTodo === "1";
  const puedeEditarHorarios = document.body.dataset.puedeEditarHorarios === "1";
  const soloLectura = document.body.dataset.soloLectura === "1";

  const mesSelect = document.getElementById("mesSelect");
  const btnRecargar = document.getElementById("btnRecargar");
  const btnProcesoSinNovedad = document.getElementById("btnProcesoSinNovedad");
  const btnCatalogos = document.getElementById("btnCatalogos");
  const btnVerificarMes = document.getElementById("btnVerificarMes");
  const statusBar = document.getElementById("statusBar");
  const headerRow = document.getElementById("headerRow");
  const bodyRows = document.getElementById("bodyRows");
  const verificarMesTitle = document.getElementById("verificarMesTitle");
  const verificarMesMeta = document.getElementById("verificarMesMeta");
  const verificarMesResumen = document.getElementById("verificarMesResumen");
  const verificarMesDetalle = document.getElementById("verificarMesDetalle");

  const editForm = document.getElementById("editForm");
  const editTitle = document.getElementById("editTitle");
  const editMeta = document.getElementById("editMeta");
  const editFechaId = document.getElementById("editFechaId");
  const editHoraInicio = document.getElementById("editHoraInicio");
  const editHoraFin = document.getElementById("editHoraFin");
  const editParada = document.getElementById("editParada");
  const editProduccion = document.getElementById("editProduccion");
  const editPorcentaje = document.getElementById("editPorcentaje");
  const editResponsable = document.getElementById("editResponsable");
  const editJustificacion = document.getElementById("editJustificacion");
  const editFestivo = document.getElementById("editFestivo");
  const editFestivoDesc = document.getElementById("editFestivoDesc");
  const festivoDescWrap = document.getElementById("festivoDescWrap");

  const semanaForm = document.getElementById("semanaForm");
  const semanaTitle = document.getElementById("semanaTitle");
  const semanaMeta = document.getElementById("semanaMeta");
  const semanaFechaInicio = document.getElementById("semanaFechaInicio");
  const asignacionesList = document.getElementById("asignacionesList");
  const asignacionesSabadoList = document.getElementById("asignacionesSabadoList");
  const excepcionesList = document.getElementById("excepcionesList");
  const btnAddAsignacion = document.getElementById("btnAddAsignacion");
  const btnAddAsignacionSabado = document.getElementById("btnAddAsignacionSabado");
  const btnAddExcepcion = document.getElementById("btnAddExcepcion");
  const btnEnviarWhatsApp = document.getElementById("btnEnviarWhatsApp");
  const btnCopiarSemana = document.getElementById("btnCopiarSemana");
  const btnPegarSemana = document.getElementById("btnPegarSemana");
  const semanaClipboardMeta = document.getElementById("semanaClipboardMeta");
  const bloqueLunVie = document.getElementById("bloqueLunVie");
  const bloqueSabado = document.getElementById("bloqueSabado");
  const semanaAlertBox = document.getElementById("semanaAlertBox");
  const semanaHint = document.getElementById("semanaHint");
  const uiToastHost = document.getElementById("uiToastHost");
  const uiAlertTitle = document.getElementById("uiAlertTitle");
  const uiAlertMessage = document.getElementById("uiAlertMessage");
  const uiAlertIcon = document.getElementById("uiAlertIcon");
  const uiAlertOk = document.getElementById("uiAlertOk");
  const uiAlertCancel = document.getElementById("uiAlertCancel");
  const uiAlertModalEl = document.getElementById("uiAlertModal");
  const HORARIO_CLIPBOARD_KEY = "controlparadas_horario_semana";

  let uiAlertResolver = null;
  let confirmarGuardadoVacio = false;

  const formNuevoEmpleado = document.getElementById("formNuevoEmpleado");
  const formNuevoTurno = document.getElementById("formNuevoTurno");
  const listaEmpleados = document.getElementById("listaEmpleados");
  const listaTurnos = document.getElementById("listaTurnos");
  const editEmpId = document.getElementById("editEmpId");
  const editTurId = document.getElementById("editTurId");
  const btnEmpSubmit = document.getElementById("btnEmpSubmit");
  const btnTurSubmit = document.getElementById("btnTurSubmit");
  const nuevoTurInicio = document.getElementById("nuevoTurInicio");
  const nuevoTurFin = document.getElementById("nuevoTurFin");

  const modalDia = new bootstrap.Modal(document.getElementById("editModal"));
  const modalSemana = new bootstrap.Modal(document.getElementById("semanaModal"));
  const modalCatalogo = new bootstrap.Modal(document.getElementById("catalogoModal"));
  const modalVerificarMes = new bootstrap.Modal(
    document.getElementById("verificarMesModal")
  );
  const modalUiAlert = new bootstrap.Modal(uiAlertModalEl);
  const resumenDiaTitle = document.getElementById("resumenDiaTitle");
  const resumenDiaMeta = document.getElementById("resumenDiaMeta");
  const resumenDiaBody = document.getElementById("resumenDiaBody");
  const modalResumenDia = new bootstrap.Modal(
    document.getElementById("resumenDiaModal")
  );

  const MESES = [
    "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const FILAS = [
    { key: "minutos_parada", label: "Minutos de parada", tipo: "num" },
    { key: "minutos_produccion", label: "Minutos de producción", tipo: "num" },
    { key: "porcentaje_parada", label: "Porcentaje de parada (%)", tipo: "pct" },
    { key: "responsable_proceso", label: "Responsable del proceso", tipo: "text" },
    { key: "justificacion_parada", label: "Justificación de la parada", tipo: "text" },
  ];

  let estado = {
    columnas: [],
    semanas: [],
    empleados: [],
    turnos: [],
    anio: 2026,
    mes: 1,
  };

  function setStatus(msg, isError = false) {
    statusBar.textContent = msg || "";
    statusBar.classList.toggle("error", Boolean(isError));
    statusBar.classList.toggle("ok", Boolean(msg) && !isError);
  }

  function mostrarToast(mensaje, tipo = "ok", titulo = "") {
    if (!uiToastHost) return;
    const toast = document.createElement("div");
    toast.className = `ui-toast ${tipo}`;
    const icon = tipo === "error" ? "!" : tipo === "warn" ? "i" : "✓";
    const title =
      titulo ||
      (tipo === "error" ? "Revisa el formulario" : tipo === "warn" ? "Atención" : "Listo");
    toast.innerHTML = `
      <span class="ui-toast-badge">${icon}</span>
      <div>
        <strong>${title}</strong>
        <p>${mensaje}</p>
      </div>
      <button type="button" class="ui-toast-close" aria-label="Cerrar">×</button>
    `;
    const close = () => toast.remove();
    toast.querySelector(".ui-toast-close").addEventListener("click", close);
    uiToastHost.appendChild(toast);
    setTimeout(close, tipo === "error" ? 6500 : 4200);
  }

  function mostrarAlertaSemana(mensaje, tipo = "error") {
    if (!semanaAlertBox) return;
    semanaAlertBox.className = `ui-alert ${tipo}`;
    semanaAlertBox.textContent = mensaje;
    semanaAlertBox.classList.remove("d-none");
  }

  function limpiarAlertaSemana() {
    if (!semanaAlertBox) return;
    semanaAlertBox.className = "ui-alert d-none";
    semanaAlertBox.textContent = "";
  }

  function mostrarAlerta(mensaje, tipo = "error", titulo = "") {
    return new Promise((resolve) => {
      uiAlertResolver = resolve;
      uiAlertModalEl.classList.remove("error", "warn", "ok");
      uiAlertModalEl.classList.add(tipo);
      uiAlertIcon.textContent = tipo === "error" ? "!" : tipo === "warn" ? "i" : "✓";
      uiAlertTitle.textContent =
        titulo ||
        (tipo === "error" ? "No se puede continuar" : tipo === "warn" ? "Confirmación" : "Listo");
      uiAlertMessage.textContent = mensaje;
      uiAlertCancel.classList.toggle("d-none", tipo !== "warn");
      uiAlertOk.textContent = tipo === "warn" ? "Continuar" : "Entendido";
      modalUiAlert.show();
    });
  }

  uiAlertOk.addEventListener("click", () => {
    modalUiAlert.hide();
    if (uiAlertResolver) {
      const done = uiAlertResolver;
      uiAlertResolver = null;
      done(true);
    }
  });
  uiAlertCancel.addEventListener("click", () => {
    if (uiAlertResolver) {
      const done = uiAlertResolver;
      uiAlertResolver = null;
      done(false);
    }
  });
  uiAlertModalEl.addEventListener("hidden.bs.modal", () => {
    if (uiAlertResolver) {
      const done = uiAlertResolver;
      uiAlertResolver = null;
      done(false);
    }
  });

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toDisplay12(hhmm) {
    if (!hhmm || hhmm === "F.P") return hhmm || "";
    const [hStr, mStr] = hhmm.split(":");
    let h = Number(hStr);
    const m = Number(mStr);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${pad2(m)} ${ampm}`;
  }

  function buildShiftTimes() {
    const list = [];
    for (let h = 5; h <= 23; h += 1) {
      for (let m = 0; m < 60; m += 15) {
        list.push(toDisplay12(`${pad2(h)}:${pad2(m)}`));
      }
    }
    return list;
  }

  const SHIFT_TIMES = buildShiftTimes();

  function fillSelect(select, values, placeholder, selected = "") {
    select.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = placeholder;
    select.appendChild(ph);
    for (const v of values) {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      if (String(v) === String(selected)) opt.selected = true;
      select.appendChild(opt);
    }
  }

  function normalizeTime(value, fallback = "00:00:00") {
    if (!value && value !== 0) return fallback;
    const parts = String(value).trim().split(":");
    if (parts.length === 2) {
      return `${pad2(Number(parts[0]) || 0)}:${pad2(Number(parts[1]) || 0)}:00`;
    }
    if (parts.length >= 3) {
      return `${pad2(Number(parts[0]) || 0)}:${pad2(Number(parts[1]) || 0)}:${pad2(Number(parts[2]) || 0)}`;
    }
    return fallback;
  }

  function parseTimeParts(hhmmss) {
    const norm = normalizeTime(hhmmss, "00:00:00");
    const [h, m, s] = norm.split(":").map(Number);
    return { h, m, s, text: norm };
  }

  function segundosDe(hhmmss) {
    if (!hhmmss) return null;
    const { h, m, s } = parseTimeParts(hhmmss);
    if ([h, m, s].some((n) => Number.isNaN(n))) return null;
    return h * 3600 + m * 60 + s;
  }

  function minutosDe(hhmmss) {
    const secs = segundosDe(hhmmss);
    return secs === null ? null : Math.floor(secs / 60);
  }

  function esMadrugada(hhmmss) {
    const mins = minutosDe(hhmmss);
    return mins !== null && mins <= 6 * 60;
  }

  function createClockPicker(root, hiddenInput, onChange) {
    let hour = 0;
    let minute = 0;
    let second = 0;
    let mode = "h";
    let dragging = false;

    root.innerHTML = `
      <div class="clock-digital">
        <button type="button" data-mode="h" data-part="h">00</button>
        <span class="sep">:</span>
        <button type="button" data-mode="m" data-part="m">00</button>
        <span class="sep">:</span>
        <button type="button" data-mode="s" data-part="s">00</button>
      </div>
      <div class="clock-modes">
        <button type="button" data-mode="h">Hora</button>
        <button type="button" data-mode="m">Min</button>
        <button type="button" data-mode="s">Seg</button>
      </div>
      <div class="clock-face-wrap">
        <div class="clock-face" tabindex="0" role="slider" aria-label="Dial de tiempo">
          <div class="ticks"></div>
          <div class="hand"></div>
          <div class="pivot"></div>
        </div>
      </div>
      <p class="clock-hint">Arrastra o toca el círculo · cambia entre Hora / Min / Seg</p>
    `;

    const btnH = root.querySelector('[data-part="h"]');
    const btnM = root.querySelector('[data-part="m"]');
    const btnS = root.querySelector('[data-part="s"]');
    const face = root.querySelector(".clock-face");
    const ticks = root.querySelector(".ticks");
    const hand = root.querySelector(".hand");
    const modeButtons = root.querySelectorAll("[data-mode]");

    function currentValue() {
      return `${pad2(hour)}:${pad2(minute)}:${pad2(second)}`;
    }

    function syncHidden() {
      hiddenInput.value = currentValue();
    }

    function setMode(next) {
      mode = next;
      modeButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === mode);
      });
      renderTicks();
      renderHand();
    }

    function renderDigital() {
      btnH.textContent = pad2(hour);
      btnM.textContent = pad2(minute);
      btnS.textContent = pad2(second);
    }

    function activeValue() {
      if (mode === "h") return hour;
      if (mode === "m") return minute;
      return second;
    }

    function maxForMode() {
      return mode === "h" ? 24 : 60;
    }

    function renderTicks() {
      ticks.innerHTML = "";
      const max = maxForMode();
      const step = mode === "h" ? 2 : 5;
      const radius = 42;
      for (let v = 0; v < max; v += step) {
        const angle = (v / max) * 360;
        const rad = ((angle - 90) * Math.PI) / 180;
        const x = 50 + radius * Math.cos(rad);
        const y = 50 + radius * Math.sin(rad);
        const tick = document.createElement("div");
        tick.className = "tick";
        tick.textContent = pad2(v);
        tick.style.left = `${x}%`;
        tick.style.top = `${y}%`;
        ticks.appendChild(tick);
      }
    }

    function renderHand() {
      const max = maxForMode();
      const val = activeValue();
      const angle = (val / max) * 360;
      hand.style.transform = `rotate(${angle}deg)`;
    }

    function commit(nextHour, nextMinute, nextSecond, emit = true) {
      hour = ((nextHour % 24) + 24) % 24;
      minute = ((nextMinute % 60) + 60) % 60;
      second = ((nextSecond % 60) + 60) % 60;
      renderDigital();
      renderHand();
      syncHidden();
      if (emit && typeof onChange === "function") onChange();
    }

    function valueFromPointer(clientX, clientY) {
      const rect = face.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let deg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI + 90;
      if (deg < 0) deg += 360;
      const max = maxForMode();
      let val = Math.round((deg / 360) * max) % max;
      return val;
    }

    function applyPointer(clientX, clientY, emit) {
      const val = valueFromPointer(clientX, clientY);
      if (mode === "h") commit(val, minute, second, emit);
      else if (mode === "m") commit(hour, val, second, emit);
      else commit(hour, minute, val, emit);
    }

    root.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => setMode(btn.dataset.mode));
    });

    face.addEventListener("pointerdown", (ev) => {
      dragging = true;
      face.setPointerCapture(ev.pointerId);
      applyPointer(ev.clientX, ev.clientY, true);
    });
    face.addEventListener("pointermove", (ev) => {
      if (!dragging) return;
      applyPointer(ev.clientX, ev.clientY, true);
    });
    face.addEventListener("pointerup", () => {
      dragging = false;
    });
    face.addEventListener("pointercancel", () => {
      dragging = false;
    });

    setMode("h");
    commit(0, 0, 0, false);

    return {
      setValue(value) {
        const parts = parseTimeParts(value);
        commit(parts.h, parts.m, parts.s, false);
      },
      getValue() {
        return currentValue();
      },
    };
  }

  const clockInicio = createClockPicker(
    document.getElementById("clockInicio"),
    editHoraInicio,
    () => actualizarCalculoProduccion()
  );
  const clockFin = createClockPicker(
    document.getElementById("clockFin"),
    editHoraFin,
    () => actualizarCalculoProduccion()
  );

  function calcPorcentaje(parada, produccion) {
    const p = Number(parada) || 0;
    const pr = Number(produccion) || 0;
    const den = p + pr;
    if (!den) return 0;
    return Math.round((p / den) * 10000) / 100;
  }

  function formatPct(value) {
    if (value === null || value === undefined || value === "") return "";
    const n = Number(value);
    return Number.isNaN(n) ? "" : n.toFixed(2);
  }

  /**
   * Fórmula de la planilla:
   * duración = fin - inicio → H:MM:SS
   * minutos_produccion = (H * 60) + MM
   */
  function calcMinutosProduccion(inicio, fin) {
    if (!inicio || !fin) return null;
    let ini = segundosDe(inicio);
    let end = segundosDe(fin);
    if (ini === null || end === null) return null;
    const cruzaMedianoche = end < ini;
    if (cruzaMedianoche) end += 24 * 3600;
    const diff = end - ini;
    const horas = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;
    return {
      duracion: `${horas}:${pad2(mins)}:${pad2(secs)}`,
      horas,
      mins,
      secs,
      producto: horas * 60,
      total: horas * 60 + mins,
      cruzaMedianoche,
    };
  }

  function actualizarCalculoProduccion() {
    const calc = calcMinutosProduccion(editHoraInicio.value, editHoraFin.value);
    document.getElementById("calcInicio").textContent = editHoraInicio.value || "—";
    const finLabel = editHoraFin.value
      ? calc && calc.cruzaMedianoche
        ? `${editHoraFin.value} (+1)`
        : editHoraFin.value
      : "—";
    document.getElementById("calcFin").textContent = finLabel;
    if (!calc) {
      document.getElementById("calcDuracion").textContent = "—";
      document.getElementById("calcHoras").textContent = "0";
      document.getElementById("calcProducto").textContent = "0";
      document.getElementById("calcMinutosResto").textContent = "0";
      document.getElementById("calcTotal").textContent = "0";
      editProduccion.value = 0;
    } else {
      document.getElementById("calcDuracion").textContent = calc.duracion;
      document.getElementById("calcHoras").textContent = String(calc.horas);
      document.getElementById("calcProducto").textContent = String(calc.producto);
      document.getElementById("calcMinutosResto").textContent = String(calc.mins);
      document.getElementById("calcTotal").textContent = String(calc.total);
      editProduccion.value = calc.total;
    }
    editPorcentaje.value = formatPct(
      calcPorcentaje(editParada.value, editProduccion.value)
    );
  }

  function poblarSelectoresProceso(selectedInicio = "15:00:00", selectedFin = "22:08:00") {
    clockInicio.setValue(normalizeTime(selectedInicio, "15:00:00"));
    clockFin.setValue(normalizeTime(selectedFin, "22:08:00"));
  }

  /** Evita desfase UTC: fecha ISO + mediodía local */
  function fechaLocal(fechaIso) {
    return new Date(`${String(fechaIso).slice(0, 10)}T12:00:00`);
  }

  function esDomingoFecha(fechaIso) {
    return fechaLocal(fechaIso).getDay() === 0;
  }

  function esDomingoCol(col) {
    return Boolean(col.es_domingo || esDomingoFecha(col.fecha));
  }

  function esFestivoLaborable(col) {
    // Festivo que se trabaja con normalidad (no domingo)
    return Boolean(col.es_festivo) && !esDomingoCol(col);
  }

  function esEspecial(col) {
    // Solo domingo bloquea la columna; los festivos se diligencian como día normal
    return esDomingoCol(col);
  }

  function etiquetaEspecial(col) {
    if (esDomingoCol(col)) return "DOMINGO";
    return "";
  }

  async function api(url, options = {}) {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Error HTTP ${res.status}`);
    return data;
  }

  function poblarSelectorMeses() {
    mesSelect.innerHTML = "";
    for (let m = 1; m <= 12; m += 1) {
      const opt = document.createElement("option");
      opt.value = String(m);
      opt.textContent = `${MESES[m]} 2026`;
      mesSelect.appendChild(opt);
    }
    mesSelect.value = "1";
  }

  function poblarSelectoresCatalogo() {
    fillSelect(nuevoTurInicio, SHIFT_TIMES, "Hora inicio…");
    fillSelect(nuevoTurFin, [...SHIFT_TIMES, "F.P"], "Hora fin…");
  }

  function poblarResponsables(selected = "") {
    const nombres = [
      ...new Set((estado.empleados || []).map((e) => (e.nombre || "").toUpperCase())),
    ].filter(Boolean);
    editResponsable.innerHTML = '<option value="">—</option>';
    for (const n of nombres) {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      if (n === (selected || "").toUpperCase()) opt.selected = true;
      editResponsable.appendChild(opt);
    }
    if (selected && ![...editResponsable.options].some((o) => o.value === selected.toUpperCase())) {
      const opt = document.createElement("option");
      opt.value = selected.toUpperCase();
      opt.textContent = selected.toUpperCase();
      opt.selected = true;
      editResponsable.appendChild(opt);
    }
  }

  async function cargarReporte() {
    const mes = Number(mesSelect.value) || 1;
    setStatus("Cargando…");
    try {
      const data = await api(`/api/registros?mes=${mes}&anio=2026`);
      estado = data;
      renderTabla();
      setStatus(`${data.columnas.length} días · ${data.mes_nombre} ${data.anio}`);
    } catch (err) {
      setStatus(err.message, true);
    }
  }

  function tieneProduccion(col) {
    return Number(col.minutos_produccion || 0) > 0;
  }

  function tieneHorarioPersonal(col) {
    return Boolean(String(col.detalle_horario || "").trim());
  }

  function verificarMesActual() {
    const cols = estado.columnas || [];
    const habiles = cols.filter((col) => !esDomingoCol(col));
    const pendientesProduccion = [];
    const pendientesHorario = [];
    const pendientesAmbos = [];

    for (const col of habiles) {
      const okProd = tieneProduccion(col);
      const okHor = tieneHorarioPersonal(col);
      if (okProd && okHor) continue;
      const item = {
        etiqueta: esFestivoLaborable(col)
          ? `${col.etiqueta} (festivo)`
          : col.etiqueta,
        fecha: col.fecha,
        faltaProduccion: !okProd,
        faltaHorario: !okHor,
      };
      if (!okProd && !okHor) pendientesAmbos.push(item);
      else if (!okProd) pendientesProduccion.push(item);
      else pendientesHorario.push(item);
    }

    const totalPendientes =
      pendientesProduccion.length +
      pendientesHorario.length +
      pendientesAmbos.length;
    const completos = habiles.length - totalPendientes;
    const mesNombre = estado.mes_nombre || MESES[estado.mes] || "Mes";
    const anio = estado.anio || 2026;

    verificarMesTitle.textContent = `Verificación · ${mesNombre} ${anio}`;
    verificarMesMeta.textContent =
      "Días hábiles (incluye festivos laborables; excluye solo domingos) · Minutos de producción y Horarios del personal";

    verificarMesResumen.className =
      "verify-summary" + (totalPendientes ? " incomplete" : "");
    if (!habiles.length) {
      verificarMesResumen.innerHTML =
        "<p class=\"verify-warn\">No hay días hábiles cargados en este mes.</p>";
      verificarMesDetalle.innerHTML = "";
    } else if (!totalPendientes) {
      verificarMesResumen.innerHTML = `
        <p class="verify-ok">Todos los días hábiles están completos</p>
        <p>${completos} de ${habiles.length} días con minutos de producción y horarios del personal.</p>
      `;
      verificarMesDetalle.innerHTML = "";
      setStatus(`${mesNombre}: mes completo (${completos} días hábiles)`);
    } else {
      verificarMesResumen.innerHTML = `
        <p class="verify-warn">Hay días pendientes</p>
        <p>${completos} completos · ${totalPendientes} pendientes · ${habiles.length} hábiles en total</p>
      `;
      verificarMesDetalle.innerHTML = renderPendientesVerificacion({
        pendientesAmbos,
        pendientesProduccion,
        pendientesHorario,
      });
      setStatus(
        `${mesNombre}: ${totalPendientes} día(s) pendiente(s) de ${habiles.length} hábiles`,
        true
      );
    }

    modalVerificarMes.show();
  }

  function renderListaPendientes(titulo, items, tagsFn) {
    if (!items.length) return "";
    const lis = items
      .map((item) => {
        const tags = tagsFn(item)
          .map((t) => `<span class="tag">${t}</span>`)
          .join("");
        return `<li><strong>${item.etiqueta}</strong> <small>(${item.fecha})</small>${tags}</li>`;
      })
      .join("");
    return `<h3>${titulo}</h3><ul>${lis}</ul>`;
  }

  function renderPendientesVerificacion({
    pendientesAmbos,
    pendientesProduccion,
    pendientesHorario,
  }) {
    return [
      renderListaPendientes(
        "Falta producción y horario",
        pendientesAmbos,
        () => ["Producción", "Horario"]
      ),
      renderListaPendientes(
        "Falta minutos de producción",
        pendientesProduccion,
        () => ["Producción"]
      ),
      renderListaPendientes(
        "Falta horarios del personal",
        pendientesHorario,
        () => ["Horario"]
      ),
    ].join("");
  }

  function renderTabla() {
    const cols = estado.columnas || [];
    headerRow.innerHTML = "";

    const corner = document.createElement("th");
    corner.className = "corner sticky-col title-cell";
    corner.innerHTML = `<span>${estado.titulo || "PARADAS DE LÍNEA POR TECNOLOGÍA 2026"}</span>`;
    headerRow.appendChild(corner);

    for (const col of cols) {
      const th = document.createElement("th");
      th.className = "day-head";
      if (esDomingoCol(col)) th.classList.add("special");
      else if (esFestivoLaborable(col)) th.classList.add("festivo");

      if (esFestivoLaborable(col)) {
        const desc = String(col.descripcion_festivo || "").trim();
        th.innerHTML = `
          <span class="day-label">${col.etiqueta}</span>
          <span class="day-festivo-tag">Festivo</span>
        `;
        th.title = desc || "Día festivo · se labora con normalidad";
      } else {
        th.textContent = col.etiqueta;
        th.title = col.descripcion_festivo || col.fecha;
      }
      th.addEventListener("click", () => abrirEditorDia(col));
      headerRow.appendChild(th);
    }

    bodyRows.innerHTML = "";

    for (const fila of FILAS) {
      const tr = document.createElement("tr");
      const label = document.createElement("td");
      label.className = "sticky-col";
      label.textContent = fila.label;
      tr.appendChild(label);

      for (const col of cols) {
        const td = document.createElement("td");
        td.className = "editable";

        // Solo domingo: etiqueta en toda la columna (no se labora)
        if (esEspecial(col)) {
          td.classList.add("special");
          td.textContent = etiquetaEspecial(col);
          td.addEventListener("click", () => abrirEditorDia(col));
          tr.appendChild(td);
          continue;
        }

        const valor = col[fila.key];
        if (fila.tipo === "num") {
          td.classList.add("num");
          td.textContent = String(valor ?? 0);
        } else if (fila.tipo === "pct") {
          td.classList.add("num", "pct");
          if (!col.minutos_parada) {
            td.textContent = "";
            td.classList.add("empty");
          } else {
            td.textContent = formatPct(valor);
          }
        } else if (fila.key === "justificacion_parada") {
          td.classList.add("texto-celda");
          const texto = (valor || "").trim();
          const wrap = document.createElement("div");
          wrap.className = "texto-celda-inner";
          wrap.textContent = texto || "—";
          if (!texto) wrap.classList.add("vacio");
          if (texto) td.title = texto;
          td.appendChild(wrap);
        } else {
          td.textContent = valor || "";
        }

        td.addEventListener("click", () => abrirEditorDia(col));
        tr.appendChild(td);
      }
      bodyRows.appendChild(tr);
    }

    const trH = document.createElement("tr");
    const labelH = document.createElement("td");
    labelH.className = "sticky-col";
    labelH.textContent = "Horarios del personal";
    trH.appendChild(labelH);

    for (const semana of estado.semanas || []) {
      const colsSemana = cols.slice(
        semana.inicio_idx,
        semana.inicio_idx + semana.colspan
      );
      let k = 0;
      while (k < colsSemana.length) {
        const col = colsSemana[k];
        const wd = fechaLocal(col.fecha).getDay(); // 0=dom … 6=sáb

        if (wd === 6) {
          trH.appendChild(
            crearCeldaHorario({
              titulo: "Sábado",
              asignaciones: semana.asignaciones_sabado || [],
              excepciones: (semana.excepciones || []).filter(
                (e) => fechaLocal(e.fecha).getDay() === 6
              ),
              responsable: semana.responsable_sabado || "",
              colspan: 1,
              clase: "sabado",
              onClick: () => abrirEditorSemana(semana),
              vacio: "Clic para horario de sábado",
            })
          );
          k += 1;
          continue;
        }

        // Lun–vie (el domingo no se trabaja: celda vacía, sin bloque aparte)
        if (wd === 0) {
          const tdDom = document.createElement("td");
          tdDom.className = "week-cell domingo-off";
          tdDom.colSpan = 1;
          trH.appendChild(tdDom);
          k += 1;
          continue;
        }

        let n = k + 1;
        while (n < colsSemana.length) {
          const wdn = fechaLocal(colsSemana[n].fecha).getDay();
          if (wdn === 0 || wdn === 6) break;
          n += 1;
        }
        trH.appendChild(
          crearCeldaHorario({
            titulo: `Lun–Vie · ${semana.etiqueta}`,
            asignaciones: semana.asignaciones_lun_vie || semana.asignaciones || [],
            excepciones: (semana.excepciones || []).filter(
              (e) => fechaLocal(e.fecha).getDay() !== 0 && fechaLocal(e.fecha).getDay() !== 6
            ),
            responsable: semana.responsable_proceso || "",
            colspan: n - k,
            clase: "",
            onClick: () => abrirEditorSemana(semana),
            vacio: "Clic para horario lun–vie",
          })
        );
        k = n;
      }
    }

    bodyRows.appendChild(trH);
  }

  function crearCeldaHorario({
    titulo,
    asignaciones,
    excepciones = [],
    responsable,
    colspan,
    clase,
    onClick,
    vacio,
  }) {
    const td = document.createElement("td");
    td.className = "week-cell editable" + (clase ? ` ${clase}` : "");
    td.colSpan = colspan;
    const base = clase === "sabado" ? 180 : 108;
    td.style.minWidth = `${Math.max(base, colspan * base * 0.92)}px`;

    const card = document.createElement("div");
    card.className = "week-card";
    card.innerHTML = `<div class="week-label">${titulo}</div>`;

    if (asignaciones && asignaciones.length) {
      const chips = document.createElement("div");
      chips.className = "week-chips";
      asignaciones.forEach((a, idx) => {
        const chip = document.createElement("div");
        const esPlanta = /planta|f\.p/i.test(
          `${a.turno_nombre || ""} ${a.turno_etiqueta || ""} ${a.texto || ""}`
        );
        chip.className = "chip" + (esPlanta ? " chip-planta" : "");
        chip.style.animationDelay = `${idx * 35}ms`;
        const nombreTurno = a.turno_nombre || a.turno_etiqueta || "Turno";
        const horas = a.turno_etiqueta && a.turno_nombre
          ? a.turno_etiqueta.replace(`${a.turno_nombre}:`, "").trim()
          : a.turno_etiqueta || "";
        chip.innerHTML = `
          <strong>${a.empleado_etiqueta || ""}</strong>
          <span>${nombreTurno}</span>
          ${horas ? `<span class="chip-hours">${horas}</span>` : ""}
        `;
        chips.appendChild(chip);
      });
      card.appendChild(chips);
      if (responsable) {
        const resp = document.createElement("div");
        resp.className = "week-responsable";
        resp.textContent = `Responsable: ${responsable}`;
        card.appendChild(resp);
      }
    }

    if (excepciones && excepciones.length) {
      const chipsExc = document.createElement("div");
      chipsExc.className = "week-chips";
      excepciones.forEach((e, idx) => {
        const chip = document.createElement("div");
        chip.className = "chip chip-exc";
        chip.style.animationDelay = `${idx * 35}ms`;
        const dia = e.fecha ? e.fecha.slice(8, 10) + "/" + e.fecha.slice(5, 7) : "";
        chip.innerHTML = `
          <strong>Exc. ${dia}</strong>
          <span>${e.cubre_etiqueta || ""}</span>
          ${e.sale_etiqueta ? `<span>← ${e.sale_etiqueta}</span>` : ""}
        `;
        chipsExc.appendChild(chip);
      });
      card.appendChild(chipsExc);
    }

    if (!(asignaciones && asignaciones.length) && !(excepciones && excepciones.length)) {
      const empty = document.createElement("div");
      empty.className = "week-empty";
      empty.textContent = vacio || "Sin horario";
      card.appendChild(empty);
    }

    td.appendChild(card);
    td.addEventListener("click", onClick);
    return td;
  }

  function abrirEditorDia(col) {
    if (soloLectura) {
      abrirResumenDia(col);
      return;
    }
    if (!puedeEditarTodo) {
      mostrarToast(
        "Solo el superadmin puede editar el reporte diario.",
        "warn",
        "Sin permiso"
      );
      return;
    }
    editFechaId.value = col.fecha_id;
    editTitle.textContent = `Editar · ${col.etiqueta}`;
    const flags = [];
    if (col.es_domingo) flags.push("Domingo");
    if (col.es_festivo) flags.push(col.descripcion_festivo || "Festivo");
    editMeta.textContent = `${col.fecha}${flags.length ? " · " + flags.join(" · ") : ""}`;

    const ini = col.hora_inicio_proceso || "15:00:00";
    const fin = col.hora_fin_proceso || "22:08:00";
    poblarSelectoresProceso(ini, fin);
    poblarResponsables(col.responsable_proceso || "");

    editParada.value = col.minutos_parada ?? 0;
    editJustificacion.value = col.justificacion_parada || "";
    editFestivo.checked = Boolean(col.es_festivo);
    editFestivoDesc.value = col.descripcion_festivo || "";
    festivoDescWrap.classList.toggle("d-none", !editFestivo.checked);
    actualizarCalculoProduccion();
    modalDia.show();
  }

  function textoOVacio(valor) {
    const t = String(valor ?? "").trim();
    return t || "—";
  }

  function escaparHtml(texto) {
    return String(texto ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatearHoraResumen(valor) {
    const t = String(valor || "").trim();
    if (!t) return "—";
    const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return escaparHtml(t);
    const hh = Number(m[1]);
    const mm = m[2];
    const ss = m[3] || "00";
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = ((hh + 11) % 12) + 1;
    return `${h12}:${mm}:${ss} ${ampm}`;
  }

  function filaResumen(label, valor, opts = {}) {
    const vacio = !String(valor ?? "").trim() || valor === "—";
    const valorMostrar = escaparHtml(vacio ? "—" : valor);
    if (opts.bloque) {
      return `<div class="span-full"><dt>${escaparHtml(label)}</dt><dd class="${
        vacio ? "empty" : ""
      }">${valorMostrar}</dd></div>`;
    }
    return `<div><dt>${escaparHtml(label)}</dt><dd class="${
      vacio ? "empty" : ""
    }">${valorMostrar}</dd></div>`;
  }

  function abrirResumenDia(col) {
    const flags = [];
    if (col.es_domingo) flags.push("Domingo");
    if (col.es_festivo) flags.push(col.descripcion_festivo || "Festivo");

    resumenDiaTitle.textContent = `Resumen · ${col.etiqueta}`;
    resumenDiaMeta.textContent = `${col.fecha}${
      flags.length ? " · " + flags.join(" · ") : ""
    }`;

    const pct =
      col.minutos_parada || col.porcentaje_parada
        ? formatPct(col.porcentaje_parada)
        : "—";

    resumenDiaBody.innerHTML = [
      filaResumen("Hora inicio de proceso", formatearHoraResumen(col.hora_inicio_proceso)),
      filaResumen("Hora finalización", formatearHoraResumen(col.hora_fin_proceso)),
      filaResumen("Minutos de parada", String(col.minutos_parada ?? 0)),
      filaResumen("Minutos de producción", String(col.minutos_produccion ?? 0)),
      filaResumen("Porcentaje de parada", pct),
      filaResumen("Responsable del proceso", textoOVacio(col.responsable_proceso)),
      filaResumen(
        "Festivo",
        col.es_festivo
          ? textoOVacio(col.descripcion_festivo) !== "—"
            ? `Sí · ${col.descripcion_festivo}`
            : "Sí"
          : "No"
      ),
      filaResumen(
        "Justificación de la parada",
        textoOVacio(col.justificacion_parada),
        { bloque: true }
      ),
    ].join("");

    modalResumenDia.show();
  }

  function optionList(items, valueKey, labelKey, selected) {
    return items
      .map(
        (item) =>
          `<option value="${item[valueKey]}" ${
            String(item[valueKey]) === String(selected) ? "selected" : ""
          }>${item[labelKey]}</option>`
      )
      .join("");
  }

  function esTurnoSoloSabado(texto) {
    const t = String(texto || "").toLowerCase();
    return /sabad/.test(t) || /festivo/.test(t);
  }

  function esTurnoSoloEntreSemana(texto) {
    const t = String(texto || "").toLowerCase();
    return (
      /lun[\s\-–]*vie/.test(t) ||
      /entre\s*semana/.test(t) ||
      /entre-semana/.test(t)
    );
  }

  function turnoPorId(turnoId) {
    return (estado.turnos || []).find((t) => String(t.id) === String(turnoId));
  }

  function textoTurno(turnoId, selectEl) {
    const tur = turnoPorId(turnoId);
    if (tur) return `${tur.nombre || ""} ${tur.etiqueta || ""}`;
    return selectEl ? textoOpcionSelect(selectEl) : "";
  }

  function avisoTurnoEnAmbitoIncorrecto(ambito, turnoTexto) {
    if (ambito === "lun_vie" && esTurnoSoloSabado(turnoTexto)) {
      return "Ese turno es de sábado. No se puede asignar en lunes a viernes.";
    }
    if (ambito === "sabado" && esTurnoSoloEntreSemana(turnoTexto)) {
      return "Ese turno es de entre semana. No se puede asignar en sábado.";
    }
    return "";
  }

  function validarCruceAmbitos() {
    for (const row of asignacionesList.querySelectorAll(".asig-row")) {
      const turSel = row.querySelector(".tur-select");
      if (!turSel.value) continue;
      const msg = avisoTurnoEnAmbitoIncorrecto(
        "lun_vie",
        textoTurno(turSel.value, turSel)
      );
      if (msg) {
        row.classList.add("incomplete");
        return msg;
      }
    }
    for (const row of asignacionesSabadoList.querySelectorAll(".asig-row")) {
      const turSel = row.querySelector(".tur-select");
      if (!turSel.value) continue;
      const msg = avisoTurnoEnAmbitoIncorrecto(
        "sabado",
        textoTurno(turSel.value, turSel)
      );
      if (msg) {
        row.classList.add("incomplete");
        return msg;
      }
    }
    return "";
  }

  function renderAsignacionRow(container, asig = {}, ambito = "lun_vie") {
    const row = document.createElement("div");
    row.className = "asig-row";
    row.dataset.ambito = ambito;
    row.innerHTML = `
      <select class="form-select emp-select">
        <option value="">Empleado…</option>
        ${optionList(estado.empleados || [], "id", "etiqueta", asig.empleado_id)}
      </select>
      <select class="form-select tur-select">
        <option value="">Turno de trabajo…</option>
        ${optionList(estado.turnos || [], "id", "etiqueta", asig.turno_id)}
      </select>
      <button type="button" class="icon-action danger btn-remove">Quitar</button>
    `;
    const empSel = row.querySelector(".emp-select");
    const turSel = row.querySelector(".tur-select");
    const syncIncomplete = () => {
      const emp = empSel.value;
      const tur = turSel.value;
      const incompleta = Boolean((emp && !tur) || (!emp && tur));
      row.classList.toggle("incomplete", incompleta);
    };
    turSel.addEventListener("change", () => {
      if (!turSel.value) {
        syncIncomplete();
        return;
      }
      const aviso = avisoTurnoEnAmbitoIncorrecto(
        ambito,
        textoTurno(turSel.value, turSel)
      );
      if (aviso) {
        turSel.value = "";
        row.classList.add("incomplete");
        mostrarAlertaSemana(aviso, "error");
        mostrarToast(aviso, "error", "Aviso");
        syncIncomplete();
        return;
      }
      limpiarAlertaSemana();
      syncIncomplete();
    });
    empSel.addEventListener("change", syncIncomplete);
    row.querySelector(".btn-remove").addEventListener("click", () => row.remove());
    syncIncomplete();
    if (asig.turno_id) {
      const aviso = avisoTurnoEnAmbitoIncorrecto(
        ambito,
        textoTurno(asig.turno_id, turSel)
      );
      if (aviso) {
        turSel.value = "";
        row.classList.add("incomplete");
      }
    }
    container.appendChild(row);
  }

  function leerAsignaciones(container) {
    const out = [];
    for (const row of container.querySelectorAll(".asig-row")) {
      const emp = row.querySelector(".emp-select").value;
      const tur = row.querySelector(".tur-select").value;
      if (!emp || !tur) continue;
      out.push({ empleado_id: Number(emp), turno_id: Number(tur) });
    }
    return out;
  }

  function textoOpcionSelect(select) {
    const opt = select.options[select.selectedIndex];
    return opt ? String(opt.textContent || "").trim() : "";
  }

  function leerAsignacionesTexto(container) {
    const out = [];
    for (const row of container.querySelectorAll(".asig-row")) {
      const empSel = row.querySelector(".emp-select");
      const turSel = row.querySelector(".tur-select");
      if (!empSel.value || !turSel.value) continue;
      out.push({
        empleado: textoOpcionSelect(empSel),
        turno: textoOpcionSelect(turSel),
      });
    }
    return out;
  }

  function esTurnoPlantaTexto(texto) {
    const blob = String(texto || "").toLowerCase();
    return blob.includes("planta") || blob.replace(/\s+/g, "").includes("f.p");
  }

  function responsableDesdeAsignaciones(items) {
    const hit = items.find((a) => esTurnoPlantaTexto(a.turno));
    return hit ? String(hit.empleado || "").trim().toUpperCase() : "";
  }

  function formatearLineasAsignacion(items) {
    if (!items.length) return ["(sin asignaciones)"];
    return items.map((a) => `- ${a.empleado} → ${a.turno}`);
  }

  function diasOpcionesSemanaActual() {
    const inicio = semanaFechaInicio.value;
    if (!inicio) return [];
    const lunes = fechaLocal(inicio);
    const out = [];
    const nombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      if (d.getDay() === 0) continue; // domingo no se trabaja
      const iso = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      out.push({
        value: iso,
        label: `${nombres[d.getDay()]} ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`,
      });
    }
    return out;
  }

  function renderExcepcionRow(exc = {}) {
    const row = document.createElement("div");
    row.className = "exc-row";
    const dias = diasOpcionesSemanaActual();
    const diasOpts = dias
      .map(
        (d) =>
          `<option value="${d.value}" ${
            String(d.value) === String(exc.fecha || "") ? "selected" : ""
          }>${d.label}</option>`
      )
      .join("");
    row.innerHTML = `
      <select class="form-select exc-fecha">
        <option value="">Día…</option>
        ${diasOpts}
      </select>
      <select class="form-select exc-sale">
        <option value="">Cede (opcional)…</option>
        ${optionList(estado.empleados || [], "id", "etiqueta", exc.empleado_sale_id)}
      </select>
      <select class="form-select exc-cubre">
        <option value="">Cubre…</option>
        ${optionList(estado.empleados || [], "id", "etiqueta", exc.empleado_cubre_id)}
      </select>
      <select class="form-select exc-turno">
        <option value="">Turno…</option>
        ${optionList(estado.turnos || [], "id", "etiqueta", exc.turno_id)}
      </select>
      <input type="text" class="form-control exc-nota" maxlength="255" placeholder="Nota (opcional)" value="${
        String(exc.nota || "").replace(/"/g, "&quot;")
      }" />
      <button type="button" class="icon-action danger btn-remove">Quitar</button>
    `;
    const sync = () => {
      const fecha = row.querySelector(".exc-fecha").value;
      const cubre = row.querySelector(".exc-cubre").value;
      const turno = row.querySelector(".exc-turno").value;
      const sale = row.querySelector(".exc-sale").value;
      const incompleta = Boolean(
        (fecha || cubre || turno || sale) && !(fecha && cubre && turno)
      );
      const mismo = Boolean(cubre && sale && cubre === sale);
      row.classList.toggle("incomplete", incompleta || mismo);
    };
    row.querySelectorAll("select, input").forEach((el) => {
      el.addEventListener("change", sync);
      el.addEventListener("input", sync);
    });
    row.querySelector(".btn-remove").addEventListener("click", () => row.remove());
    sync();
    excepcionesList.appendChild(row);
  }

  function leerExcepciones() {
    const out = [];
    for (const row of excepcionesList.querySelectorAll(".exc-row")) {
      const fecha = row.querySelector(".exc-fecha").value;
      const cubre = row.querySelector(".exc-cubre").value;
      const turno = row.querySelector(".exc-turno").value;
      const sale = row.querySelector(".exc-sale").value;
      const nota = row.querySelector(".exc-nota").value.trim();
      if (!fecha && !cubre && !turno && !sale && !nota) continue;
      if (!fecha || !cubre || !turno) continue;
      out.push({
        fecha,
        empleado_cubre_id: Number(cubre),
        empleado_sale_id: sale ? Number(sale) : null,
        turno_id: Number(turno),
        nota,
      });
    }
    return out;
  }

  function validarFilasExcepcion() {
    const incompletas = [];
    for (const row of excepcionesList.querySelectorAll(".exc-row")) {
      const fecha = row.querySelector(".exc-fecha").value;
      const cubre = row.querySelector(".exc-cubre").value;
      const turno = row.querySelector(".exc-turno").value;
      const sale = row.querySelector(".exc-sale").value;
      const nota = row.querySelector(".exc-nota").value.trim();
      const vacia = !fecha && !cubre && !turno && !sale && !nota;
      if (vacia) {
        row.classList.remove("incomplete");
        continue;
      }
      const incompleta = !(fecha && cubre && turno);
      const mismo = Boolean(cubre && sale && cubre === sale);
      row.classList.toggle("incomplete", incompleta || mismo);
      if (incompleta || mismo) incompletas.push(row);
    }
    return incompletas;
  }

  function excepcionesTextoLista() {
    const out = [];
    for (const row of excepcionesList.querySelectorAll(".exc-row")) {
      const fechaSel = row.querySelector(".exc-fecha");
      const cubreSel = row.querySelector(".exc-cubre");
      const saleSel = row.querySelector(".exc-sale");
      const turSel = row.querySelector(".exc-turno");
      if (!fechaSel.value || !cubreSel.value || !turSel.value) continue;
      const fechaLabel = textoOpcionSelect(fechaSel);
      const cubre = textoOpcionSelect(cubreSel);
      const sale = saleSel.value ? textoOpcionSelect(saleSel) : "";
      const turno = textoOpcionSelect(turSel);
      const nota = row.querySelector(".exc-nota").value.trim();
      let line = `- ${fechaLabel}: ${cubre} cubre ${turno}`;
      if (sale) line += ` (en lugar de ${sale})`;
      if (nota) line += ` · ${nota}`;
      out.push(line);
    }
    return out;
  }

  function saludoSegunHora(fecha = new Date()) {
    const h = fecha.getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }

  function numeroSemanaDelAnio(fechaIso) {
    const d = new Date(`${fechaIso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
  }

  function textoInfoSemana(fechaInicio, fechaFin) {
    const n = numeroSemanaDelAnio(fechaInicio);
    const rango =
      fechaInicio && fechaFin
        ? `Lunes ${fechaInicio} → Domingo ${fechaFin}`
        : fechaInicio
          ? `Semana desde ${fechaInicio}`
          : "Semana";
    if (n) return `Semana ${n} del año · ${rango}`;
    return rango;
  }

  function construirMensajeHorariosWhatsApp() {
    const lunVie = leerAsignacionesTexto(asignacionesList);
    const sabado = leerAsignacionesTexto(asignacionesSabadoList);
    const excepciones = excepcionesTextoLista();
    const fechaInicio = semanaFechaInicio.value || "";
    const fechaFin = fechaInicio
      ? (() => {
          const d = new Date(`${fechaInicio}T12:00:00`);
          d.setDate(d.getDate() + 6);
          return d.toISOString().slice(0, 10);
        })()
      : "";
    const responsable =
      responsableDesdeAsignaciones(lunVie) ||
      responsableDesdeAsignaciones(sabado);

    const lineas = [
      saludoSegunHora(),
      "",
      "*Horarios del personal*",
      textoInfoSemana(fechaInicio, fechaFin),
      "",
      "*Lunes a viernes*",
      ...formatearLineasAsignacion(lunVie),
      "",
      "*Sábado*",
      ...formatearLineasAsignacion(sabado),
    ];
    if (excepciones.length) {
      lineas.push("", "*Excepciones*", ...excepciones);
    }
    if (responsable) {
      lineas.push("", "*Responsable del proceso:* " + responsable);
    }
    lineas.push("", "Gracias");
    return lineas.join("\n");
  }

  function enviarHorariosPorWhatsApp() {
    limpiarAlertaSemana();
    const lunVie = leerAsignacionesTexto(asignacionesList);
    const sabado = leerAsignacionesTexto(asignacionesSabadoList);
    const excepciones = excepcionesTextoLista();
    if (!lunVie.length && !sabado.length && !excepciones.length) {
      const msg =
        "Completa al menos una asignación o excepción antes de enviar por WhatsApp.";
      mostrarAlertaSemana(msg, "error");
      mostrarToast(msg, "error", "WhatsApp");
      return;
    }

    const mensaje = construirMensajeHorariosWhatsApp();
    const url = "https://wa.me/?text=" + encodeURIComponent(mensaje);
    window.open(url, "_blank", "noopener,noreferrer");
    mostrarToast("WhatsApp abierto · elige el grupo y pulsa Enviar", "ok");
    setStatus("WhatsApp abierto · elige el grupo y pulsa Enviar");
  }

  function hoyIsoLocal() {
    const n = new Date();
    return `${n.getFullYear()}-${pad2(n.getMonth() + 1)}-${pad2(n.getDate())}`;
  }

  function formatearHoraClick(fecha = new Date()) {
    const hh = fecha.getHours();
    const mm = pad2(fecha.getMinutes());
    const ss = pad2(fecha.getSeconds());
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = ((hh + 11) % 12) + 1;
    return `${h12}:${mm}:${ss} ${ampm}`;
  }

  function formatearFechaCorta(fechaIso) {
    const d = fechaLocal(fechaIso);
    if (Number.isNaN(d.getTime())) return fechaIso;
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  function semanaPorFecha(fechaIso) {
    return (estado.semanas || []).find(
      (s) => fechaIso >= s.fecha_inicio && fechaIso <= s.fecha_fin
    );
  }

  function responsableProcesoParaFecha(fechaIso) {
    const semana = semanaPorFecha(fechaIso);
    const col = (estado.columnas || []).find((c) => c.fecha === fechaIso);
    if (col && String(col.responsable_proceso || "").trim()) {
      return String(col.responsable_proceso).trim().toUpperCase();
    }
    if (!semana) return "";
    const wd = fechaLocal(fechaIso).getDay();
    if (wd === 6) {
      return String(
        semana.responsable_sabado || semana.responsable_proceso || ""
      )
        .trim()
        .toUpperCase();
    }
    return String(semana.responsable_proceso || "").trim().toUpperCase();
  }

  const FRASES_MOTIVADORAS_PROCESO = [
    "¡Misión cumplida! Otro proceso cerrado con excelencia.",
    "¡Lo logramos! Trabajo en equipo que se nota.",
    "Proceso terminado: constancia + disciplina = resultado.",
    "¡Excelente jornada! Cada cierre sin novedad suma.",
    "¡Hecho! Hoy el proceso salió como debía.",
    "Cierre limpio, equipo enfocado. ¡Así se trabaja!",
    "¡Orgullo de planta! Proceso finalizado sin contratiempos.",
    "Un día más, un proceso más… ¡y bien hecho!",
    "¡Éxito compartido! Gracias al equipo por el compromiso.",
    "Meta alcanzada. Mañana seguimos con la misma energía.",
    "Sin novedad, con calidad. ¡Eso es profesionalismo!",
    "¡Victoria del día! Proceso de beneficio cerrado correctamente.",
  ];

  function elegirAlAzar(lista) {
    if (!lista || !lista.length) return "";
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function construirMensajeProcesoSinNovedad(ahora = new Date()) {
    const fechaIso = hoyIsoLocal();
    const responsable = responsableProcesoParaFecha(fechaIso);
    const semana = semanaPorFecha(fechaIso);
    const frase = elegirAlAzar(FRASES_MOTIVADORAS_PROCESO);
    const lineas = [
      saludoSegunHora(ahora),
      "",
      "El proceso de beneficio *finalizó sin novedad*.",
      "",
      `*Fecha:* ${formatearFechaCorta(fechaIso)}`,
      `*Hora de confirmación:* ${formatearHoraClick(ahora)}`,
    ];
    if (semana) {
      const n = semana.semana_anio || numeroSemanaDelAnio(semana.fecha_inicio);
      if (n) lineas.push(`*Semana:* ${n} del año`);
    }
    lineas.push(
      "",
      `*Enviado por:* ${responsable || "(sin responsable asignado)"}`,
      "_Responsable del proceso (Horarios del personal)_",
      "",
      `💪 ${frase}`,
      "",
      "Gracias"
    );
    return { mensaje: lineas.join("\n"), responsable, fechaIso, semana, frase };
  }

  function enviarProcesoSinNovedadWhatsApp() {
    const ahora = new Date();
    const { mensaje, responsable, fechaIso, semana } =
      construirMensajeProcesoSinNovedad(ahora);

    if (!semana) {
      const msg =
        "No hay datos de la semana actual en el mes cargado. Cambia al mes de hoy y pulsa Actualizar.";
      mostrarToast(msg, "warn", "Sin semana");
      setStatus(msg, true);
      return;
    }
    if (!responsable) {
      const msg =
        "No hay responsable del proceso en Horarios del personal para hoy (turno Planta).";
      mostrarToast(msg, "warn", "Falta responsable");
      setStatus(msg, true);
      return;
    }

    const url = "https://wa.me/?text=" + encodeURIComponent(mensaje);
    window.open(url, "_blank", "noopener,noreferrer");
    mostrarToast(
      `WhatsApp abierto · confirmación de ${responsable}`,
      "ok",
      "Proceso sin novedad"
    );
    setStatus(
      `Confirmación WA · ${responsable} · ${formatearFechaCorta(fechaIso)} ${formatearHoraClick(ahora)}`
    );
  }

  function abrirEditorSemana(semana) {
    if (!puedeEditarHorarios) {
      mostrarToast(
        "Tu rol es solo lectura. No puedes editar horarios.",
        "warn",
        "Sin permiso"
      );
      return;
    }
    confirmarGuardadoVacio = false;
    limpiarAlertaSemana();

    semanaFechaInicio.value = semana.fecha_inicio;
    semanaTitle.textContent = "Horario semanal";
    semanaMeta.textContent = textoInfoSemana(
      semana.fecha_inicio,
      semana.fecha_fin
    );
    semanaHint.textContent =
      "Un mismo empleado puede tener varios turnos. Usa Excepciones para cambios puntuales entre compañeros.";

    bloqueLunVie.classList.remove("d-none");
    bloqueSabado.classList.remove("d-none");

    const tabBase = document.getElementById("tabHorarioBase");
    if (tabBase) tabBase.click();

    asignacionesList.innerHTML = "";
    asignacionesSabadoList.innerHTML = "";
    excepcionesList.innerHTML = "";

    const itemsLv =
      (semana.asignaciones_lun_vie || semana.asignaciones || []).length
        ? semana.asignaciones_lun_vie || semana.asignaciones
        : [{}];
    itemsLv.forEach((a) => renderAsignacionRow(asignacionesList, a, "lun_vie"));

    const itemsSab =
      (semana.asignaciones_sabado || []).length ? semana.asignaciones_sabado : [{}];
    itemsSab.forEach((a) => renderAsignacionRow(asignacionesSabadoList, a, "sabado"));

    const itemsExc = semana.excepciones || [];
    if (itemsExc.length) {
      itemsExc.forEach((e) => renderExcepcionRow(e));
    } else {
      renderExcepcionRow({});
    }

    actualizarEstadoPortapapelesSemana();
    modalSemana.show();
  }

  function leerPortapapelesSemana() {
    try {
      const raw = localStorage.getItem(HORARIO_CLIPBOARD_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      return {
        asignaciones_lun_vie: Array.isArray(data.asignaciones_lun_vie)
          ? data.asignaciones_lun_vie
          : Array.isArray(data.asignaciones) && data.ambito === "lun_vie"
            ? data.asignaciones
            : [],
        asignaciones_sabado: Array.isArray(data.asignaciones_sabado)
          ? data.asignaciones_sabado
          : Array.isArray(data.asignaciones) && data.ambito === "sabado"
            ? data.asignaciones
            : [],
        origen: data.origen || "",
      };
    } catch (_) {
      return null;
    }
  }

  function actualizarEstadoPortapapelesSemana() {
    const clip = leerPortapapelesSemana();
    const tiene =
      clip &&
      (clip.asignaciones_lun_vie.length > 0 || clip.asignaciones_sabado.length > 0);
    btnPegarSemana.disabled = !tiene;
    if (!tiene) {
      semanaClipboardMeta.textContent = "Sin horario copiado";
      return;
    }
    const origen = clip.origen ? " · origen " + clip.origen : "";
    semanaClipboardMeta.textContent =
      "Portapapeles: " +
      clip.asignaciones_lun_vie.length +
      " lun–vie · " +
      clip.asignaciones_sabado.length +
      " sábado" +
      origen;
  }

  function filtrarAsignacionesValidas(items) {
    const empIds = new Set((estado.empleados || []).map((e) => Number(e.id)));
    const turIds = new Set((estado.turnos || []).map((t) => Number(t.id)));
    const out = [];
    let omitidas = 0;
    for (const item of items || []) {
      const emp = Number(item.empleado_id);
      const tur = Number(item.turno_id);
      if (!emp || !tur || !empIds.has(emp) || !turIds.has(tur)) {
        omitidas += 1;
        continue;
      }
      out.push({ empleado_id: emp, turno_id: tur });
    }
    return { items: out, omitidas };
  }

  function renderAsignacionesEn(container, items, ambito) {
    container.innerHTML = "";
    const lista = items && items.length ? items : [{}];
    lista.forEach((a) => renderAsignacionRow(container, a, ambito));
  }

  function validarFilasAsignacion(container) {
    const incompletas = [];
    for (const row of container.querySelectorAll(".asig-row")) {
      const emp = row.querySelector(".emp-select").value;
      const tur = row.querySelector(".tur-select").value;
      const incompleta = Boolean((emp && !tur) || (!emp && tur));
      row.classList.toggle("incomplete", incompleta);
      if (incompleta) incompletas.push(row);
    }
    return incompletas;
  }

  function copiarHorarioSemana() {
    limpiarAlertaSemana();
    const incompletas = [
      ...validarFilasAsignacion(asignacionesList),
      ...validarFilasAsignacion(asignacionesSabadoList),
    ];
    if (incompletas.length) {
      const msg =
        "Hay filas incompletas (empleado sin turno o turno sin empleado). Complétalas o quítalas antes de copiar.";
      mostrarAlertaSemana(msg, "error");
      mostrarToast(msg, "error", "No se pudo copiar");
      return;
    }
    const cruce = validarCruceAmbitos();
    if (cruce) {
      mostrarAlertaSemana(cruce, "error");
      mostrarToast(cruce, "error", "Horario incorrecto");
      return;
    }
    const asignaciones_lun_vie = leerAsignaciones(asignacionesList);
    const asignaciones_sabado = leerAsignaciones(asignacionesSabadoList);
    if (!asignaciones_lun_vie.length && !asignaciones_sabado.length) {
      const msg = "No hay asignaciones para copiar.";
      mostrarAlertaSemana(msg, "warn");
      mostrarToast(msg, "warn", "Nada para copiar");
      return;
    }
    const payload = {
      asignaciones_lun_vie,
      asignaciones_sabado,
      origen: semanaFechaInicio.value || "",
      copiado_en: new Date().toISOString(),
    };
    try {
      localStorage.setItem(HORARIO_CLIPBOARD_KEY, JSON.stringify(payload));
    } catch (_) {
      const msg = "No se pudo guardar el horario en el portapapeles del navegador.";
      mostrarAlertaSemana(msg, "error");
      mostrarToast(msg, "error");
      return;
    }
    actualizarEstadoPortapapelesSemana();
    const ok =
      "Horario copiado · " +
      asignaciones_lun_vie.length +
      " lun–vie · " +
      asignaciones_sabado.length +
      " sábado";
    mostrarAlertaSemana(ok, "ok");
    mostrarToast(ok, "ok", "Copiado");
    setStatus(ok);
  }

  function pegarHorarioSemana() {
    limpiarAlertaSemana();
    const clip = leerPortapapelesSemana();
    if (
      !clip ||
      (!clip.asignaciones_lun_vie.length && !clip.asignaciones_sabado.length)
    ) {
      const msg = "No hay un horario copiado para pegar.";
      mostrarAlertaSemana(msg, "warn");
      mostrarToast(msg, "warn");
      actualizarEstadoPortapapelesSemana();
      return;
    }

    const lv = filtrarAsignacionesValidas(clip.asignaciones_lun_vie);
    const sab = filtrarAsignacionesValidas(clip.asignaciones_sabado);
    if (!lv.items.length && !sab.items.length) {
      const msg =
        "El horario copiado no tiene empleados/turnos válidos en el catálogo actual.";
      mostrarAlertaSemana(msg, "error");
      mostrarToast(msg, "error");
      return;
    }

    renderAsignacionesEn(asignacionesList, lv.items, "lun_vie");
    renderAsignacionesEn(asignacionesSabadoList, sab.items, "sabado");

    const cruce = validarCruceAmbitos();
    if (cruce) {
      mostrarAlertaSemana(cruce, "warn");
      mostrarToast(cruce, "warn", "Revisa turnos");
    }

    const omitidas = lv.omitidas + sab.omitidas;
    const base =
      "Horario pegado · " +
      lv.items.length +
      " lun–vie · " +
      sab.items.length +
      " sábado · recuerda Guardar semana";
    if (omitidas) {
      const msg = base + " · se omitieron " + omitidas + " inválidas";
      mostrarAlertaSemana(msg, "warn");
      mostrarToast(msg, "warn", "Pegado con omisiones");
      setStatus(msg, true);
    } else {
      mostrarAlertaSemana(base, "ok");
      mostrarToast(base, "ok", "Pegado");
      setStatus(base);
    }
  }

  async function guardarDia(event) {
    event.preventDefault();
    if (!editHoraInicio.value || !editHoraFin.value) {
      setStatus("Selecciona hora de inicio y fin del proceso", true);
      return;
    }
    setStatus("Guardando día…");
    try {
      await api("/api/registros/guardar", {
        method: "POST",
        body: JSON.stringify({
          fecha_id: Number(editFechaId.value),
          minutos_parada: Number(editParada.value) || 0,
          hora_inicio_proceso: editHoraInicio.value,
          hora_fin_proceso: editHoraFin.value,
          minutos_produccion: Number(editProduccion.value) || 0,
          responsable_proceso: editResponsable.value,
          justificacion_parada: editJustificacion.value,
          es_festivo: editFestivo.checked,
          descripcion_festivo: editFestivoDesc.value,
        }),
      });
      modalDia.hide();
      await cargarReporte();
      setStatus("Día guardado");
    } catch (err) {
      setStatus(err.message, true);
    }
  }

  async function guardarSemana(event) {
    event.preventDefault();
    limpiarAlertaSemana();

    const incompletas = [
      ...validarFilasAsignacion(asignacionesList),
      ...validarFilasAsignacion(asignacionesSabadoList),
      ...validarFilasExcepcion(),
    ];
    if (incompletas.length) {
      const msg =
        "Hay filas incompletas en horario o excepciones. Complétalas o quítalas.";
      mostrarAlertaSemana(msg, "error");
      mostrarToast(msg, "error", "Validación");
      return;
    }

    const cruce = validarCruceAmbitos();
    if (cruce) {
      mostrarAlertaSemana(cruce, "error");
      mostrarToast(cruce, "error", "Horario incorrecto");
      return;
    }

    const asignaciones_lun_vie = leerAsignaciones(asignacionesList);
    const asignaciones_sabado = leerAsignaciones(asignacionesSabadoList);
    const excepciones = leerExcepciones();

    if (
      !asignaciones_lun_vie.length &&
      !asignaciones_sabado.length &&
      !excepciones.length &&
      !confirmarGuardadoVacio
    ) {
      const msg =
        "Vas a guardar la semana sin asignaciones ni excepciones (se borrarán). Pulsa Guardar otra vez para confirmar.";
      confirmarGuardadoVacio = true;
      mostrarAlertaSemana(msg, "warn");
      mostrarToast(msg, "warn", "Confirmación");
      return;
    }
    confirmarGuardadoVacio = false;

    setStatus("Guardando semana…");
    try {
      const res = await api("/api/horarios-semana/guardar", {
        method: "POST",
        body: JSON.stringify({
          fecha_inicio: semanaFechaInicio.value,
          asignaciones_lun_vie,
          asignaciones_sabado,
          excepciones,
        }),
      });
      modalSemana.hide();
      await cargarReporte();
      const okMsg = res.responsable_proceso
        ? "Semana guardada · Responsable del proceso: " + res.responsable_proceso
        : "Horario semanal guardado";
      mostrarToast(okMsg, "ok", "Guardado");
      setStatus(okMsg);
    } catch (err) {
      mostrarAlertaSemana(err.message, "error");
      mostrarToast(err.message, "error", "Error al guardar");
      setStatus(err.message, true);
    }
  }

  async function cargarCatalogos() {
    const [empleados, turnos] = await Promise.all([
      api("/api/empleados?todos=1"),
      api("/api/turnos?todos=1"),
    ]);
    estado.empleados = empleados.filter((e) => e.activo);
    estado.turnos = turnos.filter((t) => t.activo);
    renderListaEmpleados(empleados);
    renderListaTurnos(turnos);
  }

  function resetEmpForm() {
    editEmpId.value = "";
    formNuevoEmpleado.reset();
    btnEmpSubmit.textContent = "Agregar";
  }

  function resetTurForm() {
    editTurId.value = "";
    formNuevoTurno.reset();
    fillSelect(nuevoTurInicio, SHIFT_TIMES, "Hora inicio…");
    fillSelect(nuevoTurFin, [...SHIFT_TIMES, "F.P"], "Hora fin…");
    btnTurSubmit.textContent = "Agregar";
  }

  function renderListaEmpleados(empleados) {
    listaEmpleados.innerHTML = "";
    for (const e of empleados) {
      if (!e.activo) continue;
      const li = document.createElement("li");
      li.className = "catalog-item";
      li.innerHTML = `
        <div class="meta">
          <strong>${e.etiqueta || e.nombre}</strong>
        </div>
        <div class="actions">
          <button type="button" class="icon-action btn-edit">Editar</button>
          <button type="button" class="icon-action danger btn-del">Quitar</button>
        </div>
      `;
      li.querySelector(".btn-edit").addEventListener("click", () => {
        editEmpId.value = e.id;
        document.getElementById("nuevoEmpNombre").value = e.nombre;
        btnEmpSubmit.textContent = "Guardar";
      });
      li.querySelector(".btn-del").addEventListener("click", async () => {
        if (!confirm(`¿Desactivar a ${e.etiqueta}?`)) return;
        try {
          await api(`/api/empleados/${e.id}`, { method: "DELETE" });
          await cargarCatalogos();
          await cargarReporte();
        } catch (err) {
          setStatus(err.message, true);
        }
      });
      listaEmpleados.appendChild(li);
    }
  }

  function renderListaTurnos(turnos) {
    listaTurnos.innerHTML = "";
    for (const t of turnos) {
      if (!t.activo) continue;
      const li = document.createElement("li");
      li.className = "catalog-item";
      li.innerHTML = `
        <div class="meta">
          <strong>${t.nombre}</strong>
          <small>${t.hora_inicio} → ${t.hora_fin}</small>
        </div>
        <div class="actions">
          <button type="button" class="icon-action btn-edit">Editar</button>
          <button type="button" class="icon-action danger btn-del">Quitar</button>
        </div>
      `;
      li.querySelector(".btn-edit").addEventListener("click", () => {
        editTurId.value = t.id;
        document.getElementById("nuevoTurNombre").value = t.nombre;
        fillSelect(nuevoTurInicio, SHIFT_TIMES, "Hora inicio…", t.hora_inicio);
        fillSelect(nuevoTurFin, [...SHIFT_TIMES, "F.P"], "Hora fin…", t.hora_fin);
        btnTurSubmit.textContent = "Guardar";
      });
      li.querySelector(".btn-del").addEventListener("click", async () => {
        if (!confirm(`¿Desactivar el turno "${t.nombre}"?`)) return;
        try {
          await api(`/api/turnos/${t.id}`, { method: "DELETE" });
          await cargarCatalogos();
          await cargarReporte();
        } catch (err) {
          setStatus(err.message, true);
        }
      });
      listaTurnos.appendChild(li);
    }
  }

  formNuevoEmpleado.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      nombre: document.getElementById("nuevoEmpNombre").value.trim(),
    };
    try {
      if (editEmpId.value) {
        await api(`/api/empleados/${editEmpId.value}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setStatus("Empleado actualizado");
      } else {
        await api("/api/empleados", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setStatus("Empleado agregado");
      }
      resetEmpForm();
      await cargarCatalogos();
      await cargarReporte();
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  formNuevoTurno.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      nombre: document.getElementById("nuevoTurNombre").value,
      hora_inicio: nuevoTurInicio.value,
      hora_fin: nuevoTurFin.value,
    };
    try {
      if (editTurId.value) {
        await api(`/api/turnos/${editTurId.value}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setStatus("Turno actualizado");
      } else {
        await api("/api/turnos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setStatus("Turno agregado");
      }
      resetTurForm();
      await cargarCatalogos();
      await cargarReporte();
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  editParada.addEventListener("input", () => {
    editPorcentaje.value = formatPct(
      calcPorcentaje(editParada.value, editProduccion.value)
    );
  });
  editFestivo.addEventListener("change", () => {
    festivoDescWrap.classList.toggle("d-none", !editFestivo.checked);
  });

  editForm.addEventListener("submit", guardarDia);
  semanaForm.addEventListener("submit", guardarSemana);
  btnAddAsignacion.addEventListener("click", () =>
    renderAsignacionRow(asignacionesList, {}, "lun_vie")
  );
  btnAddAsignacionSabado.addEventListener("click", () =>
    renderAsignacionRow(asignacionesSabadoList, {}, "sabado")
  );
  btnAddExcepcion.addEventListener("click", () => renderExcepcionRow({}));
  btnCopiarSemana.addEventListener("click", copiarHorarioSemana);
  btnPegarSemana.addEventListener("click", pegarHorarioSemana);
  btnEnviarWhatsApp.addEventListener("click", enviarHorariosPorWhatsApp);
  btnRecargar.addEventListener("click", cargarReporte);
  btnVerificarMes.addEventListener("click", async () => {
    const mes = Number(mesSelect.value) || 1;
    setStatus("Verificando mes…");
    try {
      const data = await api(`/api/registros?mes=${mes}&anio=2026`);
      estado = data;
      renderTabla();
      verificarMesActual();
    } catch (err) {
      setStatus(err.message, true);
    }
  });
  btnCatalogos.addEventListener("click", async () => {
    try {
      resetEmpForm();
      resetTurForm();
      await cargarCatalogos();
      modalCatalogo.show();
    } catch (err) {
      setStatus(err.message + " · Ejecuta migrate_horarios.sql en MariaDB", true);
    }
  });
  if (btnProcesoSinNovedad) {
    btnProcesoSinNovedad.addEventListener("click", enviarProcesoSinNovedadWhatsApp);
  }
  mesSelect.addEventListener("change", cargarReporte);

  (async function init() {
    if (soloLectura && btnProcesoSinNovedad) {
      btnProcesoSinNovedad.classList.add("d-none");
    }
    if (!puedeEditarTodo) {
      if (btnCatalogos && !puedeEditarHorarios) btnCatalogos.classList.add("d-none");
    }
    if (soloLectura) {
      const hint = document.getElementById("scrollHint");
      if (hint) {
        hint.textContent =
          "Modo visitante · clic en un día para ver el resumen · los horarios del personal no se abren";
      }
    }
    poblarSelectorMeses();
    poblarSelectoresCatalogo();
    poblarSelectoresProceso();
    try {
      await cargarReporte();
    } catch (err) {
      setStatus(err.message + " · Verifica MySQL/MariaDB y .env", true);
    }
  })();
})();
