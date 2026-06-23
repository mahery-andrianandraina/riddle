/**
 * mario-bg.js  —  Super Mario Quiz Background
 * Niveau thématisé : ZONE 1 = CRP (bleu/commercial), ZONE 2 = PLC (vert/tissu)
 *
 * CRP = logiciel commercial (commandes, PO, gestion)
 *   → Blocs CRP bleus, ennemis "BUG" en costume de tableur,
 *     pièces = "PO" (Purchase Orders), tuyaux = pipeline de commandes
 *
 * PLC = outil développement tissu
 *   → Blocs PLC verts, ennemis "DEFECT" (chenilles tissu),
 *     pièces = bobines de tissu, tuyaux = rouleaux de tissu
 */
(function () {
  "use strict";

  /* ================================================================
     CANVAS SETUP
     ================================================================ */
  const canvas = document.getElementById("mario-bg-canvas");
  const ctx    = canvas.getContext("2d");

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  /* ================================================================
     PALETTES  (deux zones : CRP = bleu, PLC = vert)
     ================================================================ */
  const ZONES = {
    CRP: {
      sky:        "#1a2a6c",   // nuit bleu foncé (salle de bureau)
      skyFar:     "#0d1540",
      ground:     "#2d4a8a",   // sol bleu
      groundTop:  "#4a6fb5",
      blockFill:  "#1565c0",
      blockLight: "#90caf9",
      blockDark:  "#0d47a1",
      blockLabel: "#ffffff",
      pipe:       "#1976d2",
      pipeDark:   "#0d47a1",
      coinColor:  "#f8b800",
      enemyBody:  "#e53935",   // BUG rouge
      enemyDark:  "#b71c1c",
      label:      "CRP",
      sublabel:   "COMMANDES & PO",
    },
    PLC: {
      sky:        "#1b4332",   // forêt verte profonde
      skyFar:     "#081c15",
      ground:     "#2d6a4f",
      groundTop:  "#40916c",
      blockFill:  "#1b7a2f",
      blockLight: "#a9d6a0",
      blockDark:  "#0a4a1a",
      blockLabel: "#ffffff",
      pipe:       "#52b788",
      pipeDark:   "#2d6a4f",
      coinColor:  "#ffd166",
      enemyBody:  "#f77f00",   // DEFECT orange
      enemyDark:  "#a64e00",
      label:      "PLC",
      sublabel:   "DEV TISSU",
    },
  };

  /* NES base palette */
  const C = {
    white:      "#ffffff",
    black:      "#000000",
    marioRed:   "#e52521",
    marioSkin:  "#fcd8a0",
    marioPants: "#0000aa",
    marioHat:   "#e52521",
    marioShirt: "#e52521",
  };

  /* ================================================================
     CONSTANTS
     ================================================================ */
  const TILE         = 32;
  const GH           = 60;     // ground height px from bottom
  const GRAVITY      = 0.52;
  const SCROLL_SPEED = 2.0;
  const FPS          = 60;

  /* ================================================================
     ZONE / WORLD STATE
     ================================================================ */
  let worldX        = 0;
  let zoneProgress  = 0;       // how many px we've traveled in current zone
  const ZONE_LENGTH = 3200;    // px per zone before switching
  let currentZone   = "CRP";   // starts with CRP
  let zoneFade      = 0;       // 0–1, fade between zones
  let zoneTransitioning = false;

  function getZone() { return ZONES[currentZone]; }

  /* ================================================================
     HELPER
     ================================================================ */
  function px(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  }

  function lerpColor(c1, c2, t) {
    const [r1,g1,b1] = hexToRgb(c1);
    const [r2,g2,b2] = hexToRgb(c2);
    return `rgb(${Math.round(lerp(r1,r2,t))},${Math.round(lerp(g1,g2,t))},${Math.round(lerp(b1,b2,t))})`;
  }

  /* ================================================================
     MARIO
     ================================================================ */
  const mario = {
    x: 120, y: 0, vy: 0,
    onGround: false,
    frame: 0, frameTimer: 0,
    invincible: 0,

    get groundY() { return canvas.height - GH - 48; },

    reset() {
      this.y = this.groundY; this.vy = 0; this.onGround = true; this.invincible = 0;
    },

    jump() {
      if (this.onGround) { this.vy = -13; this.onGround = false; }
    },

    update() {
      this.frameTimer++;
      if (this.frameTimer % 4 === 0) this.frame = (this.frame + 1) % 4;
      this.vy += GRAVITY;
      this.y  += this.vy;
      if (this.y >= this.groundY) { this.y = this.groundY; this.vy = 0; this.onGround = true; }
      if (this.invincible > 0) this.invincible--;
      if (this.y > canvas.height + 60) this.reset();
    },

    draw() {
      const sx = this.x, sy = this.y;
      const P  = 3;
      const run = this.frame;
      const isJ = !this.onGround;

      if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0) return;

      // Hat
      px(sx+2*P, sy,    10*P, 2*P, C.marioHat);
      px(sx+1*P, sy+2*P,12*P, 2*P, C.marioHat);
      // Face
      px(sx+1*P, sy+4*P,12*P, 2*P, C.black);
      px(sx+2*P, sy+6*P,11*P, 4*P, C.marioSkin);
      px(sx+6*P, sy+7*P, 2*P, 2*P, C.black);
      px(sx+3*P, sy+9*P, 8*P, 2*P, C.black);
      // Shirt
      px(sx+0*P, sy+10*P,14*P,4*P, C.marioShirt);
      // Overalls
      px(sx+1*P, sy+14*P,12*P,4*P, C.marioPants);
      px(sx+3*P, sy+14*P, 2*P,2*P, C.marioRed);
      px(sx+9*P, sy+14*P, 2*P,2*P, C.marioRed);
      // Legs
      if (isJ) {
        px(sx+1*P,sy+18*P,5*P,3*P,C.marioPants);
        px(sx+8*P,sy+18*P,5*P,3*P,C.marioPants);
        px(sx+0*P,sy+21*P,6*P,3*P,C.black);
        px(sx+8*P,sy+21*P,6*P,3*P,C.black);
      } else {
        const lo = [0,2,0,-2][run];
        px(sx+2*P,sy+18*P+lo, 4*P,4*P,C.marioPants);
        px(sx+8*P,sy+18*P-lo, 4*P,4*P,C.marioPants);
        px(sx+1*P,sy+22*P+lo, 5*P,2*P,C.black);
        px(sx+8*P,sy+22*P-lo, 5*P,2*P,C.black);
      }
      // Arms
      const ao = isJ ? 0 : [0,1,0,-1][run];
      px(sx-1*P, sy+11*P+ao, 3*P,4*P, C.marioShirt);
      px(sx+12*P,sy+11*P-ao, 3*P,4*P, C.marioShirt);
    },

    get rect() { return { x:this.x, y:this.y, w:42, h:48 }; }
  };

  /* ================================================================
     THEMED BLOCK  (CRP = bleu, PLC = vert)
     ================================================================ */
  class ThemeBlock {
    constructor(worldX, y, zone, label) {
      this.worldX = worldX;
      this.y      = y;
      this.zone   = zone;   // "CRP" or "PLC"
      this.label  = label || zone;
      this.hit    = false;
      this.bounceY= 0;
      this.bounceT= 0;
      this.frame  = 0;
      this.ft     = 0;
    }

    update() {
      this.ft++;
      if (this.ft % 25 === 0 && !this.hit) this.frame = (this.frame + 1) % 3;
      if (this.bounceT > 0) {
        this.bounceT--;
        this.bounceY = Math.sin((15-this.bounceT)/15*Math.PI) * -12;
      } else this.bounceY = 0;
    }

    activate() {
      if (!this.hit) {
        this.hit = true;
        this.bounceT = 15;
        const z = ZONES[this.zone];
        spawnCoin(this.worldX + 16, this.y - 28, z.coinColor, this.zone);
        spawnParticles(this.worldX + 16, this.y, z.blockFill, 5);
        spawnFloatText(this.worldX - worldX + 16, this.y, this.zone === "CRP" ? "+PO" : "+SWATCH");
        score += this.zone === "CRP" ? 150 : 200;
      }
    }

    draw(cx) {
      const z  = ZONES[this.zone];
      const sx = this.worldX - cx;
      const sy = this.y + this.bounceY;
      const fc = this.hit ? "#555" : z.blockFill;
      const lc = this.hit ? "#333" : z.blockDark;
      const tc = this.hit ? "#aaa" : z.blockLight;

      // Main block
      px(sx, sy, TILE, TILE, fc);
      // Borders NES style
      px(sx, sy, TILE, 3, tc);
      px(sx, sy, 3, TILE, tc);
      px(sx+TILE-3, sy, 3, TILE, lc);
      px(sx, sy+TILE-3, TILE, 3, lc);

      // Label inside block
      if (!this.hit) {
        ctx.save();
        ctx.font = "bold 7px 'Press Start 2P',monospace";
        ctx.fillStyle = z.blockLabel;
        ctx.textAlign = "center";
        ctx.shadowColor = lc;
        ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
        ctx.fillText(this.label, sx + TILE/2, sy + TILE/2 + 3);
        ctx.restore();
      }
    }

    get rect() { return { x:this.worldX, y:this.y, w:TILE, h:TILE }; }
  }

  /* ================================================================
     BRICK  (colored by zone)
     ================================================================ */
  class Brick {
    constructor(worldX, y, zone) {
      this.worldX = worldX; this.y = y; this.zone = zone;
      this.alive = true; this.shakeT = 0; this.shakeY = 0;
    }
    update() {
      if (this.shakeT > 0) { this.shakeT--; this.shakeY = Math.sin((8-this.shakeT)/8*Math.PI)*-7; }
      else this.shakeY = 0;
    }
    shake() { this.shakeT = 8; spawnParticles(this.worldX+16, this.y, ZONES[this.zone].blockFill, 3); }
    draw(cx) {
      if (!this.alive) return;
      const z  = ZONES[this.zone];
      const sx = this.worldX - cx, sy = this.y + this.shakeY;
      px(sx, sy, TILE, TILE, z.blockFill);
      px(sx, sy, TILE, 3, z.blockLight);
      px(sx, sy, 3, TILE, z.blockLight);
      px(sx+TILE-3, sy, 3, TILE, z.blockDark);
      px(sx, sy+TILE-3, TILE, 3, z.blockDark);
      px(sx+3, sy+TILE/2, TILE-6, 2, z.blockDark);
      px(sx+TILE/2, sy+4, 2, TILE/2-4, z.blockDark);
    }
    get rect() { return { x:this.worldX, y:this.y, w:TILE, h:TILE }; }
  }

  /* ================================================================
     PIPE  (themed: CRP = bleu "pipeline commandes", PLC = vert "rouleau tissu")
     ================================================================ */
  class Pipe {
    constructor(worldX, h, zone) {
      this.worldX = worldX; this.h = h; this.zone = zone;
    }
    draw(cx) {
      const z  = ZONES[this.zone];
      const sx = this.worldX - cx;
      const sy = canvas.height - GH - this.h * TILE;
      const w  = TILE * 2;

      // Shaft
      px(sx, sy+TILE, w, this.h*TILE-TILE, z.pipe);
      px(sx, sy+TILE, 8, this.h*TILE-TILE, z.pipeDark);
      // Cap
      px(sx-4, sy, w+8, TILE, z.pipe);
      px(sx-4, sy, 8, TILE, z.pipeDark);
      // Border
      ctx.strokeStyle = C.black;
      ctx.lineWidth = 3;
      ctx.strokeRect(sx, sy+TILE, w, this.h*TILE-TILE);
      ctx.strokeRect(sx-4, sy, w+8, TILE);

      // Label on pipe
      const label = this.zone === "CRP" ? "PO" : "PLC";
      ctx.save();
      ctx.font = "bold 7px 'Press Start 2P',monospace";
      ctx.fillStyle = z.blockLabel;
      ctx.textAlign = "center";
      ctx.fillText(label, sx + w/2, sy + TILE/2 + 3);
      ctx.restore();
    }
    get rect() {
      return { x:this.worldX-4, y:canvas.height-GH-this.h*TILE, w:TILE*2+8, h:this.h*TILE };
    }
  }

  /* ================================================================
     ENEMIES
     CRP zone → "BUG" (erreur de commande, carré rouge avec ?)
     PLC zone → "DEFECT" (défaut tissu, chenille orange)
     ================================================================ */
  class Enemy {
    constructor(worldX, zone) {
      this.worldX  = worldX;
      this.x       = worldX;
      this.y       = canvas.height - GH - 36;
      this.vx      = -1.6;
      this.zone    = zone;
      this.alive   = true;
      this.squished= false;
      this.squishT = 0;
      this.frame   = 0;
      this.ft      = 0;
    }

    update() {
      if (this.squished) { this.squishT--; if (this.squishT <= 0) this.alive = false; return; }
      this.x  += this.vx;
      this.ft++;
      if (this.ft % 18 === 0) this.frame ^= 1;
    }

    squish() {
      this.squished = true; this.squishT = 35;
      const z = ZONES[this.zone];
      spawnParticles(this.x+16, this.y+16, z.enemyBody, 7);
      score += this.zone === "CRP" ? 200 : 250;
      spawnFloatText(this.x - worldX + 16, this.y, this.zone === "CRP" ? "BUG FIXED!" : "DEFECT OUT!");
    }

    draw(cx) {
      const sx = this.x - cx;
      const sy = this.y;
      const z  = ZONES[this.zone];

      if (this.squished) {
        px(sx, sy+20, 36, 10, z.enemyBody);
        px(sx+2, sy+18, 32, 4, z.enemyDark);
        return;
      }

      if (this.zone === "CRP") {
        // BUG : mini tableur carré rouge avec un "?" qui clignote
        px(sx+2, sy+6, 32, 30, z.enemyBody);
        px(sx+2, sy+6, 32, 5, z.enemyDark);   // header
        // screen lines (like spreadsheet)
        for (let i=0; i<3; i++) px(sx+5, sy+14+i*6, 22, 2, z.enemyDark);
        // "?" blink
        if (this.frame===0) {
          ctx.save(); ctx.font = "bold 12px monospace"; ctx.fillStyle = C.white;
          ctx.fillText("?!", sx+10, sy+32); ctx.restore();
        }
        // Feet
        const lx = this.frame===0 ? 0 : 4;
        px(sx+4+lx, sy+34, 8, 6, z.enemyDark);
        px(sx+24-lx, sy+34, 8, 6, z.enemyDark);
        // Angry eyes
        px(sx+6, sy+10, 4, 4, C.white);  px(sx+22, sy+10, 4, 4, C.white);
        px(sx+7, sy+11, 2, 2, C.black);  px(sx+23, sy+11, 2, 2, C.black);
      } else {
        // DEFECT : chenille orange (tissu défectueux)
        // Segments
        for (let i=0; i<3; i++) {
          px(sx+i*10+2, sy+14, 12, 16, z.enemyBody);
          px(sx+i*10+4, sy+12, 8, 5, z.enemyDark);
        }
        // Head
        px(sx+4, sy+4, 18, 14, z.enemyBody);
        px(sx+5, sy+8, 5, 5, C.white); px(sx+14, sy+8, 5, 5, C.white);
        px(sx+6, sy+9, 3, 3, C.black); px(sx+15, sy+9, 3, 3, C.black);
        // Antennae
        px(sx+7, sy, 2, 6, z.enemyDark); px(sx+15, sy, 2, 6, z.enemyDark);
        // Feet animated
        const lx2 = this.frame===0?0:3;
        for (let i=0; i<3; i++) {
          px(sx+i*10+4+lx2, sy+28, 4, 6, z.enemyDark);
          px(sx+i*10+8-lx2, sy+28, 4, 6, z.enemyDark);
        }
        // "X" mark (défaut)
        ctx.save(); ctx.font="bold 8px monospace"; ctx.fillStyle=C.white;
        ctx.fillText("✗", sx+10, sy+20); ctx.restore();
      }
    }

    get rect() { return { x:this.x+4, y:this.y+4, w:28, h:30 }; }
  }

  /* ================================================================
     COIN / SWATCH  (animé)
     ================================================================ */
  class Coin {
    constructor(worldX, y, color, zone) {
      this.worldX = worldX; this.y = y; this.color = color; this.zone = zone;
      this.vy = -9; this.alive = true; this.frame = 0; this.timer = 55;
    }
    update() {
      this.vy += 0.45; this.y += this.vy;
      this.frame = (this.frame + 0.3) % 4;
      this.timer--;
      if (this.timer <= 0) this.alive = false;
    }
    draw(cx) {
      const sx = this.worldX - cx;
      if (this.zone === "PLC") {
        // Swatch de tissu (rectangle avec texture)
        const w = 14, h = 10;
        px(sx - w/2, this.y, w, h, this.color);
        // tissu lines
        for (let i=0; i<3; i++) px(sx-w/2+1, this.y+i*3, w-2, 1, "#00000033");
        ctx.save(); ctx.font="5px monospace"; ctx.fillStyle=C.white;
        ctx.fillText("≡", sx-2, this.y+8); ctx.restore();
      } else {
        // PO badge (Purchase Order)
        const w = [12,7,2,7][Math.floor(this.frame)];
        px(sx - 6, this.y, w, 16, this.color);
        ctx.save(); ctx.font="5px monospace"; ctx.fillStyle=C.black;
        if (w > 6) ctx.fillText("PO", sx-5, this.y+10);
        ctx.restore();
      }
    }
  }

  /* ================================================================
     PARTICLES
     ================================================================ */
  class Particle {
    constructor(wx, y, color) {
      this.worldX = wx; this.y = y;
      this.vx = (Math.random()-0.5)*6;
      this.vy = Math.random()*-7-2;
      this.color = color;
      this.life = 40+Math.random()*20; this.maxLife = this.life;
      this.size = 4+Math.random()*4;
    }
    update() { this.vy+=0.4; this.worldX+=this.vx; this.y+=this.vy; this.life--; }
    draw(cx) {
      ctx.globalAlpha = this.life/this.maxLife;
      px(this.worldX-cx, this.y, this.size, this.size, this.color);
      ctx.globalAlpha = 1;
    }
    get alive() { return this.life > 0; }
  }

  /* ================================================================
     FLOATING TEXT
     ================================================================ */
  class FloatText {
    constructor(x, y, text) { this.x=x; this.y=y; this.text=text; this.life=55; }
    update() { this.y-=0.9; this.life--; }
    draw() {
      ctx.globalAlpha = Math.min(1, this.life/15);
      ctx.font = "bold 8px 'Press Start 2P',monospace";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000"; ctx.lineWidth = 3;
      ctx.strokeText(this.text, this.x, this.y);
      ctx.fillText(this.text, this.x, this.y);
      ctx.globalAlpha = 1;
    }
    get alive() { return this.life > 0; }
  }

  /* ================================================================
     CLOUDS (thématisées : CRP = nuages données, PLC = nuages coton)
     ================================================================ */
  class Cloud {
    constructor(x, y, w, zone) { this.x=x; this.y=y; this.w=w; this.zone=zone||"CRP"; }
    update() {
      this.x -= SCROLL_SPEED * 0.35;
      if (this.x + this.w < 0) {
        this.x = canvas.width + 80;
        this.zone = currentZone;
      }
    }
    draw() {
      const alpha = 0.55;
      ctx.globalAlpha = alpha;
      // Cloud shape
      ctx.fillStyle = this.zone === "CRP" ? "#c8d8ff" : "#d4f7dc";
      ctx.beginPath();
      ctx.roundRect(this.x, this.y+18, this.w, 24, 4);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(this.x+this.w*0.15, this.y+8, this.w*0.35, 22, 4);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(this.x+this.w*0.48, this.y+2, this.w*0.32, 28, 4);
      ctx.fill();
      ctx.strokeStyle = "#00000044"; ctx.lineWidth=2;
      ctx.strokeRect(this.x, this.y+18, this.w, 24);
      // Label on cloud
      ctx.globalAlpha = 0.8;
      ctx.font = "5px 'Press Start 2P',monospace";
      ctx.fillStyle = this.zone === "CRP" ? "#1565c0" : "#1b7a2f";
      const label = this.zone === "CRP"
        ? ["ORDER","DELIVERY","INVOICE","STOCK","PO"][Math.abs(Math.floor(this.x/100))%5]
        : ["WARP","WEFT","SWATCH","DESIGN","BLEND"][Math.abs(Math.floor(this.x/100))%5];
      ctx.fillText(label, this.x + this.w*0.2, this.y + 34);
      ctx.globalAlpha = 1;
    }
  }

  /* ================================================================
     SIGN  (panneau de zone à l'entrée)
     ================================================================ */
  class ZoneSign {
    constructor(worldX, zone) { this.worldX=worldX; this.zone=zone; }
    draw(cx) {
      const z  = ZONES[this.zone];
      const sx = this.worldX - cx;
      const sy = canvas.height - GH - 90;
      // Pole
      px(sx+22, sy+60, 6, 36, "#8B4513");
      // Board
      px(sx, sy, 50, 55, z.blockFill);
      px(sx, sy, 50, 3, z.blockLight);
      px(sx, sy, 3, 55, z.blockLight);
      px(sx+47, sy, 3, 55, z.blockDark);
      px(sx, sy+52, 50, 3, z.blockDark);
      // Text
      ctx.save();
      ctx.font = "bold 6px 'Press Start 2P',monospace";
      ctx.fillStyle = C.white;
      ctx.textAlign = "center";
      ctx.fillText("ZONE", sx+25, sy+16);
      ctx.font = "bold 10px 'Press Start 2P',monospace";
      ctx.fillStyle = z.coinColor;
      ctx.fillText(this.zone, sx+25, sy+32);
      ctx.font = "5px 'Press Start 2P',monospace";
      ctx.fillStyle = "#cccccc";
      const words = z.sublabel.split(" & ");
      words.forEach((w,i) => ctx.fillText(w, sx+25, sy+43+i*9));
      ctx.restore();
    }
  }

  /* ================================================================
     SCORE / COLLECTIONS
     ================================================================ */
  let score     = 0;
  let poCount   = 0;     // CRP coins collected
  let swatches  = 0;     // PLC coins collected
  let enemies_defeated = 0;

  let entities = { enemies:[], blocks:[], bricks:[], pipes:[], coins:[], particles:[], floatTexts:[], clouds:[], signs:[] };

  function spawnCoin(wx, y, color, zone) {
    entities.coins.push(new Coin(wx, y, color, zone));
  }
  function spawnParticles(wx, y, color, n) {
    for (let i=0;i<n;i++) {
      const p = new Particle(wx, y, color);
      entities.particles.push(p);
    }
  }
  function spawnFloatText(sx, sy, text) {
    entities.floatTexts.push(new FloatText(sx, sy, text));
  }

  /* ================================================================
     WORLD GENERATION
     ================================================================ */
  let generatedUpTo = 0;

  function generateChunk(from, to, zone) {
    const step = 190;
    for (let wx=from; wx<to; wx+=step) {
      const roll = Math.random();
      const blockY  = canvas.height - GH - TILE * 4;
      const blockY2 = canvas.height - GH - TILE * 5;

      if (roll < 0.25) {
        // Themed block (CRP or PLC)
        const labels = zone === "CRP"
          ? ["CRP","PO","CMD","STK"]
          : ["PLC","WARP","DEV","TEX"];
        entities.blocks.push(new ThemeBlock(wx, blockY, zone, labels[Math.floor(Math.random()*labels.length)]));
      } else if (roll < 0.45) {
        // Enemy
        entities.enemies.push(new Enemy(wx + canvas.width, zone));
      } else if (roll < 0.6) {
        // Brick row
        const count = 3 + Math.floor(Math.random()*4);
        for (let b=0; b<count; b++) entities.bricks.push(new Brick(wx+b*TILE, blockY, zone));
        // Bonus block above
        if (Math.random()<0.5) entities.blocks.push(new ThemeBlock(wx+TILE, blockY2, zone, zone==="CRP"?"CRP":"PLC"));
      } else if (roll < 0.78) {
        // Pipe
        entities.pipes.push(new Pipe(wx, 2+Math.floor(Math.random()*3), zone));
      } else if (roll < 0.9) {
        // Enemy + blocks combo
        entities.blocks.push(new ThemeBlock(wx, blockY, zone, zone==="CRP"?"PO":"SWTCH"));
        entities.blocks.push(new ThemeBlock(wx+TILE*2, blockY, zone, zone));
        entities.enemies.push(new Enemy(wx + canvas.width + 50, zone));
      } else {
        // Staircase of blocks
        for (let s=0; s<3; s++) {
          entities.bricks.push(new Brick(wx+s*TILE, canvas.height-GH-TILE*(s+2), zone));
        }
      }
    }
    generatedUpTo = to;
  }

  function initWorld() {
    Object.keys(entities).forEach(k => entities[k] = []);
    generatedUpTo = 0;
    score = 0; poCount = 0; swatches = 0; enemies_defeated = 0;

    // Clouds
    for (let i=0; i<5; i++) {
      entities.clouds.push(new Cloud(
        Math.random()*canvas.width,
        30 + Math.random()*(canvas.height*0.28),
        80 + Math.random()*80,
        "CRP"
      ));
    }
    // Opening sign
    entities.signs.push(new ZoneSign(250, "CRP"));

    generateChunk(350, canvas.width + 700, "CRP");
  }

  /* ================================================================
     ZONE SWITCHING
     ================================================================ */
  function switchZone() {
    if (zoneTransitioning) return;
    zoneTransitioning = true;
    zoneFade = 0;
    const nextZone = currentZone === "CRP" ? "PLC" : "CRP";

    // Drop a sign for the new zone
    entities.signs.push(new ZoneSign(worldX + canvas.width + 100, nextZone));

    // Schedule actual switch
    setTimeout(() => {
      currentZone = nextZone;
      zoneProgress = 0;
      zoneTransitioning = false;
    }, 2000);
  }

  /* ================================================================
     COLLISION HELPERS
     ================================================================ */
  function rectsOverlap(a, b) {
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }
  function marioLandsOn(mr, br) {
    const prevBot = mario.y + 48 - mario.vy;
    return mr.x+mr.w > br.x+4 && mr.x < br.x+br.w-4 && prevBot <= br.y+2 && mr.y+mr.h >= br.y;
  }
  function marioHitsBottom(mr, br) {
    const prevTop = mario.y - mario.vy;
    return mr.x+mr.w > br.x+4 && mr.x < br.x+br.w-4 && prevTop >= br.y+br.h-4 && mr.y <= br.y+br.h;
  }

  /* ================================================================
     AUTO-JUMP AI
     ================================================================ */
  let jumpCooldown = 0;

  function autoJump() {
    if (!mario.onGround || jumpCooldown > 0) return;
    const lookX = mario.x + 100;

    const pipeAhead   = entities.pipes.find(p => { const rx=p.worldX-worldX; return rx>mario.x+10&&rx<lookX; });
    const enemyAhead  = entities.enemies.find(e => e.alive&&!e.squished && { x:e.x-worldX, y:e.y, w:36, h:36 } && (e.x-worldX)>mario.x+5&&(e.x-worldX)<lookX);
    const blockAhead  = [...entities.blocks,...entities.bricks].find(b => {
      if (b.alive===false) return false;
      const rx=b.worldX-worldX, ry=b.y;
      return rx>mario.x&&rx<lookX&&ry>mario.groundY-100;
    });

    if (pipeAhead || enemyAhead || blockAhead) {
      mario.jump();
      jumpCooldown = 45;
    }
  }

  /* ================================================================
     UPDATE
     ================================================================ */
  function update() {
    worldX      += SCROLL_SPEED;
    zoneProgress += SCROLL_SPEED;

    if (jumpCooldown > 0) jumpCooldown--;
    autoJump();
    mario.update();

    // Zone switch
    if (zoneProgress > ZONE_LENGTH && !zoneTransitioning) switchZone();

    // Generate ahead
    if (worldX + canvas.width + 900 > generatedUpTo) {
      generateChunk(generatedUpTo, generatedUpTo + 1400, currentZone);
    }

    // Update clouds
    entities.clouds.forEach(c => c.update());
    if (Math.random() < 0.004) {
      entities.clouds.push(new Cloud(canvas.width+60, 20+Math.random()*canvas.height*0.3, 80+Math.random()*100, currentZone));
    }

    // Update all entities
    entities.enemies.forEach(e => e.update());
    entities.blocks.forEach(b => b.update());
    entities.bricks.forEach(b => b.update());
    entities.coins.forEach(c => c.update());
    entities.particles.forEach(p => p.update());
    entities.floatTexts.forEach(f => f.update());

    // Cull off-screen
    const cullLeft = worldX - 350;
    entities.enemies   = entities.enemies.filter(e => e.alive && e.x > cullLeft);
    entities.blocks    = entities.blocks.filter(b => b.worldX > cullLeft);
    entities.bricks    = entities.bricks.filter(b => b.worldX > cullLeft);
    entities.pipes     = entities.pipes.filter(p => p.worldX > cullLeft);
    entities.signs     = entities.signs.filter(s => s.worldX > cullLeft);
    entities.coins     = entities.coins.filter(c => c.alive);
    entities.particles = entities.particles.filter(p => p.alive);
    entities.floatTexts= entities.floatTexts.filter(f => f.alive);

    /* ---- Mario vs blocks (from below) ---- */
    [...entities.blocks, ...entities.bricks].forEach(block => {
      const br = { x:block.worldX-worldX, y:block.y, w:TILE, h:TILE };
      if (marioHitsBottom({ x:mario.x, y:mario.y, w:42, h:48 }, br)) {
        mario.vy = Math.abs(mario.vy)*0.4;
        if (block instanceof ThemeBlock) block.activate();
        else if (block instanceof Brick)  block.shake();
      }
      if (marioLandsOn({ x:mario.x, y:mario.y, w:42, h:48 }, br)) {
        mario.y = br.y - 48; mario.vy = 0; mario.onGround = true;
      }
    });

    /* ---- Mario vs pipes ---- */
    entities.pipes.forEach(pipe => {
      const pr = { x:pipe.worldX-worldX-4, y:pipe.rect.y, w:pipe.rect.w, h:pipe.rect.h };
      if (marioLandsOn({ x:mario.x, y:mario.y, w:42, h:48 }, pr)) {
        mario.y = pr.y - 48; mario.vy = 0; mario.onGround = true;
      }
    });

    /* ---- Mario vs enemies ---- */
    entities.enemies.forEach(e => {
      if (e.squished || mario.invincible > 0) return;
      const er = { x:e.x-worldX+4, y:e.y+4, w:28, h:30 };
      if (rectsOverlap({ x:mario.x, y:mario.y, w:42, h:48 }, er)) {
        const prevBot = mario.y + 48 - mario.vy;
        if (prevBot <= er.y + 8 && mario.vy > 0) {
          e.squish(); mario.vy = -9; enemies_defeated++;
        } else {
          mario.invincible = 85; mario.vy = -7;
        }
      }
    });
  }

  /* ================================================================
     DRAW GROUND
     ================================================================ */
  function drawGround() {
    const z   = getZone();
    const gy  = canvas.height - GH;
    const w   = canvas.width;
    const off = Math.floor(worldX) % 40;

    px(0, gy, w, GH, z.ground);
    px(0, gy, w, 5, z.groundTop);
    px(0, gy + GH - 4, w, 4, z.blockDark);

    ctx.strokeStyle = z.blockDark; ctx.lineWidth=2;
    for (let x=-off; x<w+40; x+=40) {
      ctx.beginPath(); ctx.moveTo(x,gy+5); ctx.lineTo(x,gy+GH-4); ctx.stroke();
    }
    for (let y=gy+5; y<canvas.height-4; y+=30) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
    }
  }

  /* ================================================================
     DRAW SKY + ZONE BANNER
     ================================================================ */
  function drawSky() {
    const z    = getZone();
    const next = ZONES[currentZone==="CRP"?"PLC":"CRP"];
    const fade = Math.min(1, Math.max(0, (zoneProgress - ZONE_LENGTH*0.8) / (ZONE_LENGTH*0.2)));

    const skyColor  = lerpColor(z.sky, next.sky, fade);
    const skyColor2 = lerpColor(z.skyFar||z.sky, next.skyFar||next.sky, fade);

    // Gradient sky
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, skyColor2);
    grad.addColorStop(1, skyColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars/grid lines in sky (différent par zone)
    if (currentZone === "CRP") {
      // CRP : grille de données légère (lignes bleues)
      ctx.strokeStyle = "rgba(100,150,255,0.08)";
      ctx.lineWidth = 1;
      for (let x=(worldX*0.1%80)-80; x<canvas.width+80; x+=80) {
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height*0.7); ctx.stroke();
      }
      for (let y=40; y<canvas.height*0.7; y+=50) {
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
      }
    } else {
      // PLC : motif tissu délicat (lignes vertes)
      ctx.strokeStyle = "rgba(80,200,100,0.07)";
      ctx.lineWidth = 1;
      const weavOff = worldX * 0.15 % 24;
      for (let x=-weavOff; x<canvas.width+24; x+=24) {
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+20,canvas.height*0.65); ctx.stroke();
      }
      for (let x=-weavOff+12; x<canvas.width+24; x+=24) {
        ctx.beginPath(); ctx.moveTo(x,canvas.height*0.65); ctx.lineTo(x+20,0); ctx.stroke();
      }
    }
  }

  /* ================================================================
     DRAW HUD
     ================================================================ */
  function drawHUD() {
    const z = getZone();
    ctx.save();
    ctx.font = "7px 'Press Start 2P',monospace";
    ctx.fillStyle = C.white;
    ctx.shadowColor = C.black; ctx.shadowOffsetX=2; ctx.shadowOffsetY=2;

    // Zone badge
    ctx.fillStyle = z.coinColor;
    ctx.fillRect(12, 8, 62, 18);
    ctx.fillStyle = C.black;
    ctx.font = "bold 7px 'Press Start 2P',monospace";
    ctx.fillText("ZONE "+currentZone, 15, 21);

    // Sublabel
    ctx.fillStyle = C.white;
    ctx.font = "5px 'Press Start 2P',monospace";
    ctx.fillText(z.sublabel, 15, 35);

    // Score
    ctx.font = "7px 'Press Start 2P',monospace";
    ctx.fillText("PTS: "+String(score).padStart(6,"0"), 15, 52);

    // PO counter (CRP)
    ctx.fillText("PO: "+poCount, 15, 65);
    // Swatches (PLC)
    ctx.fillText("SWATCH: "+swatches, 15, 78);

    ctx.shadowOffsetX=0; ctx.shadowOffsetY=0;
    ctx.restore();
  }

  /* ================================================================
     RENDER
     ================================================================ */
  function draw() {
    drawSky();
    entities.clouds.forEach(c => c.draw());
    drawGround();
    entities.pipes.forEach(p => p.draw(worldX));
    entities.signs.forEach(s => s.draw(worldX));
    entities.blocks.forEach(b => b.draw(worldX));
    entities.bricks.forEach(b => b.draw(worldX));
    entities.coins.forEach(c => c.draw(worldX));
    entities.enemies.forEach(e => e.draw(worldX));
    mario.draw();
    entities.particles.forEach(p => p.draw(worldX));
    entities.floatTexts.forEach(f => f.draw());
    drawHUD();
  }

  /* ================================================================
     LOOP
     ================================================================ */
  let last = 0;
  function loop(ts) {
    if (ts - last >= 1000/FPS) { update(); draw(); last = ts; }
    requestAnimationFrame(loop);
  }

  mario.reset();
  initWorld();
  requestAnimationFrame(loop);

})();
