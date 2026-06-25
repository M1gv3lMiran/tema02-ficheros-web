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
