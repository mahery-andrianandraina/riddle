// ============================================================
// game-data.js  —  Super Mario Quiz : Qui Suis-Je ?
// ============================================================
window.gameData = {
  settings: {
    googleSheetsUrl: "https://script.google.com/macros/s/AKfycbx_m3gdkkuDPopVE_P23t1jxnUlr98ssawnFCiPtVA0lNleOdXbx3NL7felflwGsXQ/exec",
    pointsPerQuestion: 1000,
    timeLimitSeconds: 25,
    themeToReveal: "🚀 LE GRAND PROJET / HACKATHON 2026 🚀",

    // --------------------------------------------------------
    // VIDÉO D'INTRO  (jouée APRÈS toutes les questions)
    // --------------------------------------------------------
    // Types disponibles : "cloudinary" | "youtube" | "direct"
    //
    // cloudinary → collez l'URL complète Cloudinary
    //   ex: "https://res.cloudinary.com/VOTRE_CLOUD/video/upload/v123/ma-video.mp4"
    //
    // youtube    → collez uniquement l'ID de la vidéo YouTube
    //   ex: "dQw4w9WgXcQ"
    //
    // direct     → URL ou chemin local vers un fichier .mp4
    //   ex: "Revelation.mp4"
    // --------------------------------------------------------
    revelationVideoType: "cloudinary-embed",
    revelationVideoId:   "https://player.cloudinary.com/embed/?cloud_name=djz4uow1p&public_id=Revelation_q0bhoc",

    // --------------------------------------------------------
    // VIDÉO DE FIN  (fond du leaderboard, en boucle muette)
    // --------------------------------------------------------
    endingVideoType: "direct",
    endingVideoId:   "Ending.mp4"
  },

  // ----------------------------------------------------------
  // POOL DE QUESTIONS
  // ----------------------------------------------------------
  questions: [

    // ════════════════════════════════
    // OUTILS  —  CRP & PLC
    // ════════════════════════════════
    {
      id: "tool_01",
      category: "tool",
      title: "Qui suis-je ? (L'outil du commercial)",
      clues: [
        "Je suis utilisé chaque jour par l'équipe commerciale pour gérer les commandes clients.",
        "Grâce à moi, vous pouvez générer des PO (Purchase Orders) en quelques clics.",
        "Mon nom se compose de 3 lettres et je suis au cœur de toute la gestion commerciale."
      ],
      options: ["PLC", "CRP", "ERP", "SAP"],
      correctAnswer: "CRP",
      funFact: "CRP (Commercial Resource Planning) relie commandes, stocks et PO pour toute l'équipe commerciale."
    },
    {
      id: "tool_02",
      category: "tool",
      title: "Qui suis-je ? (L'outil tissu)",
      clues: [
        "Je suis l'outil de l'équipe développement produit, pas du commercial.",
        "Je permets de suivre un tissu du concept jusqu'à la validation finale.",
        "Mon nom en 3 lettres évoque aussi un composant électronique… mais ici je suis 100% textile !"
      ],
      options: ["CRP", "PLM", "PLC", "ERP"],
      correctAnswer: "PLC",
      funFact: "PLC centralise les fiches matière, les swatches et le suivi complet des collections tissu."
    },
    {
      id: "tool_03",
      category: "tool",
      title: "Qui suis-je ? (Le document magique)",
      clues: [
        "Je suis un document officiel généré dans CRP.",
        "Sans moi, aucune commande fournisseur n'est validée.",
        "Mes deux lettres sont les initiales de 'Purchase Order'."
      ],
      options: ["SO", "PO", "DO", "PR"],
      correctAnswer: "PO",
      funFact: "Le PO (Purchase Order) est le déclencheur officiel d'une commande fournisseur dans CRP."
    },
    {
      id: "tool_04",
      category: "tool",
      title: "Qui suis-je ? (CRP ou PLC ?)",
      clues: [
        "L'équipe commerciale utilise CRP… mais qui utilise l'équipe développement tissu ?",
        "Je suis l'autre outil maison, complémentaire au CRP.",
        "Je gère les matières, les couleurs, les swatches — tout ce qui touche au tissu."
      ],
      options: ["CRP", "Excel", "PLC", "Slack"],
      correctAnswer: "PLC",
      funFact: "CRP et PLC sont deux outils complémentaires : CRP pour le commercial, PLC pour le développement tissu."
    },

    // ════════════════════════════════
    // PROCESS  —  Développement & TP
    // ════════════════════════════════
    {
      id: "process_01",
      category: "process",
      title: "Dans quel ordre ? (Développement échantillon)",
      clues: [
        "Le développement d'un échantillon commence toujours par un brief créatif.",
        "Après le brief, on envoie une demande officielle au fournisseur.",
        "La première demande officielle envoyée au fournisseur pour démarrer un développement tissu s'appelle…"
      ],
      options: ["Un PO", "Un TP (Tech Pack)", "Une LAB DIP request", "Un Strike Off"],
      correctAnswer: "Un TP (Tech Pack)",
      funFact: "Le Tech Pack (TP) est le document technique complet envoyé au fournisseur : specs matière, couleur et construction."
    },
    {
      id: "process_02",
      category: "process",
      title: "Quelle est la première étape ? (Réception d'un TP)",
      clues: [
        "On vient de recevoir un TP du fournisseur. Que fait-on en premier ?",
        "Avant de valider quoi que ce soit, on s'assure que le tissu correspond aux specs techniques.",
        "On vérifie grammage, composition, laize et coloris."
      ],
      options: [
        "On génère un PO dans CRP",
        "On enregistre le TP dans PLC et on contrôle les specs",
        "On envoie directement en production",
        "On fait une réunion de collection"
      ],
      correctAnswer: "On enregistre le TP dans PLC et on contrôle les specs",
      funFact: "La première étape à la réception d'un TP : enregistrement dans PLC + contrôle qualité des specs techniques."
    },
    {
      id: "process_03",
      category: "process",
      title: "C'est quoi un LAB DIP ?",
      clues: [
        "Je suis une étape clé dans le développement coloris d'un tissu.",
        "Je suis un petit morceau de tissu teint envoyé par le fournisseur pour approbation.",
        "Sans mon approbation, on ne peut pas lancer la teinture en grande quantité."
      ],
      options: [
        "Un rapport de test qualité",
        "Un bon de commande couleur",
        "Un échantillon de teinte envoyé par le fournisseur",
        "Une fiche technique matière"
      ],
      correctAnswer: "Un échantillon de teinte envoyé par le fournisseur",
      funFact: "Le LAB DIP est un swatch teint que le fournisseur envoie pour valider la couleur avant la production en grande quantité."
    },
    {
      id: "process_04",
      category: "process",
      title: "Quand arrive le Strike Off ?",
      clues: [
        "Le strike off intervient après le lab dip, mais avant la production.",
        "Je suis un échantillon de tissu imprimé ou tissé à l'échelle réelle.",
        "Mon approbation valide le motif, le coloris et la qualité avant le bulk."
      ],
      options: [
        "Avant le lab dip",
        "Après la production bulk",
        "Entre le lab dip et la production bulk",
        "Après la réception du PO"
      ],
      correctAnswer: "Entre le lab dip et la production bulk",
      funFact: "L'ordre est : Brief → TP → Lab Dip → Strike Off → Production Bulk. Chaque étape est validée avant de passer à la suivante."
    },
    {
      id: "process_05",
      category: "process",
      title: "Quel outil pour quelle étape ?",
      clues: [
        "Le Strike Off vient d'être validé. L'équipe commerciale doit commander la production.",
        "Il faut créer un document officiel d'achat auprès du fournisseur tissu.",
        "Quel outil utilisent-ils pour générer ce document ?"
      ],
      options: ["PLC", "CRP", "Excel", "Outlook"],
      correctAnswer: "CRP",
      funFact: "Une fois le Strike Off validé, CRP prend le relais : l'équipe génère le PO de production directement dans CRP."
    },
    {
      id: "process_06",
      category: "process",
      title: "Qui gère quoi dans le process ?",
      clues: [
        "Le développement tissu avance. Qui saisit les informations matière dans le système ?",
        "La fiche technique tissu (composition, grammage, coloris) doit être enregistrée quelque part.",
        "L'outil utilisé par l'équipe développement pour centraliser ces infos s'appelle…"
      ],
      options: ["CRP", "SAP", "PLC", "Jira"],
      correctAnswer: "PLC",
      funFact: "PLC est la source de vérité pour toutes les données matière. CRP y puise les infos pour générer les PO."
    },

    // ════════════════════════════════
    // PERSONNALITÉ
    // ════════════════════════════════
    {
      id: "personality_01",
      category: "personality",
      title: "Quel profil es-tu ? (Style de travail)",
      clues: [
        "Tu reçois un nouveau projet. Ta première réaction ?",
        "Tu ouvres Excel et tu crées un tableau de suivi avec des colonnes colorées avant même d'avoir lu le brief.",
        "Tu dis souvent : 'On va organiser ça proprement !'"
      ],
      options: [
        "Le Visionnaire Créatif 🎨",
        "L'Organisateur Maniaque 📊",
        "Le Pompier de Service 🚒",
        "Le Philosophe Zen 🧘"
      ],
      correctAnswer: "L'Organisateur Maniaque 📊",
      funFact: "L'Organisateur Maniaque transforme chaque projet en chef-d'œuvre de gestion. Son Excel est une œuvre d'art."
    },
    {
      id: "personality_02",
      category: "personality",
      title: "Quel profil es-tu ? (En réunion)",
      clues: [
        "La réunion dure depuis 45 minutes et tu as déjà écrit 3 pages de notes.",
        "Tu interromps doucement pour demander 'Qui fait quoi et pour quand ?'",
        "Tu envoies le compte-rendu dans les 10 minutes qui suivent la réunion."
      ],
      options: [
        "Le Note-taker Légendaire 📝",
        "Celui qui regarde son téléphone 📱",
        "Le Powerpoint Artist 🎭",
        "Le Silencieux Stratège 🤫"
      ],
      correctAnswer: "Le Note-taker Légendaire 📝",
      funFact: "Le Note-taker Légendaire est le MVP de toute équipe. Sans lui, personne ne se souvient de ce qui a été décidé."
    },
    {
      id: "personality_03",
      category: "personality",
      title: "Quel profil es-tu ? (Face à un problème)",
      clues: [
        "Le système CRP est tombé en panne au pire moment.",
        "Ta réaction : tu googles la solution, trouves un workaround en 5 minutes et continues.",
        "Tes collègues t'appellent en premier quand quelque chose ne marche pas."
      ],
      options: [
        "Le Panicard Organisé 😱",
        "Le MacGyver du Bureau 🔧",
        "Le Suiveur de Process 📋",
        "Le Philosophe du Destin 🎲"
      ],
      correctAnswer: "Le MacGyver du Bureau 🔧",
      funFact: "Le MacGyver du Bureau résout les problèmes avec les moyens du bord. Il a probablement réparé quelque chose avec du scotch et une formule Excel."
    },
    {
      id: "personality_04",
      category: "personality",
      title: "Quel rôle joues-tu ? (Process tissu)",
      clues: [
        "Tu fais le lien entre le brief créatif et le fournisseur.",
        "Tu traduis les idées de la créa en specs techniques compréhensibles.",
        "Tu connais la différence entre un lab dip, un strike off et un bulk… par cœur."
      ],
      options: [
        "Le Commercial Chasseur 🎯",
        "Le Développeur Tissu 🧵",
        "Le Designer Rêveur ✨",
        "Le Comptable Précis 🔢"
      ],
      correctAnswer: "Le Développeur Tissu 🧵",
      funFact: "Le Développeur Tissu est le pont entre la créativité et la réalité industrielle. Sans lui, un beau dessin reste un beau dessin."
    },

    // ════════════════════════════════
    // COLLÈGUES
    // ════════════════════════════════
    {
      id: "coworker_01",
      category: "coworker",
      title: "Qui suis-je ? (Le collègue caché)",
      clues: [
        "Mon café du matin est une affaire d'État : aucune interaction avant 9h15.",
        "J'adore le code propre mais j'ai horreur de rédiger la documentation.",
        "J'ai déjà dit : 'Mais pourtant ça marchait en local !'"
      ],
      options: ["Alexandre", "Sarah", "Thomas", "Nathalie"],
      correctAnswer: "Thomas",
      funFact: "Thomas détient le record du bureau : 7 tasses de café en une seule matinée."
    },
    {
      id: "coworker_02",
      category: "coworker",
      title: "Qui suis-je ? (Le collègue caché)",
      clues: [
        "Mon double-écran ressemble à un poste de contrôle de la NASA.",
        "Je suis le premier appelé quand le Wi-Fi décide de prendre sa retraite.",
        "Mon bureau est couvert de câbles mystérieux que personne n'ose toucher."
      ],
      options: ["Julien", "Sophie", "Mehdi", "Antoine"],
      correctAnswer: "Mehdi",
      funFact: "Mehdi a un jour réparé le serveur en tapotant simplement sur le boîtier."
    },
    {
      id: "coworker_03",
      category: "coworker",
      title: "Qui suis-je ? (Le collègue caché)",
      clues: [
        "J'organise les projets avec des tableaux Excel colorés à faire pâlir un designer.",
        "Mon agenda est plus rempli que celui d'un chef d'État.",
        "Je commence chaque réunion par : 'Alors, on en est où sur les deadlines ?'"
      ],
      options: ["Laurent", "Amélie", "Clara", "Stéphane"],
      correctAnswer: "Amélie",
      funFact: "Amélie a déjà planifié ses vacances sur un diagramme de Gantt avec des jalons précis."
    },

    // ════════════════════════════════
    // VIE DE BUREAU
    // ════════════════════════════════
    {
      id: "office_01",
      category: "office-life",
      title: "Qui suis-je ? (La vie de bureau)",
      clues: [
        "Je suis le cœur battant du bureau où naissent toutes les rumeurs.",
        "Sans moi, la productivité chute de 90% instantanément.",
        "Je chauffe, je gronde, et je distribue du bonheur en capsules."
      ],
      options: ["La machine à café", "L'imprimante", "Le micro-ondes", "Le routeur Wi-Fi"],
      correctAnswer: "La machine à café",
      funFact: "Les décisions les plus importantes de l'équipe se prennent toujours devant la machine à café."
    }

  ],

  // ----------------------------------------------------------
  // SHUFFLE  (Fisher-Yates)
  // ----------------------------------------------------------
  getShuffledQuestions(max) {
    const pool = [...this.questions];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return max ? pool.slice(0, max) : pool;
  }
};
