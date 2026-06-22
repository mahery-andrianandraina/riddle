// Configuration globale du jeu - Accessible sans import/export pour fonctionner sur file://
window.gameData = {
  settings: {
    googleSheetsUrl: "",
    pointsPerQuestion: 1000,
    timeLimitSeconds: 20,
    themeToReveal: "🚀 LE GRAND PROJET / HACKATHON 2026 🚀",
    revelationVideoType: "direct",
    revelationVideoId: "Revelation.mp4",
    endingVideoType: "direct",
    endingVideoId: "Ending.mp4"
  },

  questions: [

    // ──────────────────────────────────────────────
    // QUESTIONS OUTILS : CRP & PLC
    // ──────────────────────────────────────────────
    {
      id: 1,
      category: "tool",
      title: "Qui suis-je ? (L'outil du commercial)",
      clues: [
        "Je suis utilisé chaque jour par l'équipe commerciale pour gérer les commandes clients.",
        "Grâce à moi, vous pouvez générer des PO (Purchase Orders) en quelques clics.",
        "Mon nom se compose de 3 lettres et je suis au cœur de toute la gestion commerciale."
      ],
      options: ["PLC", "CRP", "ERP", "SAP"],
      correctAnswer: "CRP",
      funFact: "CRP (Commercial Resource Planning) est l'outil central qui relie les commandes, les stocks et les PO pour l'équipe commerciale."
    },
    {
      id: 2,
      category: "tool",
      title: "Qui suis-je ? (L'outil du développement tissu)",
      clues: [
        "Je suis l'outil préféré de l'équipe de développement produit.",
        "Je permets de suivre et de développer de nouveaux tissus, du concept jusqu'à la validation finale.",
        "Mon nom en 3 lettres est aussi le signe d'un composant électronique… mais ici je suis textile !"
      ],
      options: ["CRP", "PLM", "PLC", "ERP"],
      correctAnswer: "PLC",
      funFact: "PLC dans ce contexte est l'outil dédié au développement tissu : il centralise les fiches matière, les swatches et le suivi des collections."
    },
    {
      id: 3,
      category: "tool",
      title: "Qui suis-je ? (La fonction cachée)",
      clues: [
        "Je suis une action que l'on fait dans CRP pour formaliser un achat auprès d'un fournisseur.",
        "Je suis un document officiel : sans moi, pas de commande validée.",
        "Mes deux lettres sont aussi les initiales de 'Purchase Order'."
      ],
      options: ["SO", "PO", "DO", "PR"],
      correctAnswer: "PO",
      funFact: "Le PO (Purchase Order) est généré dans CRP. C'est le document clé qui déclenche officiellement une commande fournisseur."
    },
    {
      id: 4,
      category: "tool",
      title: "Qui suis-je ? (Outil vs outil)",
      clues: [
        "L'équipe commerciale utilise CRP, mais l'équipe développement tissu utilise… qui ?",
        "Je suis l'autre outil maison, complémentaire au CRP.",
        "Je gère les matières, les couleurs, les swatches — tout ce qui touche au tissu."
      ],
      options: ["CRP", "Excel", "PLC", "Slack"],
      correctAnswer: "PLC",
      funFact: "CRP et PLC sont deux outils complémentaires : CRP pour le commercial (commandes, PO), PLC pour le développement tissu (matières, fiches techniques)."
    },

    // ──────────────────────────────────────────────
    // QUESTIONS COLLÈGUES
    // ──────────────────────────────────────────────
    {
      id: 5,
      category: "coworker",
      title: "Qui suis-je ? (Le collègue caché)",
      clues: [
        "Mon café du matin est une affaire d'État : aucune interaction sociale n'est acceptée avant 9h15.",
        "J'adore le code propre, mais j'ai une sainte horreur de rédiger la documentation.",
        "J'ai déjà prononcé la phrase légendaire : 'Mais pourtant, ça marchait en local !'"
      ],
      options: ["Alexandre", "Sarah", "Thomas", "Nathalie"],
      correctAnswer: "Thomas",
      funFact: "Thomas détient le record du bureau avec 7 tasses de café bues en une seule matinée."
    },
    {
      id: 6,
      category: "coworker",
      title: "Qui suis-je ? (Le collègue caché)",
      clues: [
        "Mon double-écran est tellement grand qu'on dirait un poste de contrôle de la NASA.",
        "Je suis la personne à contacter d'urgence quand le Wi-Fi du bureau décide de prendre sa retraite.",
        "Mon bureau est décoré de figurines Pop et de câbles mystérieux que personne n'ose toucher."
      ],
      options: ["Julien", "Sophie", "Mehdi", "Antoine"],
      correctAnswer: "Mehdi",
      funFact: "Mehdi a un jour réparé le serveur en tapotant simplement sur le boîtier."
    },
    {
      id: 7,
      category: "coworker",
      title: "Qui suis-je ? (Le collègue caché)",
      clues: [
        "Je suis capable d'organiser un projet complexe avec des tableaux Excel colorés à faire pâlir un designer.",
        "Mon agenda est plus rempli que celui du Premier Ministre.",
        "Je commence toutes mes réunions par : 'Alors, on en est où sur les deadlines ?'"
      ],
      options: ["Laurent", "Amélie", "Clara", "Stéphane"],
      correctAnswer: "Amélie",
      funFact: "Amélie a déjà planifié ses vacances sur un diagramme de Gantt avec des jalons précis."
    },

    // ──────────────────────────────────────────────
    // VIE DE BUREAU
    // ──────────────────────────────────────────────
    {
      id: 8,
      category: "office-life",
      title: "Qui suis-je ? (La vie de bureau)",
      clues: [
        "Je suis le véritable cœur battant du bureau où se créent et se défont les rumeurs.",
        "Sans moi, la productivité de l'équipe chute instantanément de 90%.",
        "Je chauffe, je gronde, et je distribue du bonheur chaud sous forme de capsules."
      ],
      options: ["La machine à café", "L'imprimante", "Le micro-ondes", "Le routeur Wi-Fi"],
      correctAnswer: "La machine à café",
      funFact: "C'est l'endroit où se prennent les décisions les plus importantes du projet !"
    }

  ]
};
