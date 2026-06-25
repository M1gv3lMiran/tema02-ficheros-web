/* ===========================================================================
 *  Contenido del Tema 2 — Organización de un SO tipo GNU/Linux (ficheros)
 *  Preguntas, ejercicios y resumen extraídos del PDF tema02-ficheros.pdf
 * ========================================================================= */

window.DATA = {

  // -------------------------------------------------------------------------
  //  PREGUNTAS TIPO TEST (elaboradas a partir del contenido del PDF)
  // -------------------------------------------------------------------------
  quiz: [
    {
      q: "Según la filosofía de GNU/Linux vista en el tema, ¿qué afirmación es correcta?",
      opts: [
        "Todo son ficheros; «si algo no es un fichero, entonces es un proceso»",
        "Solo los datos de usuario son ficheros, los dispositivos no",
        "Los programas no se consideran ficheros",
        "Los sockets y tuberías no forman parte del sistema de ficheros"
      ],
      a: 0,
      exp: "En GNU/Linux todo son ficheros (programas, dispositivos I/O, sockets, pipes, directorios…). Lo que no es un fichero es un proceso."
    },
    {
      q: "¿Qué son los nodos-i (i-nodes)?",
      opts: [
        "Metadatos del fichero: tamaño, permisos, posición de sus sectores, nº de enlaces…",
        "El contenido de datos del fichero",
        "El nombre del fichero",
        "Un tipo de partición del disco"
      ],
      a: 0,
      exp: "El nodo-i guarda los METADATOS (tamaño, permisos, ubicación de los sectores, nº de enlaces…). Ojo: NO guarda el nombre del fichero."
    },
    {
      q: "¿Con qué comando puedes ver el número de nodo-i de los ficheros?",
      opts: ["ls -i", "ls -l", "df -i", "stat -n"],
      a: 0,
      exp: "ls -i muestra el inodo. df -i muestra cuántos nodos-i quedan libres en el sistema de ficheros (es otra cosa)."
    },
    {
      q: "En la cadena de permisos -rwxrw-r--, ¿qué permisos tiene el GRUPO propietario?",
      opts: ["rw- (lectura y escritura)", "rwx (todos)", "r-- (solo lectura)", "--- (ninguno)"],
      a: 0,
      exp: "Se lee en bloques de 3: usuario=rwx, grupo=rw-, otros=r--. El grupo tiene lectura y escritura, pero no ejecución."
    },
    {
      q: "¿Qué comando cambia el USUARIO propietario de un fichero?",
      opts: ["chown", "chgrp", "chmod", "chusr"],
      a: 0,
      exp: "chown cambia el usuario (y opcionalmente el grupo con usuario:grupo). chgrp cambia solo el grupo. Requiere privilegios de root."
    },
    {
      q: "Sobre un FICHERO, ¿qué permite el permiso de ejecución (x)?",
      opts: [
        "Ejecutar el fichero",
        "Listar su contenido",
        "Entrar dentro de él",
        "Crear ficheros dentro"
      ],
      a: 0,
      exp: "En un fichero: r=ver contenido, w=modificar contenido, x=ejecutar. En un directorio: r=listar, w=crear/eliminar ficheros, x=entrar."
    },
    {
      q: "Sobre un DIRECTORIO, ¿qué permite el permiso de escritura (w)?",
      opts: [
        "Crear y eliminar ficheros dentro del directorio",
        "Modificar el contenido de los ficheros que contiene",
        "Entrar en el directorio",
        "Ejecutar el directorio"
      ],
      a: 0,
      exp: "En un directorio w permite crear/eliminar ficheros. x permite entrar (cd) y r permite listar (ls)."
    },
    {
      q: "¿Cuál es el equivalente en modo ABSOLUTO de los permisos rwxr-xr--?",
      opts: ["754", "755", "744", "750"],
      a: 0,
      exp: "rwx=4+2+1=7, r-x=4+0+1=5, r--=4+0+0=4 → 754."
    },
    {
      q: "¿Cuál de estos comandos chmod es modo SIMBÓLICO?",
      opts: ["chmod u=rwx,go= fichero", "chmod 740 fichero", "chmod 0644 fichero", "chmod 1777 dir"],
      a: 0,
      exp: "El modo simbólico usa u/g/o/a con +,-,= y rwx. El modo absoluto usa dígitos octales (740, 0644, 1777)."
    },
    {
      q: "Tienes un fichero rw------- y ejecutas chmod a+x. ¿Resultado?",
      opts: ["rwx--x--x", "rwxrwxrwx", "rwx------", "-wx--x--x"],
      a: 0,
      exp: "a+x añade ejecución a todos (usuario, grupo y otros) sin tocar el resto: rw-------  →  rwx--x--x."
    },
    {
      q: "¿Qué hace el permiso especial SUID sobre un ejecutable?",
      opts: [
        "Durante la ejecución, el usuario efectivo del proceso es el PROPIETARIO del fichero, no quien lo ejecuta",
        "Impide que nadie salvo root lo borre",
        "Hace que el grupo del proceso sea el del fichero",
        "Mantiene la imagen del fichero en memoria"
      ],
      a: 0,
      exp: "SUID (chmod u+s): cambio de dominio a nivel de usuario. Por eso passwd (rwsr-xr-x) puede modificar /etc/shadow siendo lanzado por un usuario normal."
    },
    {
      q: "El comando passwd aparece como -rwsr-xr-x. ¿Por qué un usuario normal puede cambiar su contraseña?",
      opts: [
        "Por el bit SUID: el proceso se ejecuta con los permisos de root (propietario), que sí puede escribir en /etc/shadow",
        "Porque /etc/shadow tiene permisos rwxrwxrwx",
        "Porque passwd tiene el sticky bit activado",
        "Porque cualquiera puede escribir en /etc/passwd"
      ],
      a: 0,
      exp: "/etc/shadow es rw-r----- root shadow. Gracias al SUID de passwd, el proceso adopta el dominio de root y puede modificarlo."
    },
    {
      q: "¿Qué hace el permiso especial SGID sobre un DIRECTORIO?",
      opts: [
        "Los ficheros creados dentro heredan el GRUPO del directorio, no el del usuario que los crea",
        "Solo root puede entrar",
        "El usuario efectivo pasa a ser el propietario",
        "Se ignora siempre"
      ],
      a: 0,
      exp: "SGID en directorio: al crear un fichero dentro, su grupo propietario es el del directorio. Ej.: pagutierrez copia tema2.pdf a /practicas (drwxr-sr-x grupo alumnos) → el fichero queda con grupo alumnos."
    },
    {
      q: "¿Qué efecto tiene el STICKY BIT sobre un directorio (como /tmp)?",
      opts: [
        "Solo root o el propietario del fichero (o de la carpeta) pueden borrar/renombrar un fichero, aunque otros tengan w en la carpeta",
        "Hace que todos puedan borrar cualquier fichero",
        "Cambia el usuario efectivo del proceso",
        "Impide entrar en el directorio"
      ],
      a: 0,
      exp: "El sticky bit (chmod o+t, octal 1) protege los ficheros de borrado por terceros en directorios compartidos como /tmp (drwxrwxrwt)."
    },
    {
      q: "En ls -l ves -rwsr-xr-x. La 's' minúscula en el lugar de la x del usuario indica…",
      opts: [
        "SUID activado Y el bit de ejecución del usuario también activado",
        "SUID activado pero SIN ejecución (estado inconsistente, sería 'S')",
        "Sticky bit del usuario",
        "Que el fichero es un enlace simbólico"
      ],
      a: 0,
      exp: "s minúscula = SUID + x. S mayúscula = SUID sin x (inconsistente). Lo mismo con SGID (s/S en el grupo) y sticky (t/T en otros)."
    },
    {
      q: "La umask por defecto suele ser 0002. ¿Qué indica el valor de la máscara?",
      opts: [
        "En modo absoluto, los bits de permiso que quedan RESTRINGIDOS (se quitan) al crear ficheros/directorios",
        "Los permisos que se AÑADEN a los ficheros nuevos",
        "El nodo-i por defecto",
        "El número máximo de enlaces"
      ],
      a: 0,
      exp: "La umask indica qué bits se restringen. Permisos resultantes = base AND (NOT umask). Base: 666 ficheros, 777 directorios."
    },
    {
      q: "Con umask 027, ¿con qué permisos se crea un DIRECTORIO nuevo (mkdir)?",
      opts: ["750 (rwxr-x---)", "640 (rw-r-----)", "755 (rwxr-xr-x)", "777 (rwxrwxrwx)"],
      a: 0,
      exp: "777 - 027 = 750 → rwxr-x---. Para un fichero sería 666 - 027 = 640 (rw-r-----). La x no se pone con umask en ficheros."
    },
    {
      q: "¿Se puede crear una umask que permita crear FICHEROS con permiso de ejecución?",
      opts: [
        "No: la base de los ficheros es 666 (sin x), la máscara solo puede QUITAR bits, nunca añadirlos",
        "Sí, con umask 111",
        "Sí, con umask 000",
        "Sí, solo en /tmp"
      ],
      a: 0,
      exp: "La umask solo restringe. Como la base de ficheros es 666 (no tiene x), ninguna máscara puede dar permiso de ejecución a un fichero nuevo."
    },
    {
      q: "Los cambios hechos con el comando umask en la terminal…",
      opts: [
        "No son definitivos: se reestablecen al valor por defecto al cerrar la terminal",
        "Son permanentes para todo el sistema",
        "Modifican /etc/passwd",
        "Solo afectan a root"
      ],
      a: 0,
      exp: "umask afecta solo a la sesión actual. Al cerrar la terminal vuelve al valor por defecto (configurado en perfiles del sistema)."
    },
    {
      q: "¿Qué caracteriza a un ENLACE FÍSICO (hard link)?",
      opts: [
        "Es otro nombre para el mismo nodo-i; si borras el original, el dato persiste mientras quede algún enlace",
        "Es un fichero de texto que contiene la ruta al original",
        "Puede apuntar a directorios y entre particiones distintas",
        "Tiene su propio nodo-i diferente al del original"
      ],
      a: 0,
      exp: "El hard link comparte el MISMO nodo-i (mismo número en ls -li y el contador de enlaces sube). No funciona entre particiones ni con directorios."
    },
    {
      q: "¿Qué caracteriza a un ENLACE SIMBÓLICO (symbolic link)?",
      opts: [
        "Es un fichero con nodo-i PROPIO que contiene la ruta (puntero virtual) al fichero real",
        "Comparte el nodo-i con el original",
        "No se puede crear con ln",
        "Si lo borras, se borra el fichero original"
      ],
      a: 0,
      exp: "El symlink (ln -s) tiene su propio nodo-i y guarda la ruta del destino (acceso directo). En ls -l aparece como l...... y -> destino."
    },
    {
      q: "Limitaciones del enlace FÍSICO frente al simbólico:",
      opts: [
        "Solo entre ficheros de la MISMA partición y NO se pueden hacer a directorios",
        "Solo funciona con directorios",
        "Solo entre particiones distintas",
        "No tiene ninguna limitación"
      ],
      a: 0,
      exp: "El hard link no cruza particiones (el nodo-i es local a la partición) ni se aplica a directorios. El simbólico sí puede cruzar particiones y apuntar a directorios."
    },
    {
      q: "¿Qué tipo de fichero representa /dev/sda1?",
      opts: [
        "Fichero especial de BLOQUES: la primera partición del primer disco",
        "Un enlace simbólico",
        "Una tubería con nombre (FIFO)",
        "Un socket"
      ],
      a: 0,
      exp: "/dev/sda = primer disco entero; /dev/sda1 = su primera partición. Los discos NVMe aparecen como /dev/nvme0n1, /dev/nvme0n1p1…"
    },
    {
      q: "En ls -l, ¿qué letra identifica a un fichero especial de CARÁCTER?",
      opts: ["c", "b", "p", "s"],
      a: 0,
      exp: "Tipos: - normal, d directorio, b bloque, c carácter, p named pipe (FIFO), s socket, l enlace simbólico."
    },
    {
      q: "¿Cuál es la diferencia entre un Named Pipe (p) y un Socket (s)?",
      opts: [
        "El pipe es comunicación FIFO (un sentido); el socket permite comunicación dúplex (ambos sentidos)",
        "El socket es más lento siempre",
        "El pipe solo lo usa root",
        "No hay diferencia"
      ],
      a: 0,
      exp: "Named pipe (FIFO): comunicación entre procesos en un sentido. Socket: como los pipes pero dúplex (ej. /tmp/.X11-unix/X0)."
    },
    {
      q: "Según el FHS, ¿qué directorio contiene la mayoría de ficheros de CONFIGURACIÓN del sistema?",
      opts: ["/etc", "/var", "/opt", "/usr/lib"],
      a: 0,
      exp: "/etc → configuración local del sistema (solo texto). /var → datos variables (logs, colas). /opt → paquetes estáticos."
    },
    {
      q: "Según el FHS, ¿qué directorio es el HOME del administrador (root)?",
      opts: ["/root", "/home/root", "/admin", "/sys"],
      a: 0,
      exp: "/root es el directorio HOME del superusuario. /home contiene los directorios del resto de usuarios."
    },
    {
      q: "¿Qué contienen /proc y /sys?",
      opts: [
        "Son sistemas de ficheros VIRTUALES con información de procesos, núcleo, módulos y dispositivos",
        "Los binarios del sistema",
        "Los logs y colas de impresión",
        "El gestor de arranque"
      ],
      a: 0,
      exp: "/proc y /sys son sistemas de ficheros virtuales (no ocupan disco real) que exponen el estado del núcleo y los procesos como ficheros."
    },
    {
      q: "En la clasificación del FHS, ¿qué significa contenido ESTÁTICO?",
      opts: [
        "Binarios, bibliotecas y documentación que no cambian sin intervención del administrador (pueden ser read-only)",
        "Ficheros que cambian constantemente y necesitan backup frecuente",
        "Ficheros que se pueden usar en otra máquina",
        "Ficheros temporales que se borran al apagar"
      ],
      a: 0,
      exp: "Estático: no cambia solo (ej. /bin, /sbin, /opt, /boot, /usr/bin). Dinámico: cambia y necesita backup (ej. /var/mail, /var/spool, /home)."
    },
    {
      q: "¿Qué comando muestra los dispositivos de bloques y sus puntos de montaje?",
      opts: ["lsblk", "ls -b", "df -i", "blkdev"],
      a: 0,
      exp: "lsblk lista los dispositivos de bloques (discos y particiones) con tamaño, tipo y MOUNTPOINT. Pertenece a util-linux."
    },
    {
      q: "En el directorio /tmp se ve drwxrwxrwt. La 't' final significa que…",
      opts: [
        "Tiene el sticky bit: cada usuario solo puede borrar sus propios ficheros pese a la w para todos",
        "Todos pueden borrar todo",
        "Es un enlace temporal",
        "Está montado como solo lectura"
      ],
      a: 0,
      exp: "La t (sticky bit) en /tmp evita que un usuario borre ficheros de otro, aunque el directorio tenga w para todos."
    }
  ],

  // -------------------------------------------------------------------------
  //  PREGUNTAS DEL PROFESOR (Wayground) — a rellenar manualmente
  // -------------------------------------------------------------------------
  // No se pudieron extraer automáticamente del enlace de partida en vivo.
  // Pega aquí las preguntas con el mismo formato que las de "quiz".
  profQuiz: [
    // Ejemplo de formato:
    // { q: "Texto de la pregunta", opts: ["A","B","C","D"], a: 0, exp: "Explicación" },
  ],

  // -------------------------------------------------------------------------
  //  EJERCICIOS DEL PDF (verificables en la terminal)
  // -------------------------------------------------------------------------
  exercises: [
    {
      title: "Ejercicio 1 — Permisos (apartado a)",
      desc: "Crea un fichero <code>ejemplo</code> y establece permisos de <b>escritura solo para el usuario propietario</b>, <b>lectura para todos</b> y <b>ejecución para usuario y grupo</b> propietarios. Pruébalo en modo simbólico y absoluto.",
      hint: "Usuario: r+w+x (escritura+lectura+ejecución). Grupo: r+x. Otros: r. → octal 754.",
      setup: "touch ejemplo",
      check: function (sh) {
        const oct = sh.octal("ejemplo");
        return oct === "754";
      },
      solutionText: "Simbólico: <code>chmod u=rwx,g=rx,o=r ejemplo</code> &nbsp;·&nbsp; Absoluto: <code>chmod 754 ejemplo</code>",
      goal: "ejemplo debe quedar en 754 (rwxr-xr--)"
    },
    {
      title: "Ejercicio 1 — Permisos (apartado b)",
      desc: "Sobre <code>ejemplo</code>: <b>escritura solo para el propietario</b>, <b>ejecución para usuario y grupo</b> propietarios y <b>nada para el resto</b>.",
      hint: "Usuario: w+x. Grupo: x. Otros: nada. → octal 310.",
      setup: "touch ejemplo",
      check: function (sh) {
        return sh.octal("ejemplo") === "310";
      },
      solutionText: "Simbólico: <code>chmod u=wx,g=x,o= ejemplo</code> &nbsp;·&nbsp; Absoluto: <code>chmod 310 ejemplo</code>",
      goal: "ejemplo debe quedar en 310 (-wx--x---)"
    },
    {
      title: "Ejercicio 2 — Sticky bit en un fichero",
      desc: "Reproduce el ejemplo del PDF: crea <code>carpeta</code>, entra, crea <code>fichero</code> y ponle <code>o+w+t</code>. Observa el resultado con <code>ls -la fichero</code>. (¿Qué sentido tiene el sticky bit en un fichero? Ninguno práctico: solo aplica a directorios.)",
      hint: "mkdir -p carpeta && cd carpeta ; touch fichero ; chmod o+w+t fichero ; ls -la fichero",
      setup: "",
      check: function (sh) {
        const n = sh.getNode("fichero") || sh.getNode("carpeta/fichero");
        if (!n) return false;
        return (n.perms & 0o2) === 0o2 && (n.perms & 0o1000) === 0o1000; // o+w y sticky
      },
      solutionText: "<code>mkdir -p carpeta && cd carpeta</code><br><code>touch fichero</code><br><code>chmod o+w+t fichero</code>",
      goal: "fichero con escritura para otros y sticky bit activado (ls muestra ...rwt)"
    },
    {
      title: "Ejercicio 3 — umask y directorios",
      desc: "Establece <code>umask 027</code>, crea <code>/tmp/prueba1</code> con <code>mkdir -p</code> y comprueba con <code>ls -ld /tmp/prueba1</code> que sale <code>drwxr-x---</code>.",
      hint: "umask 027 ; mkdir -p /tmp/prueba1 ; ls -ld /tmp/prueba1   → 777-027 = 750",
      setup: "",
      check: function (sh) {
        return sh.octal("/tmp/prueba1") === "750";
      },
      solutionText: "<code>umask 027</code><br><code>mkdir -p /tmp/prueba1</code><br><code>ls -ld /tmp/prueba1</code>  →  <code>drwxr-x---</code>",
      goal: "/tmp/prueba1 con permisos 750"
    },
    {
      title: "Ejercicio 4 — umask y ficheros",
      desc: "Con la <code>umask 027</code> anterior, crea <code>/tmp/prueba1/a</code> con <code>touch</code> y comprueba con <code>ls -l</code> que sale <code>-rw-r-----</code>.",
      hint: "touch /tmp/prueba1/a ; ls -l /tmp/prueba1   → 666-027 = 640 (la x no se aplica a ficheros)",
      setup: "umask 027\nmkdir -p /tmp/prueba1",
      check: function (sh) {
        return sh.octal("/tmp/prueba1/a") === "640";
      },
      solutionText: "<code>touch /tmp/prueba1/a</code><br><code>ls -l /tmp/prueba1/</code>  →  <code>-rw-r----- a</code>",
      goal: "/tmp/prueba1/a con permisos 640"
    },
    {
      title: "Ejercicio 5 — Enlace físico vs simbólico",
      desc: "Reproduce el ejemplo del PDF en <code>/tmp</code>: crea <code>prueba</code>, haz un enlace físico <code>enlace_fisico</code> y un enlace simbólico <code>enlace_simbolico</code>. Con <code>ls -li</code> observa que el enlace físico comparte nodo-i (3ª columna = 2 enlaces) y el simbólico tiene nodo-i propio.",
      hint: "cd /tmp ; touch prueba ; ln prueba enlace_fisico ; ln -s prueba enlace_simbolico ; ls -li prueba enlace_fisico enlace_simbolico",
      setup: "cd /tmp",
      check: function (sh) {
        const orig = sh.getNode("/tmp/prueba");
        const hard = sh.getNode("/tmp/enlace_fisico");
        const sym = sh.getNode("/tmp/enlace_simbolico");
        if (!orig || !hard || !sym) return false;
        return orig.inode === hard.inode && orig.links >= 2 && sym.type === "symlink";
      },
      solutionText: "<code>cd /tmp</code><br><code>touch prueba</code><br><code>ln prueba enlace_fisico</code><br><code>ln -s prueba enlace_simbolico</code><br><code>ls -li prueba enlace_fisico enlace_simbolico</code>",
      goal: "enlace_fisico comparte nodo-i con prueba (2 enlaces); enlace_simbolico es de tipo l con nodo-i propio"
    }
  ],

  // -------------------------------------------------------------------------
  //  RESUMEN DE REPASO
  // -------------------------------------------------------------------------
  summary: [
    {
      h: "1. Todo son ficheros",
      points: [
        "«Si algo no es un fichero, entonces es un proceso».",
        "Son ficheros: programas (/bin/ls), dispositivos (/dev/sda), sockets, tuberías (pipes), directorios, datos y configuración.",
        "El sistema de ficheros es jerárquico: la raíz es <code>/</code>. No hay «unidades» (C:, D:) como en Windows."
      ]
    },
    {
      h: "2. Nodos-i (i-nodes)",
      points: [
        "Metadatos del fichero: tamaño, permisos, propietario, posición de los sectores, nº de enlaces… <b>NO el nombre</b>.",
        "Cada fichero tiene un nodo-i. Ver con <code>ls -i</code>.",
        "El nº de nodos-i es limitado. <code>df -i</code> muestra cuántos quedan.",
        "Los ficheros se almacenan «desorganizados» por el disco; el nodo-i sabe dónde están sus sectores."
      ]
    },
    {
      h: "3. Propietarios y permisos",
      points: [
        "Cada fichero tiene dos propietarios: <b>usuario</b> y <b>grupo</b>.",
        "<code>chown usuario fichero</code> · <code>chown usuario:grupo fichero</code> · <code>chgrp grupo fichero</code> (necesitan root).",
        "Cadena: <code>-rwxrw-r--</code> → tipo + 3 bloques (usuario, grupo, otros).",
        "Significado — Fichero: r=ver, w=modificar, x=ejecutar. Directorio: r=listar, w=crear/borrar, x=entrar."
      ]
    },
    {
      h: "4. chmod simbólico y absoluto",
      points: [
        "Simbólico: <code>chmod u+r fichero</code> · <code>chmod u=rwx,go= fichero</code> · <code>chmod -R u+rwx,go-rwx dir</code>.",
        "Absoluto (octal): r=4, w=2, x=1. Ej. <code>chmod 740 fichero</code> = u=rwx, g=r, o=nada.",
        "Destinatarios: u (usuario), g (grupo), o (otros), a (todos)."
      ]
    },
    {
      h: "5. Permisos especiales (4º nivel)",
      points: [
        "<b>SUID</b> (<code>chmod u+s</code>): en ejecutables, el proceso corre con el usuario PROPIETARIO. Ej.: <code>passwd</code> (-rwsr-xr-x) puede editar /etc/shadow. En 'l' aparece <b>s/S</b> en el bit del usuario.",
        "<b>SGID</b> (<code>chmod g+s</code>): en ejecutables, grupo efectivo = grupo del fichero. En directorios, los ficheros creados heredan el grupo del directorio.",
        "<b>Sticky bit</b> (<code>chmod o+t</code>): en directorios (como /tmp, drwxrwxrwt) solo el dueño del fichero, el dueño de la carpeta o root pueden borrar/renombrar.",
        "En octal van delante: 4=suid, 2=sgid, 1=sticky. Ej. <code>chmod 1777 /tmp</code>."
      ]
    },
    {
      h: "6. umask (máscara de permisos)",
      points: [
        "Indica los bits que se <b>restringen</b> al crear ficheros/directorios. Permisos = base AND (NOT umask).",
        "Base: <b>666</b> ficheros, <b>777</b> directorios. La x nunca se da a ficheros nuevos.",
        "umask 0002 (típica): dir → 775, fichero → 664. umask 027: dir → 750, fichero → 640.",
        "No es permanente: se reestablece al cerrar la terminal."
      ]
    },
    {
      h: "7. Tipos de ficheros (ls -l)",
      points: [
        "<code>-</code> normal · <code>d</code> directorio · <code>b</code> especial de bloque · <code>c</code> especial de carácter.",
        "<code>p</code> named pipe (FIFO, un sentido) · <code>s</code> socket (dúplex) · <code>l</code> enlace simbólico."
      ]
    },
    {
      h: "8. Enlaces",
      points: [
        "<b>Físico</b> (<code>ln orig enlace</code>): otro nombre para el MISMO nodo-i. Borrar uno no borra el dato si queda otro. Solo misma partición y NO a directorios.",
        "<b>Simbólico</b> (<code>ln -s orig enlace</code>): fichero con nodo-i propio que guarda la RUTA del original (acceso directo). Puede cruzar particiones y apuntar a directorios.",
        "En <code>ls -li</code>: el físico comparte el nº de nodo-i; el simbólico tiene otro y muestra <code>-> destino</code>."
      ]
    },
    {
      h: "9. Dispositivos (/dev)",
      points: [
        "Se manejan como ficheros: leer/escribir el dispositivo = leer/escribir el fichero.",
        "<code>/dev/sda</code> primer disco · <code>/dev/sda1</code> 1ª partición · <code>/dev/sdb</code> 2º disco · <code>/dev/sdc</code> USB.",
        "<code>/dev/tty1</code> terminal · <code>/dev/lp0</code> puerto paralelo · <code>/dev/fd0</code> disquete · <code>/dev/nvme0n1</code> SSD NVMe.",
        "<code>lsblk</code> lista los dispositivos de bloques y sus puntos de montaje."
      ]
    },
    {
      h: "10. Estructura del sistema de ficheros (FHS)",
      points: [
        "<code>/bin</code> ejecutables básicos · <code>/sbin</code> de administración · <code>/etc</code> configuración · <code>/dev</code> dispositivos.",
        "<code>/home</code> usuarios · <code>/root</code> HOME de root · <code>/lib</code> bibliotecas · <code>/tmp</code> temporales (sticky).",
        "<code>/var</code> variables (logs, spool, mail) · <code>/usr</code> recursos (bin, lib, include, share, src) · <code>/opt</code> paquetes estáticos.",
        "<code>/proc</code> y <code>/sys</code> sistemas de ficheros virtuales · <code>/boot</code> núcleo y arranque · <code>/mnt</code>, <code>/media</code> montajes.",
        "Estático vs dinámico · Compartible vs no compartible. Ver <code>man hier</code>."
      ]
    }
  ]
};
