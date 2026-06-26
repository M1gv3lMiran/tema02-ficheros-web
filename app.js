/* ===========================================================================
 *  Lógica de la interfaz: pestañas, terminales, ejercicios, test y resumen.
 * ========================================================================= */
(function () {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  // ---------- Pestañas ------------------------------------------------------
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => t.classList.remove("active"));
      $$(".panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      $("#" + tab.dataset.tab).classList.add("active");
    });
  });

  // ---------- Terminal genérica --------------------------------------------
  function attachTerminal(shell, ids) {
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
    function esc(s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function run(line) {
      print('<span class="prompt">' + esc(shell.prompt()) + '</span><span class="cmd-echo">' + esc(line) + "</span>");
      const r = shell.exec(line);
      if (r.clear) { out.innerHTML = ""; }
      else {
        if (r.out) print(esc(r.out));
        if (r.err) print('<span class="err">' + esc(r.err) + "</span>");
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
    print('<span style="color:#8b949e">Mini-shell del Tema 2. Escribe <b style="color:#7ee787">help</b> para ver los comandos.</span>');
    return { run, refreshPrompt };
  }

  // Terminal principal
  const shell1 = new LinuxShell();
  const term1 = attachTerminal(shell1, { out: "term-output", input: "term-input", prompt: "term-prompt", wrap: "term" });
  $$(".chip").forEach((c) =>
    c.addEventListener("click", () => { term1.run(c.dataset.cmd); $("#term-input").focus(); })
  );

  // Terminal de ejercicios (shell independiente)
  const shell2 = new LinuxShell();
  const term2 = attachTerminal(shell2, { out: "term2-output", input: "term2-input", prompt: "term2-prompt", wrap: "term2" });

  // ---------- Ejercicios ----------------------------------------------------
  const exList = $("#ex-list");
  DATA.exercises.forEach((ex, i) => {
    const card = document.createElement("div");
    card.className = "ex-card";
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
    exList.appendChild(card);

    const status = $(".ex-status", card);
    const detail = $(".ex-detail", card);

    $$('button[data-act]', card).forEach((b) => {
      b.addEventListener("click", () => {
        const act = b.dataset.act;
        if (act === "setup") {
          ex.setup.split("\n").forEach((c) => c.trim() && term2.run(c.trim()));
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
          try { ok = ex.check(shell2); } catch (e) { ok = false; }
          status.textContent = ok ? "✔ Correcto" : "✗ Aún no";
          status.className = "ex-status " + (ok ? "ok" : "fail");
          if (!ok) {
            detail.classList.add("show");
            detail.innerHTML = "❌ Todavía no se cumple el objetivo. Revisa el estado con <code>ls -l</code> en la terminal de ejercicios. " +
              "Recuerda: <i>" + ex.goal + "</i>";
          } else {
            detail.classList.add("show");
            detail.innerHTML = "🎉 ¡Bien! " + ex.goal;
          }
        }
      });
    });
  });

  // ---------- Test ----------------------------------------------------------
  const quizArea = $("#quiz-area");
  const profNote = $("#prof-note");

  $$('input[name="qsrc"]').forEach((r) =>
    r.addEventListener("change", () => {
      const prof = $('input[name="qsrc"][value="prof"]').checked;
      profNote.classList.toggle("hidden", !(prof && DATA.profQuiz.length === 0));
    })
  );

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  $("#start-quiz").addEventListener("click", () => {
    const src = $('input[name="qsrc"]:checked').value;
    let questions = src === "prof" ? DATA.profQuiz : DATA.quiz;
    if (src === "prof" && questions.length === 0) {
      profNote.classList.remove("hidden");
      quizArea.innerHTML = "";
      return;
    }
    if ($("#shuffle").checked) questions = shuffle(questions);
    renderQuiz(questions);
  });

  function renderQuiz(questions) {
    quizArea.innerHTML = "";
    let answered = 0, correct = 0;

    const scoreBar = document.createElement("div");
    scoreBar.id = "quiz-score";
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
        '<div class="q-text">' + escapeHtml(qq.q) + "</div>" +
        opts +
        '<div class="q-exp"></div>';
      quizArea.appendChild(card);

      const exp = $(".q-exp", card);
      let done = false;
      $$(".q-opt", card).forEach((opt) => {
        opt.addEventListener("click", () => {
          if (done) return;
          done = true;
          answered++;
          const chosen = parseInt(opt.dataset.i, 10);
          $$(".q-opt", card).forEach((o, idx) => {
            o.classList.add("disabled");
            if (idx === qq.a) o.classList.add("correct");
          });
          if (chosen === qq.a) { correct++; }
          else { opt.classList.add("wrong"); exp.classList.add("bad"); }
          exp.classList.add("show");
          exp.innerHTML = (chosen === qq.a ? "✅ <b>Correcto.</b> " : "❌ <b>Incorrecto.</b> ") + escapeHtml(qq.exp);
          scoreBar.textContent = answered + " / " + questions.length + " respondidas · " + correct + " aciertos";
        });
      });
    });

    quizArea.appendChild(scoreBar);
    quizArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ---------- Práctica de permisos absolutos --------------------------------
  (function permPractice() {
    const RWX = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
    const symToOct = (sym) => {
      let v = 0;
      if (sym[0] === "r") v += 4; if (sym[1] === "w") v += 2; if (sym[2] === "x") v += 1;
      return v;
    };
    const octStr = (o) => "" + o; // 1 dígito
    const fullSym = (o3) => RWX[o3[0]] + RWX[o3[1]] + RWX[o3[2]];

    // descripciones: cada una con su octal calculado
    const descPool = [
      ["Dueño: todo. Grupo: leer y ejecutar. Otros: leer y ejecutar.", "755"],
      ["Dueño: leer y escribir. Grupo: leer. Otros: leer.", "644"],
      ["Dueño: todo. Grupo: leer y ejecutar. Otros: solo ejecutar.", "751"],
      ["Dueño: leer y escribir. Grupo: leer. Otros: nada.", "640"],
      ["Dueño: todo. Grupo: nada. Otros: nada.", "700"],
      ["Dueño: leer y escribir. Grupo: leer y escribir. Otros: nada.", "660"],
      ["Dueño: leer. Grupo: leer. Otros: nada (un fichero solo de consulta).", "440"],
      ["Dueño: todo. Grupo: leer y ejecutar. Otros: nada (directorio dueño+grupo).", "750"],
      ["Dueño: todo. Grupo: todo. Otros: leer y ejecutar.", "775"],
      ["Dueño: leer, escribir y ejecutar. Grupo: solo ejecutar. Otros: solo ejecutar.", "711"],
      ["Dueño: leer y ejecutar. Grupo: leer. Otros: leer.", "544"],
      ["Dueño: leer y escribir. Grupo: ejecutar. Otros: ejecutar.", "611"]
    ];

    const qEl = $("#practice-q");
    const ansEl = $("#practice-answer");
    const fbEl = $("#practice-feedback");
    const scoreEl = $("#practice-score");
    let mode = "sym2oct";
    let current = null;
    let hits = 0, total = 0;

    const randOct3 = () => [rnd(8), rnd(8), rnd(8)];
    function rnd(n) { return Math.floor(Math.random() * n); }

    function newChallenge() {
      fbEl.textContent = ""; fbEl.className = "practice-feedback";
      ansEl.value = ""; ansEl.focus();
      if (mode === "sym2oct") {
        const o = randOct3();
        const sym = fullSym(o);
        current = { answer: "" + o[0] + o[1] + o[2], type: "oct" };
        qEl.innerHTML = 'Escribe el <b>octal</b> de: <code class="big">' + sym + "</code>";
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

    function normalizeSym(s) {
      return s.trim().toLowerCase().replace(/\s+/g, "");
    }

    function check() {
      if (!current) return;
      let val = ansEl.value.trim();
      if (!val) return;
      total++;
      let ok;
      if (current.type === "oct") {
        val = val.replace(/^0+(?=\d)/, ""); // quita ceros a la izquierda
        ok = val === current.answer;
      } else {
        ok = normalizeSym(val) === current.answer;
      }
      if (ok) {
        hits++;
        fbEl.className = "practice-feedback ok";
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

    $$(".modebtn").forEach((b) =>
      b.addEventListener("click", () => {
        $$(".modebtn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        mode = b.dataset.mode;
        newChallenge();
      })
    );
    $("#practice-check").addEventListener("click", check);
    $("#practice-new").addEventListener("click", newChallenge);
    ansEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (fbEl.textContent && fbEl.classList.contains("ok")) newChallenge();
        else check();
      }
    });
    newChallenge();
  })();

  // ---------- Resumen -------------------------------------------------------
  const sumArea = $("#summary-area");
  DATA.summary.forEach((sec, idx) => {
    const det = document.createElement("details");
    det.className = "sum-card";
    if (idx === 0) det.open = true;
    let lis = sec.points.map((p) => "<li>" + p + "</li>").join("");
    det.innerHTML = "<summary>" + sec.h + "</summary><ul>" + lis + "</ul>";
    sumArea.appendChild(det);
  });
})();
