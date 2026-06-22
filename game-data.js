// Configuration globale du jeu - Accessible sans import/export pour fonctionner sur file://
window.gameData = {
  settings: {
    // ----------------------------------------------------
    // CONFIGURATION DE LA BASE DE DONNÉES (GOOGLE SHEETS)
    // ----------------------------------------------------
    // Collez l'URL de votre Google Apps Script Web App ci-dessous.
    // Laissez vide "" pour utiliser automatiquement le classement local (localStorage) de secours.
    googleSheetsUrl: "",

    // ----------------------------------------------------
    // PARAMÈTRES DU JEU
    // ----------------------------------------------------
    pointsPerQuestion: 1000,      // Points maximum de départ par question
    timeLimitSeconds: 20,         // Limite de temps en secondes par question

    // ----------------------------------------------------
    // RÉVÉLATION DU THÈME
    // ----------------------------------------------------
    // Le thème secret à révéler à l'équipe après la vidéo finale.
    // Vous pouvez le remplacer par ce que vous voulez !
    themeToReveal: "🚀 LE GRAND PROJET / HACKATHON 2026 🚀",

    // ----------------------------------------------------
    // CONFIGURATION DES VIDÉOS HÉBERGÉES / LOCALES
    // ----------------------------------------------------
    // Types disponibles : 
    // - "youtube" : Utilisez l'ID de la vidéo YouTube (ex: "dQw4w9WgXcQ")
    // - "direct"  : Utilisez une URL directe vers un fichier MP4 en ligne ou local (ex: "Revelation.mp4")
    
    // Vidéo de révélation (jouée après la dernière énigme)
    revelationVideoType: "direct",
    revelationVideoId: "Revelation.mp4", // Fichier vidéo local
    
    // Vidéo de fin de partie (célébration en arrière-plan du classement)
    endingVideoType: "direct",
    endingVideoId: "Ending.mp4"      // Fichier vidéo local
  },

  // ----------------------------------------------------
  // LISTE DES QUESTIONS & INDICES
  // ----------------------------------------------------
  questions: [
    {
      id: 1,
      category: "coworker",
      title: "Qui suis-je ? (Le collègue caché)",
      clues: [
        "Mon café du matin est une affaire d'État : aucune interaction sociale n'est acceptée avant 9h15.",
        "J'adore le code propre, mais j'ai une sainte horreur de rédiger la documentation.",
        "J'ai déjà prononcé la phrase légendaire : 'Mais pourtant, ça marchait en local !'."
      ],
      options: ["Alexandre", "Sarah", "Thomas", "Nathalie"],
      correctAnswer: "Thomas",
      funFact: "Thomas détient le record du bureau avec 7 tasses de café bues en une seule matinée."
    },
    {
      id: 2,
      category: "tool",
      title: "Qui suis-je ? (L'outil quotidien)",
      clues: [
        "Je suis le meilleur moyen de voyager dans le temps pour corriger vos erreurs.",
        "Mes branches se croisent mais ne portent pas de fruits.",
        "Mes mots préférés sont 'commit', 'push' et le redoutable 'merge conflict'."
      ],
      options: ["Slack", "Git", "Jira", "VS Code"],
      correctAnswer: "Git",
      funFact: "Le créateur de Git, Linus Torvalds, l'a nommé d'après l'argot britannique signifiant 'désagréable' ou 'idiot'."
    },
    {
      id: 3,
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
      id: 4,
      category: "office-life",
      title: "Qui suis-je ? (La vie de bureau)",
      clues: [
        "Je suis le véritable cœur battant du bureau où se créent et se défont les rumeurs.",
        "Sans moi, la productivité de l'équipe chute instantanément de 90%.",
        "Je chauffe, je gronde, et je distribue du bonheur chaud sous forme de capsules.",
      ],
      options: ["La machine à café", "L'imprimante", "Le micro-ondes", "Le routeur Wi-Fi"],
      correctAnswer: "La machine à café",
      funFact: "C'est l'endroit où se prennent les décisions les plus importantes du projet !"
    },
    {
      id: 5,
      category: "coworker",
      title: "Qui suis-je ? (Le collègue caché)",
      clues: [
        "Je suis capable d'organiser un projet complexe avec des tableaux Excel colorés à faire pâlir un designer.",
        "Mon agenda est plus rempli que celui du Premier Ministre.",
        "Je commence toutes mes réunions par : 'Alors, on en est où sur les deadlines ?'."
      ],
      options: ["Laurent", "Amélie", "Clara", "Stéphane"],
      correctAnswer: "Amélie",
      funFact: "Amélie a déjà planifié ses vacances sur un diagramme de Gantt avec des jalons précis."
    },
    {
      id: 6,
      category: "tool",
      title: "Qui suis-je ? (L'outil quotidien)",
      clues: [
        "Je suis une toile d'araignée de lignes et de colonnes infinies.",
        "Les gens m'utilisent pour des calculs complexes ou simplement pour faire des listes de courses.",
        "Ma formule magique préférée est le redoutable 'RECHERCHEV' (VLOOKUP)."
      ],
      options: ["Word", "Excel", "Trello", "Photoshop"],
      correctAnswer: "Excel",
      funFact: "Il y a des compétitions mondiales d'Excel diffusées sur des chaînes de sport !"
    },
    {
      id: 7,
      category: "coworker",
      title: "Qui suis-je ? (Le collègue caché)",
      clues: [
        "Je réponds aux messages Slack avec des GIFs animés toujours parfaitement ciblés.",
        "J'aime écouter de la musique techno à fond dans mon casque pour rester concentré.",
        "Je suis la personne qui propose toujours d'aller boire un verre le vendredi soir."
      ],
      options: ["Lucas", "Camille", "Eric", "Marion"],
      correctAnswer: "Lucas",
      funFact: "Lucas possède une collection secrète de plus de 500 mèmes triés par catégorie."
    }
  ]
};
