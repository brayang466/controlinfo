(() => {
  const mesSelect = document.getElementById("mesSelect");
  const btnRecargar = document.getElementById("btnRecargar");
  const btnPrecargar = document.getElementById("btnPrecargar");
  const btnCatalogos = document.getElementById("btnCatalogos");
  const statusBar = document.getElementById("statusBar");
  const headerRow = document.getElementById("headerRow");
  const bodyRows = document.getElementById("bodyRows");

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
  const btnAddAsignacion = document.getElementById("btnAddAsignacion");
  const btnAddAsignacionSabado = document.getElementById("btnAddAsignacionSabado");

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
  }

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

  function buildMinuteTimes() {
    const list = [];
    for (let h = 0; h < 24; h += 1) {
      for (let m = 0; m < 60; m += 1) {
        list.push(`${pad2(h)}:${pad2(m)}`);
      }
    }
    return list;
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

  const PROCESS_TIMES = buildMinuteTimes();
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

  function minutosDe(hhmm) {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  function esMadrugada(hhmm) {
    const mins = minutosDe(hhmm);
    return mins !== null && mins <= 6 * 60; // 00:00 … 06:00
  }

  /** Lista de fin: mismo día + madrugada (+1) hasta 6:00 AM + resto del día siguiente si aplica */
  function fillHoraFinSelect(selected = "", inicio = "") {
    const iniMins = minutosDe(inicio);
    editHoraFin.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = "Fin…";
    editHoraFin.appendChild(ph);

    const grupoMismo = document.createElement("optgroup");
    grupoMismo.label = "Mismo día";
    const grupoMadrugada = document.createElement("optgroup");
    grupoMadrugada.label = "Madrugada (día siguiente, hasta 6:00 AM)";
    const grupoOtro = document.createElement("optgroup");
    grupoOtro.label = "Otras horas (día siguiente)";

    for (const v of PROCESS_TIMES) {
      const finMins = minutosDe(v);
      const opt = document.createElement("option");
      opt.value = v;

      if (iniMins === null || finMins >= iniMins) {
        opt.textContent = v;
        grupoMismo.appendChild(opt);
      } else if (esMadrugada(v)) {
        opt.textContent = `${v} · madrugada (+1 día)`;
        grupoMadrugada.appendChild(opt);
      } else {
        opt.textContent = `${v} · día siguiente`;
        grupoOtro.appendChild(opt);
      }

      if (String(v) === String(selected)) opt.selected = true;
    }

    if (grupoMismo.children.length) editHoraFin.appendChild(grupoMismo);
    if (grupoMadrugada.children.length) editHoraFin.appendChild(grupoMadrugada);
    if (grupoOtro.children.length) editHoraFin.appendChild(grupoOtro);
  }

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
   * duración = fin - inicio → H:MM
   * minutos_produccion = (H * 60) + MM
   */
  function calcMinutosProduccion(inicio, fin) {
    if (!inicio || !fin) return null;
    let ini = minutosDe(inicio);
    let end = minutosDe(fin);
    const cruzaMedianoche = end < ini;
    if (cruzaMedianoche) end += 24 * 60;
    const diff = end - ini;
    const horas = Math.floor(diff / 60);
    const mins = diff % 60;
    return {
      duracion: `${horas}:${pad2(mins)}`,
      horas,
      mins,
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

  /** Evita desfase UTC: fecha ISO + mediodía local */
  function fechaLocal(fechaIso) {
    return new Date(`${String(fechaIso).slice(0, 10)}T12:00:00`);
  }

  function esDomingoFecha(fechaIso) {
    return fechaLocal(fechaIso).getDay() === 0;
  }

  function esEspecial(col) {
    // Festivo por BD; domingo por BD o por calendario real (2026)
    return Boolean(col.es_festivo || col.es_domingo || esDomingoFecha(col.fecha));
  }

  function etiquetaEspecial(col) {
    if (col.es_festivo) return "FESTIVO";
    if (col.es_domingo || esDomingoFecha(col.fecha)) return "DOMINGO";
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

  function poblarSelectoresProceso(selectedInicio = "15:00", selectedFin = "22:08") {
    fillSelect(editHoraInicio, PROCESS_TIMES, "Inicio…", selectedInicio);
    fillHoraFinSelect(selectedFin, selectedInicio || editHoraInicio.value);
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

  function renderTabla() {
    const cols = estado.columnas || [];
    headerRow.innerHTML = "";

    const corner = document.createElement("th");
    corner.className = "corner sticky-col title-cell";
    corner.innerHTML = `<span>${estado.titulo || "PARADAS DE LÍNEA POR TECNOLOGÍA 2026"}</span>`;
    headerRow.appendChild(corner);

    for (const col of cols) {
      const th = document.createElement("th");
      th.className = "day-head" + (esEspecial(col) ? " special" : "");
      th.textContent = col.etiqueta;
      th.title = col.descripcion_festivo || col.fecha;
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

        // Domingos/festivos: misma etiqueta en TODAS las filas (alineada a la columna)
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
    responsable,
    colspan,
    clase,
    onClick,
    vacio,
  }) {
    const td = document.createElement("td");
    td.className = "week-cell editable" + (clase ? ` ${clase}` : "");
    td.colSpan = colspan;
    // Ancho cómodo según días que abarca (legible en bloques lun–vie)
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
    } else {
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
    editFechaId.value = col.fecha_id;
    editTitle.textContent = `Editar · ${col.etiqueta}`;
    const flags = [];
    if (col.es_domingo) flags.push("Domingo");
    if (col.es_festivo) flags.push(col.descripcion_festivo || "Festivo");
    editMeta.textContent = `${col.fecha}${flags.length ? " · " + flags.join(" · ") : ""}`;

    const ini = col.hora_inicio_proceso || "15:00";
    const fin = col.hora_fin_proceso || "22:08";
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

  function renderAsignacionRow(container, asig = {}) {
    const row = document.createElement("div");
    row.className = "asig-row";
    row.innerHTML = `
      <select class="form-select emp-select" required>
        <option value="">Empleado…</option>
        ${optionList(estado.empleados || [], "id", "etiqueta", asig.empleado_id)}
      </select>
      <select class="form-select tur-select" required>
        <option value="">Turno de trabajo…</option>
        ${optionList(estado.turnos || [], "id", "etiqueta", asig.turno_id)}
      </select>
      <button type="button" class="icon-action danger btn-remove">Quitar</button>
    `;
    row.querySelector(".btn-remove").addEventListener("click", () => row.remove());
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

  function abrirEditorSemana(semana) {
    semanaFechaInicio.value = semana.fecha_inicio;
    semanaTitle.textContent = "Horario semanal";
    semanaMeta.textContent = `Lunes ${semana.fecha_inicio} → Domingo ${semana.fecha_fin}`;
    asignacionesList.innerHTML = "";
    asignacionesSabadoList.innerHTML = "";

    const itemsLv =
      (semana.asignaciones_lun_vie || semana.asignaciones || []).length
        ? semana.asignaciones_lun_vie || semana.asignaciones
        : [{}];
    itemsLv.forEach((a) => renderAsignacionRow(asignacionesList, a));

    const itemsSab =
      (semana.asignaciones_sabado || []).length ? semana.asignaciones_sabado : [{}];
    itemsSab.forEach((a) => renderAsignacionRow(asignacionesSabadoList, a));

    modalSemana.show();
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
    const asignaciones_lun_vie = leerAsignaciones(asignacionesList);
    const asignaciones_sabado = leerAsignaciones(asignacionesSabadoList);

    setStatus("Guardando semana…");
    try {
      const res = await api("/api/horarios-semana/guardar", {
        method: "POST",
        body: JSON.stringify({
          fecha_inicio: semanaFechaInicio.value,
          asignaciones_lun_vie,
          asignaciones_sabado,
        }),
      });
      modalSemana.hide();
      await cargarReporte();
      if (res.responsable_proceso) {
        setStatus(
          `Semana guardada · Responsable del proceso: ${res.responsable_proceso}`
        );
      } else {
        setStatus("Horario semanal guardado");
      }
    } catch (err) {
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

  editHoraInicio.addEventListener("change", () => {
    const finActual = editHoraFin.value;
    fillHoraFinSelect(finActual, editHoraInicio.value);
    actualizarCalculoProduccion();
  });
  editHoraFin.addEventListener("change", actualizarCalculoProduccion);
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
    renderAsignacionRow(asignacionesList, {})
  );
  btnAddAsignacionSabado.addEventListener("click", () =>
    renderAsignacionRow(asignacionesSabadoList, {})
  );
  btnRecargar.addEventListener("click", cargarReporte);
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
  btnPrecargar.addEventListener("click", async () => {
    setStatus("Precargando 2026…");
    try {
      const res = await api("/api/calendario/precargar", {
        method: "POST",
        body: JSON.stringify({ anio: 2026 }),
      });
      await cargarReporte();
      setStatus(`Calendario listo · ${res.dias_creados} días nuevos`);
    } catch (err) {
      setStatus(err.message, true);
    }
  });
  mesSelect.addEventListener("change", cargarReporte);

  (async function init() {
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
