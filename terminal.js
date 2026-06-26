/* ===========================================================================
 *  Mini-shell GNU/Linux en el navegador
 *  Sistema de ficheros virtual + comandos para practicar el Tema 2 (ficheros).
 *  No es un Linux real: simula con fidelidad permisos, nodos-i, enlaces y umask.
 * ========================================================================= */

(function (global) {
  "use strict";

  // ---- Modelo de nodos del sistema de ficheros -----------------------------
  let inodeCounter = 1;

  function nextInode() { return inodeCounter++; }

  // perms: número octal de 12 bits -> [especiales(suid,sgid,sticky)][u][g][o]
  function makeNode(type, perms, owner, group) {
    return {
      type,                 // 'dir' | 'file' | 'symlink' | 'block' | 'char' | 'fifo' | 'socket'
      perms,                // entero (ej. 0o644)
      owner: owner || "javi",
      group: group || "javi",
      inode: nextInode(),
      children: type === "dir" ? {} : null,
      content: "",
      target: null,         // ruta destino si es symlink
      links: 1,             // nº de enlaces físicos (hard links)
      mtime: "feb 23 23:00"
    };
  }

  function VFS() {
    this.umask = 0o022;
    this.user = "javi";
    this.group = "javi";
    this.root = makeNode("dir", 0o755, "root", "root");
    this.cwd = "/";
    // Estructura mínima parecida a la del PDF
    this._mk("/etc", "dir", 0o755, "root", "root");
    this._mk("/bin", "dir", 0o755, "root", "root");
    this._mk("/dev", "dir", 0o755, "root", "root");
    this._mk("/tmp", "dir", 0o1777, "root", "root"); // sticky bit como en Linux real
    this._mk("/home", "dir", 0o755, "root", "root");
    this._mk("/home/javi", "dir", 0o755, "javi", "javi");
    this.cwd = "/home/javi";
  }

  // Crea un nodo de forma directa (uso interno, sin comprobar permisos)
  VFS.prototype._mk = function (path, type, perms, owner, group) {
    const parts = path.split("/").filter(Boolean);
    let node = this.root;
    for (let i = 0; i < parts.length - 1; i++) {
      node = node.children[parts[i]];
      if (!node) return null;
    }
    const n = makeNode(type, perms, owner, group);
    node.children[parts[parts.length - 1]] = n;
    return n;
  };

  // ---- Resolución de rutas -------------------------------------------------
  VFS.prototype.normalize = function (path) {
    let base = path.startsWith("/") ? [] : this.cwd.split("/").filter(Boolean);
    const parts = path.split("/").filter(Boolean);
    for (const p of parts) {
      if (p === ".") continue;
      else if (p === "..") base.pop();
      else base.push(p);
    }
    return "/" + base.join("/");
  };

  // Devuelve {node, parent, name} sin seguir el último symlink
  VFS.prototype.lookup = function (path, follow) {
    const abs = this.normalize(path);
    if (abs === "/") return { node: this.root, parent: null, name: "/" };
    const parts = abs.split("/").filter(Boolean);
    let node = this.root, parent = null;
    for (let i = 0; i < parts.length; i++) {
      if (!node || node.type !== "dir") return { node: null, parent: null, name: parts[i] };
      parent = node;
      node = node.children[parts[i]];
      // seguir symlinks intermedios
      if (node && node.type === "symlink" && (follow || i < parts.length - 1)) {
        const r = this.lookup(node.target, true);
        node = r.node;
      }
    }
    return { node: node || null, parent, name: parts[parts.length - 1] };
  };

  // ---- Render de permisos --------------------------------------------------
  function typeChar(t) {
    return { dir: "d", file: "-", symlink: "l", block: "b", char: "c", fifo: "p", socket: "s" }[t] || "-";
  }

  function permString(node) {
    const p = node.perms;
    const suid = (p >> 11) & 1, sgid = (p >> 10) & 1, sticky = (p >> 9) & 1;
    const bits = [
      (p >> 6) & 7, (p >> 3) & 7, p & 7
    ];
    let s = typeChar(node.type);
    const rwx = (v, special, lower, upper) => {
      let r = (v & 4) ? "r" : "-";
      let w = (v & 2) ? "w" : "-";
      let x;
      if (special) x = (v & 1) ? lower : upper;
      else x = (v & 1) ? "x" : "-";
      return r + w + x;
    };
    s += rwx(bits[0], suid, "s", "S");
    s += rwx(bits[1], sgid, "s", "S");
    s += rwx(bits[2], sticky, "t", "T");
    return s;
  }

  function octalString(perms) {
    const sp = (perms >> 9) & 7;
    const u = (perms >> 6) & 7, g = (perms >> 3) & 7, o = perms & 7;
    return (sp ? sp : "") + "" + u + g + o;
  }

  // ---- Parser de chmod simbólico ------------------------------------------
  function applySymbolic(perms, spec, isDir) {
    // spec ej: "u+rwx,go-rwx" o "u=rwx,g=rx,o=r" o "o+t" o "u+s"
    const clauses = spec.split(",");
    for (let clause of clauses) {
      // who una vez, seguido de una o varias acciones (op + perms). Ej: o+w+t
      const head = clause.match(/^([ugoa]*)((?:[+\-=][rwxXst]*)+)$/);
      if (!head) throw new Error("chmod: modo inválido: '" + clause + "'");
      let who = head[1] || "a";
      if (who === "a") who = "ugo";
      const actions = head[2].match(/[+\-=][rwxXst]*/g);
      for (const action of actions) {
      const op = action[0];
      const what = action.slice(1);
      // calcular máscara de rwx por cada destinatario
      let valR = what.includes("r");
      let valW = what.includes("w");
      let valXexplicit = what.includes("x");
      let valXcap = what.includes("X"); // x solo si dir o ya ejecutable
      const setSuid = what.includes("s");
      const setSticky = what.includes("t");

      const targets = [];
      if (who.includes("u")) targets.push("u");
      if (who.includes("g")) targets.push("g");
      if (who.includes("o")) targets.push("o");

      for (const t of targets) {
        const shift = t === "u" ? 6 : t === "g" ? 3 : 0;
        let cur = (perms >> shift) & 7;
        let add = 0;
        if (valR) add |= 4;
        if (valW) add |= 2;
        if (valXexplicit) add |= 1;
        if (valXcap && (isDir || (perms & 0o111))) add |= 1;
        if (op === "+") cur |= add;
        else if (op === "-") cur &= ~add;
        else if (op === "=") cur = add;
        perms = (perms & ~(7 << shift)) | (cur << shift);
      }
      // bits especiales
      if (setSuid) {
        if (who.includes("u")) {
          if (op === "+" || op === "=") perms |= (1 << 11); else perms &= ~(1 << 11);
        }
        if (who.includes("g")) {
          if (op === "+" || op === "=") perms |= (1 << 10); else perms &= ~(1 << 10);
        }
      }
      if (setSticky) {
        if (op === "+" || op === "=") perms |= (1 << 9); else perms &= ~(1 << 9);
      }
      } // fin acciones
    }
    return perms;
  }

  // ===========================================================================
  //  SHELL
  // ===========================================================================
  function Shell() {
    this.vfs = new VFS();
  }

  Shell.prototype.prompt = function () {
    let p = this.vfs.cwd;
    if (p === "/home/" + this.vfs.user) p = "~";
    else if (p.startsWith("/home/" + this.vfs.user + "/")) p = "~" + p.slice(("/home/" + this.vfs.user).length);
    return this.vfs.user + "@linux:" + p + "$ ";
  };

  // Ejecuta una línea, devuelve {out, err}
  Shell.prototype.exec = function (line) {
    line = line.trim();
    if (!line) return { out: "", err: "" };
    // redirección de salida a fichero:  cmd ... > fichero   ó   >> fichero
    let redirect = null;
    if (!line.includes("|")) {
      const rm = line.match(/^(.*?)\s*(>>|>)\s*(\S+)\s*$/);
      if (rm) { redirect = { append: rm[2] === ">>", file: rm[3] }; line = rm[1].trim(); }
    }
    // soporte muy básico de pipes para ls | head, ls | grep
    if (line.includes("|")) {
      return this.execPipe(line);
    }
    const argv = tokenize(line);
    const cmd = argv[0];
    const args = argv.slice(1);
    const fn = this.commands[cmd];
    if (!fn) return { out: "", err: cmd + ": orden no encontrada" };
    let res;
    try {
      res = fn.call(this, args);
    } catch (e) {
      return { out: "", err: e.message };
    }
    if (redirect) {
      const r = this.vfs.lookup(redirect.file, false);
      let node = r.node;
      if (!node) {
        if (!r.parent) return { out: "", err: "bash: " + redirect.file + ": No existe la ruta" };
        node = makeNode("file", 0o666 & ~this.vfs.umask, this.vfs.user, this.vfs.group);
        r.parent.children[r.name] = node;
      }
      const text = res.out || "";
      node.content = redirect.append ? (node.content + text + "\n") : (text + "\n");
      return { out: "", err: res.err || "" };
    }
    return res;
  };

  Shell.prototype.execPipe = function (line) {
    const stages = line.split("|").map((s) => s.trim());
    let data = "";
    let err = "";
    for (let i = 0; i < stages.length; i++) {
      const argv = tokenize(stages[i]);
      const cmd = argv[0];
      const args = argv.slice(1);
      if (i === 0) {
        const r = this.exec(stages[i]);
        data = r.out; err = r.err;
      } else if (cmd === "head") {
        let n = 10;
        const idx = args.indexOf("-n");
        if (idx >= 0) n = parseInt(args[idx + 1], 10) || 10;
        data = data.split("\n").slice(0, n).join("\n");
      } else if (cmd === "grep") {
        let pat = args.filter((a) => !a.startsWith("-")).pop() || "";
        const inv = args.includes("-v");
        data = data.split("\n").filter((l) => (inv ? !l.includes(pat) : l.includes(pat))).join("\n");
      } else if (cmd === "wc") {
        data = String(data.split("\n").filter(Boolean).length);
      } else {
        err = cmd + ": no soportado en pipe";
      }
    }
    return { out: data, err };
  };

  function tokenize(line) {
    const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    const out = [];
    let m;
    while ((m = re.exec(line)) !== null) out.push(m[1] || m[2] || m[3]);
    return out;
  }

  // ---- Implementación de comandos -----------------------------------------
  Shell.prototype.commands = {
    help() {
      return { out:
`Comandos disponibles (mini-shell del Tema 2):
  pwd                      ruta actual
  ls [-l -a -i -d -R]      listar (combina: ls -la, ls -li, ls -ld)
  cd [dir]                 cambiar de directorio
  touch <fichero>          crear fichero vacío (aplica umask)
  mkdir [-p] <dir>         crear directorio (aplica umask)
  rm [-r] <ruta>           borrar
  cat <fichero>            mostrar contenido
  echo <texto>             imprimir texto
  chmod <modo> <ruta>      permisos: simbólico (u+rwx,go-rwx) u octal (754)
  chown <usr>[:grp] <ruta> cambiar propietario  (usa: sudo chown ...)
  chgrp <grp> <ruta>       cambiar grupo
  umask [valor]            ver/establecer máscara (ej. umask 027)
  ln <orig> <enlace>       enlace físico (hard link)
  ln -s <orig> <enlace>    enlace simbólico
  stat <ruta>              metadatos del fichero
  id / whoami              identidad del usuario
  tree                     árbol del directorio actual
  clear                    limpiar pantalla
  reset                    reiniciar el sistema de ficheros
  help                     esta ayuda

Sugerencia: prueba los ejercicios de la pestaña "Ejercicios".`, err: "" };
    },

    whoami() { return { out: this.vfs.user, err: "" }; },
    id() { return { out: `uid=1000(${this.vfs.user}) gid=1000(${this.vfs.group}) groups=1000(${this.vfs.group})`, err: "" }; },
    pwd() { return { out: this.vfs.cwd, err: "" }; },
    clear() { return { out: "", err: "", clear: true }; },
    reset() { this.vfs = new VFS(); return { out: "Sistema de ficheros reiniciado.", err: "" }; },

    echo(args) { return { out: args.join(" "), err: "" }; },

    cd(args) {
      const target = args[0] || "/home/" + this.vfs.user;
      const r = this.vfs.lookup(target, true);
      if (!r.node) return { out: "", err: "cd: " + target + ": No existe el fichero o el directorio" };
      if (r.node.type !== "dir") return { out: "", err: "cd: " + target + ": No es un directorio" };
      this.vfs.cwd = this.vfs.normalize(target);
      return { out: "", err: "" };
    },

    ls(args) {
      const flags = args.filter((a) => a.startsWith("-")).join("");
      const paths = args.filter((a) => !a.startsWith("-"));
      const long = flags.includes("l");
      const all = flags.includes("a");
      const showInode = flags.includes("i");
      const dirItself = flags.includes("d");
      const target = paths[0] || ".";
      const r = this.vfs.lookup(target, true);
      if (!r.node) return { out: "", err: "ls: no se puede acceder a '" + target + "': No existe el fichero o el directorio" };

      const fmtLine = (name, node) => {
        if (!long) return (showInode ? node.inode + " " : "") + name;
        const owner = node.owner.padEnd(5);
        const group = node.group.padEnd(5);
        const size = String(node.type === "symlink" ? (node.target ? node.target.length : 0) : (node.content.length)).padStart(4);
        const linkInfo = node.type === "symlink" ? " -> " + node.target : "";
        const ino = showInode ? node.inode + " " : "";
        return `${ino}${permString(node)} ${node.links} ${owner} ${group} ${size} ${node.mtime} ${name}${linkInfo}`;
      };

      if (node_is_listable(r.node) && !dirItself) {
        const node = r.node;
        const names = Object.keys(node.children).sort();
        let lines = [];
        if (all) {
          lines.push(fmtLine(".", node));
          lines.push(fmtLine("..", node));
        }
        for (const n of names) lines.push(fmtLine(n, node.children[n]));
        const out = long ? (all || names.length ? "total " + names.length + "\n" : "") + lines.join("\n") : lines.join(long ? "\n" : "  ");
        return { out, err: "" };
      } else {
        // fichero o ls -d
        return { out: fmtLine(target.split("/").filter(Boolean).pop() || target, r.node), err: "" };
      }
    },

    touch(args) {
      const name = args[0];
      if (!name) return { out: "", err: "touch: falta un operando" };
      const r = this.vfs.lookup(name, false);
      if (r.node) return { out: "", err: "" }; // ya existe, solo actualizaría mtime
      if (!r.parent) return { out: "", err: "touch: no se puede crear '" + name + "': No existe la ruta" };
      const perms = 0o666 & ~this.vfs.umask;
      const n = makeNode("file", perms, this.vfs.user, this.vfs.group);
      r.parent.children[r.name] = n;
      return { out: "", err: "" };
    },

    mkdir(args) {
      const p = args.includes("-p");
      const names = args.filter((a) => !a.startsWith("-"));
      if (!names.length) return { out: "", err: "mkdir: falta un operando" };
      for (const name of names) {
        const abs = this.vfs.normalize(name);
        const parts = abs.split("/").filter(Boolean);
        let node = this.vfs.root;
        for (let i = 0; i < parts.length; i++) {
          const last = i === parts.length - 1;
          if (node.children[parts[i]]) {
            if (last && !p) return { out: "", err: "mkdir: no se puede crear el directorio '" + name + "': El fichero ya existe" };
            node = node.children[parts[i]];
            if (node.type !== "dir") return { out: "", err: "mkdir: '" + name + "': No es un directorio" };
          } else {
            if (!last && !p) return { out: "", err: "mkdir: no se puede crear '" + name + "': No existe la ruta" };
            const perms = 0o777 & ~this.vfs.umask;
            const nn = makeNode("dir", perms, this.vfs.user, this.vfs.group);
            node.children[parts[i]] = nn;
            node = nn;
          }
        }
      }
      return { out: "", err: "" };
    },

    rm(args) {
      const rec = args.includes("-r") || args.includes("-rf") || args.includes("-f");
      const names = args.filter((a) => !a.startsWith("-"));
      for (const name of names) {
        const r = this.vfs.lookup(name, false);
        if (!r.node) return { out: "", err: "rm: no se puede borrar '" + name + "': No existe" };
        if (r.node.type === "dir" && !rec) return { out: "", err: "rm: no se puede borrar '" + name + "': Es un directorio" };
        // decrementar enlaces si es fichero con hard links
        if (r.node.type === "file" && r.node.links > 1) r.node.links--;
        delete r.parent.children[r.name];
      }
      return { out: "", err: "" };
    },

    cat(args) {
      const r = this.vfs.lookup(args[0], true);
      if (!r.node) return { out: "", err: "cat: " + args[0] + ": No existe el fichero o el directorio" };
      if (r.node.type === "dir") return { out: "", err: "cat: " + args[0] + ": Es un directorio" };
      return { out: r.node.content, err: "" };
    },

    stat(args) {
      const r = this.vfs.lookup(args[0], false);
      if (!r.node) return { out: "", err: "stat: no se puede efectuar stat sobre '" + args[0] + "'" };
      const n = r.node;
      return { out:
`  Fichero: ${args[0]}${n.type === "symlink" ? " -> " + n.target : ""}
   Nodo-i: ${n.inode}   Enlaces: ${n.links}
   Acceso: (${octalString(n.perms).padStart(4,"0")}/${permString(n)})  Uid: (${n.owner})  Gid: (${n.group})`, err: "" };
    },

    chmod(args) {
      // permitir "sudo chmod"
      args = stripSudo(args);
      const rec = args.includes("-R");
      const real = args.filter((a) => a !== "-R");
      const mode = real[0];
      const paths = real.slice(1);
      if (!mode || !paths.length) return { out: "", err: "chmod: faltan operandos" };
      for (const path of paths) {
        const r = this.vfs.lookup(path, false);
        if (!r.node) return { out: "", err: "chmod: no se puede acceder a '" + path + "': No existe" };
        const isDir = r.node.type === "dir";
        if (/^[0-7]{3,4}$/.test(mode)) {
          r.node.perms = parseInt(mode, 8);
        } else {
          r.node.perms = applySymbolic(r.node.perms, mode, isDir);
        }
        if (rec && isDir) this._chmodRec(r.node, mode);
      }
      return { out: "", err: "" };
    },

    chown(args) {
      args = stripSudo(args);
      const rec = args.includes("-R");
      const real = args.filter((a) => a !== "-R");
      const spec = real[0];
      if (!spec) return { out: "", err: "chown: falta operando" };
      const [usr, grp] = spec.split(":");
      for (const path of real.slice(1)) {
        const r = this.vfs.lookup(path, false);
        if (!r.node) return { out: "", err: "chown: no se puede acceder a '" + path + "'" };
        if (usr) r.node.owner = usr;
        if (grp) r.node.group = grp;
        if (rec && r.node.type === "dir") this._chownRec(r.node, usr, grp);
      }
      return { out: "", err: "" };
    },

    chgrp(args) {
      args = stripSudo(args);
      const rec = args.includes("-R");
      const real = args.filter((a) => a !== "-R");
      const grp = real[0];
      for (const path of real.slice(1)) {
        const r = this.vfs.lookup(path, false);
        if (!r.node) return { out: "", err: "chgrp: no se puede acceder a '" + path + "'" };
        r.node.group = grp;
        if (rec && r.node.type === "dir") this._chownRec(r.node, null, grp);
      }
      return { out: "", err: "" };
    },

    umask(args) {
      if (!args.length) {
        return { out: "0" + this.vfs.umask.toString(8).padStart(3, "0"), err: "" };
      }
      const v = parseInt(args[0], 8);
      if (isNaN(v)) return { out: "", err: "umask: " + args[0] + ": número octal no válido" };
      this.vfs.umask = v;
      return { out: "", err: "" };
    },

    ln(args) {
      const sym = args.includes("-s");
      const real = args.filter((a) => !a.startsWith("-"));
      const [orig, enlace] = real;
      if (!orig || !enlace) return { out: "", err: "ln: faltan operandos" };
      if (sym) {
        const r = this.vfs.lookup(enlace, false);
        if (r.node) return { out: "", err: "ln: no se puede crear el enlace simbólico '" + enlace + "': El fichero ya existe" };
        const n = makeNode("symlink", 0o777, this.vfs.user, this.vfs.group);
        n.target = orig;
        r.parent.children[r.name] = n;
        return { out: "", err: "" };
      } else {
        const ro = this.vfs.lookup(orig, false);
        if (!ro.node) return { out: "", err: "ln: no se pudo acceder a '" + orig + "': No existe" };
        if (ro.node.type === "dir") return { out: "", err: "ln: '" + orig + "': no se permite enlace físico a un directorio" };
        const re = this.vfs.lookup(enlace, false);
        if (re.node) return { out: "", err: "ln: no se puede crear el enlace '" + enlace + "': El fichero ya existe" };
        ro.node.links++;
        re.parent.children[re.name] = ro.node; // mismo nodo-i: comparten objeto
        return { out: "", err: "" };
      }
    },

    tree() {
      const r = this.vfs.lookup(".", true);
      const lines = ["."];
      const walk = (node, prefix) => {
        const names = Object.keys(node.children).sort();
        names.forEach((name, idx) => {
          const last = idx === names.length - 1;
          const child = node.children[name];
          lines.push(prefix + (last ? "└── " : "├── ") + name + (child.type === "dir" ? "/" : child.type === "symlink" ? " -> " + child.target : ""));
          if (child.type === "dir") walk(child, prefix + (last ? "    " : "│   "));
        });
      };
      walk(r.node, "");
      return { out: lines.join("\n"), err: "" };
    },

    sudo(args) {
      // ejecutar el resto como comando (sin restricciones reales)
      const sub = args[0];
      const fn = this.commands[sub];
      if (!fn) return { out: "", err: "sudo: " + sub + ": orden no encontrada" };
      return fn.call(this, args.slice(1));
    },

    man(args) {
      const t = args[0] || "";
      const pages = {
        chmod: "chmod - cambia los bits de permiso de un fichero. Modo simbólico [ugoa][+-=][rwxXst] o octal (3-4 dígitos).",
        ls: "ls - lista el contenido. -l formato largo, -a ocultos, -i nodo-i, -d el propio directorio.",
        ln: "ln - crea enlaces. Sin -s: enlace físico (mismo nodo-i). Con -s: enlace simbólico.",
        umask: "umask - máscara de permisos. Base 666 (ficheros) y 777 (directorios) menos la máscara.",
        hier: "hier - jerarquía del sistema de ficheros (FHS): /bin /etc /dev /home /lib /tmp /var /usr ..."
      };
      return { out: pages[t] || ("No hay página de manual para " + t), err: "" };
    }
  };

  function node_is_listable(node) { return node.type === "dir"; }
  function stripSudo(args) { return args[0] === "sudo" ? args.slice(1) : args; }

  Shell.prototype._chmodRec = function (dir, mode) {
    for (const k in dir.children) {
      const c = dir.children[k];
      if (/^[0-7]{3,4}$/.test(mode)) c.perms = parseInt(mode, 8);
      else c.perms = applySymbolic(c.perms, mode, c.type === "dir");
      if (c.type === "dir") this._chmodRec(c, mode);
    }
  };
  Shell.prototype._chownRec = function (dir, usr, grp) {
    for (const k in dir.children) {
      const c = dir.children[k];
      if (usr) c.owner = usr;
      if (grp) c.group = grp;
      if (c.type === "dir") this._chownRec(c, usr, grp);
    }
  };

  // exportar utilidades para los validadores de ejercicios
  Shell.prototype.permString = function (path) {
    const r = this.vfs.lookup(path, false);
    return r.node ? permString(r.node) : null;
  };
  Shell.prototype.octal = function (path) {
    const r = this.vfs.lookup(path, false);
    return r.node ? octalString(r.node.perms) : null;
  };
  Shell.prototype.getNode = function (path) {
    return this.vfs.lookup(path, false).node;
  };

  global.LinuxShell = Shell;
})(window);
