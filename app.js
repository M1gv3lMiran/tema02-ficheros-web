/* ===========================================================================
 *  Lógica de la interfaz: temas, pestañas, terminales, ejercicios, test y resumen.
 * ========================================================================= */
(function () {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---------- Selector de tema ---------------------------------------------
  $$(".themebtn").forEach((b) => {
    b.addEventListener("click", () => {
      $$(".themebtn").forEach((x) => x.classList.remove("active"));
      $$(".theme-content").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      $("#" + b.dataset.theme).classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // ---------- Pestañas (con ámbito por tema) -------------------------------
  $$(".theme-content").forEach((content) => {
    const tabs = $$(".tab", content);
    const panels = $$(".panel", content);
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        panels.forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        $("#" + tab.dataset.tab, content).classList.add("active");
      });
    });
  });

  // ---------- Terminal genérica --------------------------------------------
  function attachTerminal(shell, ids, welcome) {
    const out = $("#" + ids.out);
    const input = $("#" + ids.input);
    const promptEl = $("#" + ids.prompt);
    const wrap = $("#" + ids.wrap);
    const history = [];
    let hi = -1;

    function refreshPrompt() { promptEl.textContent = shell.prompt(); }
    function print(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      out.appendChild(div);
      wrap.scrollTop = wrap.scrollHeight;
    }
    function run(line) {
      print('<span class="prompt">' + escapeHtml(shell.prompt()) + '</span><span class="cmd-echo">' + escapeHtml(line) + "</span>");
      const r = shell.exec(line);
      if (r.clear) { out.innerHTML = ""; }
      else {
        if (r.out) print(escapeHtml(r.out));
        if (r.err) print('<span class="err">' + escapeHtml(r.err) + "</span>");
      }
      refreshPrompt();
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const line = input.value;
        if (line.trim()) { history.push(line); hi = history.length; }
        input.value = "";
        run(line);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (hi > 0) { hi--; input.value = history[hi]; }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (hi < history.length - 1) { hi++; input.value = history[hi]; }
        else { hi = history.length; input.value = ""; }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault(); out.innerHTML = "";
      }
    });

    wrap.addEventListener("click", () => input.focus());
    refreshPrompt();
    if (welcome) print('<span style="color:#8b949e">' + welcome + "</span>");
    return { run, refreshPrompt };
  }

  // ---------- Render de ejercicios (reutilizable) --------------------------
  function renderExercises(container, exercises, termRun, shell) {
    exercises.forEach((ex) => {
      const card = document.createElement("div");
      card.className = "ex-card";

      if (ex.concept) {
        card.innerHTML =
          '<h4>' + ex.title + " <span class='tag'>concepto</span></h4>" +
          "<div>" + ex.desc + "</div>" +
          '<div class="ex-actions"><button class="btn secondary" data-act="ans">Ver respuesta</button></div>' +
          '<div class="ex-detail"></div>';
        const detail = $(".ex-detail", card);
        $('button[data-act="ans"]', card).addEventListener("click", () => {
          detail.classList.toggle("show");
          detail.innerHTML = ex.answer;
        });
        container.appendChild(card);
        return;
      }

      card.innerHTML =
        '<h4>' + ex.title + "</h4>" +
        "<div>" + ex.desc + "</div>" +
        '<div class="ex-goal">🎯 Objetivo: ' + ex.goal + "</div>" +
        '<div class="ex-actions">' +
          (ex.setup ? '<button class="btn secondary" data-act="setup">Preparar</button>' : "") +
          '<button class="btn" data-act="check">Comprobar</button>' +
          '<button class="btn secondary" data-act="hint">Pista</button>' +
          '<button class="btn secondary" data-act="sol">Ver solución</button>' +
          '<span class="ex-status"></span>' +
        "</div>" +
        '<div class="ex-detail"></div>';
      container.appendChild(card);

      const status = $(".ex-status", card);
      const detail = $(".ex-detail", card);

      $$('button[data-act]', card).forEach((b) => {
        b.addEventListener("click", () => {
          const act = b.dataset.act;
          if (act === "setup") {
            ex.setup.split("\n").forEach((c) => c.trim() && termRun(c.trim()));
            detail.classList.add("show");
            detail.innerHTML = "🔧 Comandos de preparación ejecutados en la terminal de ejercicios.";
          } else if (act === "hint") {
            detail.classList.add("show");
            detail.innerHTML = "💡 <b>Pista:</b> " + ex.hint;
          } else if (act === "sol") {
            detail.classList.add("show");
            detail.innerHTML = "✅ <b>Solución:</b><br>" + ex.solutionText;
          } else if (act === "check") {
            let ok = false;
            try { ok = ex.check(shell); } catch (e) { ok = false; }
            status.textContent = ok ? "✔ Correcto" : "✗ Aún no";
            status.className = "ex-status " + (ok ? "ok" : "fail");
            detail.classList.add("show");
            detail.innerHTML = ok
              ? "🎉 ¡Bien! " + ex.goal
              : "❌ Todavía no se cumple el objetivo. Revisa el estado en la terminal de ejercicios. Recuerda: <i>" + ex.goal + "</i>";
          }
        });
      });
    });
  }

  // ---------- Test (reutilizable) ------------------------------------------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function setupQuiz(cfg) {
    const startBtn = $("#" + cfg.startBtn);
    const area = $("#" + cfg.area);
    const profNote = $("#" + cfg.profNote);
    const shuffleBox = $("#" + cfg.shuffleBox);

    $$('input[name="' + cfg.srcName + '"]').forEach((r) =>
      r.addEventListener("change", () => {
        const prof = $('input[name="' + cfg.srcName + '"][value="prof"]').checked;
        profNote.classList.toggle("hidden", !(prof && cfg.data.profQuiz.length === 0));
      })
    );

    startBtn.addEventListener("click", () => {
      const src = $('input[name="' + cfg.srcName + '"]:checked').value;
      let questions = src === "prof" ? cfg.data.profQuiz : cfg.data.quiz;
      if (src === "prof" && questions.length === 0) {
        profNote.classList.remove("hidden");
        area.innerHTML = "";
        return;
      }
      if (shuffleBox.checked) questions = shuffle(questions);
      renderQuiz(area, questions);
    });
  }

  function renderQuiz(area, questions) {
    area.innerHTML = "";
    let answered = 0, correct = 0;
    const scoreBar = document.createElement("div");
    scoreBar.className = "quiz-score";
    scoreBar.textContent = "0 / " + questions.length + " respondidas · 0 aciertos";

    questions.forEach((qq, i) => {
      const card = document.createElement("div");
      card.className = "q-card";
      let opts = "";
      qq.opts.forEach((o, j) => {
        opts += '<label class="q-opt" data-i="' + j + '">' + escapeHtml(o) + "</label>";
      });
      card.innerHTML =
        '<div class="q-num">Pregunta ' + (i + 1) + " de " + questions.length + "</div>" +
        '<div class="q-text">' + escapeHtml(qq.q) + "</div>" + opts +
        '<div class="q-exp"></div>';
      area.appendChild(card);

      const exp = $(".q-exp", card);
      let done = false;
      $$(".q-opt", card).forEach((opt) => {
        opt.addEventListener("click", () => {
          if (done) return;
          done = true; answered++;
          const chosen = parseInt(opt.dataset.i, 10);
          $$(".q-opt", card).forEach((o, idx) => {
            o.classList.add("disabled");
            if (idx === qq.a) o.classList.add("correct");
          });
          if (chosen === qq.a) correct++;
          else { opt.classList.add("wrong"); exp.classList.add("bad"); }
          exp.classList.add("show");
          exp.innerHTML = (chosen === qq.a ? "✅ <b>Correcto.</b> " : "❌ <b>Incorrecto.</b> ") + escapeHtml(qq.exp);
          scoreBar.textContent = answered + " / " + questions.length + " respondidas · " + correct + " aciertos";
        });
      });
    });
    area.appendChild(scoreBar);
    area.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- Resumen (reutilizable) ---------------------------------------
  function renderSummary(container, summary) {
    summary.forEach((sec, idx) => {
      const det = document.createElement("details");
      det.className = "sum-card";
      if (idx === 0) det.open = true;
      det.innerHTML = "<summary>" + sec.h + "</summary><ul>" +
        sec.points.map((p) => "<li>" + p + "</li>").join("") + "</ul>";
      container.appendChild(det);
    });
  }

  // ========================================================================
  //  TEMA 2
  // ========================================================================
  const shell1 = new LinuxShell();
  const term1 = attachTerminal(shell1,
    { out: "term-output", input: "term-input", prompt: "term-prompt", wrap: "term" },
    'Mini-shell del Tema 2. Escribe <b style="color:#7ee787">help</b> para ver los comandos.');
  $$(".chip", $("#theme-t2")).forEach((c) =>
    c.addEventListener("click", () => { term1.run(c.dataset.cmd); $("#term-input").focus(); }));

  const shell2 = new LinuxShell();
  const term2 = attachTerminal(shell2,
    { out: "term2-output", input: "term2-input", prompt: "term2-prompt", wrap: "term2" },
    'Terminal de ejercicios del Tema 2.');

  renderExercises($("#ex-list"), DATA.exercises, term2.run, shell2);
  setupQuiz({ startBtn: "start-quiz", area: "quiz-area", profNote: "prof-note", shuffleBox: "shuffle", srcName: "qsrc", data: DATA });
  renderSummary($("#summary-area"), DATA.summary);

  // ---------- Práctica de permisos absolutos (Tema 2) ----------------------
  (function permPractice() {
    const RWX = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
    const symToOct = (sym) => (sym[0] === "r" ? 4 : 0) + (sym[1] === "w" ? 2 : 0) + (sym[2] === "x" ? 1 : 0);
    const fullSym = (o3) => RWX[o3[0]] + RWX[o3[1]] + RWX[o3[2]];
    const descPool = [
      ["Dueño: todo. Grupo: leer y ejecutar. Otros: leer y ejecutar.", "755"],
      ["Dueño: leer y escribir. Grupo: leer. Otros: leer.", "644"],
      ["Dueño: todo. Grupo: leer y ejecutar. Otros: solo ejecutar.", "751"],
      ["Dueño: leer y escribir. Grupo: leer. Otros: nada.", "640"],
      ["Dueño: todo. Grupo: nada. Otros: nada.", "700"],
      ["Dueño: leer y escribir. Grupo: leer y escribir. Otros: nada.", "660"],
      ["Dueño: leer. Grupo: leer. Otros: nada (un fichero solo de consulta).", "440"],
      ["Dueño: todo. Grupo: leer y ejecutar. Otros: nada.", "750"],
      ["Dueño: todo. Grupo: todo. Otros: leer y ejecutar.", "775"],
      ["Dueño: leer, escribir y ejecutar. Grupo: solo ejecutar. Otros: solo ejecutar.", "711"],
      ["Dueño: leer y ejecutar. Grupo: leer. Otros: leer.", "544"],
      ["Dueño: leer y escribir. Grupo: ejecutar. Otros: ejecutar.", "611"]
    ];
    const qEl = $("#practice-q"), ansEl = $("#practice-answer"), fbEl = $("#practice-feedback"), scoreEl = $("#practice-score");
    let mode = "sym2oct", current = null, hits = 0, total = 0;
    const rnd = (n) => Math.floor(Math.random() * n);
    const randOct3 = () => [rnd(8), rnd(8), rnd(8)];

    function newChallenge() {
      fbEl.textContent = ""; fbEl.className = "practice-feedback"; ansEl.value = ""; ansEl.focus();
      if (mode === "sym2oct") {
        const o = randOct3();
        current = { answer: "" + o[0] + o[1] + o[2], type: "oct" };
        qEl.innerHTML = 'Escribe el <b>octal</b> de: <code class="big">' + fullSym(o) + "</code>";
        ansEl.placeholder = "ej. 754";
      } else if (mode === "oct2sym") {
        const o = randOct3();
        current = { answer: fullSym(o), type: "sym" };
        qEl.innerHTML = 'Escribe el <b>simbólico</b> (9 caracteres) de: <code class="big">' + ("" + o[0] + o[1] + o[2]) + "</code>";
        ansEl.placeholder = "ej. rwxr-xr--";
      } else {
        const d = descPool[rnd(descPool.length)];
        current = { answer: d[1], type: "oct" };
        qEl.innerHTML = "Escribe el <b>octal</b> que cumple:<br><span class='desc'>" + d[0] + "</span>";
        ansEl.placeholder = "ej. 644";
      }
    }
    function check() {
      if (!current) return;
      let val = ansEl.value.trim();
      if (!val) return;
      total++;
      let ok;
      if (current.type === "oct") { val = val.replace(/^0+(?=\d)/, ""); ok = val === current.answer; }
      else ok = val.trim().toLowerCase().replace(/\s+/g, "") === current.answer;
      if (ok) {
        hits++; fbEl.className = "practice-feedback ok";
        fbEl.innerHTML = "✅ ¡Correcto! <code>" + current.answer + "</code>";
      } else {
        fbEl.className = "practice-feedback bad";
        const extra = current.type === "oct"
          ? " &nbsp;(" + fullSym(current.answer.split("").map(Number)) + ")"
          : " &nbsp;(" + current.answer.split("").reduce((a, _, i, arr) => i % 3 === 0 ? a.concat(symToOct(arr.slice(i, i + 3).join(""))) : a, []).join("") + ")";
        fbEl.innerHTML = "❌ No. La respuesta es <code>" + current.answer + "</code>" + extra;
      }
      scoreEl.textContent = "Aciertos: " + hits + " / " + total;
    }
    $$(".modebtn").forEach((b) => b.addEventListener("click", () => {
      $$(".modebtn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active"); mode = b.dataset.mode; newChallenge();
    }));
    $("#practice-check").addEventListener("click", check);
    $("#practice-new").addEventListener("click", newChallenge);
    ansEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { if (fbEl.classList.contains("ok")) newChallenge(); else check(); }
    });
    newChallenge();
  })();

  // ========================================================================
  //  TEMA 3
  // ========================================================================
  const usys1 = new UserSystem();
  const t3term1 = attachTerminal(usys1,
    { out: "t3-term-output", input: "t3-term-input", prompt: "t3-term-prompt", wrap: "t3-term" },
    'Simulador de usuarios del Tema 3. Escribe <b style="color:#7ee787">help</b> para ver los comandos.');
  $$(".chip", $("#theme-t3")).forEach((c) =>
    c.addEventListener("click", () => { t3term1.run(c.dataset.cmd); $("#t3-term-input").focus(); }));

  const usys2 = new UserSystem();
  const t3term2 = attachTerminal(usys2,
    { out: "t3-term2-output", input: "t3-term2-input", prompt: "t3-term2-prompt", wrap: "t3-term2" },
    'Terminal de ejercicios del Tema 3.');

  renderExercises($("#t3-ex-list"), DATA_T3.exercises, t3term2.run, usys2);
  setupQuiz({ startBtn: "t3-start-quiz", area: "t3-quiz-area", profNote: "t3-prof-note", shuffleBox: "t3-shuffle", srcName: "t3-qsrc", data: DATA_T3 });
  renderSummary($("#t3-summary-area"), DATA_T3.summary);

  // ========================================================================
  //  TEMA 5
  // ========================================================================
  const psys1 = new ProcSystem();
  const t5term1 = attachTerminal(psys1,
    { out: "t5-term-output", input: "t5-term-input", prompt: "t5-term-prompt", wrap: "t5-term" },
    'Simulador de recursos del Tema 5. Escribe <b style="color:#7ee787">help</b> para ver los comandos.');
  $$(".chip", $("#theme-t5")).forEach((c) =>
    c.addEventListener("click", () => { t5term1.run(c.dataset.cmd); $("#t5-term-input").focus(); }));

  const psys2 = new ProcSystem();
  const t5term2 = attachTerminal(psys2,
    { out: "t5-term2-output", input: "t5-term2-input", prompt: "t5-term2-prompt", wrap: "t5-term2" },
    'Terminal de ejercicios del Tema 5.');

  renderExercises($("#t5-ex-list"), DATA_T5.exercises, t5term2.run, psys2);
  setupQuiz({ startBtn: "t5-start-quiz", area: "t5-quiz-area", profNote: "t5-prof-note", shuffleBox: "t5-shuffle", srcName: "t5-qsrc", data: DATA_T5 });
  renderSummary($("#t5-summary-area"), DATA_T5.summary);
})();
