# PAS — Práctica interactiva (Temas 2 y 3)

Página web interactiva para repasar **Programación y Administración de Sistemas**. Incluye un selector arriba para cambiar entre temas:

- **📁 Tema 2 · Ficheros** — Organización del SO, sistema de ficheros, permisos, enlaces, FHS.
- **👤 Tema 3 · Usuarios** — Gestión de usuarios y grupos, /etc/passwd, shadow passwords, hashing, chage, grupos.

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
| `index.html` | Estructura y pestañas |
| `styles.css` | Estilos (tema oscuro) |
| `terminal.js` | Emulador de shell + sistema de ficheros virtual |
| `data.js` | Preguntas, ejercicios y resumen |
| `app.js` | Lógica de UI (pestañas, terminal, test, ejercicios) |
