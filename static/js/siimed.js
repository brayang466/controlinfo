/*! Portal solicitudes Siimed — anulación/eliminación de documentos */
(() => {
  const MESES = [
    "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const DEPARTAMENTOS = [
    "ADMINISTRACION Y FINANZAS",
    "PRODUCCION",
    "JURIDICA Y GESTION HUMANA",
    "COMERCIAL",
  ];

  const AREAS = [
    "Contabilidad",
    "Compras",
    "Juridica",
    "Almacen",
    "Nomina",
    "Tesoreria",
    "Logistica",
    "Comercial",
    "Cartera",
  ];

  const TIPOS_DOCUMENTO = [
    { codigo: "A", nombre: "Ajuste por Inflación" },
    { codigo: "C", nombre: "Nota Crédito" },
    { codigo: "D", nombre: "Nota Débito" },
    { codigo: "DE", nombre: "Nota Débito Electrónica" },
    { codigo: "E", nombre: "Nota de Entrada" },
    { codigo: "F", nombre: "Factura de Venta" },
    { codigo: "G", nombre: "Egreso" },
    { codigo: "H", nombre: "Nota de Salida" },
    { codigo: "J", nombre: "Devolución" },
    { codigo: "L", nombre: "Otros" },
    { codigo: "N", nombre: "Nota Interna" },
    { codigo: "O", nombre: "Nota Producción" },
    { codigo: "P", nombre: "Registro Compra" },
    { codigo: "R", nombre: "Recibo de Caja" },
    { codigo: "S", nombre: "Nota de Remisión" },
    { codigo: "T", nombre: "Nota de Traslado" },
    { codigo: "U", nombre: "Devolución de Compra" },
  ];

  const anioSelect = document.getElementById("anioSelect");
  const mesSelect = document.getElementById("mesSelect");
  const btnFiltrar = document.getElementById("btnFiltrar");
  const btnNuevo = document.getElementById("btnNuevo");
  const statusBar = document.getElementById("statusBar");
  const cardsList = document.getElementById("cardsList");
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
    tipo_consec: document.getElementById("fTipoConsec"),
    cantidad: document.getElementById("fCantidad"),
    numero_documento: document.getElementById("fNumero"),
    accion: document.getElementById("fAccion"),
    mes: document.getElementById("fMes"),
    anio: document.getElementById("fAnio"),
    motivo: document.getElementById("fMotivo"),
  };
  const tipoLetraPreview = document.getElementById("tipoLetraPreview");
  const tipoResultadoPreview = document.getElementById("tipoResultadoPreview");

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

  function etiquetaTipo(tipo) {
    return `${tipo.codigo} — ${tipo.nombre}`;
  }

  function fillSelect(select, items, placeholder) {
    select.innerHTML = "";
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = placeholder;
    select.appendChild(empty);
    for (const item of items) {
      const opt = document.createElement("option");
      if (typeof item === "string") {
        opt.value = item;
        opt.textContent = item;
      } else {
        // value = solo la letra/código; texto = código + nombre
        opt.value = item.codigo;
        opt.textContent = etiquetaTipo(item);
      }
      select.appendChild(opt);
    }
  }

  function codigoTipoCompleto() {
    const letra = String(fields.tipo_documento.value || "").trim().toUpperCase();
    const n = String(fields.tipo_consec.value || "").trim();
    if (!letra || !n) return "";
    return `${letra}${n}`;
  }

  function actualizarPreviewTipo() {
    const letra = String(fields.tipo_documento.value || "").trim().toUpperCase() || "—";
    const full = codigoTipoCompleto() || "—";
    if (tipoLetraPreview) tipoLetraPreview.textContent = letra;
    if (tipoResultadoPreview) tipoResultadoPreview.textContent = full;
  }

  function expandirRangoNumeros(inicio, fin) {
    const a = Number(inicio);
    const b = Number(fin);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return [];
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    if (to - from > 50000) return null; // tipazo / rango absurdo
    const out = [];
    for (let n = from; n <= to; n += 1) out.push(n);
    return out;
  }

  function numerosDeSegmento(seg) {
    const t = String(seg || "").trim();
    if (!t) return [];

    let m = t.match(/(\d+)\s*(?:a\s*la|al|hasta)\s*(\d+)/i);
    if (m) return expandirRangoNumeros(m[1], m[2]);

    m = t.match(/(\d+)\s*[-–—]\s*(\d+)/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      // cadena 700-701-702: si hay más de un guion, tomar todos los dígitos
      const all = t.match(/\d+/g) || [];
      if (all.length > 2) {
        const nums = all.map(Number);
        const consec = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
        if (consec) return nums;
      }
      return expandirRangoNumeros(a, b);
    }

    m = t.match(/(\d+)/);
    if (m) return [Number(m[1])];
    return [];
  }

  function calcularCantidadDesdeNumero(texto) {
    const raw = String(texto || "").trim();
    if (!raw) return 0;

    const segmentos = raw.split(/\s*,\s*|\s+y\s+/i).filter(Boolean);
    const set = new Set();
    for (const seg of segmentos) {
      const nums = numerosDeSegmento(seg);
      if (nums === null) return -1;
      nums.forEach((n) => set.add(n));
    }
    return set.size;
  }

  function sanitizarNumeroDocumento(texto) {
    // Solo dígitos, espacios, comas y guiones (rangos). Sin letras.
    return String(texto || "").replace(/[^0-9\s,\-–—]/g, "");
  }

  function actualizarCantidadAutomatica() {
    const limpio = sanitizarNumeroDocumento(fields.numero_documento.value);
    if (limpio !== fields.numero_documento.value) {
      const pos = fields.numero_documento.selectionStart;
      fields.numero_documento.value = limpio;
      try {
        fields.numero_documento.setSelectionRange(Math.max(0, pos - 1), Math.max(0, pos - 1));
      } catch (_) {
        /* ignore */
      }
    }
    const texto = fields.numero_documento.value;
    const n = calcularCantidadDesdeNumero(texto);
    fields.cantidad.classList.remove("is-invalid");
    if (!String(texto || "").trim()) {
      fields.cantidad.value = "0";
      return true;
    }
    if (n < 0) {
      fields.cantidad.value = "";
      fields.cantidad.classList.add("is-invalid");
      return false;
    }
    if (n === 0) {
      fields.cantidad.value = "1";
      return true;
    }
    fields.cantidad.value = String(n);
    return true;
  }

  function parseTipoDocumento(raw) {
    const v = String(raw || "").trim();
    if (!v) return { codigo: "", consecutivo: "" };
    const first = v.split(",")[0].trim();
    const codes = TIPOS_DOCUMENTO.map((t) => t.codigo).sort(
      (a, b) => b.length - a.length
    );
    for (const c of codes) {
      const up = first.toUpperCase();
      if (up.startsWith(c.toUpperCase())) {
        const rest = first.slice(c.length);
        if (rest === "" || /^\d+$/.test(rest)) {
          return { codigo: c, consecutivo: rest };
        }
      }
    }
    const m = first.match(/^([A-Za-z]+)(\d+)$/);
    if (m) return { codigo: m[1].toUpperCase(), consecutivo: m[2] };
    return { codigo: "", consecutivo: "", crudo: v };
  }

  function asegurarOpcion(select, value) {
    const v = String(value || "").trim();
    if (!v) {
      select.value = "";
      return;
    }
    const existe = Array.from(select.options).some((o) => o.value === v);
    if (!existe) {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    }
    select.value = v;
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

    fillSelect(fields.departamento, DEPARTAMENTOS, "Selecciona departamento…");
    fillSelect(fields.area, AREAS, "Selecciona área…");
    fillSelect(fields.tipo_documento, TIPOS_DOCUMENTO, "Selecciona tipo…");
    actualizarPreviewTipo();
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

  function claseAccion(accion) {
    const a = String(accion || "").toLowerCase();
    if (a.includes("anul")) return "accion-anular";
    if (a.includes("elim")) return "accion-eliminar";
    return "accion-otra";
  }

  function renderTabla() {
    cardsList.innerHTML = "";
    if (!rows.length) {
      emptyState.classList.remove("d-none");
      resumenMes.textContent = "Sin registros en este mes";
      return;
    }
    emptyState.classList.add("d-none");
    const totalCant = rows.reduce((s, r) => s + Number(r.cantidad || 0), 0);
    resumenMes.textContent = `${rows.length} registro(s) · ${totalCant} documento(s)`;

    for (const r of rows) {
      const card = document.createElement("article");
      card.className = `siimed-card ${claseAccion(r.accion)}`;
      card.innerHTML = `
        <div class="card-top">
          <div class="card-badges">
            <span class="chip tipo">${escapar(r.tipo_documento)}</span>
            <span class="chip accion ${claseAccion(r.accion)}">${escapar(r.accion)}</span>
            <span class="chip soft">${escapar(MESES[r.mes] || r.mes)}</span>
          </div>
          <div class="card-qty" title="Cantidad">
            <strong>${escapar(r.cantidad)}</strong>
            <small>doc.</small>
          </div>
        </div>
        <div class="card-main">
          <h3 class="card-doc">${escapar(r.numero_documento)}</h3>
          <p class="card-org">
            <span>${escapar(r.departamento)}</span>
            <span class="dot">·</span>
            <span>${escapar(r.area)}</span>
          </p>
        </div>
        <p class="card-motivo">${escapar(r.motivo || "Sin motivo registrado")}</p>
        <div class="card-actions">
          <button type="button" class="btn-mini" data-edit="${r.id}">Editar</button>
          <button type="button" class="btn-mini danger" data-del="${r.id}">Eliminar</button>
        </div>
      `;
      cardsList.appendChild(card);
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
    fillSelect(fields.departamento, DEPARTAMENTOS, "Selecciona departamento…");
    fillSelect(fields.area, AREAS, "Selecciona área…");
    fillSelect(fields.tipo_documento, TIPOS_DOCUMENTO, "Selecciona tipo…");
    fields.cantidad.value = "0";
    fields.tipo_consec.value = "";
    fields.anio.value = String(anio);
    fields.mes.value = String(mes);
    actualizarPreviewTipo();
    actualizarCantidadAutomatica();
    modal.show();
  }

  function abrirEditar(id) {
    const r = rows.find((x) => Number(x.id) === Number(id));
    if (!r) return;
    clearFormAlert();
    docId.value = String(r.id);
    modalTitle.textContent = "Editar registro";
    fillSelect(fields.departamento, DEPARTAMENTOS, "Selecciona departamento…");
    fillSelect(fields.area, AREAS, "Selecciona área…");
    fillSelect(fields.tipo_documento, TIPOS_DOCUMENTO, "Selecciona tipo…");
    asegurarOpcion(fields.departamento, r.departamento);
    asegurarOpcion(fields.area, r.area);
    const parsed = parseTipoDocumento(r.tipo_documento);
    if (parsed.codigo) {
      asegurarOpcion(fields.tipo_documento, parsed.codigo);
      fields.tipo_consec.value = parsed.consecutivo || "";
    } else if (parsed.crudo) {
      // valor libre (ej. varios tipos): se muestra en resultado
      fields.tipo_documento.value = "";
      fields.tipo_consec.value = "";
      if (tipoResultadoPreview) tipoResultadoPreview.textContent = parsed.crudo;
    }
    fields.numero_documento.value = r.numero_documento || "";
    fields.accion.value = r.accion || "";
    fields.mes.value = String(r.mes);
    fields.anio.value = String(r.anio);
    fields.motivo.value = r.motivo || "";
    actualizarPreviewTipo();
    actualizarCantidadAutomatica();
    // si el texto no se puede recalcular, conserva la cantidad guardada
    if (!fields.cantidad.value || fields.cantidad.value === "0") {
      fields.cantidad.value = String(r.cantidad ?? 1);
    }
    if (parsed.crudo && tipoResultadoPreview) {
      tipoResultadoPreview.textContent = parsed.crudo;
    }
    modal.show();
  }

  async function guardar(event) {
    event.preventDefault();
    clearFormAlert();
    const tipoCompleto = codigoTipoCompleto();
    actualizarCantidadAutomatica();
    const payload = {
      departamento: fields.departamento.value.trim(),
      area: fields.area.value.trim(),
      tipo_documento: tipoCompleto,
      cantidad: Number(fields.cantidad.value),
      numero_documento: sanitizarNumeroDocumento(fields.numero_documento.value).trim(),
      accion: fields.accion.value.trim(),
      mes: Number(fields.mes.value),
      anio: Number(fields.anio.value),
      motivo: fields.motivo.value.trim(),
    };
    if (
      !payload.departamento ||
      !payload.area ||
      !fields.tipo_documento.value.trim() ||
      !fields.tipo_consec.value.trim() ||
      !payload.tipo_documento ||
      !payload.numero_documento ||
      !payload.accion
    ) {
      showFormAlert("Completa los campos obligatorios (incluye letra y consecutivo del tipo).");
      return;
    }
    if (!actualizarCantidadAutomatica()) {
      showFormAlert("El rango de documentos es demasiado grande o inválido.");
      return;
    }
    payload.cantidad = Number(fields.cantidad.value);
    if (!payload.cantidad || payload.cantidad < 1) {
      showFormAlert("Indica al menos un número o rango de documento válido.");
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

  cardsList.addEventListener("click", (event) => {
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
  fields.tipo_documento.addEventListener("change", actualizarPreviewTipo);
  fields.tipo_consec.addEventListener("input", actualizarPreviewTipo);
  fields.numero_documento.addEventListener("input", actualizarCantidadAutomatica);

  poblarSelectores();
  cargar();
})();
