/* =====================================================================
   LUCCE PORTFOLIO — Interactive Frame Scrubber & Project Modal
   ===================================================================== */
(function () {
  'use strict';

  const TOTAL_FRAMES = 48;
  const frames = [];
  let loadedCount = 0;

  function pad3(n) {
    return String(n).padStart(3, '0');
  }

  /* ------------------------------------------------ Frame Preloader & Scrubber */
  function initScrubber() {
    const card = document.getElementById('card-restaurante');
    const canvas = document.getElementById('walkthrough-canvas');
    const label = document.getElementById('scrubber-frame-label');
    const bar = document.getElementById('scrubber-bar-fill');
    if (!card || !canvas) return;

    const ctx = canvas.getContext('2d');
    let targetProgress = 0;
    let currentProgress = 0;
    let isHovering = false;
    let lastDrawnIdx = -1;

    function drawToCanvas(c, context, idx) {
      const img = frames[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      if (c.width !== img.naturalWidth || c.height !== img.naturalHeight) {
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
      }
      context.drawImage(img, 0, 0, c.width, c.height);
    }

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = 'assets/frames/frame_' + pad3(i) + '.webp';
      img.onload = function () {
        loadedCount++;
        if (i === 1 && lastDrawnIdx < 0) {
          drawToCanvas(canvas, ctx, 0);
          lastDrawnIdx = 0;
        }
      };
      frames.push(img);
    }

    function updateTargetFromPointer(clientX, rect) {
      const rel = (clientX - rect.left) / Math.max(1, rect.width);
      targetProgress = Math.max(0, Math.min(1, rel));
    }

    card.addEventListener('pointerenter', function (e) {
      isHovering = true;
      updateTargetFromPointer(e.clientX, card.getBoundingClientRect());
    });
    card.addEventListener('pointermove', function (e) {
      isHovering = true;
      updateTargetFromPointer(e.clientX, card.getBoundingClientRect());
    }, { passive: true });
    card.addEventListener('pointerleave', function () {
      isHovering = false;
    });
    card.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) {
        isHovering = true;
        updateTargetFromPointer(e.touches[0].clientX, card.getBoundingClientRect());
      }
    }, { passive: true });

    let lastTime = performance.now();
    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!isHovering && loadedCount > 12) {
        /* subtle idle breathing when not hovered */
        targetProgress = 0.5 + 0.5 * Math.sin(now * 0.00045 - Math.PI / 2);
      }

      currentProgress += (targetProgress - currentProgress) * (1 - Math.exp(-10 * dt));
      const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentProgress * (TOTAL_FRAMES - 1))));

      if (idx !== lastDrawnIdx && frames[idx] && frames[idx].complete) {
        drawToCanvas(canvas, ctx, idx);
        lastDrawnIdx = idx;
        if (label) label.textContent = 'FRAME ' + String(idx + 1).padStart(2, '0') + ' / ' + TOTAL_FRAMES;
        if (bar) bar.style.width = ((idx / (TOTAL_FRAMES - 1)) * 100).toFixed(1) + '%';
      }

      /* Also sync modal scrubber if open */
      const modalCanvas = document.getElementById('modal-walkthrough-canvas');
      if (modalCanvas && modalCanvas.dataset.active === '1') {
        const mCtx = modalCanvas.getContext('2d');
        const mIdx = Number(modalCanvas.dataset.targetIdx ?? idx);
        if (frames[mIdx] && frames[mIdx].complete) {
          drawToCanvas(modalCanvas, mCtx, mIdx);
        }
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------ Project Data & Modal */
  const PROJECTS = {
    restaurante: {
      eyebrow: 'PROJETO 01 — GASTRONOMIA & PWA',
      jp: '龍・中華料理',
      title: 'Dragão Imperial — Restaurante Chinês',
      summary:
        'Site completo desenvolvido para o restaurante fictício Dragão Imperial, inspirado na culinária cantonesa da família Chen desde 1998. Projetado para oferecer uma experiência prática e intuitiva: o visitante explora a história do restaurante, navega pelo cardápio dividido por categorias com filtros em tempo real, confere depoimentos de clientes, faz pedidos diretos via WhatsApp e reserva mesas para refeições presenciais.',
      highlights: [
        'Cardápio interativo com filtro por categorias (Entradas, Yakisobas, Pratos Principais, Sobremesas e Bebidas), incluindo Rolinho Primavera, Guioza de Porco, Frango Xadrez, Carne Mongoliana e Chop Suey Imperial.',
        'Suporte a PWA (Progressive Web App) com manifest.json e Service Worker (sw.js), além de menu mobile responsivo e cabeçalho dinâmico ao rolar.',
        'Animações de revelação progressiva com IntersectionObserver e integração direta para pedidos pelo WhatsApp e reserva de mesas.',
        'Walkthrough em 3D/vídeo: sequência de 48 frames extraída do vídeo gerado no Google Flow com scrubbing interativo por cursor em <canvas>.'
      ],
      tags: ['HTML5', 'CSS3', 'JavaScript', 'PWA · Service Worker', 'IntersectionObserver', 'Google Flow Frames'],
      liveUrl: 'https://lucc3332.github.io/restaurante-chines/',
      repoUrl: 'https://github.com/Lucc3332/restaurante-chines',
      hasScrubber: true
    },
    feira: {
      eyebrow: 'PROJETO 02 — EDUCAÇÃO & GENÉTICA',
      jp: '遺伝子・真偽',
      title: 'Feira Cultural — DNA: Verdade ou Fake?',
      summary:
        'Aplicação web interativa desenvolvida para uma Feira Cultural escolar, transformando conceitos de genética e biologia molecular em um jogo dinâmico de perguntas e respostas. O jogador lê afirmações científicas sobre o DNA e decide se são verdadeiras ou fake news, recebendo explicações educativas imediatas após cada resposta.',
      highlights: [
        'Banco de questões científicas sobre estrutura do DNA, genes, núcleo celular, mitocôndrias, tipo sanguíneo e hereditariedade.',
        'Feedback pedagógico instantâneo: cada escolha exibe a confirmação (Verdadeiro ou Fake News) acompanhada de uma explicação clara e acessível.',
        'Fluxo completo em três estados (tela inicial, rodada de perguntas com barra de progresso e tela de resultado final com pontuação).'
      ],
      tags: ['HTML5', 'CSS3', 'JavaScript', 'Quiz Educativo', 'Manipulação de DOM'],
      liveUrl: 'https://lucc3332.github.io/FeiraCultural/',
      repoUrl: 'https://github.com/Lucc3332/FeiraCultural',
      hasScrubber: false
    },
    reflexo: {
      eyebrow: 'PROJETO 03 — AGILIDADE & JOGO WEB',
      jp: '反射神経・反応',
      title: 'Jogo de Reflexo — Teclado WASD',
      summary:
        'Jogo de agilidade e coordenação motora onde o jogador precisa pressionar corretamente as teclas sorteadas (A, W, S, D) dentro de um limite de tempo regressivo. Desenvolvido para testar velocidade de reação, foco e precisão sob pressão em partidas de até 100 rodadas.',
      highlights: [
        'Sorteio contínuo das teclas A, W, S e D com cronômetro regressivo por rodada e encerramento automático ao atingir 100 rodadas.',
        'Placar em tempo real contabilizando Acertos (+1), Erros (-1) e número da rodada atual com feedback visual imediato.',
        'Controle preciso de eventos de teclado (onkeydown) e temporizadores (setTimeout / setInterval) para evitar respostas duplicadas entre rodadas.'
      ],
      tags: ['HTML5', 'CSS3', 'JavaScript', 'Eventos de Teclado', 'Game Loop & Timers'],
      liveUrl: 'https://lucc3332.github.io/jogo-de-reflexo/',
      repoUrl: 'https://github.com/Lucc3332/jogo-de-reflexo',
      hasScrubber: false
    }
  };

  function initProjectModal() {
    const modal = document.getElementById('proj-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('proj-close');
    const backdrop = modal.querySelector('.proj-backdrop');
    const elEyebrow = document.getElementById('proj-eyebrow');
    const elJp = document.getElementById('proj-jp');
    const elTitle = document.getElementById('proj-title');
    const elSummary = document.getElementById('proj-summary');
    const elFeatures = document.getElementById('proj-features');
    const elTags = document.getElementById('proj-tags');
    const elLive = document.getElementById('proj-live');
    const elRepo = document.getElementById('proj-repo');
    const elScrubberBox = document.getElementById('proj-scrubber-box');
    const elModalCanvas = document.getElementById('modal-walkthrough-canvas');
    const elModalLabel = document.getElementById('modal-scrubber-label');

    function openProject(key) {
      const p = PROJECTS[key];
      if (!p) return;

      elEyebrow.textContent = p.eyebrow;
      elJp.textContent = p.jp;
      elTitle.textContent = p.title;
      elSummary.textContent = p.summary;

      elFeatures.innerHTML = '';
      p.highlights.forEach(function (h) {
        const li = document.createElement('li');
        li.textContent = h;
        elFeatures.appendChild(li);
      });

      elTags.innerHTML = '';
      p.tags.forEach(function (t) {
        const span = document.createElement('span');
        span.className = 'proj-tag';
        span.textContent = t;
        elTags.appendChild(span);
      });

      elLive.href = p.liveUrl;
      elRepo.href = p.repoUrl;

      if (p.hasScrubber && elScrubberBox && elModalCanvas) {
        elScrubberBox.style.display = 'block';
        elModalCanvas.dataset.active = '1';
        elModalCanvas.dataset.targetIdx = '0';
      } else if (elScrubberBox && elModalCanvas) {
        elScrubberBox.style.display = 'none';
        elModalCanvas.dataset.active = '0';
      }

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
    }

    function closeProject() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      if (elModalCanvas) elModalCanvas.dataset.active = '0';
    }

    if (elScrubberBox && elModalCanvas) {
      elScrubberBox.addEventListener('pointermove', function (e) {
        const rect = elScrubberBox.getBoundingClientRect();
        const rel = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
        const idx = Math.round(rel * (TOTAL_FRAMES - 1));
        elModalCanvas.dataset.targetIdx = String(idx);
        if (elModalLabel) {
          elModalLabel.textContent = 'FRAME ' + String(idx + 1).padStart(2, '0') + ' / ' + TOTAL_FRAMES;
        }
      }, { passive: true });
    }

    document.querySelectorAll('[data-proj]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('a[target="_blank"]')) return;
        e.preventDefault();
        openProject(el.dataset.proj);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeProject);
    if (backdrop) backdrop.addEventListener('click', closeProject);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeProject();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initScrubber();
      initProjectModal();
    });
  } else {
    initScrubber();
    initProjectModal();
  }
})();
