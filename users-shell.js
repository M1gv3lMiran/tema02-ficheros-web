/* ===========================================================================
 *  Simulador de gestión de usuarios y grupos (Tema 3)
 *  Modela /etc/passwd, /etc/shadow y /etc/group, y los comandos de gestión.
 *  No es un Linux real: reproduce el comportamiento para practicar el tema.
 * ========================================================================= */
(function (global) {
  "use strict";

  function today() { return "2026-06-26"; }
  // días desde 1/1/1970 (aprox) para el campo "changed" de shadow
  function daysSinceEpoch() { return Math.floor(Date.now() / 86400000); }

  function UserSystem() {
    this.reset();
  }

  UserSystem.prototype.reset = function () {
    this.me = "pas";          // usuario de la sesión (administrador, con sudo)
    this.activeGroup = null;  // newgrp
    this.nextUid = 1001;
    this.nextGid = 1003;

    // grupos: nombre -> { gid, members: [] }
    this.groups = {
      root: { gid: 0, members: [] },
      sudo: { gid: 27, members: ["pas"] },
      pas: { gid: 1000, members: [] },
      clase: { gid: 1001, members: [] },
      profesores: { gid: 1002, members: ["pas"] }
    };

    // usuarios: nombre -> {uid, gid, gecos, home, shell, pw, shadow{...}}
    this.users = {
      root: u(0, 0, "root", "/root", "/bin/bash", "x"),
      pas: u(1000, 1000, "Administrador,,,", "/home/pas", "/bin/bash", "x")
    };
    function u(uid, gid, gecos, home, shell, pw) {
      return {
        uid, gid, gecos, home, shell, pw,
        shadow: { pass: "$y$j9T$" + rndHash(), changed: daysSinceEpoch(), min: 0, max: 99999, warn: 7, inactive: -1, expired: -1 }
      };
    }
  };

  function rndHash() {
    const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./";
    let s = "";
    for (let i = 0; i < 22; i++) s += c[Math.floor(Math.random() * c.length)];
    return s + "$" + (function () { let h = ""; for (let i = 0; i < 43; i++) h += c[Math.floor(Math.random() * c.length)]; return h; })();
  }

  // ---- utilidades de consulta -------------------------------------------
  UserSystem.prototype.groupNameByGid = function (gid) {
    for (const g in this.groups) if (this.groups[g].gid === gid) return g;
    return String(gid);
  };
  UserSystem.prototype.secondaryGroups = function (user) {
    const out = [];
    for (const g in this.groups) if (this.groups[g].members.includes(user)) out.push(g);
    return out;
  };
  UserSystem.prototype.allGroups = function (user) {
    const u = this.users[user];
    if (!u) return [];
    const prim = this.groupNameByGid(u.gid);
    const sec = this.secondaryGroups(user).filter((g) => g !== prim);
    return [prim].concat(sec);
  };

  // ===========================================================================
  function tokenize(line) {
    const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    const out = []; let m;
    while ((m = re.exec(line)) !== null) out.push(m[1] || m[2] || m[3]);
    return out;
  }

  UserSystem.prototype.exec = function (line) {
    line = line.trim();
    if (!line) return { out: "", err: "" };
    // pipe simple: cmd | grep patrón
    if (line.includes("|")) return this.pipe(line);
    let argv = tokenize(line);
    if (argv[0] === "sudo") argv = argv.slice(1);
    const cmd = argv[0];
    const fn = this.commands[cmd];
    if (!fn) return { out: "", err: cmd + ": orden no encontrada" };
    try { return fn.call(this, argv.slice(1)); }
    catch (e) { return { out: "", err: e.message }; }
  };

  UserSystem.prototype.pipe = function (line) {
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
      } else if (a[0] === "cut") {
        // cut -d: -fN
        const dIdx = a.indexOf("-d"); const d = dIdx >= 0 ? a[dIdx + 1] : "\t";
        const fIdx = a.indexOf("-f"); const f = fIdx >= 0 ? parseInt(a[fIdx + 1]) : 1;
        data = data.split("\n").map((l) => l.split(d)[f - 1] || "").join("\n");
      } else { return { out: data, err: a[0] + ": no soportado en pipe" }; }
    }
    return { out: data, err: r.err };
  };

  // ---- comandos ----------------------------------------------------------
  UserSystem.prototype.commands = {
    help() {
      return { out:
`Gestión de usuarios y grupos (Tema 3). Estás como 'pas' (administrador).

  cat /etc/passwd        cuentas (nombre:x:uid:gid:gecos:home:shell)
  cat /etc/shadow        contraseñas cifradas + envejecimiento
  cat /etc/group         grupos (nombre:x:gid:miembros)
  grep <pat> <fichero>   filtrar líneas

  useradd [-m -u UID -g GRP -G g1,g2 -s SHELL -c GECOS] NOMBRE
  adduser NOMBRE [--ingroup GRP]      crear usuario (estilo Debian)
  usermod [-aG g1,g2 -g GRP -s SHELL -l NUEVO -L -U] NOMBRE
  userdel [-r] NOMBRE
  passwd [NOMBRE]        asignar/cambiar contraseña

  groupadd|addgroup NOMBRE
  groupdel|delgroup NOMBRE
  groups [NOMBRE]        grupos del usuario
  id [NOMBRE]            uid, gid y grupos
  newgrp GRUPO           cambiar grupo activo

  chage -l NOMBRE                ver envejecimiento
  chage [-M -m -W -I días | -E fecha | -d fecha] NOMBRE
  chsh -s SHELL [NOMBRE]         cambiar intérprete
  cat /etc/shells               shells permitidos

  whoami · id · clear · reset · help`, err: "" };
    },

    whoami() { return { out: this.me, err: "" }; },
    clear() { return { out: "", err: "", clear: true }; },
    reset() { this.reset(); return { out: "Sistema de usuarios reiniciado.", err: "" }; },
    echo(a) { return { out: a.join(" "), err: "" }; },

    cat(a) {
      const f = a[0];
      if (f === "/etc/passwd") {
        const order = Object.keys(this.users).sort((x, y) => this.users[x].uid - this.users[y].uid);
        return { out: order.map((n) => {
          const u = this.users[n];
          return [n, u.pw, u.uid, u.gid, u.gecos, u.home, u.shell].join(":");
        }).join("\n"), err: "" };
      }
      if (f === "/etc/shadow") {
        const order = Object.keys(this.users).sort((x, y) => this.users[x].uid - this.users[y].uid);
        return { out: order.map((n) => {
          const s = this.users[n].shadow;
          return [n, s.pass, s.changed, s.min, s.max, s.warn, s.inactive < 0 ? "" : s.inactive, s.expired < 0 ? "" : s.expired, ""].join(":");
        }).join("\n"), err: "" };
      }
      if (f === "/etc/group") {
        const order = Object.keys(this.groups).sort((x, y) => this.groups[x].gid - this.groups[y].gid);
        return { out: order.map((n) => [n, "x", this.groups[n].gid, this.groups[n].members.join(",")].join(":")).join("\n"), err: "" };
      }
      if (f === "/etc/gshadow") {
        return { out: Object.keys(this.groups).map((n) => [n, "!", "", this.groups[n].members.join(",")].join(":")).join("\n"), err: "" };
      }
      if (f === "/etc/shells") {
        return { out: "/bin/sh\n/bin/bash\n/bin/rbash\n/usr/bin/bash\n/bin/dash", err: "" };
      }
      return { out: "", err: "cat: " + (f || "") + ": No existe el fichero o el directorio" };
    },

    grep(a) {
      const inv = a.includes("-v");
      const rest = a.filter((x) => !x.startsWith("-"));
      const pat = rest[0]; const file = rest[1];
      const r = this.commands.cat.call(this, [file]);
      if (r.err) return r;
      const lines = r.out.split("\n").filter((l) => inv ? !l.includes(pat) : l.includes(pat));
      return { out: lines.join("\n"), err: "" };
    },

    useradd(a) {
      let uid = null, gid = null, secGroups = [], shell = "/bin/sh", gecos = "", home = null, makeHome = false, name = null;
      for (let i = 0; i < a.length; i++) {
        const t = a[i];
        if (t === "-m") makeHome = true;
        else if (t === "-u") uid = parseInt(a[++i]);
        else if (t === "-g") gid = a[++i];
        else if (t === "-G") secGroups = a[++i].split(",");
        else if (t === "-s") shell = a[++i];
        else if (t === "-c") gecos = a[++i];
        else if (t === "-d") home = a[++i];
        else if (!t.startsWith("-")) name = t;
      }
      if (!name) return { out: "", err: "useradd: falta el nombre de usuario" };
      if (this.users[name]) return { out: "", err: "useradd: el usuario '" + name + "' ya existe" };
      if (uid === null) uid = this.nextUid++; else if (uid >= this.nextUid) this.nextUid = uid + 1;
      // grupo primario
      let primGid;
      if (gid !== null) {
        const g = this.groups[gid] || this.groups[this.groupNameByGid(parseInt(gid))];
        if (!g) return { out: "", err: "useradd: el grupo '" + gid + "' no existe" };
        primGid = g.gid;
      } else {
        // crea grupo con el mismo nombre (USERGROUPS_ENAB yes)
        const ng = this.nextGid++;
        this.groups[name] = { gid: ng, members: [] };
        primGid = ng;
      }
      this.users[name] = {
        uid, gid: primGid, gecos, home: home || ("/home/" + name), shell,
        pw: "x",
        shadow: { pass: "!", changed: daysSinceEpoch(), min: 0, max: 99999, warn: 7, inactive: -1, expired: -1 }
      };
      for (const sg of secGroups) { if (this.groups[sg]) this.groups[sg].members.push(name); }
      const note = makeHome ? "" : "  (sin -m: useradd NO crea el $HOME)";
      return { out: "usuario '" + name + "' creado (uid=" + uid + ", grupo=" + this.groupNameByGid(primGid) + ", shell=" + shell + ")" + note + "\nRecuerda: la contraseña está sin asignar ('!'). Usa passwd " + name, err: "" };
    },

    adduser(a) {
      let name = null, ingroup = null;
      for (let i = 0; i < a.length; i++) {
        if (a[i] === "--ingroup") ingroup = a[++i];
        else if (!a[i].startsWith("-")) name = a[i];
      }
      if (!name) return { out: "", err: "adduser: falta el nombre" };
      if (this.users[name]) return { out: "", err: "adduser: El usuario '" + name + "' ya existe." };
      const uid = this.nextUid++;
      let primGid;
      if (ingroup) {
        if (!this.groups[ingroup]) return { out: "", err: "adduser: El grupo '" + ingroup + "' no existe." };
        primGid = this.groups[ingroup].gid;
      } else {
        const ng = this.nextGid++;
        this.groups[name] = { gid: ng, members: [] };
        primGid = ng;
      }
      this.users[name] = {
        uid, gid: primGid, gecos: "", home: "/home/" + name, shell: "/bin/bash",
        pw: "x",
        shadow: { pass: "$y$j9T$" + rndHash(), changed: daysSinceEpoch(), min: 0, max: 99999, warn: 7, inactive: -1, expired: -1 }
      };
      return { out:
`Añadiendo el usuario '${name}' ...
Añadiendo el nuevo grupo primario '${this.groupNameByGid(primGid)}' ...
Creando el directorio personal '/home/${name}' ...
Copiando los ficheros desde '/etc/skel' ...
(adduser crea el $HOME y copia .bashrc, .profile, etc.)`, err: "" };
    },

    usermod(a) {
      let name = null, addG = null, primG = null, shell = null, newName = null, lock = false, unlock = false;
      for (let i = 0; i < a.length; i++) {
        const t = a[i];
        if (t === "-aG" || t === "-a") addG = a[++i];
        else if (t === "-G") addG = a[++i];
        else if (t === "-g") primG = a[++i];
        else if (t === "-s") shell = a[++i];
        else if (t === "-l") newName = a[++i];
        else if (t === "-L") lock = true;
        else if (t === "-U") unlock = true;
        else if (!t.startsWith("-")) name = t;
      }
      const u = this.users[name];
      if (!u) return { out: "", err: "usermod: el usuario '" + name + "' no existe" };
      if (addG) for (const g of addG.split(",")) {
        if (!this.groups[g]) return { out: "", err: "usermod: el grupo '" + g + "' no existe" };
        if (!this.groups[g].members.includes(name)) this.groups[g].members.push(name);
      }
      if (primG) {
        const g = this.groups[primG]; if (!g) return { out: "", err: "usermod: el grupo '" + primG + "' no existe" };
        u.gid = g.gid;
      }
      if (shell) u.shell = shell;
      if (lock) { if (!u.shadow.pass.startsWith("!")) u.shadow.pass = "!" + u.shadow.pass; }
      if (unlock) { u.shadow.pass = u.shadow.pass.replace(/^!/, ""); }
      if (newName && newName !== name) {
        this.users[newName] = u; delete this.users[name];
        for (const g in this.groups) { const idx = this.groups[g].members.indexOf(name); if (idx >= 0) this.groups[g].members[idx] = newName; }
        name = newName;
      }
      return { out: "", err: "" };
    },

    userdel(a) {
      const rec = a.includes("-r");
      const name = a.filter((x) => !x.startsWith("-"))[0];
      if (!this.users[name]) return { out: "", err: "userdel: el usuario '" + name + "' no existe" };
      delete this.users[name];
      for (const g in this.groups) { const i = this.groups[g].members.indexOf(name); if (i >= 0) this.groups[g].members.splice(i, 1); }
      return { out: "", err: "" };
    },
    deluser(a) { return this.commands.userdel.call(this, a); },

    passwd(a) {
      const name = a.filter((x) => !x.startsWith("-"))[0] || this.me;
      const u = this.users[name];
      if (!u) return { out: "", err: "passwd: el usuario '" + name + "' no existe" };
      u.pw = "x";
      u.shadow.pass = "$y$j9T$" + rndHash();
      u.shadow.changed = daysSinceEpoch();
      return { out: "Cambiando la contraseña del usuario " + name + ".\ncontraseña actualizada correctamente\n(la cifrada se guarda en /etc/shadow, no en /etc/passwd)", err: "" };
    },

    groupadd(a) { return addgroup.call(this, a); },
    addgroup(a) { return addgroup.call(this, a); },

    groupdel(a) { return delgroup.call(this, a); },
    delgroup(a) { return delgroup.call(this, a); },

    groups(a) {
      const name = a[0] || this.me;
      if (!this.users[name]) return { out: "", err: "groups: '" + name + "': no existe ese usuario" };
      return { out: name + " : " + this.allGroups(name).join(" "), err: "" };
    },

    id(a) {
      const name = a[0] || this.me;
      const u = this.users[name];
      if (!u) return { out: "", err: "id: '" + name + "': no existe ese usuario" };
      const prim = this.groupNameByGid(u.gid);
      const grps = this.allGroups(name).map((g) => this.groups[g].gid + "(" + g + ")").join(",");
      return { out: `uid=${u.uid}(${name}) gid=${u.gid}(${prim}) grupos=${grps}`, err: "" };
    },

    newgrp(a) {
      const g = a[0];
      if (!this.groups[g]) return { out: "", err: "newgrp: el grupo '" + g + "' no existe" };
      this.activeGroup = g;
      return { out: "Grupo activo cambiado a '" + g + "'. (los ficheros nuevos tendrán este grupo)", err: "" };
    },

    chsh(a) {
      let shell = null, name = this.me;
      for (let i = 0; i < a.length; i++) { if (a[i] === "-s") shell = a[++i]; else if (!a[i].startsWith("-")) name = a[i]; }
      const u = this.users[name];
      if (!u) return { out: "", err: "chsh: el usuario '" + name + "' no existe" };
      if (!shell) return { out: "", err: "chsh: falta el shell (-s)" };
      const allowed = ["/bin/sh", "/bin/bash", "/bin/rbash", "/usr/bin/bash", "/bin/dash", "/bin/false", "/sbin/nologin"];
      if (!allowed.includes(shell)) return { out: "", err: "chsh: «" + shell + "» no está en la lista de shells autorizados (/etc/shells)" };
      u.shell = shell;
      return { out: "Intérprete de " + name + " cambiado a " + shell, err: "" };
    },

    chage(a) {
      if (a[0] === "-l") {
        const name = a[1] || this.me; const u = this.users[name];
        if (!u) return { out: "", err: "chage: el usuario '" + name + "' no existe" };
        const s = u.shadow;
        return { out:
`Último cambio de contraseña                              : (día ${s.changed})
La contraseña caduca                                     : ${s.max >= 99999 ? "nunca" : "en " + s.max + " días"}
La contraseña está inactiva                              : ${s.inactive < 0 ? "nunca" : s.inactive + " días tras caducar"}
La cuenta caduca                                         : ${s.expired < 0 ? "nunca" : s.expired}
Núm. mínimo de días entre cambios de contraseña          : ${s.min}
Núm. máximo de días entre cambios de contraseña          : ${s.max}
Núm. de días de aviso antes de que caduque la contraseña : ${s.warn}`, err: "" };
      }
      let name = null, M = null, m = null, W = null, I = null, E = null, d = null;
      for (let i = 0; i < a.length; i++) {
        const t = a[i];
        if (t === "-M") M = parseInt(a[++i]);
        else if (t === "-m") m = parseInt(a[++i]);
        else if (t === "-W") W = parseInt(a[++i]);
        else if (t === "-I") I = parseInt(a[++i]);
        else if (t === "-E") E = a[++i];
        else if (t === "-d") d = a[++i];
        else if (!t.startsWith("-")) name = t;
      }
      const u = this.users[name];
      if (!u) return { out: "", err: "chage: el usuario '" + name + "' no existe" };
      if (M !== null) u.shadow.max = M;
      if (m !== null) u.shadow.min = m;
      if (W !== null) u.shadow.warn = W;
      if (I !== null) u.shadow.inactive = I;
      if (E !== null) u.shadow.expired = E;
      if (d !== null) u.shadow.changed = d;
      return { out: "", err: "" };
    }
  };

  function addgroup(a) {
    let gid = null, name = null;
    for (let i = 0; i < a.length; i++) { if (a[i] === "-g") gid = parseInt(a[++i]); else if (!a[i].startsWith("-")) name = a[i]; }
    if (!name) return { out: "", err: "addgroup: falta el nombre del grupo" };
    if (this.groups[name]) return { out: "", err: "addgroup: El grupo '" + name + "' ya existe." };
    if (gid === null) gid = this.nextGid++; else if (gid >= this.nextGid) this.nextGid = gid + 1;
    this.groups[name] = { gid, members: [] };
    return { out: "Añadiendo el grupo '" + name + "' (GID " + gid + ") ...", err: "" };
  }
  function delgroup(a) {
    const name = a.filter((x) => !x.startsWith("-"))[0];
    if (!this.groups[name]) return { out: "", err: "delgroup: El grupo '" + name + "' no existe." };
    for (const un in this.users) if (this.users[un].gid === this.groups[name].gid)
      return { out: "", err: "delgroup: No puede eliminar el grupo primario del usuario '" + un + "'." };
    delete this.groups[name];
    return { out: "Eliminando el grupo '" + name + "' ...", err: "" };
  }

  // ---- prompt + API para validar ejercicios ------------------------------
  UserSystem.prototype.prompt = function () { return this.me + "@debian:~$ "; };
  UserSystem.prototype.getUser = function (n) { return this.users[n] || null; };
  UserSystem.prototype.getGroup = function (n) { return this.groups[n] || null; };
  UserSystem.prototype.userInGroup = function (user, group) {
    return this.allGroups(user).includes(group);
  };

  global.UserSystem = UserSystem;
})(window);
