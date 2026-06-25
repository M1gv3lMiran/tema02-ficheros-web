# Tema 2 — Ficheros GNU/Linux · Práctica interactiva

Página web interactiva para repasar el **Tema 2 (Organización de un SO tipo GNU/Linux: sistema de ficheros)** de Programación y Administración de Sistemas.

🔗 **Web:** _(activa GitHub Pages para obtener la URL — ver más abajo)_

## ¿Qué incluye?

- **💻 Terminal interactiva**: un mini-shell con un sistema de ficheros virtual (en JavaScript puro, sin servidor) que ejecuta de verdad `ls -l`, `chmod` (simbólico y octal), `chown`, `chgrp`, `ln`, `ln -s`, `umask`, `touch`, `mkdir`, `stat`, `tree`… con permisos, nodos-i, enlaces y bits especiales (suid/sgid/sticky) bien modelados.
- **📝 Ejercicios**: los ejercicios del PDF (permisos, sticky bit, umask, enlaces) con **comprobación automática** del estado del sistema de ficheros.
- **❓ Test**: preguntas tipo test elaboradas a partir del contenido del PDF, con corrección y explicación al instante. Incluye un apartado para pegar las **preguntas del profesor**.
- **📚 Resumen**: chuleta de repaso de todo el tema.

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
