/* ===========================================================================
 *  Simulador de gestión de recursos del sistema (Tema 5)
 *  Modela una tabla de procesos, memoria/swap, discos y temporizadores, y los
 *  comandos típicos de administración: ps, top, pstree, nice, renice, kill,
 *  killall, pkill, pgrep, uptime, free, vmstat, df, du, iostat, swapon, cron…
 *  No es un Linux real: reproduce el comportamiento para practicar el tema.
 * ========================================================================= */
(function (global) {
  "use strict";

  function ProcSystem() { this.reset(); }

  // ---- estado inicial ----------------------------------------------------
  ProcSystem.prototype.reset = function () {
    this.me = "javi";
    this.nextPid = 30000;

    // proc: pid, ppid, user, ni, stat, pcpu, pmem, vsz(KB), rss(KB), tty, time, cmd
    const P = (pid, ppid, user, ni, stat, pcpu, pmem, vsz, rss, tty, time, cmd) =>
      ({ pid, ppid, user, ni, stat, pcpu, pmem, vsz, rss, tty, time, cmd });

    this.procs = [
      P(1, 0, "root", 0, "Ss", 0.0, 0.0, 166852, 11240, "?", "0:02", "/sbin/init"),
      P(2, 0, "root", 0, "S", 0.0, 0.0, 0, 0, "?", "0:00", "[kthreadd]"),
      P(13, 2, "root", 0, "I", 0.0, 0.0, 0, 0, "?", "0:30", "[rcu_sched]"),
      P(710, 1, "root", 0, "S", 0.3, 0.1, 486964, 20516, "?", "0:17", "NetworkManager"),
      P(927, 1, "root", 0, "Ssl+", 6.9, 1.0, 1059784, 340240, "tty7", "24:22", "Xorg"),
      P(1174, 1, "javi", -11, "S<", 2.0, 0.1, 2460768, 20644, "?", "6:21", "pulseaudio"),
      P(1402, 1, "javi", 0, "S", 1.3, 0.2, 386468, 80468, "?", "4:31", "marco"),
      P(1916, 1, "javi", 0, "S", 0.7, 1.8, 3680980, 594664, "?", "6:55", "thunderbird"),
      P(2307, 1916, "javi", 0, "S", 1.3, 2.3, 21600000, 755064, "?", "64:47", "firefox-bin"),
      P(14955, 1, "javi", 0, "Sl", 5.6, 0.9, 57000000, 300016, "?", "10:38", "code"),
      P(18292, 1, "javi", 0, "Ss", 0.0, 0.0, 10644, 4860, "pts/0", "0:00", "bash"),
      P(18649, 18292, "javi", 0, "Ss+", 0.0, 0.0, 10644, 4912, "pts/1", "0:00", "bash"),
      P(29822, 1, "root", 0, "Ss", 0.0, 0.0, 6524, 4396, "?", "0:00", "apache2"),
      P(29823, 29822, "www-data", 0, "Sl", 0.0, 0.0, 1997844, 4320, "?", "0:00", "apache2"),
      P(29824, 29822, "www-data", 0, "Sl", 0.0, 0.0, 1932308, 4316, "?", "0:00", "apache2")
    ];

    // memoria (MiB)
    this.mem = { total: 31976, used: 5729, free: 16274, buffcache: 9973, available: 24470 };

    // swap: lista de dispositivos/ficheros activos
    this.swap = [{ name: "/dev/sda5", type: "partition", sizeKB: 2097148, usedKB: 0, prio: -2 }];
    this.formatted = {};   // rutas que han pasado por mkswap
    this.files = {};       // ficheros creados con dd: ruta -> tamañoKB

    // crontab del usuario y cola de at
    this.cron = [];        // líneas crontab
    this.atJobs = [];      // {id, when, cmd}
    this.nextAt = 1;
  };

  // ---- utilidades --------------------------------------------------------
  ProcSystem.prototype.getProcByPid = function (pid) {
    pid = parseInt(pid, 10);
    return this.procs.find((p) => p.pid === pid) || null;
  };
  ProcSystem.prototype.getProcsByName = function (name) {
    return this.procs.filter((p) => p.cmd.replace(/^.*\//, "").replace(/^\[|\]$/g, "").includes(name) || p.cmd.includes(name));
  };
  ProcSystem.prototype.swapTotalKB = function () { return this.swap.reduce((a, s) => a + s.sizeKB, 0); };
  ProcSystem.prototype.swapFileActive = function (path) {
    return this.swap.some((s) => s.name === path && s.type === "file");
  };

  function pad(s, n) { s = String(s); return s.length >= n ? s : s + " ".repeat(n - s.length); }
  function padl(s, n) { s = String(s); return s.length >= n ? s : " ".repeat(n - s.length) + s; }

  // ---- tokenizado + ejecución -------------------------------------------
  function tokenize(line) {
    const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    const out = []; let m;
    while ((m = re.exec(line)) !== null) out.push(m[1] || m[2] || m[3]);
    return out;
  }

  ProcSystem.prototype.exec = function (line) {
    line = (line || "").trim();
    if (!line) return { out: "", err: "" };
    // sustitución de comandos: $(...)
    line = line.replace(/\$\(([^)]+)\)/g, (_, inner) => {
      const r = this.exec(inner.trim());
      return (r.out || "").split("\n").join(" ").trim();
    });
    if (line.includes("|")) return this.pipe(line);
    let argv = tokenize(line);
    if (argv[0] === "sudo") argv = argv.slice(1);
    const cmd = argv[0];
    const fn = this.commands[cmd];
    if (!fn) return { out: "", err: cmd + ": orden no encontrada" };
    try { return fn.call(this, argv.slice(1)); }
    catch (e) { return { out: "", err: e.message }; }
  };

  ProcSystem.prototype.pipe = function (line) {
    const stages = line.split("|").map((s) => s.trim());
    let r = this.exec(stages[0]);
    let data = r.out;
    for (let i = 1; i < stages.length; i++) {
      const a = tokenize(stages[i]);
      if (a[0] === "grep") {
        const inv = a.includes("-v");
        const pat = a.filter((x, j) => j > 0 && !x.startsWith("-")).join(" ");
        data = data.split("\n").filter((l) => inv ? !l.includes(pat) : l.includes(pat)).join("\n");
      } else if (a[0] === "head") {
        let n = 10; const k = a.indexOf("-n"); if (k >= 0) n = parseInt(a[k + 1]) || 10;
        data = data.split("\n").slice(0, n).join("\n");
      } else if (a[0] === "wc") {
        data = String(data.split("\n").filter(Boolean).length);
      } else if (a[0] === "sort") {
        data = data.split("\n").sort().join("\n");
      } else if (a[0] === "less" || a[0] === "more" || a[0] === "cat") {
        /* sin efecto: mostramos tal cual */
      } else { return { out: data, err: a[0] + ": no soportado en pipe" }; }
    }
    return { out: data, err: r.err };
  };

  // ---- señales -----------------------------------------------------------
  const SIGNALS = {
    "1": "HUP", HUP: "HUP", SIGHUP: "HUP",
    "2": "INT", INT: "INT", SIGINT: "INT",
    "3": "QUIT", QUIT: "QUIT", SIGQUIT: "QUIT",
    "9": "KILL", KILL: "KILL", SIGKILL: "KILL",
    "15": "TERM", TERM: "TERM", SIGTERM: "TERM",
    "18": "CONT", CONT: "CONT", SIGCONT: "CONT",
    "19": "STOP", STOP: "STOP", SIGSTOP: "STOP",
    "20": "TSTP", TSTP: "TSTP", SIGTSTP: "TSTP"
  };
  ProcSystem.prototype.applySignal = function (proc, sig) {
    // procesos en espera ininterrumpible (D) o zombie (Z) ignoran las señales
    if (proc.stat[0] === "D" || proc.stat[0] === "Z") return proc.cmd + " (" + proc.stat + "): no responde a la señal";
    if (sig === "STOP" || sig === "TSTP") {
      proc.stat = "T" + proc.stat.slice(1).replace(/[^+sl]/g, "");
      return proc.cmd + " (" + proc.pid + ") detenido (T)";
    }
    if (sig === "CONT") {
      proc.stat = "S" + proc.stat.slice(1);
      return proc.cmd + " (" + proc.pid + ") reanudado";
    }
    // KILL, TERM, HUP, INT, QUIT → terminar (simplificado: no se captura)
    this.procs = this.procs.filter((p) => p !== proc);
    return proc.cmd + " (" + proc.pid + ") terminado por SIG" + sig;
  };

  // ---- comandos ----------------------------------------------------------
  ProcSystem.prototype.commands = {
    help() {
      return { out:
`Gestión de recursos del sistema (Tema 5). Estás como 'javi'.

 PROCESOS
  ps aux              todos los procesos (USER PID %CPU %MEM … STAT … COMMAND)
  ps al / ps -l       formato largo (con PRI y NI)
  ps -u USUARIO       procesos de un usuario     ·  ps -e   todos
  pstree              árbol de procesos
  top                 instantánea de actividad (ordenada por CPU)
  uptime              carga media del sistema    ·  nproc / lscpu  CPU
  pgrep NOMBRE        PIDs por nombre            ·  pidof NOMBRE

 PRIORIDAD Y SEÑALES
  nice -n N COMANDO   lanzar con prioridad N     ·  nice --10 COMANDO (root)
  renice N PID        cambiar prioridad          ·  renice N -u USUARIO
  kill [-SEÑAL] PID   enviar señal (def. TERM 15);  -9 KILL, -19 STOP, -18 CONT
  killall NOMBRE      señal a todos los de ese nombre  ·  pkill NOMBRE

 MEMORIA Y DISCO
  free [-h|-m]        memoria y swap             ·  vmstat
  swapon -s           swap activa  ·  mkswap RUTA · swapon RUTA · swapoff RUTA
  dd if=… of=RUTA …   crear fichero (para swap)
  df [-h|-i]          espacio en particiones     ·  du [-h] uso por carpetas
  iostat              estadísticas de E/S de discos

 TEMPORIZADORES
  crontab -l          ver tareas  ·  crontab -a "min h dm m ds cmd"  (añadir)
  at HH:MM "CMD"      programar una vez · atq lista · atrm ID elimina

  whoami · clear · reset · help`, err: "" };
    },

    whoami() { return { out: this.me, err: "" }; },
    clear() { return { out: "", err: "", clear: true }; },
    reset() { this.reset(); return { out: "Sistema reiniciado.", err: "" }; },
    echo(a) { return { out: a.join(" "), err: "" }; },

    nproc() { return { out: "8", err: "" }; },
    lscpu() {
      return { out:
`CPU(s):                              8
Hilo(s) de procesamiento por núcleo: 2
Núcleo(s) por «socket»:              4
CPU(s) del nodo NUMA 0:              0-7`, err: "" };
    },

    uptime() {
      const r = this.procs.filter((p) => p.stat[0] === "R").length || 1;
      return { out: "13:54:52 up 7:55, 2 users, load average: 0," + (20 + r) + ", 0,12, 0,04", err: "" };
    },

    ps(a) {
      // determinar conjunto y formato
      const has = (x) => a.includes(x);
      const longFmt = has("al") || has("-l") || has("-lu") || has("-ef");
      let list = this.procs.slice();
      // ps -u user  /  ps -lu user
      let userFilter = null;
      for (let i = 0; i < a.length; i++) {
        if ((a[i] === "-u" || a[i] === "-lu") && a[i + 1]) userFilter = a[i + 1];
      }
      const all = has("aux") || has("-e") || has("-A") || has("ax") || has("a") || has("-ef");
      if (userFilter) list = list.filter((p) => p.user === userFilter);
      else if (!all && !longFmt) list = list.filter((p) => p.user === this.me && p.tty.startsWith("pts"));

      if (longFmt) {
        const head = "F   UID   PID  PPID PRI  NI     VSZ    RSS WCHAN STAT TTY     TIME COMMAND";
        const rows = list.map((p) => {
          const uid = p.user === "root" ? 0 : (p.user === this.me ? 1000 : 33);
          const pri = 20 + p.ni;
          return [pad("4", 2), padl(uid, 5), padl(p.pid, 5), padl(p.ppid, 5),
            padl(pri, 3), padl(p.ni, 4), padl(p.vsz, 8), padl(p.rss, 6),
            pad("-", 5), pad(p.stat, 4), pad(p.tty, 6), padl(p.time, 6), " " + p.cmd].join(" ");
        });
        return { out: [head].concat(rows).join("\n"), err: "" };
      }
      // formato aux (por defecto)
      const head = "USER       PID %CPU %MEM     VSZ    RSS TTY      STAT  TIME COMMAND";
      const rows = list.map((p) => [pad(p.user, 9), padl(p.pid, 5), padl(p.pcpu.toFixed(1), 4),
        padl(p.pmem.toFixed(1), 4), padl(p.vsz, 8), padl(p.rss, 6), pad(p.tty, 6),
        pad(p.stat, 5), padl(p.time, 5), " " + p.cmd].join(" "));
      return { out: [head].concat(rows).join("\n"), err: "" };
    },

    pstree() {
      return { out:
`systemd-+-NetworkManager---2*[{NetworkManager}]
        |-Xorg
        |-apache2---2*[apache2]
        |-pulseaudio
        |-thunderbird
        |-firefox-bin---marco
        |-code-+-code---15*[{code}]
        |      \`-7*[{code}]
        \`-bash---bash`, err: "" };
    },

    top() {
      const list = this.procs.slice().sort((x, y) => y.pcpu - x.pcpu);
      const run = list.filter((p) => p.stat[0] === "R").length;
      const slp = list.filter((p) => p.stat[0] === "S" || p.stat[0] === "I").length;
      const stp = list.filter((p) => p.stat[0] === "T").length;
      const zmb = list.filter((p) => p.stat[0] === "Z").length;
      const head =
`top - 14:06:52 up 4:58, 2 users, load average: 0,73, 1,04, 1,09
Tareas: ${list.length} total, ${run} ejecutar, ${slp} hibernar, ${stp} detener, ${zmb} zombie
%Cpu(s): 2,4 us, 1,2 sy, 0,0 ni, 96,0 id, 0,0 wa
MiB Mem : ${this.mem.total} total, ${this.mem.free} libre, ${this.mem.used} usado, ${this.mem.buffcache} búfer/caché
MiB Swap: ${Math.round(this.swapTotalKB() / 1024)} total, ${Math.round(this.swapTotalKB() / 1024)} libre, 0 usado.  ${this.mem.available} dispon Mem

    PID USUARIO   PR  NI    VIRT    RES S  %CPU %MEM     HORA+ ORDEN`;
      const rows = list.map((p) => [padl(p.pid, 7), pad(p.user, 9), padl(20 + p.ni, 3),
        padl(p.ni, 3), padl(p.vsz, 8), padl(p.rss, 7), pad(p.stat[0], 1),
        padl(p.pcpu.toFixed(1), 5), padl(p.pmem.toFixed(1), 5), padl(p.time, 9), " " + p.cmd].join(" "));
      return { out: head + "\n" + rows.join("\n") + "\n\n(top real es interactivo: h ayuda, k matar, r renice, M memoria, q salir)", err: "" };
    },

    pgrep(a) {
      const name = a.filter((x) => !x.startsWith("-"))[0] || "";
      const m = this.getProcsByName(name);
      if (!m.length) return { out: "", err: "" };
      return { out: m.map((p) => p.pid).join("\n"), err: "" };
    },
    pidof(a) { return this.commands.pgrep.call(this, a); },

    nice(a) {
      let ni = 10, i = 0;
      if (a[0] === "-n") { ni = parseInt(a[1], 10); i = 2; }
      else if (/^--\d+$/.test(a[0])) { ni = -parseInt(a[0].slice(2), 10); i = 1; }
      else if (/^-\d+$/.test(a[0])) { ni = parseInt(a[0].slice(1), 10); i = 1; }
      const cmd = a.slice(i).filter((x) => !x.startsWith("-"))[0];
      if (!cmd) return { out: "", err: "nice: falta el comando a ejecutar" };
      if (ni < 0 && this.me !== "root") return { out: "", err: "nice: no se puede establecer prioridad negativa: Permiso denegado (solo root)" };
      const p = { pid: this.nextPid++, ppid: 18649, user: this.me, ni, stat: "S", pcpu: 0.0, pmem: 0.0, vsz: 12000, rss: 3000, tty: "pts/1", time: "0:00", cmd };
      this.procs.push(p);
      return { out: cmd + " lanzado con PID " + p.pid + " y nº nice " + ni, err: "" };
    },

    renice(a) {
      let ni = null, users = [], pids = [], mode = "";
      for (let i = 0; i < a.length; i++) {
        const t = a[i];
        if (t === "-u") { mode = "u"; }
        else if (t === "-p") { mode = "p"; }
        else if (t === "-n" || t === "-g") { /* marcador ignorado */ }
        else if (mode === "u") { users.push(t); }
        else if (/^-?\d+$/.test(t)) { if (ni === null) ni = parseInt(t, 10); else pids.push(parseInt(t, 10)); }
        else { users.push(t); }
      }
      if (ni === null) return { out: "", err: "renice: falta la prioridad" };
      let targets = [];
      if (users.length) targets = this.procs.filter((p) => users.includes(p.user));
      else targets = pids.map((pid) => this.getProcByPid(pid)).filter(Boolean);
      if (!targets.length) return { out: "", err: "renice: no se encontró ningún proceso" };
      if (ni < 0 && this.me !== "root") return { out: "", err: "renice: Permiso denegado (bajar la prioridad solo lo hace root)" };
      targets.forEach((p) => { p.ni = ni; });
      return { out: targets.map((p) => p.pid + " (proceso): prioridad antigua → nueva " + ni).join("\n"), err: "" };
    },

    kill(a) {
      let sig = "TERM";
      const rest = [];
      for (let i = 0; i < a.length; i++) {
        if (a[i] === "-s" || a[i] === "-n") { sig = SIGNALS[a[++i]] || sig; }
        else if (a[i].startsWith("-")) { const s = a[i].slice(1); if (SIGNALS[s]) sig = SIGNALS[s]; }
        else rest.push(a[i]);
      }
      if (!rest.length) return { out: "", err: "kill: falta el PID" };
      const msgs = [];
      for (const t of rest) {
        const p = this.getProcByPid(t);
        if (!p) { msgs.push("kill: (" + t + "): no existe ese proceso"); continue; }
        msgs.push(this.applySignal(p, sig));
      }
      return { out: msgs.join("\n"), err: "" };
    },

    killall(a) {
      let sig = "TERM";
      const names = [];
      for (let i = 0; i < a.length; i++) {
        if (a[i].startsWith("-")) { const s = a[i].slice(1); if (SIGNALS[s]) sig = SIGNALS[s]; }
        else names.push(a[i]);
      }
      const name = names[0];
      if (!name) return { out: "", err: "killall: falta el nombre" };
      const m = this.getProcsByName(name);
      if (!m.length) return { out: "", err: name + ": no se encontró ningún proceso" };
      return { out: m.map((p) => this.applySignal(p, sig)).join("\n"), err: "" };
    },
    pkill(a) { return this.commands.killall.call(this, a); },

    free(a) {
      const h = a.includes("-h");
      const swT = Math.round(this.swapTotalKB() / 1024);
      if (h) {
        const g = (mb) => (mb / 1024).toFixed(1) + "Gi";
        return { out:
`               total        usado        libre   compart  búf/caché  disponible
Mem:           ${g(this.mem.total)}        ${g(this.mem.used)}       ${g(this.mem.free)}      0,2Gi      ${g(this.mem.buffcache)}       ${g(this.mem.available)}
Inter:         ${(swT / 1024).toFixed(1)}Gi        0,0Gi        ${(swT / 1024).toFixed(1)}Gi`, err: "" };
      }
      return { out:
`               total        usado        libre   compart  búf/caché  disponible
Mem:        ${padl(this.mem.total, 8)}     ${padl(this.mem.used, 8)}     ${padl(this.mem.free, 8)}      327       ${padl(this.mem.buffcache, 6)}     ${padl(this.mem.available, 8)}
Inter:      ${padl(swT, 8)}            0     ${padl(swT, 8)}`, err: "" };
    },

    vmstat() {
      return { out:
`procs ------------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b      swpd     free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 0  0         0 10368052 221628 3251020   0    0   109    71  142  482  5  1 93  0  0
 0  0         0 10367408 221636 3251288   0    0     0    58 1526 7113  4  2 94  0  0`, err: "" };
    },

    df(a) {
      const inodes = a.includes("-i");
      if (inodes) {
        return { out:
`S.ficheros      Nodos-i NUsados  NLibres NUso% Montado en
/dev/nvme0n1p5 20946944 1021112 19925832    5% /home`, err: "" };
      }
      return { out:
`S.ficheros     Tamaño Usados  Disp Uso% Montado en
udev             7,7G      0  7,7G   0% /dev
tmpfs            1,6G   1,8M  1,6G   1% /run
/dev/nvme0n1p6    58G    32G   24G  58% /
tmpfs            7,8G   279M  7,5G   4% /dev/shm
/dev/nvme0n1p5   314G   131G  167G  45% /home`, err: "" };
    },

    du(a) {
      return { out:
`196K	./Programa2025
176K	./logs
 32K	./reservas
 79M	./Evaluacion
 45M	./MaterialDocente
133M	.`, err: "" };
    },

    iostat() {
      return { out:
`Linux 5.4.0-144-generic   20/03/25   _x86_64_   (8 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           7,41    0,79    2,62    0,91    0,00   88,28

Device       tps    kB_read/s   kB_wrtn/s    kB_read    kB_wrtn
nvme0n1   218,69      3299,26     2384,25    4185145    3024449
dm-0      208,57      1415,84      427,96    1796005     542868`, err: "" };
    },
    iotop() { return { out: "iotop: muestra los procesos ordenados por uso de E/S (necesita privilegios). (interactivo)", err: "" }; },

    swapon(a) {
      if (a[0] === "-s" || a.length === 0) {
        const head = "Filename                Type        Size      Used    Priority";
        const rows = this.swap.map((s) => pad(s.name, 22) + " " + pad(s.type, 11) + " " + padl(s.sizeKB, 9) + " " + padl(s.usedKB, 9) + " " + padl(s.prio, 9));
        return { out: [head].concat(rows).join("\n"), err: "" };
      }
      const path = a[0];
      if (!this.formatted[path] && !path.startsWith("/dev/")) return { out: "", err: "swapon: " + path + ": no es un área de intercambio válida. Usa antes 'mkswap " + path + "'." };
      if (this.swap.some((s) => s.name === path)) return { out: "", err: "swapon: " + path + ": ya está activo" };
      const size = this.files[path] || 1048576;
      this.swap.push({ name: path, type: path.startsWith("/dev/") ? "partition" : "file", sizeKB: size, usedKB: 0, prio: -3 });
      return { out: "swap activado en " + path, err: "" };
    },
    swapoff(a) {
      const path = a[0];
      const before = this.swap.length;
      this.swap = this.swap.filter((s) => s.name !== path);
      if (this.swap.length === before) return { out: "", err: "swapoff: " + path + ": no estaba activo" };
      return { out: "swap desactivado en " + path, err: "" };
    },
    mkswap(a) {
      const path = a.filter((x) => !x.startsWith("-"))[0];
      if (!path) return { out: "", err: "mkswap: falta la ruta" };
      this.formatted[path] = true;
      const size = this.files[path] || 1048576;
      return { out: "Configurando espacio de intercambio versión 1, tamaño = " + Math.round(size / 1024) + " MiB\n" + path + " listo (mkswap)", err: "" };
    },
    dd(a) {
      let of = null, bs = 1048576, count = 1024;
      for (const t of a) {
        if (t.startsWith("of=")) of = t.slice(3);
        else if (t.startsWith("bs=")) bs = parseInt(t.slice(3)) || bs;
        else if (t.startsWith("count=")) count = parseInt(t.slice(6)) || count;
      }
      if (!of) return { out: "", err: "dd: falta of=" };
      this.files[of] = Math.round(bs * count / 1024);
      return { out: count + "+0 registros leídos\n" + count + "+0 registros escritos\nfichero " + of + " creado (" + Math.round(bs * count / 1048576) + " MiB)", err: "" };
    },
    sync() { return { out: "", err: "" }; },

    crontab(a) {
      if (a[0] === "-l") {
        if (!this.cron.length) return { out: "no crontab for " + this.me, err: "" };
        return { out: this.cron.join("\n"), err: "" };
      }
      if (a[0] === "-r") { this.cron = []; return { out: "crontab eliminado", err: "" }; }
      if (a[0] === "-e") return { out: "(crontab -e abre un editor; en este simulador usa: crontab -a \"min h dm mes ds comando\")", err: "" };
      if (a[0] === "-a") {
        const line = a.slice(1).join(" ").trim();
        if (line.split(/\s+/).length < 6) return { out: "", err: "crontab: formato 'min hora día_mes mes día_semana comando'" };
        this.cron.push(line);
        return { out: "tarea añadida al crontab", err: "" };
      }
      return { out: "", err: "crontab: opción no reconocida (usa -l, -e, -r, -a)" };
    },

    at(a) {
      const when = a[0] || "now";
      const cmd = a.slice(1).join(" ") || "(comando)";
      const id = this.nextAt++;
      this.atJobs.push({ id, when, cmd });
      return { out: "warning: commands will be executed using /bin/sh\njob " + id + " at " + when, err: "" };
    },
    atq() {
      if (!this.atJobs.length) return { out: "", err: "" };
      return { out: this.atJobs.map((j) => j.id + "\t" + j.when + " a " + this.me).join("\n"), err: "" };
    },
    atrm(a) {
      const id = parseInt(a[0], 10);
      this.atJobs = this.atJobs.filter((j) => j.id !== id);
      return { out: "", err: "" };
    },

    strace(a) {
      return { out: "strace: rastrearía las llamadas al sistema y señales del proceso/comando '" + (a.join(" ") || "") + "'.\n(En un sistema real verías openat(), read(), write(), etc. y las señales recibidas.)", err: "" };
    }
  };

  // ---- prompt + API para validar ejercicios ------------------------------
  ProcSystem.prototype.prompt = function () { return this.me + "@debian:~$ "; };

  global.ProcSystem = ProcSystem;
})(window);
