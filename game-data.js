// ============================================================
// game-data.js  —  Super Mario Quiz : Qui Suis-Je ?
// ============================================================
window.gameData = {
  settings: {
    googleSheetsUrl: "https://script.google.com/macros/s/AKfycbyOh1xg06PP-DiouksFKseJsXKi9TPn9F7EL4V-Mqb3ZdKlCQQ7ZxEfqytNUr3sxq4J/exec",
    pointsPerQuestion: 1000,
    timeLimitSeconds: 25,
    themeToReveal: "LE THEME VESTIMENTAIRE DU LUNDI EST REVELE !",
    revelationVideoType: "cloudinary-embed",
    revelationVideoId:   "https://player.cloudinary.com/embed/?cloud_name=djz4uow1p&public_id=Revelation_q0bhoc",
    endingVideoType: "direct",
    endingVideoId:   "Ending.mp4"
  },

  questions: [

    {
      id: "q_01",
      category: "tool",
      title: "Qui suis-je ? (L outil du commercial)",
      clues: [
        "Je suis utilise chaque jour par l equipe commerciale pour gerer les commandes clients.",
        "Grace a moi, vous pouvez generer des PO (Purchase Orders) en quelques clics.",
        "Mon nom se compose de 3 lettres et je suis au coeur de toute la gestion commerciale."
      ],
      options: ["PLC", "CRP", "PLM", "VLC"],
      correctAnswer: "CRP",
      funFact: "CRP est l outil central de l equipe commerciale : il gere les commandes clients, les stocks et la generation des PO fournisseurs."
    },

    {
      id: "q_02",
      category: "process",
      title: "Qui suis-je ?",
      clues: [
        "Le lancement de la production approche et notre equipe interne doit s assurer que tout est en ordre.",
        "Un seul objet physique centralise tous les elements necessaires pour que l assemblage soit conforme aux attentes.",
        "Chaque composant y est attache ou colle, servant de reference visuelle et materielle tout au long de la production."
      ],
      options: ["SRS", "PO", "Lab Dip", "Trim Card"],
      correctAnswer: "Trim Card",
      funFact: "Le Trim Card est la reference physique complete d un vetement : tissu, thread, labels et accessoires sont tous reunis en un seul support pour guider l equipe de production."
    },

    {
      id: "q_03",
      category: "process",
      title: "Que fait-on en premier apres reception d un TP client ?",
      clues: [
        "Un client nous envoie son TP avec toutes ses exigences techniques et ses specifications tissu.",
        "En parallele du developpement du sample, l equipe commerciale se retrouve autour des chiffres.",
        "Sans cette etape, impossible de savoir si accepter la commande est une bonne decision pour l entreprise."
      ],
      options: ["Envoyer un echantillon", "Creer une fiche PLC", "Le Costing", "Generer un PO"],
      correctAnswer: "Le Costing",
      funFact: "Des la reception du TP client, le costing est lance en parallele du SMS. Il permet d evaluer la rentabilite de la commande avant tout engagement."
    },

    {
      id: "q_04",
      category: "process",
      title: "Quel est le nom du premier prototype interne ?",
      clues: [
        "Le merchandiser a recu le TP du client et le transmet a l equipe de la sample room.",
        "L equipe de la sample room fabrique une premiere version du vetement selon les specifications du TP.",
        "Ce premier prototype confectionne en interne porte un nom de 3 lettres. Lequel ?"
      ],
      options: ["PSS", "FIT", "SMS", "PPS"],
      correctAnswer: "SMS",
      funFact: "Le SMS (Sample Making Sheet) est le tout premier prototype confectionne en interne par la sample room a partir des specifications du TP client."
    },

    {
      id: "q_05",
      category: "process",
      title: "Quelle etape est obligatoire avant le lancement de la production ?",
      clues: [
        "Les echantillons sont approuves, les matieres sont disponibles et le planning est fixe.",
        "Avant que la premiere piece ne soit coupee, une etape de coordination est obligatoire.",
        "Toutes les equipes concernees se reunissent autour d un meme ordre du jour lie a une commande specifique."
      ],
      options: ["Une reunion de collection", "Une PP Meeting", "Une validation de Lab Dip", "Un briefing fournisseur"],
      correctAnswer: "Une PP Meeting",
      funFact: "La PP Meeting (Pre-Production Meeting) est la reunion incontournable avant tout lancement. Elle garantit que toutes les equipes sont alignees sur les specifications, le planning et les exigences de la commande."
    },

    {
      id: "q_06",
      category: "process",
      title: "Quel document doit recevoir la sample room pour lancer le SMS ?",
      clues: [
        "Avant que la sample room puisse commencer a fabriquer le SMS, elle a besoin d un document.",
        "Ce document contient toutes les instructions techniques necessaires pour confectionner le prototype.",
        "Sans ce document, la sample room ne peut pas lancer le travail."
      ],
      options: ["SMV", "AWB", "FU", "SRS"],
      correctAnswer: "SRS",
      funFact: "Le SRS (Sample Request Sheet) est le document officiel transmis a la sample room. Il contient toutes les specifications techniques pour confectionner le SMS conforme aux attentes du client."
    },

    {
      id: "q_07",
      category: "process",
      title: "Sur quelle reference se base-t-on pour developper un Lab Dip ?",
      clues: [
        "Le fournisseur doit teindre le tissu et a besoin d une reference couleur precise et universelle.",
        "Cette reference est reconnue internationalement et permet a n importe quel fournisseur dans le monde de reproduire exactement la meme teinte.",
        "Elle se presente sous forme d un code numerique comme 19-1664 TCX."
      ],
      options: ["Un swatch", "Une photo couleur", "Une Pantone", "Un lab dip approuve"],
      correctAnswer: "Une Pantone",
      funFact: "La reference Pantone est le standard international de la couleur. Un code comme 19-1664 TCX permet a tout fournisseur dans le monde de reproduire exactement la meme teinte sans ambiguite."
    },

    {
      id: "q_08",
      category: "tool",
      title: "Quel outil trace chaque matiere de nos collections ?",
      clues: [
        "Quelque part dans nos systemes, chaque matiere de nos collections est tracee de sa creation jusqu a sa validation finale.",
        "Ni les commandes, ni les livraisons, ni les factures n y transitent. Cet outil a un role bien precis.",
        "Sans lui, le merchandiser ne saurait pas sur quelle base tissu s appuyer pour lancer un developpement."
      ],
      options: ["CRP", "SAP", "PLC", "ERP"],
      correctAnswer: "PLC",
      funFact: "PLC est dedie exclusivement au developpement tissu : fiches matieres, swatches, coloris et suivi de validation. Il est complementaire au CRP qui lui gere le volet commercial."
    },

    {
      id: "q_09",
      category: "process",
      title: "Quels sont les trois composants indispensables d un garment ?",
      clues: [
        "Avant de lancer la production d un vetement, le merchandiser doit s assurer que tous les elements sont disponibles.",
        "Ces elements sont indispensables pour confectionner et finaliser le vetement. Sans l un d eux, la production ne peut pas demarrer.",
        "L un sert a construire le vetement, l autre a l assembler, et le dernier a l identifier."
      ],
      options: ["Tissu, boutons, fermeture eclair", "Tissu, doublure, etiquette", "Tissu, thread, labels", "Patron, tissu, coloris"],
      correctAnswer: "Tissu, thread, labels",
      funFact: "Les trois composants fondamentaux d un garment sont le tissu (la matiere), le thread (le fil d assemblage) et les labels (les etiquettes d identification). Sans l un d eux, la production est bloquee."
    },

    {
      id: "q_10",
      category: "process",
      title: "Quel echantillon doit etre valide par le client avant l expedition ?",
      clues: [
        "La production bulk est achevee mais une derniere etape critique reste obligatoire avant l expedition.",
        "Un vetement preleve sur la production reelle est soumis au regard final du client.",
        "Son approbation ou son rejet conditionne entierement le depart du conteneur."
      ],
      options: ["Un SMS", "Un SRS", "Un Lab Dip", "Un PSS"],
      correctAnswer: "Un PSS",
      funFact: "Le PSS (Pre-Shipment Sample) est un echantillon preleve directement sur la production bulk et envoye au client pour validation finale. Sans son approbation, aucune expedition ne peut avoir lieu."
    }

  ],

  getShuffledQuestions(max) {
    const pool = [...this.questions];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return max ? pool.slice(0, max) : pool;
  }
};
