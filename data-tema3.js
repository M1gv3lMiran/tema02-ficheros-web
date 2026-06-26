/* ===========================================================================
 *  Contenido del Tema 3 — Gestión de Usuarios
 *  Preguntas, ejercicios y resumen (PDF tema03-usuarios + EjerciciosTema3)
 * ========================================================================= */
window.DATA_T3 = {

  // -------------------------------------------------------------------------
  //  TEST
  // -------------------------------------------------------------------------
  quiz: [
    {
      q: "El fichero /etc/passwd tiene el formato nombre:password:uid:gid:gecos:home:shell. ¿Qué es el campo 'gecos'?",
      opts: [
        "Información del usuario (nombre real, teléfono…)",
        "La contraseña cifrada",
        "El grupo secundario",
        "La ruta del intérprete de órdenes"
      ],
      a: 0,
      exp: "gecos es el campo de comentarios/información (nombre completo, teléfono…). La contraseña va en el 2º campo (hoy una 'x') y el shell en el último."
    },
    {
      q: "En /etc/passwd, el campo de contraseña vale 'x'. ¿Qué significa?",
      opts: [
        "Las shadow passwords están activas: la contraseña cifrada se guarda en /etc/shadow",
        "La cuenta está bloqueada",
        "La cuenta no tiene contraseña",
        "El usuario es root"
      ],
      a: 0,
      exp: "'x' indica que la contraseña cifrada está en /etc/shadow. '!!' = cuenta bloqueada/sin contraseña, '*' = cuenta desactivada (no permite login con contraseña)."
    },
    {
      q: "¿Qué representa internamente al usuario en el sistema?",
      opts: [
        "El UID (identificador numérico), no el nombre",
        "El nombre de usuario (logname)",
        "El campo gecos",
        "El nombre del grupo primario"
      ],
      a: 0,
      exp: "El sistema trabaja internamente con el UID. El nombre es solo una comodidad para las personas."
    },
    {
      q: "Permisos típicos de /etc/shadow:",
      opts: [
        "rw------- (root root) o rw-r----- (root shadow): muy restringido",
        "rw-r--r-- accesible a todos en lectura",
        "rwxrwxrwx",
        "rw-rw-r-- como /etc/passwd"
      ],
      a: 0,
      exp: "/etc/shadow es muy restringido (rw------- root, o rw-r----- grupo shadow). /etc/passwd sí es legible por todos (rw-r--r--) porque guarda info no sensible."
    },
    {
      q: "¿Por qué se usan las shadow passwords?",
      opts: [
        "Para sacar las contraseñas cifradas de /etc/passwd (legible por todos) a /etc/shadow (solo root)",
        "Para cifrar el fichero /etc/passwd entero",
        "Para permitir contraseñas más largas",
        "Para acelerar el login"
      ],
      a: 0,
      exp: "/etc/passwd debe ser legible por todos (para resolver nombres/UID). Las contraseñas cifradas se mueven a /etc/shadow, accesible solo por root."
    },
    {
      q: "Para cifrar contraseñas se usan funciones hash. ¿Qué propiedad NO es deseable?",
      opts: [
        "Que dado el hash H(C) sea fácil recuperar la contraseña C",
        "Que dado C sea fácil calcular H(C)",
        "Que sea muy difícil encontrar otro C' con el mismo hash (colisión)",
        "Que sean funciones de un solo sentido"
      ],
      a: 0,
      exp: "Justo lo contrario: dado el hash debe ser EXTREMADAMENTE difícil recuperar la contraseña (función de un solo sentido). Lo demás sí es deseable."
    },
    {
      q: "¿Para qué sirve la SAL (salt) al almacenar una contraseña?",
      opts: [
        "Es un valor aleatorio que se concatena a la contraseña: dificulta ataques con diccionarios/rainbow tables y evita que dos usuarios con la misma clave tengan el mismo hash",
        "Cifra la contraseña con AES",
        "Es la longitud del hash",
        "Es el algoritmo de cifrado"
      ],
      a: 0,
      exp: "La sal añade aleatoriedad: dos contraseñas iguales producen hashes distintos y se inutilizan las tablas hash precomputadas (rainbow tables)."
    },
    {
      q: "En un hash de shadow con formato $id$salt$hash, ¿qué algoritmo es $6$?",
      opts: ["SHA-512", "MD5", "Blowfish", "yescrypt"],
      a: 0,
      exp: "$1$=MD5, $2a$/$2y$=Blowfish, $5$=SHA-256, $6$=SHA-512, $y$=yescrypt."
    },
    {
      q: "¿Qué algoritmo identifica el prefijo $y$ en /etc/shadow?",
      opts: ["yescrypt", "SHA-512", "MD5", "Blowfish"],
      a: 0,
      exp: "$y$ = yescrypt (basado en scrypt, con factores de coste configurables: iteraciones, memoria, paralelización). Es el moderno por defecto en Debian."
    },
    {
      q: "En /etc/shadow, ¿qué controla el campo 'maxlife' (maxdays)?",
      opts: [
        "Nº máximo de días que se puede tener la misma contraseña sin cambiarla",
        "Nº de días que han de pasar para PODER cambiarla",
        "Días de aviso antes de caducar",
        "Fecha en que la cuenta expira"
      ],
      a: 0,
      exp: "maxlife = días máximos con la misma contraseña. minlife = días mínimos antes de poder cambiarla. warn = días de aviso. inactive = días tras caducar hasta deshabilitar. expired = fecha de expiración de la cuenta."
    },
    {
      q: "¿Qué comando fija las restricciones de tiempo (envejecimiento) de una cuenta?",
      opts: ["chage", "passwd -t", "usermod -t", "chmod"],
      a: 0,
      exp: "chage gestiona el envejecimiento: -M maxdías, -m mindías, -W aviso, -I inactividad, -E fecha de expiración, -d último cambio, -l para listar."
    },
    {
      q: "root ejecuta: chage -M 20 -W 6 -I 5 -E 2026-10-30 ana. ¿Qué significa -E 2026-10-30?",
      opts: [
        "La cuenta de ana expira (se deshabilita) el 30/10/2026, pase lo que pase",
        "La contraseña caduca a los 30 días",
        "Debe avisar 30 días antes",
        "Mínimo 30 días entre cambios"
      ],
      a: 0,
      exp: "-E fija la fecha de expiración de la CUENTA. -M 20 = cambiar clave cada 20 días; -W 6 = avisar 6 días antes; -I 5 = bloquear 5 días tras caducar si no se cambió."
    },
    {
      q: "¿Cuál es el directorio cuyos ficheros se copian automáticamente al $HOME de cada usuario nuevo?",
      opts: ["/etc/skel", "/etc/default", "/home/skel", "/etc/profile.d"],
      a: 0,
      exp: "/etc/skel contiene los ficheros 'esqueleto' (.bashrc, .profile…) que se copian al crear el $HOME. Si está vacío, el usuario nuevo no recibe ficheros de inicialización."
    },
    {
      q: "¿Qué fichero de inicialización lee bash al ABRIR una terminal (shell interactivo no-login)?",
      opts: [".bashrc", ".bash_profile", ".profile", ".bash_logout"],
      a: 0,
      exp: "bash: login → .bash_profile (+ .profile); shell interactivo → .bashrc; logout → .bash_logout. Por eso los alias suelen ir en .bashrc."
    },
    {
      q: "¿Dónde se definen los valores por defecto de la política (umask, caducidad, rango de UID…)?",
      opts: ["/etc/login.defs", "/etc/skel", "/etc/passwd", "/etc/shells"],
      a: 0,
      exp: "/etc/login.defs guarda los valores por defecto de gestión de contraseñas, creación de usuarios, umask por defecto, etc."
    },
    {
      q: "Para que un usuario NO pueda iniciar sesión interactiva, ¿qué shell se le asigna?",
      opts: [
        "/bin/false o /sbin/nologin",
        "/bin/bash",
        "/bin/sh",
        "/bin/rbash"
      ],
      a: 0,
      exp: "/bin/false o /sbin/nologin impiden el login interactivo (típico de pseudo-usuarios de servicios). rbash sí permite entrar, pero restringido."
    },
    {
      q: "¿Qué NO permite hacer el shell restringido /bin/rbash?",
      opts: [
        "Cambiar de directorio (cd), modificar $PATH/$HOME, usar rutas con '/' o redirección",
        "Ejecutar cualquier comando del sistema sin límite",
        "Acceder como root",
        "Nada, es igual que bash"
      ],
      a: 0,
      exp: "rbash (enlace a bash, equivale a bash -r) prohíbe cd, cambiar $PATH/$HOME, usar nombres con '/', redirección y 'exec'. Hay que limitar también su PATH a un único directorio."
    },
    {
      q: "¿Qué orden añade un usuario YA EXISTENTE a un grupo SECUNDARIO sin sacarlo de los demás?",
      opts: [
        "usermod -aG grupo usuario",
        "usermod -g grupo usuario",
        "useradd grupo usuario",
        "groups usuario grupo"
      ],
      a: 0,
      exp: "usermod -aG (append) añade a grupos secundarios conservando los actuales. ¡Ojo! usermod -G (sin -a) SUSTITUYE la lista. usermod -g cambia el grupo PRIMARIO."
    },
    {
      q: "Diferencia entre grupo PRIMARIO y grupo SECUNDARIO:",
      opts: [
        "El primario está en /etc/passwd (campo gid); los secundarios se indican en /etc/group",
        "El primario está en /etc/group y los secundarios en /etc/passwd",
        "No hay diferencia",
        "El primario es siempre 'users'"
      ],
      a: 0,
      exp: "El grupo primario se define por el gid del 4º campo de /etc/passwd. Los secundarios son las pertenencias listadas en /etc/group."
    },
    {
      q: "Al crear un fichero, ¿qué grupo se le asigna como propietario?",
      opts: [
        "El grupo ACTIVO del usuario en ese momento (normalmente el primario, salvo que se use newgrp)",
        "Siempre el grupo 'root'",
        "Todos los grupos del usuario a la vez",
        "Ninguno"
      ],
      a: 0,
      exp: "El grupo propietario del nuevo fichero es el grupo activo. Por defecto es el primario; con 'newgrp grupo' se cambia el grupo activo."
    },
    {
      q: "El comando 'newgrp profesores' pide contraseña. ¿Cuándo ocurre eso?",
      opts: [
        "Cuando el usuario NO pertenece al grupo pero el grupo tiene contraseña (en /etc/gshadow): si la sabe, pasa a ser su grupo activo",
        "Siempre, aunque seas miembro",
        "Solo si eres root",
        "newgrp nunca pide contraseña"
      ],
      a: 0,
      exp: "Con newgrp puedes adoptar un grupo activo. Si ya eres miembro, no pide nada; si no lo eres pero el grupo tiene contraseña (gpasswd), te la solicita."
    },
    {
      q: "Tras 'newgrp profesores' (siendo ahora 'profesores' tu grupo activo) sobre un fichero -rw-rw-r-- root profesores, ¿puedes escribir en él con 'echo \"HOLA\" >> prueba'?",
      opts: [
        "Sí: el grupo propietario es 'profesores' y tiene permiso rw-, y ahora actúas con ese grupo",
        "No, porque el dueño es root",
        "No, hace falta sudo",
        "Solo si eres root"
      ],
      a: 0,
      exp: "El fichero es del grupo 'profesores' con rw para el grupo. Como tu grupo activo/efectivo es 'profesores', se te aplican esos permisos de grupo y puedes escribir."
    },
    {
      q: "¿Qué rango de UID corresponde a los usuarios NORMALES (humanos)?",
      opts: ["uid ≥ 1000", "uid 0", "uid 1–99", "uid 100–499"],
      a: 0,
      exp: "0 = root, 1–99 (o hasta 999) = sistema/pseudo-usuarios, 100–499 servicios, ≥ 1000 = usuarios normales."
    },
    {
      q: "¿Qué UID tiene siempre el administrador (root)?",
      opts: ["0", "1", "1000", "65534"],
      a: 0,
      exp: "root siempre es UID 0. El UID 0 es el que confiere privilegios de administrador (no el nombre)."
    },
    {
      q: "¿Qué es un 'pseudo-usuario'?",
      opts: [
        "Una entidad que sin ser una persona posee ficheros o ejecuta servicios (p.ej. www-data, mysql, daemon)",
        "Un usuario sin contraseña",
        "El usuario root",
        "Un usuario invitado temporal"
      ],
      a: 0,
      exp: "Los pseudo-usuarios (UID reservados, p.ej. 0–999) sirven para servicios y tareas automatizadas: daemon, www-data, mysql, nobody…"
    },
    {
      q: "En /etc/group con formato nombre:x:gid:lista. ¿Qué es 'lista'?",
      opts: [
        "Los usuarios que pertenecen al grupo como SECUNDARIO, separados por comas",
        "Los ficheros del grupo",
        "La contraseña del grupo",
        "Los UID de los miembros"
      ],
      a: 0,
      exp: "El último campo es la lista de miembros (secundarios) separados por comas. Ej.: pas:x:519:pagutierrez,jsanchezm,dguijo."
    },
    {
      q: "Mira estas dos líneas de /etc/passwd:  list:x:38:38:...  e  irc:x:38:39:...  ¿Hay algo mal?",
      opts: [
        "Sí: dos usuarios distintos comparten el mismo UID (38), lo cual es una inconsistencia",
        "No, es correcto",
        "Sí: les falta el campo shell",
        "Sí: el gid debe ser 0"
      ],
      a: 0,
      exp: "Dos usuarios con el mismo UID (38) es una inconsistencia: el sistema los trataría como el mismo usuario a efectos de permisos. (pwck detecta este tipo de problemas)."
    },
    {
      q: "¿Qué comando verifica la integridad/consistencia de /etc/passwd y /etc/shadow?",
      opts: ["pwck", "grpck", "vipw", "pwconv"],
      a: 0,
      exp: "pwck verifica /etc/passwd y /etc/shadow; grpck verifica /etc/group. vipw edita passwd a mano; pwconv/pwunconv activan/desactivan shadow."
    },
    {
      q: "Diferencia entre 'adduser' y 'useradd':",
      opts: [
        "adduser es interactivo y hace TODO (crea $HOME, copia /etc/skel, pide contraseña); useradd es de bajo nivel y se salta pasos",
        "Son exactamente iguales",
        "useradd es interactivo y adduser no",
        "adduser solo crea grupos"
      ],
      a: 0,
      exp: "adduser (Debian) es una capa amigable que automatiza todo. useradd es el comando básico que, sin opciones como -m, NO crea el $HOME ni copia /etc/skel."
    },
    {
      q: "¿Qué hace 'userdel' (sin opciones) respecto al directorio personal?",
      opts: [
        "Por defecto NO borra el $HOME; hay que usar userdel -r para eliminarlo",
        "Borra siempre el $HOME",
        "Mueve el $HOME a /tmp",
        "Cifra el $HOME"
      ],
      a: 0,
      exp: "userdel por defecto deja el $HOME. Con -r se elimina también el directorio personal y su correo."
    }
  ],

  // -------------------------------------------------------------------------
  //  PREGUNTAS DEL PROFESOR (a rellenar)
  // -------------------------------------------------------------------------
  profQuiz: [],

  // -------------------------------------------------------------------------
  //  EJERCICIOS (verificables en el simulador + conceptuales)
  // -------------------------------------------------------------------------
  exercises: [
    {
      title: "Práctica · Crear grupo y usuarios de ejemplo",
      desc: "Como en los apuntes: crea el grupo <code>clase</code> ya existe; crea los usuarios <code>usuario1</code> y <code>usuario2</code> con grupo primario <code>clase</code>, y <code>usuario3</code> con su propio grupo.",
      hint: "adduser usuario1 --ingroup clase ; adduser usuario2 --ingroup clase ; adduser usuario3",
      setup: "",
      check: function (s) {
        const u1 = s.getUser("usuario1"), u2 = s.getUser("usuario2"), u3 = s.getUser("usuario3");
        const clase = s.getGroup("clase");
        if (!u1 || !u2 || !u3 || !clase) return false;
        return u1.gid === clase.gid && u2.gid === clase.gid && u3.gid !== clase.gid;
      },
      solutionText: "<code>adduser usuario1 --ingroup clase</code><br><code>adduser usuario2 --ingroup clase</code><br><code>adduser usuario3</code><br>Comprueba: <code>cat /etc/passwd</code> y <code>id usuario1</code>",
      goal: "usuario1 y usuario2 con grupo primario 'clase'; usuario3 con grupo propio"
    },
    {
      title: "Práctica · Añadir pas al grupo sudo",
      desc: "Asegúrate de que tu usuario administrador <code>pas</code> pertenece al grupo <code>sudo</code> (añádelo de nuevo si quieres practicar el comando, es idempotente).",
      hint: "usermod -aG sudo pas   (el flag -aG añade SIN quitar de otros grupos)",
      setup: "",
      check: function (s) { return s.userInGroup("pas", "sudo"); },
      solutionText: "<code>usermod -aG sudo pas</code><br>Comprueba: <code>groups pas</code> o <code>id pas</code>",
      goal: "pas pertenece al grupo 'sudo'"
    },
    {
      title: "Práctica · Crear usuario y ponerle contraseña",
      desc: "Crea un usuario <code>ana</code> con <code>useradd -m</code> y asígnale una contraseña con <code>passwd</code>. Mira cómo cambia su línea en <code>/etc/shadow</code> (de <code>!</code> a un hash <code>$y$…</code>).",
      hint: "useradd -m ana ; cat /etc/shadow | grep ana ; passwd ana ; cat /etc/shadow | grep ana",
      setup: "",
      check: function (s) {
        const u = s.getUser("ana");
        return u && u.shadow.pass.startsWith("$") && u.pw === "x";
      },
      solutionText: "<code>useradd -m ana</code>  (crea ana; en shadow aparece '!')<br><code>passwd ana</code>  (ahora shadow tiene un hash $y$…)<br><code>cat /etc/shadow | grep ana</code>",
      goal: "ana existe y tiene una contraseña cifrada en /etc/shadow"
    },
    {
      title: "Práctica · Restricciones de tiempo con chage",
      desc: "Sobre <code>ana</code>, reproduce el ejemplo de los apuntes: contraseña a cambiar cada <b>20</b> días, aviso <b>6</b> días antes, bloqueo <b>5</b> días tras caducar e <b>expiración de la cuenta el 2026-10-30</b>.",
      hint: "chage -M 20 ana ; chage -W 6 ana ; chage -I 5 ana ; chage -E 2026-10-30 ana ; chage -l ana",
      setup: "useradd -m ana",
      check: function (s) {
        const u = s.getUser("ana");
        if (!u) return false;
        const sh = u.shadow;
        return sh.max === 20 && sh.warn === 6 && sh.inactive === 5 && sh.expired === "2026-10-30";
      },
      solutionText: "<code>chage -M 20 ana</code><br><code>chage -W 6 ana</code><br><code>chage -I 5 ana</code><br><code>chage -E 2026-10-30 ana</code><br>Verifica con <code>chage -l ana</code>",
      goal: "ana con maxlife=20, warn=6, inactive=5, expira 2026-10-30"
    },
    {
      title: "Práctica · Bloquear el acceso de un usuario (Ej. 1)",
      desc: "Impide que <code>usuario3</code> pueda iniciar sesión interactiva cambiándole el intérprete a <code>/sbin/nologin</code>.",
      hint: "usermod -s /sbin/nologin usuario3   (también valdría chsh -s /sbin/nologin usuario3)",
      setup: "adduser usuario3",
      check: function (s) {
        const u = s.getUser("usuario3");
        return u && (u.shell === "/sbin/nologin" || u.shell === "/bin/false");
      },
      solutionText: "<code>usermod -s /sbin/nologin usuario3</code><br>Otras formas de bloquear: <code>usermod -L usuario3</code> (bloquea la contraseña), poner <code>*</code> o <code>!</code> en /etc/shadow, o caducar la cuenta con <code>chage -E 0</code>.",
      goal: "usuario3 con shell /sbin/nologin (o /bin/false)"
    },
    {
      title: "Práctica · Cambiar el grupo primario (Ej. 2)",
      desc: "Cambia el grupo PRIMARIO de <code>usuario1</code> al grupo <code>profesores</code>.",
      hint: "El primario se cambia con usermod -g (no -aG, que es para secundarios): usermod -g profesores usuario1",
      setup: "adduser usuario1 --ingroup clase",
      check: function (s) {
        const u = s.getUser("usuario1"), p = s.getGroup("profesores");
        return u && p && u.gid === p.gid;
      },
      solutionText: "<code>usermod -g profesores usuario1</code><br>Comprueba el 4º campo en <code>cat /etc/passwd</code> o con <code>id usuario1</code>. El grupo primario se determina por el gid de /etc/passwd.",
      goal: "usuario1 con grupo primario 'profesores'"
    },

    // ----- Conceptuales (Ver respuesta) -----
    {
      concept: true,
      title: "Ej. 1 · Formas de impedir el acceso al sistema",
      desc: "Comenta distintas formas de imposibilitar el acceso al sistema por parte de un usuario.",
      answer:
`<ul>
  <li>Cambiar su <b>shell</b> a <code>/bin/false</code> o <code>/sbin/nologin</code> (no llega a abrir sesión interactiva).</li>
  <li><b>Bloquear la contraseña</b>: <code>usermod -L usuario</code> o <code>passwd -l usuario</code> (antepone <code>!</code> al hash en /etc/shadow). Desbloquear: <code>-U</code>.</li>
  <li>Poner <code>*</code> o <code>!!</code> en el campo de contraseña de /etc/shadow (cuenta desactivada).</li>
  <li><b>Caducar la cuenta</b>: <code>chage -E 0 usuario</code> (o una fecha pasada) la deshabilita.</li>
  <li>Eliminar la cuenta: <code>userdel usuario</code> (drástico).</li>
</ul>`
    },
    {
      concept: true,
      title: "Ej. 3 · Diferencias entre máscaras 077, 027, 022 y 755",
      desc: "Explica las diferencias entre esas umask y cómo cambiarlas por defecto (de un usuario, de todos, y forzarlas).",
      answer:
`<p>Recuerda: fichero = 666 − umask, directorio = 777 − umask.</p>
<table class="ref-table" style="width:auto"><tr><th>umask</th><th>fichero</th><th>directorio</th><th>idea</th></tr>
<tr><td>077</td><td>600 (rw-------)</td><td>700 (rwx------)</td><td>privado total: nadie salvo el dueño</td></tr>
<tr><td>027</td><td>640 (rw-r-----)</td><td>750 (rwxr-x---)</td><td>grupo lee, otros nada</td></tr>
<tr><td>022</td><td>644 (rw-r--r--)</td><td>755 (rwxr-xr-x)</td><td>todos leen (por defecto habitual)</td></tr>
<tr><td>755</td><td>(022 efectivo en fichero: 022→ raro)</td><td>022 (-w--wx-wx)</td><td>máscara ABSURDA: quita r al dueño; no se usa</td></tr></table>
<p><b>Cambiarla:</b> de un usuario → en su <code>~/.bashrc</code> o <code>~/.profile</code> (<code>umask 027</code>). De todos → en <code>/etc/profile</code>, <code>/etc/bash.bashrc</code> o <code>/etc/login.defs</code> (UMASK). <b>Forzarla</b> (que no la cambien) → mediante PAM (<code>pam_umask</code>) o políticas, ya que el usuario siempre puede ejecutar <code>umask</code> en su sesión.</p>`
    },
    {
      concept: true,
      title: "Ej. 4 · ¿Root puede cambiar/leer la contraseña?",
      desc: "¿Es cierto que el administrador puede modificar el password de un usuario? ¿Puede ejecutar algún programa que le permita leerla?",
      answer:
`<p><b>Modificarla: SÍ.</b> root puede cambiar la contraseña de cualquiera con <code>passwd usuario</code> (sin conocer la anterior).</p>
<p><b>Leerla: NO.</b> En /etc/shadow solo está el <b>hash</b> (resumen de un solo sentido), no la contraseña. No existe un programa que la "des-cifre". Lo único que puede hacer un atacante con el hash es intentar <b>romperlo por fuerza bruta/diccionario</b> (john, hashcat), pero eso no es "leerla".</p>`
    },
    {
      concept: true,
      title: "Ej. 5 · newgrp + permisos sobre 'prueba'",
      desc: "Partiendo de <code>-rw-rw-r-- 1 root profesores prueba</code>, tras <code>newgrp profesores</code> ¿qué producen?  1) <code>chmod o+w prueba</code>  2) <code>echo \"HOLA\" >> prueba</code>  3) <code>cat prueba</code>",
      answer:
`<ol>
  <li><b>chmod o+w prueba → falla (Operation not permitted).</b> chmod solo lo puede hacer el <b>dueño</b> del fichero (root) o root. pagutierrez no es el dueño.</li>
  <li><b>echo "HOLA" >> prueba → funciona.</b> Tras <code>newgrp profesores</code>, su grupo activo es 'profesores', que es el grupo del fichero con permiso <code>rw-</code>. Puede escribir (append).</li>
  <li><b>cat prueba → muestra "HOLA".</b> El grupo tiene <code>r</code>, así que puede leerlo.</li>
</ol>
<p>Clave: chmod depende de ser <b>propietario</b>; leer/escribir depende de los <b>bits de permiso</b> del grupo al que ahora perteneces de forma activa.</p>`
    },
    {
      concept: true,
      title: "Ej. 6 · Inconsistencia en /etc/passwd",
      desc: "Comenta el fichero /etc/passwd dado y di si hay alguna inconsistencia.",
      answer:
`<p>Líneas problemáticas:</p>
<pre>list:x:38:38:Mailing List Manager:/var/list:/bin/sh
irc:x:38:39:ircd:/var/run/ircd:/bin/sh</pre>
<p><b>Inconsistencia:</b> <code>list</code> e <code>irc</code> tienen el <b>mismo UID (38)</b>. Dos usuarios con igual UID son, a efectos del kernel, <b>el mismo usuario</b> en cuanto a propiedad y permisos: un fallo de configuración. (Lo detecta <code>pwck</code>.)</p>
<p>El resto es normal: root UID 0; pseudo-usuarios de servicios (daemon, sync, games, nobody=65534) con UID bajos y shell /bin/sh o /bin/false; pagutierrez es el usuario real (UID 1000, /bin/bash).</p>`
    },
    {
      concept: true,
      title: "Ej. 7 · ls /etc/skel no muestra nada",
      desc: "¿Por qué <code>ls /etc/skel/</code> no produce salida? ¿Qué ficheros esperarías?",
      answer:
`<p><code>ls</code> sin <code>-a</code> <b>no muestra los ficheros ocultos</b> (los que empiezan por punto), y casi todo lo de /etc/skel es oculto. Por eso "parece" vacío.</p>
<p>Con <code>ls -a /etc/skel/</code> verías: <code>.bashrc</code>, <code>.profile</code>, <code>.bash_logout</code> (y a veces <code>.bash_profile</code>). Son los ficheros de inicialización que se copian al <code>$HOME</code> de cada usuario nuevo.</p>`
    },
    {
      concept: true,
      title: "Actividad 1 · El efecto avalancha del hash",
      desc: "¿Qué hace <code>echo \"ibase=16;obase=2;$(echo \"HOLA3\" | sha1sum | tr -d ' -' | tr '[a-z]' '[A-Z]')\" | bc</code>?",
      answer:
`<p>Calcula el <b>SHA-1</b> de la cadena, lo limpia (quita el espacio y el guion de la salida de sha1sum), lo pasa a <b>mayúsculas</b> (porque <code>bc</code> exige A-F en hexadecimal) y con <code>ibase=16;obase=2</code> lo <b>convierte de hexadecimal a binario</b>. Resultado: el resumen en bits.</p>
<p><b>Efecto avalancha:</b> si cambias <b>un solo bit</b> de la entrada (p.ej. "HOLA3" → "HOLA2"), <b>más de la mitad</b> de los bits del resumen cambian. Es una propiedad deseable de las funciones hash: pequeñas variaciones en la entrada producen salidas totalmente distintas, impredecibles.</p>
<p>Pruébalo en una terminal real con <code>sha1sum</code> (este simulador no calcula hashes reales).</p>`
    }
  ],

  // -------------------------------------------------------------------------
  //  RESUMEN
  // -------------------------------------------------------------------------
  summary: [
    {
      h: "1. Usuarios y pseudo-usuarios",
      points: [
        "<b>Usuario</b>: persona que trabaja en el sistema. <b>Pseudo-usuario</b>: entidad no-persona que ejecuta servicios o posee ficheros (daemon, www-data, mysql, nobody…).",
        "Información mínima: nombre (logname), <b>UID</b> (con el que trabaja internamente el sistema) y <b>GID</b> de los grupos.",
        "El UID es lo que da privilegios: <b>root = UID 0</b>."
      ]
    },
    {
      h: "2. /etc/passwd",
      points: [
        "Formato: <code>nombre:password:uid:gid:gecos:home:shell</code>.",
        "Campo password: <code>x</code> = shadow activas (hash en /etc/shadow); <code>*</code> = cuenta desactivada; <code>!!</code> = bloqueada/sin contraseña.",
        "gid = grupo PRIMARIO. gecos = info (nombre, teléfono). home = $HOME. shell = intérprete.",
        "Propietario root:root, permisos <b>rw-r--r--</b> (legible por todos; por eso las contraseñas se sacan a shadow). Editar con <code>vipw</code>, verificar con <code>pwck</code>."
      ]
    },
    {
      h: "3. Contraseñas",
      points: [
        "<code>passwd usuario</code> asigna/cambia la contraseña.",
        "Buenas prácticas: no usar palabras de diccionario ni datos personales; mezclar mayúsc/minúsc, símbolos, concatenar palabras…",
        "Herramientas de robustez: <code>pam_cracklib</code>, <code>pam_pwquality</code>, <code>cracklib-check</code>.",
        "Cambiarla si se sospecha fuga; al irse un admin → cambiar TODAS. Truco: un espacio antes del comando evita guardarlo en ~/.bash_history."
      ]
    },
    {
      h: "4. Shadow passwords y hashing",
      points: [
        "<code>/etc/shadow</code> guarda el <b>hash</b> de la contraseña + envejecimiento. Permisos <b>rw-------</b> (root) o <b>rw-r-----</b> (grupo shadow).",
        "Formato: <code>nom:pass:changed:min:max:warn:inactive:expired:</code>",
        "Hash = función de <b>un solo sentido</b> H(C): fácil de calcular, imposible de invertir, sin colisiones. Se usa <b>sal (salt)</b> aleatoria para frenar diccionarios/rainbow tables.",
        "Formato del campo: <code>$id$[parámetros]$salt$hash</code>. IDs: <code>$1$</code>=MD5, <code>$2a/$2y$</code>=Blowfish, <code>$5$</code>=SHA-256, <code>$6$</code>=SHA-512, <code>$y$</code>=yescrypt.",
        "Comandos: <code>mkpasswd</code>, <code>md5sum</code>, <code>shasum</code>, <code>pwconv</code>/<code>pwunconv</code>."
      ]
    },
    {
      h: "5. Restricciones de tiempo (chage)",
      points: [
        "<code>changed</code>=último cambio · <code>min</code>=días para poder cambiarla · <code>max</code>=días máx con la misma · <code>warn</code>=aviso previo · <code>inactive</code>=días tras caducar hasta bloquear · <code>expired</code>=fecha de expiración de la cuenta.",
        "<code>chage -l usuario</code> lista; <code>-M</code>/<code>-m</code>/<code>-W</code>/<code>-I</code>/<code>-E</code>/<code>-d</code> fijan los valores.",
        "Valores por defecto en <code>/etc/login.defs</code>."
      ]
    },
    {
      h: "6. Ficheros de inicialización y /etc/skel",
      points: [
        "<code>/etc/skel/</code>: ficheros que se copian al <b>$HOME</b> de cada usuario nuevo (.bashrc, .profile, .bash_logout…). Son ocultos → <code>ls -a</code> para verlos.",
        "bash: login → <code>.bash_profile</code> (+ <code>.profile</code>); shell interactivo → <code>.bashrc</code>; logout → <code>.bash_logout</code>. (sh: .profile)",
        "Definen PATH, variables de entorno, umask, alias, prompt (PS1)…",
        "Políticas globales por defecto: <code>/etc/login.defs</code>, <code>/etc/profile</code>, <code>/etc/bash.bashrc</code>."
      ]
    },
    {
      h: "7. Intérprete de órdenes y cuentas restrictivas",
      points: [
        "El shell está en el último campo de /etc/passwd. Shells permitidos en <code>/etc/shells</code>. Cambiar con <code>chsh -s</code>.",
        "Sin shell asignado → <code>/bin/sh</code>. Para impedir el login: <code>/bin/false</code> o <code>/sbin/nologin</code>.",
        "<b>Cuenta restrictiva con script</b>: el shell es un ejecutable que hace una tarea y al terminar sale (backup, shutdown…).",
        "<b>rbash</b> (<code>/bin/rbash</code>, = bash -r): prohíbe cd, cambiar $PATH/$HOME, usar '/', redirección y exec. Hay que limitar su PATH a un único directorio con los ejecutables permitidos."
      ]
    },
    {
      h: "8. Añadir usuarios: pasos y herramientas",
      points: [
        "Pasos: decidir nombre/UID/grupos → meter en passwd y group → asignar contraseña → shadow (pwck) → envejecimiento → crear $HOME (propietario/permisos) → copiar /etc/skel → quotas/mail → probar.",
        "<code>adduser</code> (interactivo, hace todo) vs <code>useradd</code> (bajo nivel; sin <code>-m</code> NO crea $HOME ni copia skel).",
        "<code>usermod</code> modifica (-aG añadir a secundarios, -g cambiar primario, -s shell, -l renombrar, -L/-U bloquear/desbloquear).",
        "<code>userdel</code>/<code>deluser</code> (por defecto NO borra $HOME; <code>-r</code> sí). <code>newusers</code> crea en lote desde un fichero."
      ]
    },
    {
      h: "9. Grupos",
      points: [
        "Colecciones de usuarios que comparten recursos. <code>/etc/group</code>: <code>nombre:x:gid:lista_de_miembros</code>.",
        "<b>Primario</b> (gid en /etc/passwd) vs <b>secundarios</b> (en /etc/group). El <b>grupo activo</b> es el que se asigna a los ficheros nuevos (primario salvo <code>newgrp</code>).",
        "Herramientas: <code>addgroup</code>/<code>groupadd</code>, <code>groupmod</code>, <code>delgroup</code>/<code>groupdel</code>, <code>groups</code>, <code>id</code>, <code>grpck</code>, <code>usermod -aG</code>.",
        "Contraseñas de grupo (poco usadas): <code>/etc/gshadow</code>, <code>gpasswd</code>, <code>newgrp</code> (adopta el grupo si sabes su contraseña)."
      ]
    },
    {
      h: "10. Usuarios y grupos estándar (rangos UID)",
      points: [
        "<b>UID 0–99</b>: el propio SO. <b>100–499</b>: servicios/programas. <b>≥ 1000</b>: usuarios normales. (pseudo-usuarios 0–999 o hasta 499).",
        "Usuarios estándar: <code>root</code>(0), <code>daemon</code>, <code>bin</code>, <code>sync</code>, <code>mail</code>, <code>nobody</code>(65534), <code>www-data</code>, <code>mysql</code>…",
        "Grupos estándar: <code>root</code>(0), <code>sys</code>(3), <code>bin</code>(2), <code>daemon</code>(1), <code>disk</code>, <code>www-data</code>(33), <code>kmem</code> (leer memoria del kernel)…"
      ]
    }
  ]
};
