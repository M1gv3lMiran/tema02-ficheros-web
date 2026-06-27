/* ===========================================================================
 *  Contenido del Tema 5 — Gestión de recursos del sistema
 *  Preguntas, ejercicios y resumen (PDF tema05-recursos + EjerciciosTema5)
 * ========================================================================= */
window.DATA_T5 = {

  // -------------------------------------------------------------------------
  //  TEST
  // -------------------------------------------------------------------------
  quiz: [
    {
      q: "¿Qué es un proceso en GNU/Linux?",
      opts: [
        "Un programa en ejecución; una abstracción para gestionar CPU, memoria y E/S",
        "Un fichero ejecutable en disco",
        "Una partición del disco",
        "Un usuario del sistema"
      ],
      a: 0,
      exp: "El proceso representa un programa en ejecución. El SO lo crea al iniciar la ejecución y lo elimina al terminar. La CPU solo ejecuta un proceso a la vez por núcleo, conmutando rápidamente (cuanto de ~100 ms)."
    },
    {
      q: "Diferencia entre modo usuario y modo núcleo:",
      opts: [
        "En modo usuario se ejecuta el código normal; en modo núcleo se ejecutan funciones del kernel (llamadas al sistema, excepciones, interrupciones)",
        "El modo usuario es más rápido porque no tiene restricciones",
        "El modo núcleo solo lo usa root",
        "No hay diferencia real, es terminología"
      ],
      a: 0,
      exp: "La distinción protege la memoria. Se pasa a modo núcleo por: llamadas al sistema (el proceso pide un servicio), excepciones (división por cero…) e interrupciones (dispositivos)."
    },
    {
      q: "En la salida de ps, ¿qué significa el estado STAT = Z?",
      opts: [
        "Zombie: el proceso terminó pero el padre no recogió su código de salida",
        "Está durmiendo",
        "Está en ejecución con prioridad alta",
        "Está esperando E/S"
      ],
      a: 0,
      exp: "Z = zombie. Conviene mirar el PPID para encontrar al padre que no hace el wait(). R=ejecución, S=durmiendo, D=espera ininterrumpible (E/S), T=parado."
    },
    {
      q: "Un proceso aparece en estado D y no puede matarse ni con kill -9. ¿Por qué?",
      opts: [
        "D = espera ininterrumpible (normalmente E/S, p.ej. NFS): no maneja señales hasta que el evento ocurra",
        "Porque es de root",
        "Porque tiene prioridad negativa",
        "Porque es un proceso zombie"
      ],
      a: 0,
      exp: "Los procesos en estado D (y los Z) no responden a las señales, ni siquiera a KILL. Suele resolverse arreglando la E/S bloqueada o reiniciando."
    },
    {
      q: "¿Qué representa el número 'nice' de un proceso?",
      opts: [
        "Su prioridad estática: valores bajos (negativos) = más prioridad; altos = menos. Rango [-20, 19]",
        "El número de hilos que usa",
        "Los MB de RAM que tiene reservados",
        "El PID del proceso padre"
      ],
      a: 0,
      exp: "nice define la prioridad. -20 es la máxima prioridad, 19 la mínima. Se hereda del padre. Solo root puede asignar valores negativos."
    },
    {
      q: "¿Qué comando cambia la prioridad de un proceso YA en ejecución?",
      opts: ["renice", "nice", "chage", "umask"],
      a: 0,
      exp: "nice lanza un proceso NUEVO con una prioridad; renice cambia la de uno existente (renice 14 890, o renice 5 -u pedroa para todos los de un usuario). También se puede con la tecla 'r' en top."
    },
    {
      q: "¿Qué señal envía 'kill' (y 'killall') por defecto?",
      opts: [
        "SIGTERM (15): pide terminar de forma ordenada y se puede capturar/bloquear",
        "SIGKILL (9), que no se puede capturar",
        "SIGSTOP (19)",
        "SIGHUP (1)"
      ],
      a: 0,
      exp: "Por defecto se envía TERM (15), que el proceso puede capturar para limpiar antes de salir. SIGKILL (9) fuerza la salida y no se puede capturar ni bloquear."
    },
    {
      q: "¿Cuál de estas señales NO se puede capturar ni bloquear?",
      opts: ["SIGKILL (9) y SIGSTOP", "SIGTERM (15)", "SIGINT (2)", "SIGHUP (1)"],
      a: 0,
      exp: "KILL (9) y STOP no se pueden capturar ni bloquear. TERM, INT, HUP, TSTP sí. Por eso STOP detiene siempre y KILL mata siempre (salvo procesos D/Z)."
    },
    {
      q: "Para PARAR temporalmente un proceso y luego REANUDARLO, ¿qué señales se usan?",
      opts: [
        "SIGSTOP (19) para pararlo y SIGCONT (18) para reanudarlo",
        "SIGTERM y SIGKILL",
        "SIGHUP y SIGINT",
        "SIGQUIT y SIGCONT"
      ],
      a: 0,
      exp: "STOP (19) detiene (estado T) y CONT (18) reanuda. También sirven Ctrl+Z (TSTP) + fg/bg. Útil para suspender un proceso acaparador antes de investigarlo o renice-arlo."
    },
    {
      q: "¿Qué muestra 'uptime' en su 'load average'?",
      opts: [
        "El nº medio de procesos en estado R o D en los últimos 1, 5 y 15 minutos",
        "El porcentaje exacto de CPU usado ahora mismo",
        "Los MB de RAM libres",
        "El número de usuarios conectados solamente"
      ],
      a: 0,
      exp: "load average = media de procesos ejecutándose o esperando (R/D). Lo que se considera 'alto' depende del número de núcleos del sistema."
    },
    {
      q: "Dentro de top, ¿qué tecla mata un proceso y cuál cambia su prioridad?",
      opts: [
        "'k' para matar (enviar señal) y 'r' para renice",
        "'q' para matar y 'p' para renice",
        "'d' para matar y 'n' para renice",
        "'M' para matar y 'P' para renice"
      ],
      a: 0,
      exp: "En top: k = enviar señal (matar), r = renice. Además P ordena por CPU, M por memoria, u filtra por usuario, 1 muestra cada CPU, q sale."
    },
    {
      q: "En la carpeta /proc, ¿qué contiene el subdirectorio cuyo nombre es un número?",
      opts: [
        "La información de un proceso (su PID): cmdline, cwd, exe, fd, maps, stat…",
        "Los ficheros de un usuario",
        "Las particiones del disco",
        "Los módulos del kernel"
      ],
      a: 0,
      exp: "Cada proceso tiene una carpeta /proc/<pid> con su información. De ahí leen ps y top: cmdline (orden), exe (ejecutable), cwd (directorio), fd (descriptores), maps (memoria), stat/statm."
    },
    {
      q: "¿Para qué sirve 'strace'?",
      opts: [
        "Para observar las llamadas al sistema y señales que hace/recibe un proceso",
        "Para medir la temperatura de la CPU",
        "Para listar particiones",
        "Para crear ficheros de swap"
      ],
      a: 0,
      exp: "strace rastrea las syscalls y señales. strace -p PID (proceso existente), strace comando (lanzarlo y rastrear), -o fichero (guardar la salida). Útil para saber qué hace un proceso antes de matarlo."
    },
    {
      q: "Diferencia entre 'at' y 'cron':",
      opts: [
        "at ejecuta una tarea UNA vez a una hora dada; cron la ejecuta PERIÓDICAMENTE",
        "at es periódico y cron de una sola vez",
        "Son sinónimos",
        "at es para discos y cron para memoria"
      ],
      a: 0,
      exp: "at = ejecución única diferida (demonio atd; atq lista, atrm borra). cron = ejecución periódica (demonio crond; crontab -e/-l/-r)."
    },
    {
      q: "Formato de una línea de crontab:",
      opts: [
        "minuto hora día_mes mes día_semana comando",
        "hora minuto día mes comando",
        "comando minuto hora día mes",
        "día mes hora minuto comando"
      ],
      a: 0,
      exp: "Orden: min (0-59) hora (0-23) día_mes (1-31) mes (1-12) día_semana (0-6, domingo=0 o 7) comando. Un '*' significa 'cualquiera'."
    },
    {
      q: "¿Qué hace la línea de crontab '0 22 * * 1-5 /script'?",
      opts: [
        "Ejecuta /script a las 22:00 de lunes a viernes",
        "Ejecuta /script cada 22 minutos",
        "Ejecuta /script el día 22 de cada mes",
        "Ejecuta /script a las 0:22 todos los días"
      ],
      a: 0,
      exp: "min=0, hora=22, día_mes=*, mes=*, día_semana=1-5 (lun-vie). Es decir, a las 22:00 de lunes a viernes."
    },
    {
      q: "¿Qué ventaja aporta 'anacron' frente a 'cron'?",
      opts: [
        "Si la máquina estaba apagada cuando tocaba la tarea, anacron la ejecuta después (cron la pierde)",
        "anacron es más preciso al segundo",
        "anacron no necesita demonio",
        "anacron solo funciona en servidores siempre encendidos"
      ],
      a: 0,
      exp: "cron asume la máquina siempre encendida; si estaba apagada, no recupera la tarea. anacron sí (útil en portátiles): tareas diarias/semanales/mensuales con /etc/cron.daily, etc."
    },
    {
      q: "¿Qué información da el comando 'free'?",
      opts: [
        "Uso de memoria RAM y de la zona de intercambio (swap): total, usado, libre, búfer/caché",
        "El espacio libre en disco",
        "La lista de procesos",
        "La carga de la CPU"
      ],
      a: 0,
      exp: "free muestra la memoria (mismos campos que top). df muestra el disco. Para swap también vale swapon -s."
    },
    {
      q: "Sobre la memoria de intercambio (swap) en un portátil que debe poder hibernar:",
      opts: [
        "Conviene al menos tanta swap como RAM (la hibernación vuelca la RAM al disco)",
        "No hace falta swap nunca",
        "La swap debe ser siempre de 2 MB",
        "La swap solo puede ser una partición, nunca un fichero"
      ],
      a: 0,
      exp: "Para hibernar hay que poder guardar toda la RAM, así que se recomienda swap ≥ RAM. Puede ser partición o fichero; se gestiona con swapon/swapoff y prioridades en /etc/fstab."
    },
    {
      q: "Para crear y activar un fichero de intercambio, ¿qué secuencia es la correcta?",
      opts: [
        "dd (crear el fichero) → mkswap (formatearlo) → swapon (activarlo)",
        "swapon → mkswap → dd",
        "mkswap → dd → swapoff",
        "df → du → swapon"
      ],
      a: 0,
      exp: "Primero se crea el fichero contiguo (dd if=/dev/zero of=… ), luego mkswap lo prepara como área de intercambio y swapon lo activa. swapon -s lo confirma."
    },
    {
      q: "Diferencia entre 'df' y 'du':",
      opts: [
        "df: espacio por sistema de ficheros/partición y punto de montaje. du: espacio que ocupan carpetas/ficheros",
        "df: carpetas; du: particiones",
        "Son idénticos",
        "df mide memoria y du mide CPU"
      ],
      a: 0,
      exp: "df -h da capacidad/uso/montaje de cada partición (df -i para inodos). du -h --max-depth=1 da lo que ocupa cada subcarpeta. Ojo: du cuenta bloques completos."
    },
    {
      q: "¿Para qué sirve 'iostat' (e 'iotop')?",
      opts: [
        "Para ver estadísticas de rendimiento de los discos / la E/S (iotop: por proceso)",
        "Para listar usuarios conectados",
        "Para cambiar prioridades",
        "Para programar tareas"
      ],
      a: 0,
      exp: "iostat da tps, kB leídos/escritos por dispositivo y %iowait de la CPU. iotop es como top pero ordenando procesos por uso de E/S, para localizar al que satura el disco."
    },
    {
      q: "Una 'fork bomb' (:(){ :|:& };:) deja el sistema inservible. ¿Cómo se previene?",
      opts: [
        "Limitando el nº de procesos por usuario en /etc/security/limits.conf (o ulimit)",
        "Desactivando la swap",
        "Borrando /proc",
        "Subiendo el nice a 19"
      ],
      a: 0,
      exp: "La fork bomb crea procesos recursivamente hasta agotar la tabla. Se mitiga con límites por usuario (nproc) en /etc/security/limits.conf y con ulimit."
    }
  ],

  // -------------------------------------------------------------------------
  //  PREGUNTAS DEL PROFESOR (a rellenar)
  // -------------------------------------------------------------------------
  profQuiz: [],

  // -------------------------------------------------------------------------
  //  EJERCICIOS (verificables en el simulador + conceptuales del PDF)
  // -------------------------------------------------------------------------
  exercises: [
    {
      title: "Práctica · Localizar procesos y su prioridad",
      desc: "Lista los procesos relacionados con <code>apache</code> y fíjate en su PID. Luego mira su prioridad en formato largo. (Comando del ejercicio 'nice' de los apuntes.)",
      hint: "ps aux | grep apache    y luego    ps -lu www-data   (o ps al)",
      setup: "",
      check: function (s) {
        // objetivo de exploración: se valida que existan los procesos apache
        return s.getProcsByName("apache2").length >= 2;
      },
      solutionText: "<code>ps aux | grep apache</code> → ves los PID (29822 master root, 29823/29824 www-data).<br><code>ps -lu www-data</code> o <code>ps al</code> muestran la columna <b>NI</b> (nice). También con <code>top</code>.",
      goal: "Identificar los procesos apache2 y dónde se ve su prioridad (NI)"
    },
    {
      title: "Práctica · Cambiar la prioridad con renice (Ej. nice)",
      desc: "El proceso maestro de apache es el PID <code>29822</code>. Bájale la prioridad asignándole un nº nice de <b>14</b> con <code>renice</code>.",
      hint: "renice 14 29822    (renice PRIORIDAD PID)",
      setup: "",
      check: function (s) {
        const p = s.getProcByPid(29822);
        return p && p.ni === 14;
      },
      solutionText: "<code>renice 14 29822</code><br>Comprueba con <code>ps al</code> o <code>top</code> que la columna NI del PID 29822 es 14. En top también se hace con la tecla <b>r</b>.",
      goal: "El proceso 29822 tiene nº nice = 14"
    },
    {
      title: "Práctica · Bajar la prioridad de TODOS los procesos de un usuario",
      desc: "Baja la prioridad de todos los procesos del usuario <code>www-data</code> a un nº nice de <b>5</b> con una sola orden.",
      hint: "renice 5 -u www-data",
      setup: "",
      check: function (s) {
        const ww = s.procs.filter((p) => p.user === "www-data");
        return ww.length > 0 && ww.every((p) => p.ni === 5);
      },
      solutionText: "<code>renice 5 -u www-data</code><br>La opción <code>-u</code> aplica el cambio a todos los procesos del usuario. Verifícalo con <code>ps -lu www-data</code>.",
      goal: "Todos los procesos de www-data con nº nice = 5"
    },
    {
      title: "Práctica · Suspender un proceso (STOP) antes de investigarlo",
      desc: "El proceso <code>firefox-bin</code> (PID <code>2307</code>) acapara recursos. Como buen administrador, antes de matarlo, <b>suspéndelo</b> con la señal STOP para que deje de consumir CPU mientras lo investigas.",
      hint: "kill -STOP 2307   (equivale a kill -19 2307). Para reanudarlo sería kill -CONT 2307.",
      setup: "",
      check: function (s) {
        const p = s.getProcByPid(2307);
        return p && p.stat[0] === "T";
      },
      solutionText: "<code>kill -STOP 2307</code> (o <code>kill -19 2307</code>) → el proceso pasa a estado <b>T</b> (detenido).<br>Buena práctica: suspender con STOP, aplicar <code>renice</code> y reanudar con <code>kill -CONT 2307</code> tras hablar con el dueño.",
      goal: "El proceso 2307 está detenido (estado T)"
    },
    {
      title: "Práctica · Matar un proceso colgado",
      desc: "El proceso <code>marco</code> (PID <code>1402</code>) se ha quedado bloqueado y no responde a TERM. Mátalo de forma forzosa con SIGKILL.",
      hint: "kill -9 1402   (SIGKILL no se puede capturar ni bloquear). También killall marco.",
      setup: "",
      check: function (s) {
        return s.getProcByPid(1402) === null;
      },
      solutionText: "<code>kill -9 1402</code> (SIGKILL). Alternativas: <code>kill -KILL 1402</code>, <code>killall marco</code> o <code>pkill marco</code>. Comprueba con <code>ps aux | grep marco</code> que ya no aparece.",
      goal: "El proceso 1402 ya no existe"
    },
    {
      title: "Práctica · Lanzar un proceso con baja prioridad (nice)",
      desc: "Lanza una tarea pesada llamada <code>backup</code> de forma que <b>moleste poco</b>: con un nº nice de <b>10</b>.",
      hint: "nice -n 10 backup",
      setup: "",
      check: function (s) {
        const m = s.getProcsByName("backup");
        return m.some((p) => p.ni === 10);
      },
      solutionText: "<code>nice -n 10 backup</code> lanza el proceso con prioridad baja (nice 10). Recuerda: <code>nice --10 backup</code> sería nice -10 (más prioridad) y SOLO lo puede hacer root.",
      goal: "Existe un proceso 'backup' con nº nice = 10"
    },
    {
      title: "Práctica · Crear y activar swap en un fichero (Ej. paginación)",
      desc: "Crea un fichero de intercambio <code>/.fichero_swap</code> de 1 GiB, prepáralo y actívalo, tal como en los apuntes.",
      hint: "dd if=/dev/zero of=/.fichero_swap bs=1048576 count=1024  →  mkswap /.fichero_swap  →  swapon /.fichero_swap",
      setup: "",
      check: function (s) {
        return s.swapFileActive("/.fichero_swap");
      },
      solutionText: "<code>dd if=/dev/zero of=/.fichero_swap bs=1048576 count=1024</code> (crea el fichero)<br><code>mkswap /.fichero_swap</code> (lo formatea como swap)<br><code>swapon /.fichero_swap</code> (lo activa)<br>Verifica con <code>swapon -s</code> y <code>free -h</code>.",
      goal: "El fichero /.fichero_swap está activo como swap"
    },
    {
      title: "Práctica · Programar espacio libre cada hora (Ej. 9, 1ª entrada)",
      desc: "Añade una tarea de crontab que vuelque el espacio libre de las particiones al fichero <code>/var/log/reportEspacio.log</code> <b>cada hora</b>. (En este simulador usa <code>crontab -a \"…\"</code> en lugar del editor <code>crontab -e</code>.)",
      hint: 'crontab -a "0 * * * * df -h > /var/log/reportEspacio.log"   (minuto 0 de cada hora)',
      setup: "",
      check: function (s) {
        return s.cron.some((l) => l.includes("reportEspacio.log") && /^0\s+\*\s+\*\s+\*\s+\*/.test(l.trim()));
      },
      solutionText: 'En la vida real: <code>crontab -e</code> y añadir la línea<br><code>0 * * * * df -h > /var/log/reportEspacio.log</code><br>(minuto 0, cualquier hora/día/mes/día-semana = una vez por hora). Aquí: <code>crontab -a "0 * * * * df -h > /var/log/reportEspacio.log"</code> y comprueba con <code>crontab -l</code>.',
      goal: "El crontab contiene una entrada horaria que escribe en /var/log/reportEspacio.log"
    },

    // ----- Conceptuales (Ver respuesta) — EjerciciosTema5.pdf -----
    {
      concept: true,
      title: "Ej. 1 · Listar el PID de todos los procesos con ls",
      desc: "¿Cómo podríamos listar el PID de todos los procesos en ejecución utilizando <code>ls</code>?",
      answer:
`<p>Cada proceso tiene una carpeta en <code>/proc</code> cuyo nombre es su <b>PID</b>. Por tanto:</p>
<pre>ls /proc</pre>
<p>Los nombres que son <b>números</b> son los PID de los procesos en ejecución. Para quedarnos solo con ellos:</p>
<pre>ls /proc | grep -E '^[0-9]+$'</pre>
<p>(En <code>/proc</code> hay también otras entradas no numéricas como <code>cpuinfo</code>, <code>meminfo</code>, <code>uptime</code>… que no son procesos.)</p>`
    },
    {
      concept: true,
      title: "Ej. 2 · Hibernar vs. suspender",
      desc: "¿Qué diferencia existe entre hibernar y suspender un equipo? ¿Cómo influye en la memoria?",
      answer:
`<ul>
  <li><b>Suspender</b> (suspend to RAM): se apaga casi todo pero la <b>RAM se mantiene alimentada</b> conservando el estado. Reanudación muy rápida, pero sigue consumiendo algo de energía (si se corta, se pierde el estado).</li>
  <li><b>Hibernar</b> (suspend to disk): el contenido de la <b>RAM se vuelca al disco</b> (a la swap) y el equipo se apaga del todo (0 consumo). Al encender se restaura desde el disco; es más lento pero no pierde nada sin batería.</li>
</ul>
<p><b>Influencia en la memoria:</b> al suspender, la RAM se conserva tal cual. Al hibernar se necesita espacio de intercambio (swap) de <b>al menos el tamaño de la RAM</b> para poder guardar todo su contenido.</p>`
    },
    {
      concept: true,
      title: "Ej. 3 · ¿Para qué sirven vmstat e iostat?",
      desc: "¿Para qué sirven los comandos <code>vmstat</code> e <code>iostat</code>? ¿Para qué tareas los usaría un administrador?",
      answer:
`<ul>
  <li><b>vmstat</b>: informa de CPU y <b>memoria virtual</b> (procesos en cola r/b, swap si/so, E/S bi/bo, interrupciones, cambios de contexto y reparto de CPU us/sy/id/wa). Útil para detectar si el sistema <b>pagina demasiado</b> (mucho si/so → falta RAM) o si la CPU está saturada o esperando E/S.</li>
  <li><b>iostat</b>: estadísticas de <b>rendimiento de los discos</b> (tps, kB leídos/escritos por dispositivo) y el <b>%iowait</b> de la CPU. Útil para ver qué disco es el cuello de botella cuando el sistema va lento por E/S.</li>
</ul>
<p>Ambos se usan para <b>monitorizar y diagnosticar cuellos de botella</b> (CPU, memoria o disco), típicamente con un intervalo: <code>vmstat 2 5</code>, <code>iostat 2</code>.</p>`
    },
    {
      concept: true,
      title: "Ej. 4 · ¿Para qué sirven df y du?",
      desc: "¿Para qué sirven <code>df</code> y <code>du</code>? Pon ejemplos de cuándo usarlos.",
      answer:
`<ul>
  <li><b>df</b> (disk free): espacio total/usado/libre y punto de montaje de <b>cada sistema de ficheros</b>. Ej.: <code>df -h</code> para ver de un vistazo qué partición se está llenando; <code>df -i</code> para ver inodos.</li>
  <li><b>du</b> (disk usage): espacio que ocupan <b>carpetas y ficheros</b>. Ej.: <code>du -h --max-depth=1</code> en <code>/var</code> para localizar qué subcarpeta se ha disparado (logs, etc.).</li>
</ul>
<p><b>Situación típica:</b> '/' al 100%. Con <code>df -h</code> ves qué partición está llena y con <code>du -h --max-depth=1 /ruta</code> bajas hasta encontrar la carpeta culpable. Ojo: <code>du</code> cuenta bloques completos (un fichero de 1 B ocupa 4 KB).</p>`
    },
    {
      concept: true,
      title: "Ej. 5 · Proceso que consume demasiada CPU",
      desc: "¿Qué hacer si un proceso consume demasiada CPU? ¿Qué comandos usar para pararlo temporalmente, reiniciarlo e investigarlo?",
      answer:
`<ol>
  <li><b>Identificarlo</b>: <code>top</code> (ordena por CPU) o <code>ps aux --sort=-%cpu | head</code> para ver el PID.</li>
  <li><b>Pararlo temporalmente</b> (sin perder su trabajo): <code>kill -STOP &lt;pid&gt;</code> (estado T).</li>
  <li><b>Investigarlo</b> mientras está parado: <code>strace -p &lt;pid&gt;</code> (qué llamadas hace), mirar <code>/proc/&lt;pid&gt;</code>, ver de quién es.</li>
  <li><b>Bajar su prioridad</b> si es legítimo: <code>renice 15 &lt;pid&gt;</code>.</li>
  <li><b>Reanudarlo</b>: <code>kill -CONT &lt;pid&gt;</code>.</li>
  <li>Si es malicioso o inservible: <code>kill -9 &lt;pid&gt;</code>.</li>
</ol>
<p>La buena práctica es <b>no matar a ciegas</b>: suspender → investigar → renice/avisar al dueño → reanudar o, en último caso, matar.</p>`
    },
    {
      concept: true,
      title: "Ej. 6 · UID del fichero vs UID real/efectivo del proceso",
      desc: "Relaciona el UID de un fichero con el UID real y el UID efectivo de un proceso. Da dos motivos por los que el UID de un proceso es necesario.",
      answer:
`<p>Cada <b>fichero</b> tiene un <b>UID propietario</b>. Cada <b>proceso</b> tiene:</p>
<ul>
  <li><b>UID real</b>: el del usuario que lo lanzó.</li>
  <li><b>UID efectivo</b>: el que se usa para <b>comprobar los permisos</b> al acceder a los ficheros (normalmente coincide con el real, salvo con SetUID).</li>
</ul>
<p>Cuando un proceso intenta acceder a un fichero, el kernel compara el <b>UID efectivo del proceso</b> con el <b>UID del fichero</b> (y los bits rwx) para permitir o denegar.</p>
<p><b>Por qué es necesario el UID de un proceso:</b></p>
<ol>
  <li><b>Control de acceso</b>: decidir a qué ficheros y recursos puede acceder (seguridad).</li>
  <li><b>Atribución/control</b>: saber a quién pertenece cada proceso para poder gestionarlo (matar, renice, contabilizar recursos, aplicar límites). El SetUID (p.ej. <code>passwd</code>) permite que un proceso adopte temporalmente el UID efectivo del dueño del ejecutable.</li>
</ol>`
    },
    {
      concept: true,
      title: "Ej. 7 · Encontrar un memory leak",
      desc: "Un <i>memory leak</i> es un consumo incremental de memoria sin fin por un proceso. ¿Cómo encontrarías estos procesos en GNU/Linux?",
      answer:
`<ul>
  <li><b>Monitorizar el uso de memoria en el tiempo</b>: con <code>top</code> (tecla <b>M</b> ordena por %MEM) o <code>ps aux --sort=-%mem | head</code>, observando si la columna RSS de un proceso <b>crece sin parar</b>.</li>
  <li><b>vmstat</b> y <b>free</b>: vigilar si la memoria libre baja continuamente y empieza a usarse mucha <b>swap</b> (si/so altos).</li>
  <li><b>/proc/&lt;pid&gt;/status</b> o <code>statm</code>: ver el detalle de la memoria del proceso sospechoso.</li>
  <li><b>Herramientas de desarrollo</b> si se puede reproducir: <code>valgrind --leak-check=full programa</code> para localizar la fuga en el código.</li>
</ul>
<p>La clave es la <b>tendencia</b>: un leak se reconoce porque la memoria del proceso aumenta de forma sostenida aunque la carga no lo justifique.</p>`
    },
    {
      concept: true,
      title: "Ej. 8 · El comando killall y la señal por defecto",
      desc: "¿Para qué sirve <code>killall</code>? ¿Qué señal envían por defecto <code>kill</code> y <code>killall</code> (número y nemónico)?",
      answer:
`<p><b>killall</b> envía una señal a <b>todos los procesos que tengan un determinado nombre de comando</b> (a diferencia de <code>kill</code>, que actúa por PID). Ej.: <code>killall firefox</code> cierra todas las instancias de firefox.</p>
<p>La señal por defecto de <code>kill</code> y <code>killall</code> es <b>SIGTERM</b>, número <b>15</b> (nemónico <code>TERM</code>). Es una petición ordenada de terminación que el proceso puede <b>capturar</b> para limpiar antes de salir. Si no responde, se recurre a <code>-9</code> (SIGKILL).</p>
<p>Relacionados: <code>pkill</code> (por nombre u otros criterios: uid, terminal…) y <code>pgrep</code> (lista los PID).</p>`
    },
    {
      concept: true,
      title: "Ej. 9 · Dos entradas de crontab",
      desc: "Especifica el contenido de dos entradas de crontab: (1) imprimir el espacio libre de las particiones cada hora en <code>/var/log/reportEspacio.log</code>; (2) imprimir el listado de todos los procesos con nombre de usuario a las 9:00, 12:00 y 15:00 los viernes en <code>/var/log/reportProcesos.log</code>.",
      answer:
`<p><b>1) Cada hora → espacio libre:</b></p>
<pre>0 * * * * df -h > /var/log/reportEspacio.log</pre>
<p>minuto 0, cualquier hora/día/mes/día-semana ⇒ una vez por hora.</p>
<p><b>2) Viernes a las 9, 12 y 15 h → listado de procesos:</b></p>
<pre>0 9,12,15 * * 5 ps aux > /var/log/reportProcesos.log</pre>
<p>minuto 0; horas 9, 12 y 15 (lista separada por comas); cualquier día de mes y mes; día_semana <b>5</b> = viernes. <code>ps aux</code> (o <code>ps -ef</code>) incluye el nombre de usuario.</p>
<p>Nota: si se quiere <b>acumular</b> en vez de sobrescribir, usar <code>&gt;&gt;</code>. Y para evitar problemas con <code>%</code> en crontab hay que escaparlos (<code>\\%</code>).</p>`
    }
  ],

  // -------------------------------------------------------------------------
  //  RESUMEN
  // -------------------------------------------------------------------------
  summary: [
    {
      h: "1. Procesos y modos de ejecución",
      points: [
        "<b>Proceso</b> = programa en ejecución; abstracción para gestionar CPU, memoria y E/S. La CPU ejecuta uno por núcleo y conmuta cada cuanto (~100 ms): <b>planificación</b>.",
        "<b>Modo usuario</b> (código del programa) vs <b>modo núcleo</b> (kernel): se entra por <b>llamadas al sistema</b>, <b>excepciones</b> e <b>interrupciones</b>.",
        "Tipos: de <b>usuario</b> (los lanza una persona), <b>demonio</b> (servicios, tareas periódicas) y <b>núcleo</b> (código del kernel, siempre en modo núcleo).",
        "Info de CPU: <code>lscpu</code>, <code>nproc</code>, <code>/proc/cpuinfo</code>."
      ]
    },
    {
      h: "2. ps y estados de los procesos",
      points: [
        "<code>ps aux</code> (todos, con %CPU/%MEM/STAT) · <code>ps al</code>/<code>-l</code> (formato largo con PRI y NI) · <code>ps -u usuario</code>.",
        "Campos: USER, PID, PPID (padre, creado con fork), %CPU, %MEM, VSZ (virtual), RSS (real), TTY, STAT, COMMAND.",
        "<b>Estados</b>: R ejecución · S durmiendo · D espera ininterrumpible (E/S) · Z zombie (el padre no recogió el código) · T parado · I idle (hilos del kernel).",
        "<b>Banderas</b>: < más prioridad · N menos · L páginas bloqueadas · s líder de sesión · l multihilo · + foreground."
      ]
    },
    {
      h: "3. Prioridad (nice) y señales (kill)",
      points: [
        "<b>nice</b>: prioridad estática, rango [-20, 19]. Bajo/negativo = más prioridad. Se hereda del padre. Negativos solo root.",
        "<code>nice -n N comando</code> lanza con prioridad N · <code>renice N pid</code> / <code>renice N -u usuario</code> la cambia en caliente.",
        "<code>kill [-señal] pid</code>: por defecto <b>TERM (15)</b> (capturable). <b>KILL (9)</b> fuerza y no se captura/bloquea. <b>STOP (19)</b> para, <b>CONT (18)</b> reanuda.",
        "<code>killall nombre</code> / <code>pkill</code> (por nombre/criterios) · <code>pgrep</code> (lista PID). Los procesos D y Z ignoran las señales (ni KILL).",
        "Señales útiles: HUP(1) recargar config de demonios · INT(2) Ctrl+C · TSTP Ctrl+Z · QUIT(3) como TERM + core dump. nohup hace inmune a HUP."
      ]
    },
    {
      h: "4. Monitorización: uptime, top, vmstat, /proc",
      points: [
        "<code>uptime</code>: hora, tiempo encendido, usuarios y <b>load average</b> (1/5/15 min = media de procesos R/D; lo 'alto' depende de los núcleos).",
        "<code>top</code>: visión en tiempo real ordenada por CPU. Teclas: <b>k</b> matar, <b>r</b> renice, <b>M</b> memoria, <b>P</b> CPU, <b>u</b> usuario, <b>1</b> por CPU, <b>q</b> salir. Alternativa: <code>htop</code>.",
        "<code>vmstat [delay [count]]</code>: r/b (colas), us/sy/id/wa (CPU), si/so (swap), bi/bo (E/S), in/cs.",
        "<b>/proc/&lt;pid&gt;</b>: una carpeta por proceso con cmdline, cwd, exe, fd, maps, stat, statm… De ahí leen ps y top.",
        "Seguridad CPU: límites por usuario en <code>/etc/security/limits.conf</code> y <code>ulimit</code> (p.ej. frente a una <i>fork bomb</i>)."
      ]
    },
    {
      h: "5. Temporizadores: at, cron, anacron",
      points: [
        "<b>at</b>: ejecutar UNA vez a una hora (demonio <code>atd</code>; <code>atq</code> lista, <code>atrm</code> borra).",
        "<b>cron</b>: ejecución PERIÓDICA (demonio <code>crond</code>; <code>crontab -e/-l/-r</code>; <code>/etc/crontab</code>, <code>/etc/cron.d</code>).",
        "Formato crontab: <code>min hora día_mes mes día_semana comando</code> (domingo = 0 o 7; '*' = cualquiera; listas con comas, rangos con '-', pasos con '/').",
        "<b>anacron</b>: recupera tareas que no se ejecutaron por estar la máquina apagada (ideal en portátiles); usa <code>/etc/cron.daily|weekly|monthly</code>. Los <b>timers de systemd</b> son la alternativa moderna."
      ]
    },
    {
      h: "6. Rastreo: strace",
      points: [
        "<code>strace</code> muestra las <b>llamadas al sistema</b> y <b>señales</b> de un proceso.",
        "<code>strace -p pid</code> (proceso existente) · <code>strace comando</code> (lanzar y rastrear) · <code>strace -o fichero comando</code>.",
        "Antes de matar a un acaparador conviene suspenderlo (STOP), investigarlo (strace, /proc) y, si es legítimo, renice + CONT."
      ]
    },
    {
      h: "7. Memoria y swap",
      points: [
        "<code>free</code> (mismos campos que top) y <code>vmstat</code> para la actividad de memoria: swpd, free, buff, cache, si/so.",
        "<b>Swap</b> (intercambio/paginación): partición o fichero. Para hibernar, swap ≥ RAM. Prioridades en <code>/etc/fstab</code>.",
        "Gestión: <code>swapon -s</code> (lista) · <code>swapon/swapoff dispositivo</code>. Crear fichero: <code>dd</code> → <code>mkswap</code> → <code>swapon</code>."
      ]
    },
    {
      h: "8. Dispositivos de E/S: discos",
      points: [
        "<code>df -h</code>: capacidad/uso/montaje por partición · <code>df -i</code>: inodos. Si '/' se llena, el sistema falla (ni arranca).",
        "<code>du -h --max-depth=1</code>: espacio por subcarpeta (cuenta bloques completos: 1 B ⇒ 4 KB).",
        "<code>iostat</code>: rendimiento de discos (tps, kB_read/s, kB_wrtn/s) y %iowait · <code>iotop</code>: procesos ordenados por uso de E/S."
      ]
    }
  ]
};
