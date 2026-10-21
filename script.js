(() => {
  "use strict";
  const STORAGE_KEY = "meuTreinoCasa_v1";
  const WEEKDAYS = [
    { id: "mon", label: "SEG", full: "Segunda-feira", title: "Upper — força", desc: "Força de membros superiores, com core opcional fora deste tracker." },
    { id: "tue", label: "TER", full: "Terça-feira", title: "Pull — costas + bíceps", desc: "Costas, deltoide posterior e bíceps. Cardio opcional ao final." },
    { id: "wed", label: "QUA", full: "Quarta-feira", title: "Push — peito + ombros + tríceps", desc: "Hipertrofia com cargas moderadas e movimentos controlados." },
    { id: "thu", label: "QUI", full: "Quinta-feira", title: "Descanso / cardio", desc: "Dia de recuperação. Caminhada ou cardio leve, se quiser." },
    { id: "fri", label: "SEX", full: "Sexta-feira", title: "Pernas completas", desc: "Único treino de pernas da semana." },
    { id: "sat", label: "SÁB", full: "Sábado", title: "High rep — metabólico", desc: "Treino de alto volume. Faça 3–4 voltas com cargas leves a moderadas." },
    { id: "sun", label: "DOM", full: "Domingo", title: "Descanso", desc: "Recuperação e preparação para a próxima semana." }
  ];
  const initialWorkouts = {
    mon: [
      ["Dumbbell Floor Press", "4 séries", "6–10 reps"],
      ["Barbell Bent-Over Row", "4 séries", "6–8 reps"],
      ["Dumbbell Squeeze Press", "3 séries", "8–12 reps"],
      ["Dumbbell Shoulder Press", "3 séries", "6–10 reps"],
      ["Dumbbell Lateral Raise", "3 séries", "12–15 reps"],
      ["Dumbbell Hammer Curl", "3 séries", "8–12 reps"],
      ["Dumbbell Triceps Kickback", "2 séries", "12–15 reps"]
    ],
    tue: [
      ["Barbell Bent-Over Row", "4 séries", "8–12 reps"],
      ["One-Arm Dumbbell Row", "4 séries", "8–12 por lado"],
      ["Dumbbell Pullover", "3 séries", "10–15 reps"],
      ["Wide-Grip Barbell Row", "3 séries", "10–12 reps"],
      ["Dumbbell Reverse Fly", "3 séries", "12–20 reps"],
      ["Dumbbell Shrug", "3 séries", "10–15 reps"],
      ["Dumbbell Hammer Curl", "3 séries", "10–15 reps"],
      ["Alternating Dumbbell Curl", "2 séries", "10–15 reps"]
    ],
    wed: [
      ["Dumbbell Floor Press", "4 séries", "8–12 reps"],
      ["Dumbbell Squeeze Press", "3 séries", "10–15 reps"],
      ["Dumbbell Floor Fly", "2 séries", "10–15 reps"],
      ["Dumbbell Shoulder Press", "3 séries", "8–12 reps"],
      ["Dumbbell Lateral Raise", "4 séries", "12–20 reps"],
      ["Dumbbell Rear Delt Fly", "3 séries", "12–20 reps"],
      ["Dumbbell Triceps Kickback", "3 séries", "12–20 reps"]
    ],
    thu: [],
    fri: [
      ["Dumbbell Goblet Squat", "4 séries", "8–12 reps"],
      ["Barbell Romanian Deadlift", "4 séries", "8–12 reps"],
      ["Dumbbell Bulgarian Split Squat", "3 séries", "8–12 por perna"],
      ["Dumbbell Reverse Lunge", "3 séries", "10–15 por perna"],
      ["Dumbbell Standing Calf Raise", "4 séries", "12–20 reps"],
      ["Single-Leg Calf Raise", "2 séries", "15–25 por perna"]
    ],
    sat: [
      ["Dumbbell Lateral Raise", "3–4 voltas", "15–20 reps"],
      ["Alternating Dumbbell Curl", "3–4 voltas", "15–20 total"],
      ["Dumbbell Hammer Curl", "3–4 voltas", "15–20 reps"],
      ["One-Arm Dumbbell Row", "3–4 voltas", "12–15 por lado"],
      ["Dumbbell Reverse Fly", "3–4 voltas", "15–20 reps"],
      ["Dumbbell Floor Press", "3–4 voltas", "15–20 reps"],
      ["Dumbbell Triceps Kickback", "3–4 voltas", "15–20 reps"],
      ["Dumbbell Shrug", "3–4 voltas", "15–20 reps"]
    ],
    sun: []
  };
  const restContent = {
    thu: ["Recuperação ativa", "Se quiser, faça 25–40 minutos de caminhada ou cardio leve."],
    sun: ["Dia de descanso", "Descanse, recupere-se e retome a rotina amanhã."]
  };

  const $ = (s) => document.querySelector(s);
  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };
  const localDayId = () => ["sun","mon","tue","wed","thu","fri","sat"][new Date().getDay()];
  const makeId = () => "ex_" + Math.random().toString(36).slice(2, 10);

  function freshState() {
    const workouts = {};
    for (const day of WEEKDAYS) {
      workouts[day.id] = (initialWorkouts[day.id] || []).map(([name, sets, reps]) => ({
        id: makeId(), name, sets, reps, weight: ""
      }));
    }
    return { workouts, checksByDate: {}, selectedDay: localDayId(), lastSeenDate: todayISO() };
  }
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || !saved.workouts) return freshState();
      const base = freshState();
      for (const day of WEEKDAYS) {
        if (Array.isArray(saved.workouts[day.id])) {
          base.workouts[day.id] = saved.workouts[day.id].map(ex => ({
            id: ex.id || makeId(), name: String(ex.name ?? "Novo exercício"),
            sets: String(ex.sets ?? "3 séries"), reps: String(ex.reps ?? "10–12 reps"),
            weight: String(ex.weight ?? "")
          }));
        }
      }
      base.checksByDate = saved.checksByDate && typeof saved.checksByDate === "object" ? saved.checksByDate : {};
      base.selectedDay = WEEKDAYS.some(d => d.id === saved.selectedDay) ? saved.selectedDay : localDayId();
      base.lastSeenDate = saved.lastSeenDate || todayISO();
      return base;
    } catch { return freshState(); }
  }
  let state = loadState();
  let editing = false;
  let toastTimer;
  function saveState() {
    state.lastSeenDate = todayISO();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { showToast("Não foi possível salvar. Exporte um backup."); }
  }
  function todayChecks(dayId = state.selectedDay) {
    const key = todayISO();
    if (!state.checksByDate[key]) state.checksByDate[key] = {};
    if (!state.checksByDate[key][dayId]) state.checksByDate[key][dayId] = {};
    return state.checksByDate[key][dayId];
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    })[ch]);
  }
  function showToast(message) {
    const el = $("#toast");
    el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }
  function isRest(dayId) { return dayId === "thu" || dayId === "sun"; }
  function dayDone(dayId) {
    const list = state.workouts[dayId] || [];
    if (!list.length) return false;
    const checks = todayChecks(dayId);
    return list.every(ex => checks[ex.id]);
  }
  function renderTabs() {
    const now = new Date();
    $("#dateLabel").textContent = now.toLocaleDateString("pt-BR", {day:"2-digit", month:"short", year:"numeric"});
    $("#dayTabs").innerHTML = WEEKDAYS.map(day => {
      const active = state.selectedDay === day.id;
      const list = state.workouts[day.id] || [];
      const checks = todayChecks(day.id);
      const count = list.filter(ex => checks[ex.id]).length;
      const status = isRest(day.id) ? "Descanso" : (list.length && count === list.length ? "✓ Feito" : `${count}/${list.length}`);
      return `<button class="day-tab ${active ? "active" : ""} ${dayDone(day.id) ? "done" : ""} ${isRest(day.id) ? "rest" : ""}" data-day="${day.id}" type="button" aria-pressed="${active}">
        <span class="day-short">${day.label}</span><span class="day-status">${status}</span>
      </button>`;
    }).join("");
    $("#dayTabs").querySelectorAll("[data-day]").forEach(btn => btn.addEventListener("click", () => {
      state.selectedDay = btn.dataset.day; saveState(); render();
    }));
  }
  function renderExercises() {
    const dayId = state.selectedDay;
    const day = WEEKDAYS.find(d => d.id === dayId);
    const list = state.workouts[dayId] || [];
    const checks = todayChecks(dayId);
    $("#workoutTitle").textContent = day.title;
    $("#workoutDescription").textContent = day.desc;
    $("#todayHeading").textContent = isRest(dayId) ? "Hora de recuperar" : "Bora cumprir o plano?";
    $("#todaySubheading").textContent = `${day.full} · marque cada exercício quando terminar.`;
    $("#resetDayBtn").textContent = "↻ Desmarcar dia";
    $("#editNotice").hidden = !editing;
    document.body.classList.toggle("editing", editing);
    $("#editModeBtn").textContent = editing ? "✓ Concluir edição" : "✎ Personalizar";
    $("#addExerciseBtn").style.display = editing ? "inline-flex" : "none";

    if (isRest(dayId)) {
      const content = restContent[dayId];
      $("#exerciseList").innerHTML = `<article class="exercise-card rest-card"><strong>${content[0]}</strong>${content[1]}</article>`;
      $("#progressText").textContent = "—";
      $("#progressCount").textContent = "Nenhum exercício programado para hoje";
      $("#progressBar").style.width = "0%";
      return;
    }
    if (!list.length) {
      $("#exerciseList").innerHTML = `<article class="exercise-card rest-card"><strong>Dia sem exercícios</strong>Use “＋ Exercício” no modo de personalização para adicionar movimentos.</article>`;
    } else {
      $("#exerciseList").innerHTML = list.map((ex, index) => `
        <article class="exercise-card ${checks[ex.id] ? "completed" : ""}" data-id="${escapeHtml(ex.id)}">
          <div class="check-wrap"><input class="exercise-check" type="checkbox" aria-label="Marcar ${escapeHtml(ex.name)} como concluído" ${checks[ex.id] ? "checked" : ""}></div>
          <div class="exercise-info">
            <div class="exercise-name">${escapeHtml(ex.name)}</div>
            <div class="exercise-detail">${escapeHtml(ex.sets)} · ${escapeHtml(ex.reps)}</div>
            <div class="edit-fields">
              <input class="edit-input edit-name" aria-label="Nome do exercício" value="${escapeHtml(ex.name)}" placeholder="Nome">
              <input class="edit-input edit-sets" aria-label="Séries" value="${escapeHtml(ex.sets)}" placeholder="Séries">
              <input class="edit-input edit-reps" aria-label="Repetições" value="${escapeHtml(ex.reps)}" placeholder="Reps">
            </div>
          </div>
          <div class="weight-field">
            <label for="weight-${escapeHtml(ex.id)}">Peso (kg)</label>
            <input id="weight-${escapeHtml(ex.id)}" class="weight-input" inputmode="decimal" placeholder="Ex.: 12,5" value="${escapeHtml(ex.weight)}" aria-label="Peso usado em ${escapeHtml(ex.name)}">
          </div>
          <div class="card-actions">
            <button class="small-icon-btn move-up" type="button" aria-label="Mover exercício para cima" title="Mover para cima">↑</button>
            <button class="small-icon-btn move-down" type="button" aria-label="Mover exercício para baixo" title="Mover para baixo">↓</button>
            <button class="small-icon-btn delete" type="button" aria-label="Remover exercício" title="Remover">✕</button>
          </div>
        </article>`).join("");
      bindExerciseEvents();
    }
    updateProgress();
  }
  function bindExerciseEvents() {
    const dayId = state.selectedDay;
    $("#exerciseList").querySelectorAll(".exercise-card[data-id]").forEach(card => {
      const id = card.dataset.id;
      const ex = (state.workouts[dayId] || []).find(item => item.id === id);
      if (!ex) return;
      card.querySelector(".exercise-check").addEventListener("change", event => {
        todayChecks(dayId)[id] = event.target.checked;
        saveState(); renderTabs(); renderExercises();
      });
      card.querySelector(".weight-input").addEventListener("change", event => {
        ex.weight = event.target.value.trim(); saveState(); showToast("Peso salvo");
      });
      const editName = card.querySelector(".edit-name");
      const editSets = card.querySelector(".edit-sets");
      const editReps = card.querySelector(".edit-reps");
      const commitEdit = () => {
        ex.name = editName.value.trim() || "Novo exercício";
        ex.sets = editSets.value.trim() || "3 séries";
        ex.reps = editReps.value.trim() || "10–12 reps";
        saveState(); renderExercises(); renderTabs();
      };
      [editName, editSets, editReps].forEach(input => {
        input.addEventListener("change", commitEdit);
        input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); input.blur(); } });
      });
      card.querySelector(".delete").addEventListener("click", () => {
        if (!confirm(`Remover "${ex.name}" deste dia?`)) return;
        state.workouts[dayId] = state.workouts[dayId].filter(item => item.id !== id);
        for (const date of Object.keys(state.checksByDate)) {
          if (state.checksByDate[date]?.[dayId]) delete state.checksByDate[date][dayId][id];
        }
        saveState(); render(); showToast("Exercício removido");
      });
      card.querySelector(".move-up").addEventListener("click", () => moveExercise(id, -1));
      card.querySelector(".move-down").addEventListener("click", () => moveExercise(id, 1));
    });
  }
  function moveExercise(id, direction) {
    const list = state.workouts[state.selectedDay];
    const index = list.findIndex(ex => ex.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    saveState(); renderExercises();
  }
  function updateProgress() {
    const list = state.workouts[state.selectedDay] || [];
    const checks = todayChecks(state.selectedDay);
    const completed = list.filter(ex => checks[ex.id]).length;
    const percent = list.length ? Math.round(completed / list.length * 100) : 0;
    $("#progressText").textContent = list.length ? `${percent}%` : "—";
    $("#progressCount").textContent = `${completed} de ${list.length} exercícios concluídos`;
    $("#progressBar").style.width = `${percent}%`;
  }
  function render() { renderTabs(); renderExercises(); }
  $("#editModeBtn").addEventListener("click", () => {
    editing = !editing; render(); showToast(editing ? "Modo de personalização ativado" : "Alterações salvas");
  });
  $("#addExerciseBtn").addEventListener("click", () => {
    if (isRest(state.selectedDay)) { showToast("Escolha um dia de treino para adicionar exercícios"); return; }
    state.workouts[state.selectedDay].push({id:makeId(), name:"Novo exercício", sets:"3 séries", reps:"10–12 reps", weight:""});
    saveState(); renderExercises(); renderTabs();
    const inputs = $("#exerciseList").lastElementChild?.querySelector(".edit-name");
    if (inputs) { inputs.focus(); inputs.select(); }
  });
  $("#resetDayBtn").addEventListener("click", () => {
    if (!confirm("Desmarcar todos os exercícios deste dia para hoje? Os pesos não serão apagados.")) return;
    state.checksByDate[todayISO()][state.selectedDay] = {};
    saveState(); render(); showToast("Checks do dia desmarcados");
  });
  $("#exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `backup-treino-${todayISO()}.json`; a.click();
    URL.revokeObjectURL(url); showToast("Backup exportado");
  });
  $("#importFile").addEventListener("change", async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!imported.workouts) throw new Error("Arquivo inválido");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
      state = loadState(); render(); showToast("Backup importado");
    } catch { alert("Não foi possível importar esse arquivo. Use um backup exportado por este app."); }
    event.target.value = "";
  });

  // Checks are stored by local calendar date, so a new date starts unchecked.
  // We keep older dates for history, but only show today's checks.
  if (state.lastSeenDate !== todayISO()) {
    state.lastSeenDate = todayISO();
    saveState();
  }
  // Select the actual weekday when the page opens; saved custom exercises/weights remain intact.
  state.selectedDay = localDayId();
  saveState();
  render();
})();