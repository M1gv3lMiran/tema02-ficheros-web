# PAS — Práctica interactiva (Temas 2, 3 y 5)

Página web interactiva para repasar **Programación y Administración de Sistemas**. Incluye un selector arriba para cambiar entre temas:

- **📁 Tema 2 · Ficheros** — Organización del SO, sistema de ficheros, permisos, enlaces, FHS.
- **👤 Tema 3 · Usuarios** — Gestión de usuarios y grupos, /etc/passwd, shadow passwords, hashing, chage, grupos.
- **⚙️ Tema 5 · Recursos** — Gestión de recursos del sistema: procesos, prioridades y señales, monitorización, temporizadores, memoria/swap y E/S de discos.

🔗 **Web:** _(activa GitHub Pages para obtener la URL — ver más abajo)_

## ¿Qué incluye cada tema?

Ambos temas tienen la misma estructura: **💻 Terminal · 📝 Ejercicios · ❓ Test · 📚 Resumen**.

### Tema 2 (ficheros)
- **Terminal**: mini-shell con sistema de ficheros virtual que ejecuta `ls -l`, `chmod` (simbólico y octal), `chown`, `chgrp`, `ln`, `ln -s`, `umask`, `touch`, `mkdir`, `stat`, `tree`… con permisos, nodos-i, enlaces y bits especiales (suid/sgid/sticky).
- **Ejercicios**: los del PDF + práctica de **permisos absolutos** (generador simbólico↔octal) y demos de umask/enlaces, con comprobación automática.
- **Test** y **Resumen** del tema.

### Tema 3 (usuarios)
- **Terminal**: simulador de gestión de usuarios con `/etc/passwd`, `/etc/shadow` y `/etc/group` virtuales. Comandos `useradd`, `adduser`, `usermod`, `userdel`, `passwd`, `chage`, `chsh`, `groups`, `id`, `newgrp`, `groupadd`…
- **Ejercicios**: prácticas verificables (crear usuarios/grupos, caducidad con chage, bloquear acceso, cambiar grupo primario) + ejercicios conceptuales del PDF con respuesta desplegable.
- **Test** (30 preguntas) y **Resumen** del tema.

### Tema 5 (recursos)
- **Terminal**: simulador de gestión de recursos con una tabla de procesos, memoria/swap, discos y temporizadores. Comandos `ps` (aux/al/-u), `top`, `pstree`, `uptime`, `nice`, `renice`, `kill`/`killall`/`pkill`/`pgrep` (con señales STOP/CONT/KILL…), `free`, `vmstat`, `df`, `du`, `iostat`, `swapon`/`mkswap`/`dd`, `crontab`, `at`/`atq`/`atrm`, `strace`…
- **Ejercicios**: prácticas verificables (renice, suspender/matar procesos, lanzar con nice, crear swap en fichero, añadir tarea a crontab) + los ejercicios conceptuales del PDF *EjerciciosTema5* con respuesta desplegable.
- **Test** y **Resumen** del tema.

## Sobre las preguntas del profesor (Wayground)

El enlace `https://wayground.com/join?gc=24708233` es una página de *unirse a una partida en vivo*: solo entrega las preguntas si la partida está activa y te unes con autenticación de jugador, por lo que **no se pudieron extraer automáticamente**.

Para añadirlas: edita `data.js`, busca el array `profQuiz` y pega tus preguntas con este formato:

```js
profQuiz: [
  { q: "Texto de la pregunta", opts: ["A", "B", "C", "D"], a: 0, exp: "Explicación" },
  // a = índice (0-based) de la opción correcta
],
```

## Cómo activar GitHub Pages

1. En GitHub: **Settings → Pages**.
2. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. Guarda. En ~1 min estará en `https://<usuario>.github.io/<repo>/`.

## Ejecutar en local

No necesita build. Abre `index.html` en el navegador, o sirve la carpeta:

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura, selector de temas y pestañas |
| `styles.css` | Estilos (tema oscuro) |
| `terminal.js` | Emulador de shell + sistema de ficheros virtual (Tema 2) |
| `users-shell.js` | Simulador de usuarios/grupos (Tema 3) |
| `proc-shell.js` | Simulador de procesos y recursos (Tema 5) |
| `data.js` | Preguntas, ejercicios y resumen del Tema 2 |
| `data-tema3.js` | Preguntas, ejercicios y resumen del Tema 3 |
| `data-tema5.js` | Preguntas, ejercicios y resumen del Tema 5 |
| `app.js` | Lógica de UI (temas, pestañas, terminal, test, ejercicios) |
