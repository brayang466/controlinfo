/*! Portal solicitudes Siimed — anulación/eliminación de documentos */
(() => {
  const MESES = [
    "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const anioSelect = document.getElementById("anioSelect");
  const mesSelect = document.getElementById("mesSelect");
  const btnFiltrar = document.getElementById("btnFiltrar");
  const btnNuevo = document.getElementById("btnNuevo");
  const statusBar = document.getElementById("statusBar");
  const tableBody = document.getElementById("tableBody");
  const emptyState = document.getElementById("emptyState");
  const resumenMes = document.getElementById("resumenMes");
  const form = document.getElementById("docForm");
  const formAlert = document.getElementById("formAlert");
  const modalTitle = document.getElementById("modalTitle");
  const docId = document.getElementById("docId");
  const toastHost = document.getElementById("toastHost");

  const fields = {
    departamento: document.getElementById("fDepartamento"),
    area: document.getElementById("fArea"),
    tipo_documento: document.getElementById("fTipo"),
    cantidad: document.getElementById("fCantidad"),
    numero_documento: document.getElementById("fNumero"),
    accion: document.getElementById("fAccion"),
    mes: document.getElementById("fMes"),
    anio: document.getElementById("fAnio"),
    motivo: document.getElementById("fMotivo"),
  };

  const modal = new bootstrap.Modal(document.getElementById("docModal"));
  let rows = [];

  function toast(mensaje, tipo = "ok") {
    const el = document.createElement("div");
    el.className = `siimed-toast ${tipo}`;
    el.textContent = mensaje;
    toastHost.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  function setStatus(msg, isError = false) {
    statusBar.textContent = msg || "";
    statusBar.classList.toggle("error", Boolean(isError));
  }

  function showFormAlert(msg) {
    formAlert.textContent = msg;
    formAlert.classList.remove("d-none");
  }

  function clearFormAlert() {
    formAlert.textContent = "";
    formAlert.classList.add("d-none");
  }

  function escapar(t) {
    return String(t ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function periodoActual() {
    return {
      anio: Number(anioSelect.value) || new Date().getFullYear(),
      mes: Number(mesSelect.value) || new Date().getMonth() + 1,
    };
  }

  function poblarSelectores() {
    const now = new Date();
    const y = now.getFullYear();
    anioSelect.innerHTML = "";
    for (let a = y - 1; a <= y + 1; a += 1) {
      const opt = document.createElement("option");
      opt.value = String(a);
      opt.textContent = String(a);
      if (a === y) opt.selected = true;
      anioSelect.appendChild(opt);
    }
    mesSelect.innerHTML = "";
    fields.mes.innerHTML = "";
    fields.anio.innerHTML = "";
    for (let m = 1; m <= 12; m += 1) {
      const o1 = document.createElement("option");
      o1.value = String(m);
      o1.textContent = MESES[m];
      if (m === now.getMonth() + 1) o1.selected = true;
      mesSelect.appendChild(o1);

      const o2 = document.createElement("option");
      o2.value = String(m);
      o2.textContent = MESES[m];
      fields.mes.appendChild(o2);
    }
    for (let a = y - 1; a <= y + 1; a += 1) {
      const o = document.createElement("option");
      o.value = String(a);
      o.textContent = String(a);
      fields.anio.appendChild(o);
    }
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

  function renderTabla() {
    tableBody.innerHTML = "";
    if (!rows.length) {
      emptyState.classList.remove("d-none");
      resumenMes.textContent = "Sin registros en este mes";
      return;
    }
    emptyState.classList.add("d-none");
    const totalCant = rows.reduce((s, r) => s + Number(r.cantidad || 0), 0);
    resumenMes.textContent = `${rows.length} registro(s) · ${totalCant} documento(s)`;

    for (const r of rows) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapar(r.departamento)}</td>
        <td>${escapar(r.area)}</td>
        <td>${escapar(r.tipo_documento)}</td>
        <td class="num">${escapar(r.cantidad)}</td>
        <td>${escapar(r.numero_documento)}</td>
        <td><span class="chip">${escapar(r.accion)}</span></td>
        <td>${escapar(MESES[r.mes] || r.mes)}</td>
        <td class="motivo">${escapar(r.motivo || "—")}</td>
        <td class="acciones">
          <button type="button" class="btn-mini" data-edit="${r.id}">Editar</button>
          <button type="button" class="btn-mini danger" data-del="${r.id}">Eliminar</button>
        </td>
      `;
      tableBody.appendChild(tr);
    }
  }

  async function cargar() {
    const { anio, mes } = periodoActual();
    setStatus("Cargando…");
    try {
      const data = await api(`/api/siimed/documentos?anio=${anio}&mes=${mes}`);
      rows = data.documentos || [];
      renderTabla();
      setStatus(`${MESES[mes]} ${anio}`);
    } catch (err) {
      rows = [];
      renderTabla();
      setStatus(err.message + " · Ejecuta migrate_siimed.sql", true);
      toast(err.message, "error");
    }
  }

  function abrirNuevo() {
    clearFormAlert();
    docId.value = "";
    modalTitle.textContent = "Nuevo registro";
    const { anio, mes } = periodoActual();
    form.reset();
    fields.cantidad.value = "1";
    fields.anio.value = String(anio);
    fields.mes.value = String(mes);
    modal.show();
  }

  function abrirEditar(id) {
    const r = rows.find((x) => Number(x.id) === Number(id));
    if (!r) return;
    clearFormAlert();
    docId.value = String(r.id);
    modalTitle.textContent = "Editar registro";
    fields.departamento.value = r.departamento || "";
    fields.area.value = r.area || "";
    fields.tipo_documento.value = r.tipo_documento || "";
    fields.cantidad.value = String(r.cantidad ?? 1);
    fields.numero_documento.value = r.numero_documento || "";
    fields.accion.value = r.accion || "";
    fields.mes.value = String(r.mes);
    fields.anio.value = String(r.anio);
    fields.motivo.value = r.motivo || "";
    modal.show();
  }

  async function guardar(event) {
    event.preventDefault();
    clearFormAlert();
    const payload = {
      departamento: fields.departamento.value.trim(),
      area: fields.area.value.trim(),
      tipo_documento: fields.tipo_documento.value.trim(),
      cantidad: Number(fields.cantidad.value),
      numero_documento: fields.numero_documento.value.trim(),
      accion: fields.accion.value.trim(),
      mes: Number(fields.mes.value),
      anio: Number(fields.anio.value),
      motivo: fields.motivo.value.trim(),
    };
    if (
      !payload.departamento ||
      !payload.area ||
      !payload.tipo_documento ||
      !payload.numero_documento ||
      !payload.accion
    ) {
      showFormAlert("Completa los campos obligatorios.");
      return;
    }
    if (!payload.cantidad || payload.cantidad < 1) {
      showFormAlert("La cantidad debe ser al menos 1.");
      return;
    }
    try {
      if (docId.value) {
        await api(`/api/siimed/documentos/${docId.value}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast("Registro actualizado");
      } else {
        await api("/api/siimed/documentos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast("Registro creado");
      }
      modal.hide();
      anioSelect.value = String(payload.anio);
      mesSelect.value = String(payload.mes);
      await cargar();
    } catch (err) {
      showFormAlert(err.message);
      toast(err.message, "error");
    }
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este registro?")) return;
    try {
      await api(`/api/siimed/documentos/${id}`, { method: "DELETE" });
      toast("Registro eliminado");
      await cargar();
    } catch (err) {
      toast(err.message, "error");
      setStatus(err.message, true);
    }
  }

  tableBody.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]");
    const del = event.target.closest("[data-del]");
    if (edit) abrirEditar(edit.getAttribute("data-edit"));
    if (del) eliminar(del.getAttribute("data-del"));
  });

  btnFiltrar.addEventListener("click", cargar);
  anioSelect.addEventListener("change", cargar);
  mesSelect.addEventListener("change", cargar);
  btnNuevo.addEventListener("click", abrirNuevo);
  form.addEventListener("submit", guardar);

  poblarSelectores();
  cargar();
})();
