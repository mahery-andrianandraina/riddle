/**
 * mario-bg.js — Super Mario Bros NES Authentic Theme
 * Vraies couleurs NES : ciel bleu #5c94fc, sol brun/orange,
 * blocs ? jaunes, briques orange, tuyaux verts, nuages blancs
 * Mario pixel-art authentique rouge/bleu
 */
(function () {
  "use strict";

  const canvas = document.getElementById("mario-bg-canvas");
  const ctx    = canvas.getContext("2d");

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  /* ============================================================
     PALETTE NES AUTHENTIQUE
     ============================================================ */
  const NES = {
    // Ciel
    sky:          "#5c94fc",  // bleu Mario NES exact
    // Sol
    ground:       "#c84c0c",  // brun-orange brique NES
    groundTop:    "#e86018",
    groundDark:   "#6c2800",
    groundBrick:  "#e86018",
    // Briques
    brick:        "#c84c0c",
    brickLight:   "#fcd8a0",
    brickDark:    "#702000",
    // Bloc ?
    qBlock:       "#f8b800",
    qBlockLight:  "#fce870",
    qBlockDark:   "#b86000",
    qBlockText:   "#000000",
    // Tuyaux
    pipeGreen:    "#00a800",
    pipeLight:    "#00cc00",
    pipeDark:     "#007000",
    pipeVDark:    "#004400",
    // Nuages
    cloud:        "#ffffff",
    cloudShadow:  "#c0c0c0",
    // Collines
    hill:         "#00a800",
    hillDark:     "#007000",
    // Mario
    marioRed:     "#e52521",
    marioSkin:    "#fcd8a0",
    marioPants:   "#0000e0",
    marioHat:     "#e52521",
    marioShoe:    "#702000",
    marioMust:    "#702000",
    // Goomba
    goombaBrown:  "#c84c0c",
    goombaDark:   "#702000",
    goombaFeet:   "#702000",
    // Coin
    coin:         "#f8b800",
    coinShine:    "#fce870",
    // Text labels
    white:        "#ffffff",
    black:        "#000000",
  };

  const TILE         = 32;
  const GH           = 64;
  const GRAVITY      = 0.55;
  const SCROLL_SPEED = 2.2;
  const FPS          = 60;

  let worldX = 0;

  function px(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  /* ============================================================
     MARIO (pixel art NES authentique, échelle 3px/pixel)
     ============================================================ */
  const mario = {
    x: 110, y: 0, vy: 0,
    onGround: false,
    frame: 0, ft: 0,
    invincible: 0,
    get groundY() { return canvas.height - GH - 48; },
    reset() { this.y = this.groundY; this.vy = 0; this.onGround = true; this.invincible = 0; },
    jump() { if (this.onGround) { this.vy = -13.5; this.onGround = false; } },
    update() {
      this.ft++;
      if (this.ft % 5 === 0) this.frame = (this.frame + 1) % 3;
      this.vy += GRAVITY;
      this.y  += this.vy;
      if (this.y >= this.groundY) { this.y = this.groundY; this.vy = 0; this.onGround = true; }
      if (this.invincible > 0) this.invincible--;
      if (this.y > canvas.height + 80) this.reset();
    },
    draw() {
      const sx = this.x, sy = this.y, S = 3;
      const isJ = !this.onGround;
      if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0) return;

      // ── Chapeau ──
      px(sx+3*S, sy+0*S, 6*S, S, NES.marioHat);
      px(sx+2*S, sy+1*S, 8*S, S, NES.marioHat);
      // ── Cheveux / Visage ──
      px(sx+1*S, sy+2*S, 4*S, S, NES.marioMust);
      px(sx+1*S, sy+3*S, 9*S, 2*S, NES.marioSkin);
      px(sx+2*S, sy+5*S, 8*S, S,   NES.marioSkin);
      // ── Yeux ──
      px(sx+2*S, sy+3*S, 2*S, S, NES.black);
      px(sx+6*S, sy+3*S, 2*S, S, NES.black);
      // ── Moustache ──
      px(sx+1*S, sy+5*S, 9*S, S, NES.marioMust);
      px(sx+0*S, sy+6*S, 5*S, S, NES.marioMust);
      px(sx+6*S, sy+6*S, 5*S, S, NES.marioMust);
      // ── Chemise rouge ──
      px(sx+0*S, sy+7*S, 11*S, 3*S, NES.marioRed);
      // ── Salopette bleue ──
      px(sx+1*S, sy+10*S, 9*S, S, NES.marioPants);
      px(sx+0*S, sy+11*S, 11*S, 2*S, NES.marioPants);
      // Bretelles
      px(sx+2*S, sy+10*S, 2*S, S, NES.marioPants);
      px(sx+7*S, sy+10*S, 2*S, S, NES.marioPants);
      // ── Jambes ──
      if (isJ) {
        px(sx+1*S, sy+13*S, 4*S, 3*S, NES.marioPants);
        px(sx+6*S, sy+13*S, 4*S, 3*S, NES.marioPants);
        px(sx+0*S, sy+14*S, 5*S, 2*S, NES.marioShoe);
        px(sx+6*S, sy+14*S, 5*S, 2*S, NES.marioShoe);
      } else {
        const f = this.frame;
        const leg1Y = [0, 1, 0][f];
        const leg2Y = [0, -1, 0][f];
        px(sx+1*S, sy+13*S+leg1Y, 4*S, 3*S, NES.marioPants);
        px(sx+6*S, sy+13*S+leg2Y, 4*S, 3*S, NES.marioPants);
        px(sx+0*S, sy+14*S+leg1Y, 5*S, 2*S, NES.marioShoe);
        px(sx+6*S, sy+14*S+leg2Y, 5*S, 2*S, NES.marioShoe);
      }
      // ── Bras ──
      const armOff = isJ ? -1 : [0,1,-1][this.frame];
      px(sx-1*S, sy+7*S+armOff, 2*S, 3*S, NES.marioRed);
      px(sx+10*S,sy+7*S-armOff, 2*S, 3*S, NES.marioRed);
      px(sx-1*S, sy+9*S+armOff, 2*S, S, NES.marioSkin);
      px(sx+10*S,sy+9*S-armOff, 2*S, S, NES.marioSkin);
    },
    get rect() { return { x: this.x, y: this.y, w: 33, h: 48 }; }
  };

  /* ============================================================
     BLOC ? (Question Block NES)
     ============================================================ */
  class QBlock {
    constructor(wx, y) {
      this.worldX = wx; this.y = y;
      this.hit = false; this.bounceT = 0; this.bounceY = 0;
      this.ft = 0; this.frame = 0;
      // Label CRP ou PLC selon worldX
      this.label = (Math.floor(wx / 200) % 2 === 0) ? "CRP" : "PLC";
    }
    update() {
      this.ft++;
      if (!this.hit && this.ft % 18 === 0) this.frame = (this.frame + 1) % 2;
      if (this.bounceT > 0) {
        this.bounceT--;
        this.bounceY = Math.sin((12 - this.bounceT) / 12 * Math.PI) * -10;
      } else this.bounceY = 0;
    }
    activate() {
      if (!this.hit) {
        this.hit = true; this.bounceT = 12;
        spawnCoin(this.worldX + 16, this.y - 20);
        spawnParticles(this.worldX + 16, this.y, NES.qBlock, 4);
        spawnFloatText(this.worldX - worldX + 16, this.y, "+200");
        score += 200;
      }
    }
    draw(cx) {
      const sx = this.worldX - cx, sy = this.y + this.bounceY;
      if (this.hit) {
        // Bloc frappé = gris/marron
        px(sx, sy, TILE, TILE, "#888888");
        px(sx, sy, TILE, 3, "#aaaaaa");
        px(sx, sy, 3, TILE, "#aaaaaa");
        px(sx+TILE-3, sy, 3, TILE, "#555555");
        px(sx, sy+TILE-3, TILE, 3, "#555555");
        return;
      }
      // Fond jaune
      px(sx, sy, TILE, TILE, NES.qBlock);
      // Bordure NES
      px(sx, sy, TILE, 3, NES.qBlockLight);
      px(sx, sy, 3, TILE, NES.qBlockLight);
      px(sx+TILE-3, sy, 3, TILE, NES.qBlockDark);
      px(sx, sy+TILE-3, TILE, 3, NES.qBlockDark);
      // Coin interne
      px(sx+3, sy+3, TILE-6, TILE-6, NES.qBlock);
      // "?" pixel art
      const q = this.frame === 0;
      if (q) {
        px(sx+10, sy+6,  12, 3, NES.black);
        px(sx+18, sy+9,   4, 6, NES.black);
        px(sx+12, sy+13,  6, 4, NES.black);
        px(sx+12, sy+20,  6, 4, NES.black);
      } else {
        px(sx+10, sy+6,  12, 3, NES.qBlockDark);
        px(sx+18, sy+9,   4, 6, NES.qBlockDark);
        px(sx+12, sy+13,  6, 4, NES.qBlockDark);
        px(sx+12, sy+20,  6, 4, NES.qBlockDark);
      }
      // Label CRP/PLC au-dessus
      ctx.save();
      ctx.font = "bold 6px 'Press Start 2P',monospace";
      ctx.fillStyle = this.label === "CRP" ? "#90caf9" : "#a9d6a0";
      ctx.textAlign = "center";
      ctx.shadowColor = "#000"; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
      ctx.fillText(this.label, sx + TILE/2, sy - 4);
      ctx.restore();
    }
    get rect() { return { x: this.worldX, y: this.y, w: TILE, h: TILE }; }
  }

  /* ============================================================
     BRIQUE NES
     ============================================================ */
  class Brick {
    constructor(wx, y) {
      this.worldX = wx; this.y = y;
      this.alive = true; this.shakeT = 0; this.shakeY = 0;
    }
    update() {
      if (this.shakeT > 0) { this.shakeT--; this.shakeY = Math.sin((8-this.shakeT)/8*Math.PI)*-8; }
      else this.shakeY = 0;
    }
    shake() {
      this.shakeT = 8;
      spawnParticles(this.worldX+16, this.y, NES.brick, 4);
    }
    draw(cx) {
      if (!this.alive) return;
      const sx = this.worldX - cx, sy = this.y + this.shakeY;
      px(sx, sy, TILE, TILE, NES.brick);
      // Joints horizontaux et verticaux
      px(sx, sy, TILE, 3, NES.brickLight);
      px(sx, sy, 3, TILE, NES.brickLight);
      px(sx+TILE-3, sy, 3, TILE, NES.brickDark);
      px(sx, sy+TILE-3, TILE, 3, NES.brickDark);
      // Ligne de mortier
      px(sx+3, sy+TILE/2, TILE-6, 2, NES.brickDark);
      px(sx+TILE/2, sy+4, 2, TILE/2-4, NES.brickDark);
    }
    get rect() { return { x: this.worldX, y: this.y, w: TILE, h: TILE }; }
  }

  /* ============================================================
     TUYAU VERT NES
     ============================================================ */
  class Pipe {
    constructor(wx, h) {
      this.worldX = wx; this.h = h;
      this.label = (Math.floor(wx / 300) % 2 === 0) ? "CRP" : "PLC";
    }
    draw(cx) {
      const sx = this.worldX - cx;
      const sy = canvas.height - GH - this.h * TILE;
      const w = TILE * 2;

      // Corps du tuyau
      px(sx+4, sy+TILE, w-8, this.h*TILE-TILE, NES.pipeGreen);
      // Reflet gauche
      px(sx+4, sy+TILE, 8, this.h*TILE-TILE, NES.pipeLight);
      // Ombre droite
      px(sx+w-8, sy+TILE, 4, this.h*TILE-TILE, NES.pipeDark);
      // Bordure noire
      ctx.strokeStyle = NES.black; ctx.lineWidth = 3;
      ctx.strokeRect(sx+4, sy+TILE, w-8, this.h*TILE-TILE);

      // Chapeau du tuyau
      px(sx, sy, w, TILE, NES.pipeGreen);
      px(sx, sy, 6, TILE, NES.pipeLight);
      px(sx+w-6, sy, 6, TILE, NES.pipeDark);
      ctx.strokeRect(sx, sy, w, TILE);

      // Ligne séparation chapeau/corps
      px(sx+4, sy+TILE-3, w-8, 3, NES.pipeDark);

      // Label coloré sur le chapeau
      ctx.save();
      ctx.font = "bold 7px 'Press Start 2P',monospace";
      ctx.fillStyle = this.label === "CRP" ? "#90caf9" : "#ffd166";
      ctx.textAlign = "center";
      ctx.shadowColor = "#000"; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
      ctx.fillText(this.label, sx + w/2, sy + TILE/2 + 3);
      ctx.restore();
    }
    get rect() {
      return { x: this.worldX, y: canvas.height-GH-this.h*TILE, w: TILE*2, h: this.h*TILE };
    }
  }

  /* ============================================================
     GOOMBA NES (pixel art authentique)
     ============================================================ */
  class Goomba {
    constructor(wx) {
      this.worldX = wx; this.x = wx;
      this.y = canvas.height - GH - 32;
      this.vx = -1.8;
      this.alive = true; this.squished = false; this.squishT = 0;
      this.frame = 0; this.ft = 0;
    }
    update() {
      if (this.squished) { this.squishT--; if (this.squishT<=0) this.alive=false; return; }
      this.x += this.vx; this.ft++;
      if (this.ft % 20 === 0) this.frame ^= 1;
    }
    squish() {
      this.squished = true; this.squishT = 30;
      spawnParticles(this.x+16, this.y+16, NES.goombaBrown, 6);
      spawnFloatText(this.x - worldX + 16, this.y, "+100");
      score += 100;
    }
    draw(cx) {
      const sx = this.x - cx, sy = this.y;
      if (this.squished) {
        // Goomba écrasé plat
        px(sx, sy+18, 32, 8, NES.goombaBrown);
        px(sx+2, sy+16, 28, 4, NES.goombaDark);
        // Pieds écartés
        px(sx-2, sy+22, 10, 6, NES.goombaFeet);
        px(sx+24, sy+22, 10, 6, NES.goombaFeet);
        return;
      }
      // Corps principal
      px(sx+2, sy+8, 28, 22, NES.goombaBrown);
      // Tête
      px(sx+4, sy, 24, 14, NES.goombaBrown);
      // Sourcils en colère
      px(sx+5, sy+3, 8, 3, NES.goombaDark);
      px(sx+19, sy+3, 8, 3, NES.goombaDark);
      // Angles intérieurs sourcils
      px(sx+10, sy+4, 2, 2, NES.goombaDark);
      px(sx+20, sy+4, 2, 2, NES.goombaDark);
      // Yeux blancs
      px(sx+6,  sy+7, 7, 6, NES.white);
      px(sx+19, sy+7, 7, 6, NES.white);
      // Pupilles
      px(sx+10, sy+8, 3, 4, NES.black);
      px(sx+21, sy+8, 3, 4, NES.black);
      // Contour foncé bas tête
      px(sx+4, sy+12, 24, 2, NES.goombaDark);
      // Pieds animés
      const lx = this.frame === 0 ? 0 : 5;
      px(sx+2+lx, sy+28, 10, 6, NES.goombaDark);
      px(sx+20-lx, sy+28, 10, 6, NES.goombaDark);
    }
    get rect() { return { x: this.x+4, y: this.y+4, w: 24, h: 26 }; }
  }

  /* ============================================================
     PIÈCE NES (spinning coin)
     ============================================================ */
  class Coin {
    constructor(wx, y) {
      this.worldX = wx; this.y = y;
      this.vy = -9; this.alive = true; this.frame = 0; this.timer = 50;
    }
    update() {
      this.vy += 0.5; this.y += this.vy;
      this.frame = (this.frame + 0.4) % 4;
      if (--this.timer <= 0) this.alive = false;
    }
    draw(cx) {
      const sx = this.worldX - cx;
      const frames = [10, 6, 2, 6];
      const w = frames[Math.floor(this.frame)];
      const ox = (10 - w) / 2;
      // Corps de la pièce
      px(sx - 5 + ox, this.y, w, 16, NES.coin);
      // Reflet
      px(sx - 5 + ox, this.y + 2, Math.max(2, w/3), 4, NES.coinShine);
    }
  }

  /* ============================================================
     PARTICULES
     ============================================================ */
  class Particle {
    constructor(wx, y, color) {
      this.worldX = wx; this.y = y;
      this.vx = (Math.random()-0.5)*7;
      this.vy = Math.random()*-8-2;
      this.color = color;
      this.life = 35+Math.random()*20; this.maxLife = this.life;
      this.size = 4+Math.random()*5;
    }
    update() { this.vy+=0.45; this.worldX+=this.vx; this.y+=this.vy; this.life--; }
    draw(cx) {
      ctx.globalAlpha = this.life/this.maxLife;
      px(this.worldX-cx, this.y, this.size, this.size, this.color);
      ctx.globalAlpha = 1;
    }
    get alive() { return this.life > 0; }
  }

  /* ============================================================
     TEXTE FLOTTANT
     ============================================================ */
  class FloatText {
    constructor(x, y, text) { this.x=x; this.y=y; this.text=text; this.life=50; }
    update() { this.y -= 1; this.life--; }
    draw() {
      ctx.globalAlpha = Math.min(1, this.life/12);
      ctx.font = "bold 9px 'Press Start 2P',monospace";
      ctx.fillStyle = NES.coin;
      ctx.strokeStyle = NES.black; ctx.lineWidth = 3;
      ctx.strokeText(this.text, this.x, this.y);
      ctx.fillText(this.text, this.x, this.y);
      ctx.globalAlpha = 1;
    }
    get alive() { return this.life > 0; }
  }

  /* ============================================================
     NUAGE NES (blanc, forme authentique)
     ============================================================ */
  class Cloud {
    constructor(x, y, scale) { this.x=x; this.y=y; this.scale=scale||1; }
    update() {
      this.x -= SCROLL_SPEED * 0.3;
      if (this.x < -120 * this.scale) this.x = canvas.width + 60;
    }
    draw() {
      const s = this.scale;
      const x = this.x, y = this.y;
      ctx.fillStyle = NES.white;
      // Forme en 3 cercles comme NES
      this._circle(x + 16*s, y + 20*s, 16*s);
      this._circle(x + 32*s, y + 10*s, 22*s);
      this._circle(x + 56*s, y + 14*s, 18*s);
      this._circle(x + 72*s, y + 20*s, 14*s);
      // Base plate
      ctx.fillRect(x + 14*s, y + 20*s, 62*s, 16*s);
      // Contour noir
      ctx.strokeStyle = NES.black; ctx.lineWidth = 2;
      ctx.strokeRect(x + 14*s, y + 20*s, 62*s, 16*s);
      // Ombre bas droite
      ctx.fillStyle = NES.cloudShadow;
      ctx.fillRect(x + 14*s, y + 32*s, 62*s, 4*s);
    }
    _circle(cx, cy, r) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
    }
  }

  /* ============================================================
     COLLINE NES (verte, forme demi-cercle avec yeux)
     ============================================================ */
  class Hill {
    constructor(x, size) { this.x=x; this.size=size; }
    update() { this.x -= SCROLL_SPEED * 0.15; if(this.x<-200) this.x=canvas.width+100; }
    draw() {
      const x=this.x, s=this.size;
      const baseY = canvas.height - GH;
      ctx.fillStyle = NES.hill;
      ctx.beginPath();
      ctx.arc(x + 60*s, baseY, 60*s, Math.PI, 0);
      ctx.closePath(); ctx.fill();
      // Reflet
      ctx.fillStyle = NES.hillDark;
      ctx.beginPath();
      ctx.arc(x + 60*s, baseY, 58*s, Math.PI, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = NES.hill;
      ctx.beginPath();
      ctx.arc(x + 55*s, baseY, 50*s, Math.PI, 0);
      ctx.closePath(); ctx.fill();
      // Points blancs
      ctx.fillStyle = NES.white;
      [[30,15],[50,8],[70,5],[90,12]].forEach(([dx,dy]) => {
        ctx.fillRect(x+dx*s, baseY-dy*s, 4*s, 4*s);
      });
    }
  }

  /* ============================================================
     PANNEAU DE ZONE (CRP / PLC)
     ============================================================ */
  class ZoneSign {
    constructor(wx, label, color) {
      this.worldX = wx; this.label = label; this.color = color;
    }
    draw(cx) {
      const sx = this.worldX - cx;
      const baseY = canvas.height - GH;
      // Poteau
      px(sx+20, baseY-80, 5, 80, "#8B4513");
      px(sx+21, baseY-80, 2, 80, "#a0522d");
      // Panneau
      px(sx, baseY-100, 50, 28, this.color);
      px(sx, baseY-100, 50, 2, NES.white);
      px(sx, baseY-100, 2, 28, NES.white);
      px(sx+48, baseY-100, 2, 28, NES.black);
      px(sx, baseY-74, 50, 2, NES.black);
      ctx.save();
      ctx.font = "bold 8px 'Press Start 2P',monospace";
      ctx.fillStyle = NES.white;
      ctx.textAlign = "center";
      ctx.shadowColor = NES.black; ctx.shadowOffsetX=1; ctx.shadowOffsetY=1;
      ctx.fillText(this.label, sx+25, baseY-83);
      ctx.restore();
    }
  }

  /* ============================================================
     ÉTAT / SPAWN
     ============================================================ */
  let score = 0;
  let entities = {
    qblocks:[], bricks:[], pipes:[], goombas:[],
    coins:[], particles:[], floatTexts:[], clouds:[], hills:[], signs:[]
  };

  function spawnCoin(wx, y) { entities.coins.push(new Coin(wx, y)); }
  function spawnParticles(wx, y, color, n) {
    for (let i=0;i<n;i++) entities.particles.push(new Particle(wx, y, color));
  }
  function spawnFloatText(sx, sy, text) { entities.floatTexts.push(new FloatText(sx, sy, text)); }

  /* ============================================================
     GÉNÉRATION DU MONDE
     ============================================================ */
  let generatedUpTo = 0;

  function generateChunk(from, to) {
    for (let wx = from; wx < to; wx += 160 + Math.random()*80) {
      const roll = Math.random();
      const blockY = canvas.height - GH - TILE*4;

      if (roll < 0.28) {
        // Bloc ?
        entities.qblocks.push(new QBlock(wx, blockY));
      } else if (roll < 0.5) {
        // Rangée de briques
        const n = 3 + Math.floor(Math.random()*5);
        for (let b=0; b<n; b++) entities.bricks.push(new Brick(wx+b*TILE, blockY));
        // Bloc ? au milieu
        if (Math.random()<0.4) {
          const mid = Math.floor(n/2);
          entities.qblocks.push(new QBlock(wx+mid*TILE, blockY - TILE));
        }
      } else if (roll < 0.7) {
        // Tuyau
        const h = 2 + Math.floor(Math.random()*3);
        entities.pipes.push(new Pipe(wx, h));
      } else if (roll < 0.88) {
        // Goomba
        entities.goombas.push(new Goomba(wx + canvas.width));
      } else {
        // Combo : escalier de briques + bloc ?
        for (let s=0;s<3;s++) {
          entities.bricks.push(new Brick(wx+s*TILE, canvas.height-GH-TILE*(s+2)));
        }
        entities.qblocks.push(new QBlock(wx+TILE, blockY-TILE));
      }
    }
    generatedUpTo = to;
  }

  function initWorld() {
    Object.keys(entities).forEach(k => entities[k]=[]);
    worldX = 0; score = 0; generatedUpTo = 0;

    // Nuages répartis
    const cloudPositions = [
      [80, 0.12, 1], [260, 0.08, 0.85], [450, 0.15, 1.1],
      [620, 0.1, 0.9], [820, 0.13, 1.2]
    ];
    cloudPositions.forEach(([xPct, yPct, s]) => {
      entities.clouds.push(new Cloud(canvas.width*xPct/100, canvas.height*yPct, s));
    });

    // Collines
    entities.hills.push(new Hill(60, 1.2));
    entities.hills.push(new Hill(350, 0.9));
    entities.hills.push(new Hill(650, 1.1));

    // Panneaux de zone
    entities.signs.push(new ZoneSign(280, "CRP", "#1565c0"));

    generateChunk(300, canvas.width + 800);
  }

  /* ============================================================
     COLLISIONS
     ============================================================ */
  function rectsOverlap(a, b) {
    return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
  }
  function landsOn(mr, br) {
    const pb = mario.y + 48 - mario.vy;
    return mr.x+mr.w>br.x+2 && mr.x<br.x+br.w-2 && pb<=br.y+3 && mr.y+mr.h>=br.y;
  }
  function hitsBottom(mr, br) {
    const pt = mario.y - mario.vy;
    return mr.x+mr.w>br.x+2 && mr.x<br.x+br.w-2 && pt>=br.y+br.h-4 && mr.y<=br.y+br.h;
  }

  /* ============================================================
     AUTO-JUMP IA
     ============================================================ */
  let jumpCD = 0;
  function autoJump() {
    if (!mario.onGround || jumpCD > 0) return;
    const lx = mario.x + 90;
    const pipe = entities.pipes.find(p => { const rx=p.worldX-worldX; return rx>mario.x+8&&rx<lx; });
    const goomba = entities.goombas.find(g => g.alive&&!g.squished&&(g.x-worldX)>mario.x+5&&(g.x-worldX)<lx);
    const block = [...entities.qblocks,...entities.bricks].find(b => {
      const rx=b.worldX-worldX, ry=b.y;
      return rx>mario.x&&rx<lx&&ry>mario.groundY-90;
    });
    if (pipe||goomba||block) { mario.jump(); jumpCD=40; }
  }

  /* ============================================================
     UPDATE
     ============================================================ */
  function update() {
    worldX += SCROLL_SPEED;
    if (jumpCD>0) jumpCD--;
    autoJump();
    mario.update();

    // Générer le monde en avance
    if (worldX + canvas.width + 1000 > generatedUpTo) {
      generateChunk(generatedUpTo, generatedUpTo+1600);
      // Panneau alterné CRP/PLC tous les ~1600px
      const label = Math.floor(generatedUpTo/1600)%2===0 ? "PLC" : "CRP";
      const color  = label==="CRP" ? "#1565c0" : "#00a800";
      entities.signs.push(new ZoneSign(generatedUpTo-200, label, color));
    }

    // Update entités
    entities.clouds.forEach(c=>c.update());
    entities.hills.forEach(h=>h.update());
    entities.qblocks.forEach(b=>b.update());
    entities.bricks.forEach(b=>b.update());
    entities.goombas.forEach(g=>g.update());
    entities.coins.forEach(c=>c.update());
    entities.particles.forEach(p=>p.update());
    entities.floatTexts.forEach(f=>f.update());

    // Cull hors écran
    const cull = worldX - 300;
    entities.qblocks   = entities.qblocks.filter(b=>b.worldX>cull);
    entities.bricks    = entities.bricks.filter(b=>b.worldX>cull);
    entities.pipes     = entities.pipes.filter(p=>p.worldX>cull);
    entities.goombas   = entities.goombas.filter(g=>g.alive&&g.x>cull);
    entities.signs     = entities.signs.filter(s=>s.worldX>cull);
    entities.coins     = entities.coins.filter(c=>c.alive);
    entities.particles = entities.particles.filter(p=>p.alive);
    entities.floatTexts= entities.floatTexts.filter(f=>f.alive);

    // Nouveaux nuages
    if (Math.random()<0.003)
      entities.clouds.push(new Cloud(canvas.width+20, canvas.height*(0.05+Math.random()*0.2), 0.8+Math.random()*0.5));

    // Mario vs blocs
    [...entities.qblocks,...entities.bricks].forEach(b=>{
      const br={x:b.worldX-worldX,y:b.y,w:TILE,h:TILE};
      const mr={x:mario.x,y:mario.y,w:33,h:48};
      if(hitsBottom(mr,br)){mario.vy=Math.abs(mario.vy)*0.3;if(b instanceof QBlock)b.activate();else b.shake();}
      if(landsOn(mr,br)){mario.y=br.y-48;mario.vy=0;mario.onGround=true;}
    });

    // Mario vs tuyaux
    entities.pipes.forEach(p=>{
      const pr={x:p.worldX-worldX,y:p.rect.y,w:p.rect.w,h:p.rect.h};
      const mr={x:mario.x,y:mario.y,w:33,h:48};
      if(landsOn(mr,pr)){mario.y=pr.y-48;mario.vy=0;mario.onGround=true;}
    });

    // Mario vs goombas
    entities.goombas.forEach(g=>{
      if(g.squished||mario.invincible>0)return;
      const gr={x:g.x-worldX+4,y:g.y+4,w:24,h:26};
      const mr={x:mario.x,y:mario.y,w:33,h:48};
      if(rectsOverlap(mr,gr)){
        const pb=mario.y+48-mario.vy;
        if(pb<=gr.y+6&&mario.vy>0){g.squish();mario.vy=-10;}
        else{mario.invincible=80;mario.vy=-7;}
      }
    });
  }

  /* ============================================================
     DESSIN SOL NES
     ============================================================ */
  function drawGround() {
    const gy = canvas.height - GH;
    const w  = canvas.width;
    const off = Math.floor(worldX) % 32;

    // Couche principale
    px(0, gy, w, GH, NES.ground);
    // Rangée du dessus (plus claire)
    px(0, gy, w, 6, NES.groundTop);
    // Rangée du bas (plus sombre)
    px(0, canvas.height-5, w, 5, NES.groundDark);

    // Grille de briques sur le sol
    ctx.strokeStyle = NES.groundDark;
    ctx.lineWidth = 2;
    // Lignes verticales
    for (let x=-off; x<w+32; x+=32) {
      ctx.beginPath(); ctx.moveTo(x, gy+6); ctx.lineTo(x, canvas.height-5); ctx.stroke();
    }
    // Lignes horizontales
    for (let y=gy+6; y<canvas.height-5; y+=16) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      // Décalage alterné
      const rowOff = Math.floor((y-gy)/16)%2===0 ? 0 : 16;
      for (let x=-off+rowOff; x<w+32; x+=32) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, Math.min(y+16, canvas.height-5)); ctx.stroke();
      }
    }
    // Ligne de lumière en haut
    px(0, gy, w, 2, NES.brickLight);
  }

  /* ============================================================
     DESSIN CIEL NES
     ============================================================ */
  function drawSky() {
    ctx.fillStyle = NES.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /* ============================================================
     HUD NES (score en haut)
     ============================================================ */
  function drawHUD() {
    ctx.save();
    ctx.font = "bold 8px 'Press Start 2P',monospace";
    ctx.fillStyle = NES.white;
    ctx.shadowColor = NES.black; ctx.shadowOffsetX=2; ctx.shadowOffsetY=2;
    ctx.fillText("MARIO", 16, 22);
    ctx.fillText(String(score).padStart(6,"0"), 16, 38);
    ctx.fillText("🪙×" + Math.floor(score/200), 160, 22);
    ctx.fillText("WORLD", 260, 22);
    ctx.fillText("1-1", 268, 38);
    ctx.shadowOffsetX=0; ctx.shadowOffsetY=0;
    ctx.restore();
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function draw() {
    drawSky();
    entities.hills.forEach(h=>h.draw());
    entities.clouds.forEach(c=>c.draw());
    drawGround();
    entities.pipes.forEach(p=>p.draw(worldX));
    entities.signs.forEach(s=>s.draw(worldX));
    entities.qblocks.forEach(b=>b.draw(worldX));
    entities.bricks.forEach(b=>b.draw(worldX));
    entities.coins.forEach(c=>c.draw(worldX));
    entities.goombas.forEach(g=>g.draw(worldX));
    mario.draw();
    entities.particles.forEach(p=>p.draw(worldX));
    entities.floatTexts.forEach(f=>f.draw());
    drawHUD();
  }

  /* ============================================================
     BOUCLE
     ============================================================ */
  let last = 0;
  function loop(ts) {
    if (ts - last >= 1000/FPS) { update(); draw(); last = ts; }
    requestAnimationFrame(loop);
  }

  mario.reset();
  initWorld();
  requestAnimationFrame(loop);

  // Réaction de Mario aux événements du quiz
  window.addEventListener('mario-react', (e) => {
    const type = e.detail && e.detail.type;
    if (type === 'correct') {
      // Mario saute de joie (double saut)
      mario.jump();
      setTimeout(() => { if (!mario.onGround) mario.vy = -14; else mario.jump(); }, 200);
    } else if (type === 'wrong') {
      // Mario clignote (invincibilité brève)
      mario.invincible = 60;
    }
  });

})();
