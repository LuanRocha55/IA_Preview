const resultsDiv = document.getElementById("results");
const resultsPlaceholder = document.getElementById("results-placeholder");
const analysisTitleContainer = document.getElementById(
  "analysis-title-container"
);
const resultsContent = document.getElementById("results-content");
const analysisSubtitle = document.getElementById("analysis-subtitle");
const quickResponseBox = document.getElementById("quick-response-box");
const generalStatsList = document.getElementById("general-stats-list");
const attackStatsList = document.getElementById("attack-stats-list");
const generalStatsDetailedList = document.getElementById(
  "general-stats-detailed-list"
);
const defenseStatsList = document.getElementById("defense-stats-list");
const disciplineStatsList = document.getElementById("discipline-stats-list");
const matchInfoList = document.getElementById("match-info-list");
const competitionsList = document.getElementById("competitions-list");
const fanVotesContainer = document.getElementById("fan-votes-container");
const fanVotesList = document.getElementById("fan-votes-list");
const oddsTitle = document.getElementById("odds-title");
const squadList = document.getElementById("squad-list");
const oddsList = document.getElementById("odds-list");
const messageBox = document.getElementById("message-box");

let currentTeamData = null; // Armazena os dados da última busca bem-sucedida
let isAnalysisLoading = false; // Controla o estado de carregamento da análise

// --- Configuração do Backend ---
// Deixamos o caminho relativo para funcionar tanto localmente (com um proxy) quanto em produção (Vercel).
const BACKEND_URL = "";

// Função para mostrar mensagens de erro ou sucesso
function showMessage(message, type = "error") {
  messageBox.textContent = message;
  messageBox.style.display = "block";
  if (type === "error") {
    messageBox.classList.remove("bg-green-800", "text-green-200");
    messageBox.classList.add("bg-red-800", "text-red-200");
  } else {
    messageBox.classList.remove("bg-red-800", "text-red-200");
    messageBox.classList.add("bg-green-800", "text-green-200");
  }
  setTimeout(() => {
    messageBox.style.display = "none";
  }, 5000);
}

// --- BANCO DE DADOS DE ESTATÍSTICAS ---
const TEAM_STATS_DB = {
  vasco: {
    competitions: [
      {
        name: "Brasileirão Betano",
        status: "15º Posição",
        details: "21 Pontos",
      },
      {
        name: "Copa Betano do Brasil",
        status: "Classificado",
        details: "Semi-Final",
      },
    ],
    stats: {
      // General
      sofascoreRating: 6.94,
      matchesPlayed: 21,
      form: "D-W-L-L-W",
      possession: "55.5%",
      formation: "4-3-3",
      passesSuccess: 88.2,
      aerialDuelsWon: 53.1,
      goalKicksPerGame: 7.3,
      // Attack
      goalsScored: 30,
      assists: 24,
      goalsPerMatch: 1.4,
      shotsPerGame: 13.4,
      shotsOnTargetPerGame: 5.0,
      bigChancesCreated: 6,
      bigChancesMissed: 1.3,
      goalsFromInsideBox: 29,
      penaltyGoals: 4,
      counterAttacks: 20,
      // Defense
      cleanSheets: 3,
      goalsConceded: 31,
      goalsConcededPerMatch: 1.5,
      tacklesPerGame: 14.6,
      interceptionsPerGame: 7.6,
      clearancesPerGame: 27.4,
      savesPerGame: 2.6,
      // Discipline
      yellowCards: 2.1,
      redCards: 2,
      foulsPerGame: 11.6,
    },
    squad: {
      attackers: [
        "Pablo Vegetti",
        "Nuno Moreira",
        "Rayan",
        "David",
        "Matheus França",
        "André Gomez",
        "Gabriel Souza",
        "Leo Jacó",
        "Cauã Paixão",
      ],
      midfielders: [
        "Philippe Coutinho",
        "Jair",
        "Cauan Barros",
        "Matheus Carvalho",
        "Tchê Tchê",
        "Adson",
        "Hugo Moura",
        "Guilherme Estrella",
        "Paulinho Paula",
      ],
      defenders: [
        "Carlos Cuesta",
        "Lucas Piton",
        "Robert Renan",
        "Paulo Henrique",
        "Puma Rodriguez",
        "Victor Luiz",
        "Lucas Freitas",
        "Lucas Oliveira",
        "Leandrinho",
        "Paulo Ricardo",
      ],
      goalkeepers: ["Léo Jardim", "Daniel Fuzato", "Pablo"],
    },
  },
  ceara: {
    competitions: [
      {
        name: "Brasileirão Betano",
        status: "11º Posição",
        details: "26 Pontos",
      },
    ],
    stats: {
      form: "D-L-W-D-L",
      possession: "42.0%",
      passesSuccess: 82.1,
      formation: "4-2-3-1",
      avgGoalsFor: "0.9",
      avgGoalsAgainst: "1.0",
      chancesCreatedPerGame: "4",
      cleanSheets: "7",
      aerialDuelsWon: 48.5,
    },
    squad: {
      attackers: ["Erick Pulga", "Facundo Barceló", "Aylon", "Saulo Mineiro"],
      midfielders: ["Guilherme Castilho", "Lourenço", "Lucas Mugni", "Richardson"],
      defenders: ["Ramon Menezes", "Matheus Felipe", "David Ricardo", "Raí Ramos"],
      goalkeepers: ["Richard", "Fernando Miguel"],
    },
  },
  flamengo: {
    competitions: [
      {
        name: "Brasileirão Betano",
        status: "1º Posição",
        details: "35 Pontos",
      },
      {
        name: "Copa Libertadores",
        status: "Classificado",
        details: "Oitavas de Final",
      },
    ],
    stats: {
      form: "W-D-W-L-W",
      possession: "60.1%",
      formation: "4-2-3-1",
      avgGoalsFor: "1.8",
      avgGoalsAgainst: "0.9",
      chancesCreatedPerGame: "7",
      cleanSheets: "8",
    },
    squad: {
      attackers: ["Pedro", "Gabriel Barbosa", "Bruno Henrique", "Everton Cebolinha"],
      midfielders: ["De Arrascaeta", "Nicolás De La Cruz", "Gerson", "Erick Pulgar"],
      defenders: ["Léo Pereira", "Fabrício Bruno", "Ayrton Lucas", "Guillermo Varela"],
      goalkeepers: ["Agustín Rossi", "Matheus Cunha"],
    },
  },
  "real madrid": {
    competitions: [
      { name: "La Liga", status: "Campeão", details: "95 Pontos" },
      {
        name: "Champions League",
        status: "Finalista",
        details: "vs B. Dortmund",
      },
    ],
    stats: {
      form: "W-W-D-W-W",
      possession: "58.2%",
      formation: "4-3-1-2",
      avgGoalsFor: "2.3",
      avgGoalsAgainst: "0.7",
      chancesCreatedPerGame: "8",
      cleanSheets: "10",
    },
    squad: {
      attackers: ["Vini Jr.", "Rodrygo", "Joselu", "Brahim Díaz"],
      midfielders: ["Jude Bellingham", "Toni Kroos", "Luka Modrić", "Federico Valverde"],
      defenders: ["Dani Carvajal", "Antonio Rüdiger", "Nacho", "Ferland Mendy"],
      goalkeepers: ["Thibaut Courtois", "Andriy Lunin"],
    },
  },
  barcelona: {
    competitions: [
      { name: "La Liga", status: "2º Posição", details: "85 Pontos" },
      {
        name: "Champions League",
        status: "Eliminado",
        details: "Quartas de Final",
      },
    ],
    stats: {
      // General
      sofascoreRating: 7.05,
      matchesPlayed: 38,
      form: "W-L-W-W-W",
      possession: "64.3%",
      formation: "4-3-3",
      passesSuccess: 89.8,
      aerialDuelsWon: 51.2,
      goalKicksPerGame: 6.2,
      // Attack
      goalsScored: 79,
      assists: 55,
      goalsPerMatch: 2.07,
      shotsPerGame: 15.8,
      shotsOnTargetPerGame: 6.1,
      bigChancesCreated: 12,
      bigChancesMissed: 2.5,
      goalsFromInsideBox: 70,
      penaltyGoals: 5,
      counterAttacks: 18,
      // Defense
      cleanSheets: 15,
      goalsConceded: 44,
      goalsConcededPerMatch: 1.15,
      tacklesPerGame: 15.5,
      interceptionsPerGame: 8.1,
      clearancesPerGame: 18.9,
      savesPerGame: 2.8,
      // Discipline
      yellowCards: 2.3,
      redCards: 3,
      foulsPerGame: 10.8,
    },
    squad: {
      attackers: ["Robert Lewandowski", "Lamine Yamal", "Raphinha", "João Félix"],
      midfielders: ["İlkay Gündoğan", "Pedri", "Frenkie de Jong", "Gavi"],
      defenders: ["Ronald Araújo", "Jules Koundé", "João Cancelo", "Pau Cubarsí"],
      goalkeepers: ["Marc-André ter Stegen", "Iñaki Peña"],
    },
  },
  "manchester city": {
    competitions: [
      {
        name: "Premier League",
        status: "2º Posição",
        details: "79 Pontos",
      },
      {
        name: "Champions League",
        status: "Classificado",
        details: "Quartas de Final",
      },
    ],
    stats: {
      // General
      sofascoreRating: 7.21,
      matchesPlayed: 34,
      form: "W-W-W-D-W",
      possession: "65.2%",
      formation: "4-3-3",
      passesSuccess: 92.5,
      aerialDuelsWon: 49.8,
      goalKicksPerGame: 5.1,
      // Attack
      goalsScored: 85,
      assists: 60,
      goalsPerMatch: 2.5,
      shotsPerGame: 18.1,
      shotsOnTargetPerGame: 7.2,
      bigChancesCreated: 15,
      bigChancesMissed: 2.1,
      goalsFromInsideBox: 75,
      penaltyGoals: 8,
      counterAttacks: 15,
      // Defense
      cleanSheets: 12,
      goalsConceded: 30,
      goalsConcededPerMatch: 0.88,
      tacklesPerGame: 12.1,
      interceptionsPerGame: 6.5,
      clearancesPerGame: 15.3,
      savesPerGame: 1.9,
      // Discipline
      yellowCards: 1.5,
      redCards: 1,
      foulsPerGame: 9.1,
    },
    squad: {
      attackers: ["Erling Haaland", "Julián Álvarez", "Jack Grealish", "Jérémy Doku"],
      midfielders: ["Kevin De Bruyne", "Rodri", "Bernardo Silva", "Phil Foden"],
      defenders: ["Rúben Dias", "Joško Gvardiol", "Kyle Walker", "John Stones"],
      goalkeepers: ["Ederson"],
    },
  },
  arsenal: {
    competitions: [
      { name: "Premier League", status: "1º Posição", details: "89 Pontos" },
      {
        name: "Champions League",
        status: "Eliminado",
        details: "Quartas de Final",
      },
    ],
    stats: {
      sofascoreRating: 7.15,
      matchesPlayed: 38,
      form: "W-W-W-W-W",
      possession: "62.1%",
      formation: "4-3-3",
      passesSuccess: 89.5,
      aerialDuelsWon: 52.3,
      goalsScored: 91,
      assists: 68,
      goalsPerMatch: 2.39,
      shotsPerGame: 16.9,
      bigChancesCreated: 18,
      bigChancesMissed: 1.9,
      cleanSheets: 18,
      goalsConceded: 29,
      goalsConcededPerMatch: 0.76,
      tacklesPerGame: 14.2,
      interceptionsPerGame: 7.8,
      clearancesPerGame: 16.1,
      savesPerGame: 1.8,
      yellowCards: 1.7,
      redCards: 2,
      foulsPerGame: 10.1,
    },
    squad: {
      attackers: ["Bukayo Saka", "Gabriel Jesus", "Gabriel Martinelli", "Leandro Trossard"],
      midfielders: ["Martin Ødegaard", "Declan Rice", "Kai Havertz", "Thomas Partey"],
      defenders: ["William Saliba", "Gabriel Magalhães", "Ben White", "Oleksandr Zinchenko"],
      goalkeepers: ["David Raya"],
    },
  },
  "bayern munich": {
    competitions: [
      { name: "Bundesliga", status: "2º Posição", details: "72 Pontos" },
      {
        name: "Champions League",
        status: "Eliminado",
        details: "Semi-Final",
      },
    ],
    stats: {
      sofascoreRating: 7.28,
      matchesPlayed: 34,
      form: "L-W-W-L-W",
      possession: "63.5%",
      formation: "4-2-3-1",
      passesSuccess: 88.1,
      aerialDuelsWon: 54.1,
      goalsScored: 94,
      assists: 70,
      goalsPerMatch: 2.76,
      shotsPerGame: 18.5,
      bigChancesCreated: 22,
      bigChancesMissed: 3.1,
      cleanSheets: 10,
      goalsConceded: 45,
      goalsConcededPerMatch: 1.32,
      tacklesPerGame: 13.8,
      interceptionsPerGame: 7.1,
      clearancesPerGame: 14.9,
      savesPerGame: 2.9,
      yellowCards: 1.6,
      redCards: 1,
      foulsPerGame: 9.5,
    },
    squad: {
      attackers: ["Harry Kane", "Leroy Sané", "Kingsley Coman", "Serge Gnabry"],
      midfielders: ["Jamal Musiala", "Joshua Kimmich", "Leon Goretzka", "Thomas Müller"],
      defenders: ["Alphonso Davies", "Matthijs de Ligt", "Dayot Upamecano", "Kim Min-jae"],
      goalkeepers: ["Manuel Neuer"],
    },
  },
  "borussia dortmund": {
    competitions: [
      { name: "Bundesliga", status: "5º Posição", details: "63 Pontos" },
      {
        name: "Champions League",
        status: "Finalista",
        details: "vs Real Madrid",
      },
    ],
    stats: {
      sofascoreRating: 6.99,
      matchesPlayed: 34,
      form: "W-L-W-W-D",
      possession: "58.9%",
      formation: "4-2-3-1",
      passesSuccess: 85.4,
      aerialDuelsWon: 51.9,
      goalsScored: 68,
      assists: 49,
      goalsPerMatch: 2.0,
      shotsPerGame: 15.1,
      bigChancesCreated: 15,
      bigChancesMissed: 2.8,
      cleanSheets: 9,
      goalsConceded: 43,
      goalsConcededPerMatch: 1.26,
      tacklesPerGame: 16.1,
      interceptionsPerGame: 8.9,
      clearancesPerGame: 19.2,
      savesPerGame: 3.1,
      yellowCards: 1.8,
      redCards: 2,
      foulsPerGame: 10.2,
    },
    squad: {
      attackers: ["Niclas Füllkrug", "Donyell Malen", "Jadon Sancho", "Karim Adeyemi"],
      midfielders: ["Julian Brandt", "Marcel Sabitzer", "Emre Can", "Marco Reus"],
      defenders: ["Mats Hummels", "Nico Schlotterbeck", "Julian Ryerson", "Ian Maatsen"],
      goalkeepers: ["Gregor Kobel"],
    },
  },
  corinthians: {
    competitions: [
      {
        name: "Brasileirão Betano",
        status: "14º Posição",
        details: "24 Pontos",
      },
      {
        name: "Copa Sudamericana",
        status: "Classificado",
        details: "Oitavas de Final",
      },
    ],
    stats: {
      sofascoreRating: 6.81,
      matchesPlayed: 22,
      form: "D-L-W-D-D",
      possession: "51.2%",
      formation: "4-3-3",
      passesSuccess: 85.9,
      aerialDuelsWon: 50.5,
      goalsScored: 22,
      assists: 15,
      goalsPerMatch: 1.0,
      shotsPerGame: 12.1,
      bigChancesCreated: 4,
      bigChancesMissed: 1.8,
      cleanSheets: 6,
      goalsConceded: 25,
      goalsConcededPerMatch: 1.13,
      tacklesPerGame: 15.8,
      interceptionsPerGame: 8.2,
      clearancesPerGame: 22.5,
      savesPerGame: 3.5,
      yellowCards: 2.8,
      redCards: 4,
      foulsPerGame: 13.1,
    },
    squad: {
      attackers: ["Yuri Alberto", "Wesley", "Pedro Raul", "Ángel Romero"],
      midfielders: ["Rodrigo Garro", "Raniele", "Breno Bidon", "Igor Coronado"],
      defenders: ["Félix Torres", "Cacá", "Fagner", "Hugo"],
      goalkeepers: ["Carlos Miguel"],
    },
  },
};

// --- BANCO DE DADOS DE PARTIDAS (Simula o que viria da API) ---
const mockDatabase = {
  "real madrid": {
    team: "Real Madrid vs B. Dortmund",
    logos: {
      home: "https://media.api-sports.io/football/teams/541.png",
      away: "https://media.api-sports.io/football/teams/165.png",
    },
    next_match: {
      opponent: "B. Dortmund",
      date: "01 de Junho de 2025, 19:00 UTC",
    },
    last_match: {
      opponent: "Real Betis",
      score: "0 - 0",
      competition: "La Liga",
    },
    odds: { win: 1.5, draw: 3.8, loss: 5.5 },
  },
  barcelona: {
    team: "Barcelona vs Real Madrid",
    logos: {
      home: "https://media.api-sports.io/football/teams/529.png",
      away: "https://media.api-sports.io/football/teams/541.png",
    },
    next_match: {
      opponent: "Real Madrid",
      date: "04 de Junho de 2025, 20:00 UTC",
    },
    last_match: {
      opponent: "Sevilla",
      score: "2 - 1",
      competition: "La Liga",
    },
    odds: { win: 2.5, draw: 3.4, loss: 2.8 },
  },
  "manchester city": {
    team: "Manchester City vs Arsenal",
    logos: {
      home: "https://media.api-sports.io/football/teams/50.png",
      away: "https://media.api-sports.io/football/teams/42.png",
    },
    next_match: {
      opponent: "Arsenal",
      date: "05 de Junho de 2025, 16:00 UTC",
    },
    last_match: {
      opponent: "Manchester United",
      score: "1 - 2",
      competition: "FA Cup Final",
    },
    odds: { win: 1.8, draw: 3.5, loss: 4.0 },
  },
  arsenal: {
    team: "Arsenal vs Tottenham",
    logos: {
      home: "https://media.api-sports.io/football/teams/42.png",
      away: "https://media.api-sports.io/football/teams/47.png",
    },
    next_match: {
      opponent: "Tottenham",
      date: "08 de Junho de 2025, 14:00 UTC",
    },
    last_match: {
      opponent: "Everton",
      score: "2 - 1",
      competition: "Premier League",
    },
    odds: { win: 1.45, draw: 4.5, loss: 6.0 },
  },
  "bayern munich": {
    team: "Bayern Munich vs Hoffenheim",
    logos: {
      home: "https://media.api-sports.io/football/teams/157.png",
      away: "https://media.api-sports.io/football/teams/167.png",
    },
    next_match: {
      opponent: "Hoffenheim",
      date: "07 de Junho de 2025, 18:30 UTC",
    },
    last_match: {
      opponent: "Real Madrid",
      score: "1 - 2",
      competition: "Champions League",
    },
    odds: { win: 1.3, draw: 5.0, loss: 8.5 },
  },
  "borussia dortmund": {
    team: "Borussia Dortmund vs Real Madrid",
    logos: {
      home: "https://media.api-sports.io/football/teams/165.png",
      away: "https://media.api-sports.io/football/teams/541.png",
    },
    next_match: {
      opponent: "Real Madrid",
      date: "01 de Junho de 2025, 19:00 UTC",
    },
    last_match: {
      opponent: "Darmstadt",
      score: "4 - 0",
      competition: "Bundesliga",
    },
    odds: { win: 5.5, draw: 3.8, loss: 1.5 },
  },
  corinthians: {
    team: "Corinthians vs Palmeiras",
    logos: {
      home: "https://media.api-sports.io/football/teams/130.png",
      away: "https://media.api-sports.io/football/teams/121.png",
    },
    next_match: { opponent: "Palmeiras", date: "10 de Junho de 2025, 20:00 UTC" },
    last_match: { opponent: "Racing-URU", score: "3 - 0", competition: "Copa Sudamericana" },
    odds: { win: 3.5, draw: 3.1, loss: 2.1 },
  },
  flamengo: {
    team: "Flamengo vs Vasco da Gama",
    logos: {
      home: "https://media.api-sports.io/football/teams/127.png",
      away: "https://media.api-sports.io/football/teams/131.png",
    },
    next_match: {
      opponent: "Vasco da Gama",
      date: "02 de Junho de 2025, 19:00 UTC",
    },
    last_match: {
      opponent: "Millonarios",
      score: "3 - 0",
      competition: "Copa Libertadores",
    },
    odds: { win: 2.2, draw: 3.1, loss: 3.3 },
  },
  vasco: {
    team: "Vasco da Gama vs Ceará",
    logos: {
      home: "https://upload.wikimedia.org/wikipedia/pt/a/ac/CRVascodaGama.png",
      away: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Cear%C3%A1_Sporting_Club_logo.svg/1845px-Cear%C3%A1_Sporting_Club_logo.svg.png",
    },
    odds: { win: 1.91, draw: 3.3, loss: 4.33 },
    fan_votes: { home: 74, draw: 9, away: 17 },
    next_match: {
      opponent: "Ceará",
      date: "14 de Setembro de 2025, 23:30 UTC",
    },
    last_match: {
      opponent: "Botafogo",
      score: "1 - 1 (5-3p)",
      competition: "Copa Betano do Brasil",
    },
  },
};

// Função que simula a chamada para buscar dados recentes
async function fetchFromSportsAPI(query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalizedQuery = query.toLowerCase().trim();
      let matchData = mockDatabase[normalizedQuery];

      if (matchData) {
        // Lógica para "puxar" os dados do banco de estatísticas
        const homeTeamKey = normalizedQuery;
        const awayTeamKey = matchData.next_match.opponent
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove acentos
          .replace(" da gama", "");

        // Anexa os dados do time da casa
        if (TEAM_STATS_DB[homeTeamKey]) {
          // Usa Object.assign para fundir os dados sem sobrescrever o objeto original
          Object.assign(matchData, TEAM_STATS_DB[homeTeamKey]);
        }

        // Anexa os dados do time visitante
        if (TEAM_STATS_DB[awayTeamKey]) {
          // Garante que opponent_data exista antes de atribuir
          matchData.next_match.opponent_data = {
            ...TEAM_STATS_DB[awayTeamKey].stats,
          };
        }
      }

      // Adiciona uma flag para identificar a partida específica do Vasco
      if (normalizedQuery === "vasco") {
        matchData.isVascoMatch = true;
      }

      resolve(matchData || null);
    }, 1000); // Simula um atraso de 1 segundo na busca
  });
}

// Função principal para analisar o jogo
async function analyzeTeam(teamName) {
  messageBox.style.display = "none";
  // Desabilitar todos os botões para evitar cliques múltiplos
  document
    .querySelectorAll(".quick-button")
    .forEach((button) => (button.disabled = true));
  // Exibe o skeleton loader
  resultsContent.classList.add("hidden", "is-transparent");
  resultsPlaceholder.classList.remove("hidden");

  // Reseta as abas para o estado inicial
  openTab(null, "visao_geral", false); // Apenas muda a aba, não gera análise ainda
  document.querySelector(".tab-button.active")?.classList.remove("active");
  document.querySelector(".tab-button")?.classList.add("active");
  resultsDiv.style.display = "block";

  try {
    // Passo 1: Buscar os dados do nosso backend.
    // Para visualizar o frontend com dados de simulação, usamos as funções mock.
    // const data = await fetchFromSportsAPI(teamName); // MODO SIMULAÇÃO: Comente esta linha para usar o backend real
    const data = await fetchDataFromServer(teamName); // MODO REAL: Descomente esta linha para usar o backend

    if (!data) {
      throw new Error(
        `Não foi possível encontrar dados para "${teamName}". Verifique o nome e tente novamente.`
      );
    }

    currentTeamData = data; // Armazena os dados para uso nas abas

    // const initialAnalysis = await generateMockAnalysis(data, "visao_geral"); // MODO SIMULAÇÃO: Comente esta linha
    const initialAnalysis = await generateFullAnalysis(data, "visao_geral"); // MODO REAL: Descomente esta linha

    // Dividir a resposta em título, subtítulo e corpo
    const lines = initialAnalysis.split("\n");
    analysisTitleContainer.innerHTML = `
            <img src="${data.logos.home}" alt="Logo do time" class="team-logo">
            <h2 class="text-2xl font-bold text-gray-100 ml-4 text-center">${
              lines[0] || "Análise do Jogo"
            }</h2>
        `;
    analysisSubtitle.textContent = lines[1] || "";

    const bodyLines = lines.slice(2);
    quickResponseBox.innerHTML = "";
    bodyLines.forEach((line) => {
      if (line.trim() !== "") {
        const p = document.createElement("p");
        p.textContent = line;
        quickResponseBox.appendChild(p);
      }
    });

    matchInfoList.innerHTML = `
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" /></svg>
                <span><strong>Próxima:</strong> vs ${data.next_match.opponent}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.25a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11z" clip-rule="evenodd" /></svg>
                <span><strong>Última:</strong> ${data.last_match.score} vs ${data.last_match.opponent}</span>
            </li>
        `;

    competitionsList.innerHTML = data.competitions
      .map(
        (comp) => `
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M15.5 5.822a1.5 1.5 0 01.539 1.44l-1.458 6.56a1.5 1.5 0 01-2.92.001L10.5 8.363l-1.66 5.46a1.5 1.5 0 01-2.92 0L4.46 7.262a1.5 1.5 0 01.54-1.44 1.5 1.5 0 012.13-.09l1.34 1.34L10.5 5.5l1.33 1.662 1.53-.998a1.5 1.5 0 012.14.658z" /><path d="M15.5 5.822a1.5 1.5 0 01.539 1.44l-1.458 6.56a1.5 1.5 0 01-2.92.001L10.5 8.363l-1.66 5.46a1.5 1.5 0 01-2.92 0L4.46 7.262a1.5 1.5 0 01.54-1.44 1.5 1.5 0 012.13-.09l1.34 1.34L10.5 5.5l1.33 1.662 1.53-.998a1.5 1.5 0 012.14.658z" /></svg>
                <span><strong>${comp.name}:</strong> ${comp.status} <span class="text-gray-400">(${comp.details})</span></span>
            </li>
        `
      )
      .join("");

    if (data.fan_votes) {
      fanVotesContainer.style.display = "block";
      const teamNames = data.team.split(" vs ");
      const homeTeamName = teamNames[0] || "Time 1";
      const awayTeamName = teamNames[1] || "Time 2";
      fanVotesList.innerHTML = `
        <li class="flex items-center">
            <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.957 9.957 0 0010 12c-2.31 0-4.438.784-6.131 2.095z" /></svg>
            <span><strong>${homeTeamName}:</strong> ${data.fan_votes.home}%</span>
        </li>
        <li class="flex items-center">
            <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clip-rule="evenodd" /></svg>
            <span><strong>Empate:</strong> ${data.fan_votes.draw}%</span>
        </li>
        <li class="flex items-center">
            <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.957 9.957 0 0010 12c-2.31 0-4.438.784-6.131 2.095z" /></svg>
            <span><strong>${awayTeamName}:</strong> ${data.fan_votes.away}%</span>
        </li>
      `;
    } else {
      fanVotesContainer.style.display = "none";
    }

    generalStatsList.innerHTML = `
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 01.5 2.9v.5a1.5 1.5 0 01-3 0v-.5a1.5 1.5 0 012.5-2.9zM12.866 15.366A10.953 10.953 0 0110 16.5c-2.929 0-5.585-1.15-7.548-3.004A.75.75 0 013.51 12.44A9.453 9.453 0 0010 15c2.49 0 4.72-.902 6.49-2.428a.75.75 0 011.06 1.061 10.953 10.953 0 01-4.684 1.734z" /></svg>
                <span><strong>Posse de Bola:</strong> ${data.stats.possession}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zM5.5 6a.5.5 0 000 1h9a.5.5 0 000-1h-9zM5.5 9.5a.5.5 0 000 1h9a.5.5 0 000-1h-9zM5.5 13a.5.5 0 000 1h9a.5.5 0 000-1h-9z" clip-rule="evenodd" /></svg>
                <span><strong>Formação Comum:</strong> ${data.stats.formation}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.5 5.5a.5.5 0 01.5.5v8a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zM8.5 8.5a.5.5 0 01.5.5v5a.5.5 0 01-1 0V9a.5.5 0 01.5-.5zM4.5 11.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5z" clip-rule="evenodd" /></svg>
                <span><strong>Forma Recente:</strong> ${data.stats.form}</span>
            </li>
        `;
    generalStatsDetailedList.innerHTML = `
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.297 3.127a1 1 0 00.95.69h3.284c.809 0 1.152 1.026.57 1.598l-2.654 1.934a1 1 0 00-.364 1.118l1.297 3.127c.321.772-.632 1.47-1.353 1.026l-2.654-1.934a1 1 0 00-1.175 0l-2.654 1.934c-.721.444-1.674-.254-1.353-1.026l1.297-3.127a1 1 0 00-.364-1.118L2.29 9.299c-.582-.572-.24-1.598.57-1.598h3.284a1 1 0 00.95-.69l1.297-3.127z" clip-rule="evenodd" /></svg>
                <span><strong>Nota Sofascore:</strong> ${data.stats.sofascoreRating}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M15.28 4.72a.75.75 0 011.06 1.06l-6.25 6.25a.75.75 0 01-1.06 0l-3.25-3.25a.75.75 0 011.06-1.06L9.5 10.44l5.72-5.72z" clip-rule="evenodd" /></svg>
                <span><strong>Passes Certos:</strong> ${data.stats.passesSuccess}%</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M11.983 1.904a.75.75 0 00-1.966 0l-3.25 4.063a.75.75 0 00.57 1.23h6.5a.75.75 0 00.57-1.23l-3.25-4.063zM11.983 18.096a.75.75 0 00-1.966 0l-3.25-4.063a.75.75 0 00-.57-1.23h6.5a.75.75 0 00-.57 1.23l-3.25 4.063zM10 7.25a2.75 2.75 0 100 5.5 2.75 2.75 0 000-5.5z" /></svg>
                <span><strong>Gols Marcados:</strong> ${data.stats.goalsScored}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 8a3 3 0 100-6 3 3 0 000 6zM1.5 15a3 3 0 100-6 3 3 0 000 6zM10 15a3 3 0 100-6 3 3 0 000 6z" /></svg>
                <span><strong>Assistências:</strong> ${data.stats.assists}</span>
            </li>
        `;
    attackStatsList.innerHTML = `
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a.75.75 0 01.75.75v.518a9.985 9.985 0 017.982 4.123.75.75 0 01-.972 1.138A8.485 8.485 0 0010.75 7.75v-2.5a.75.75 0 01-.75-.75zM10 20a9.999 9.999 0 01-7.982-4.123.75.75 0 01.972-1.138A8.485 8.485 0 009.25 12.25v2.5a.75.75 0 01.75.75zM2.5 10a.75.75 0 01.75-.75h.518a9.985 9.985 0 014.123-7.982.75.75 0 011.138.972A8.485 8.485 0 007.75 9.25h-2.5a.75.75 0 01-.75-.75zM17.5 10a.75.75 0 01-.75.75h-2.5a8.485 8.485 0 00-2.63 6.028.75.75 0 01-1.138-.972A9.985 9.985 0 0116.232 10h.518a.75.75 0 01.75.75z" /></svg>
                <span><strong>Gols por Partida:</strong> ${data.stats.goalsPerMatch}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 8.5a1.5 1.5 0 113 0v5.25a1.5 1.5 0 11-3 0V8.5z" /><path d="M6.5 6.5a1.5 1.5 0 100 3v5.75a1.5 1.5 0 103 0V12.5a1.5 1.5 0 10-3 0V6.5z" /><path d="M13.5 6.5a1.5 1.5 0 100 3v2.25a1.5 1.5 0 103 0V9.5a1.5 1.5 0 10-3 0V6.5z" /></svg>
                <span><strong>Finalizações / Jogo:</strong> ${data.stats.shotsPerGame}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M15.312 11.342a1.5 1.5 0 01-2.121-2.121l-2.03-2.03a1.5 1.5 0 012.121-2.121l2.03 2.03a1.5 1.5 0 010 2.121zM10.47 4.658a1.5 1.5 0 00-2.121-2.121l-2.03 2.03a1.5 1.5 0 002.121 2.121l2.03-2.03zM4.688 11.342a1.5 1.5 0 010-2.121l2.03-2.03a1.5 1.5 0 012.121 2.121l-2.03 2.03a1.5 1.5 0 01-2.121 0z" clip-rule="evenodd" /></svg>
                <span><strong>Grandes Chances Criadas:</strong> ${data.stats.bigChancesCreated}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M15.962 2.962a.75.75 0 00-1.06 0l-5.462 5.462a.75.75 0 01-1.06 0L2.962 2.962a.75.75 0 00-1.06 1.06L7.32 9.44a.75.75 0 010 1.06L1.902 15.962a.75.75 0 101.06 1.06L8.38 11.56a.75.75 0 011.06 0l5.462 5.462a.75.75 0 101.06-1.06L11.56 10.5l5.462-5.462a.75.75 0 000-1.076z" clip-rule="evenodd" /></svg>
                <span><strong>Grandes Chances Perdidas:</strong> ${data.stats.bigChancesMissed}</span>
            </li>
        `;
    defenseStatsList.innerHTML = `
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 1.5c-4.694 0-8.5 3.806-8.5 8.5s3.806 8.5 8.5 8.5 8.5-3.806 8.5-8.5S14.694 1.5 10 1.5zM8.5 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM10 15a5.5 5.5 0 005.5-5.5H10V15zM10 5a4.5 4.5 0 014.5 4.5H10V5z" clip-rule="evenodd" /></svg>
                <span><strong>Gols Sofridos / Jogo:</strong> ${data.stats.goalsConcededPerMatch}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
                <span><strong>Jogos sem sofrer gols:</strong> ${data.stats.cleanSheets}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                <span><strong>Desarmes / Jogo:</strong> ${data.stats.tacklesPerGame}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L7.28 7.58a.75.75 0 01-1.06-1.06l3.25-3.25a.75.75 0 011.06 0l3.25 3.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25a.75.75 0 01-.75.75z" clip-rule="evenodd" /></svg>
                <span><strong>Duelos Aéreos Ganhos:</strong> ${data.stats.aerialDuelsWon}%</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2.5-8.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg>
                <span><strong>Cortes / Jogo:</strong> ${data.stats.clearancesPerGame}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5zM10 8a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 8z" /></svg>
                <span><strong>Defesas / Jogo:</strong> ${data.stats.savesPerGame}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" /></svg>
                <span><strong>Interceptações / Jogo:</strong> ${data.stats.interceptionsPerGame}</span>
            </li>
        `;
    disciplineStatsList.innerHTML = `
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.392c1.652.22 3.08.688 4.25 1.247 1.17.56 2.104 1.182 2.939 1.81.834.628 1.483 1.19 1.945 1.634a.75.75 0 001.06-1.06c-.38-.36-1.008-.89-1.89-1.54-1.196-.857-2.328-1.555-3.63-2.228-1.302-.673-2.938-1.18-4.924-1.33V2.75z" /></svg>
                <span><strong>Faltas / Jogo:</strong> ${data.stats.foulsPerGame}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.5 2A1.5 1.5 0 002 3.5v13A1.5 1.5 0 003.5 18h13a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-13zM12.5 8a.5.5 0 01.5.5v5a.5.5 0 01-1 0v-5a.5.5 0 01.5-.5z" /></svg>
                <span><strong>Cartões Amarelos:</strong> ${data.stats.yellowCards}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.5 2A1.5 1.5 0 002 3.5v13A1.5 1.5 0 003.5 18h13a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-13zM12.5 8a.5.5 0 01.5.5v5a.5.5 0 01-1 0v-5a.5.5 0 01.5-.5z" style="color: #ef4444;"/></svg>
                <span><strong>Cartões Vermelhos:</strong> ${data.stats.redCards}</span>
            </li>
        `;
    squadList.innerHTML = `
            <div>
                <strong class="text-purple-300">Atacantes:</strong>
                <p class="text-gray-300 text-sm leading-relaxed">${data.squad.attackers.join(
                  ", "
                )}</p>
            </div>
            <div>
                <strong class="text-purple-300">Meio-campistas:</strong>
                <p class="text-gray-300 text-sm leading-relaxed">${data.squad.midfielders.join(
                  ", "
                )}</p>
            </div>
            <div>
                <strong class="text-purple-300">Defensores:</strong>
                <p class="text-gray-300 text-sm leading-relaxed">${data.squad.defenders.join(
                  ", "
                )}</p>
            </div>
            <div>
                <strong class="text-purple-300">Goleiros:</strong>
                <p class="text-gray-300 text-sm leading-relaxed">${data.squad.goalkeepers.join(
                  ", "
                )}</p>
            </div>
        `;
    oddsList.innerHTML = `
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
                <span><strong>Vitória:</strong> ${data.odds.win.toFixed(
                  2
                )}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clip-rule="evenodd" /></svg>
                <span><strong>Empate:</strong> ${data.odds.draw.toFixed(
                  2
                )}</span>
            </li>
            <li class="flex items-center">
                <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
                <span><strong>Derrota:</strong> ${data.odds.loss.toFixed(
                  2
                )}</span>
            </li>
        `;

    oddsTitle.textContent = `Odds (vs ${data.next_match.opponent})`;

    resultsDiv.style.display = "block";

    // Esconde o skeleton e mostra o conteúdo real
    resultsPlaceholder.classList.add("is-transparent");

    // Aguarda a transição do placeholder terminar antes de trocá-lo pelo conteúdo real
    setTimeout(() => {
      resultsPlaceholder.classList.add("hidden");
      resultsContent.classList.remove("hidden");
      // Força o navegador a processar a mudança de display antes de iniciar a transição de opacidade
      requestAnimationFrame(() =>
        resultsContent.classList.remove("is-transparent")
      );
    }, 400); // Duração deve ser a mesma da transição CSS (0.4s)
  } catch (error) {
    console.error("Erro durante a análise do jogo:", error);
    resultsDiv.style.display = "none";
    showMessage(
      error.message || "Ocorreu um erro inesperado. Tente novamente."
    );
  } finally {
    // Habilitar os botões novamente
    document
      .querySelectorAll(".quick-button")
      .forEach((button) => (button.disabled = false));
  }
}

async function openTab(evt, tabName, generateAnalysis = true) {
  // Get all elements with class="tab-content" and hide them
  const tabcontent = document.querySelectorAll(".tab-content");
  tabcontent.forEach((tab) => tab.classList.add("hidden"));

  // Get all elements with class="tab-button" and remove the class "active"
  const tablinks = document.querySelectorAll(".tab-button");
  tablinks.forEach((link) => link.classList.remove("active"));

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).classList.remove("hidden");
  if (evt) {
    evt.currentTarget.classList.add("active");
  }

  if (generateAnalysis) {
    await updateAnalysis(tabName);
  }
}

async function updateAnalysis(tabName) {
  if (isAnalysisLoading || !currentTeamData) return;

  isAnalysisLoading = true;
  quickResponseBox.innerHTML = `<div class="flex justify-center items-center p-8"><div class="loading-spinner"></div></div>`;
  analysisSubtitle.textContent = "Gerando nova análise...";

  try {
    // const newAnalysis = await generateMockAnalysis(currentTeamData, tabName); // MODO SIMULAÇÃO: Comente esta linha
    const newAnalysis = await generateFullAnalysis(currentTeamData, tabName); // MODO REAL: Descomente esta linha
    const lines = newAnalysis.split("\n");

    // O título principal não muda, apenas o subtítulo e o corpo
    analysisSubtitle.textContent = lines[1] || "";

    const bodyLines = lines.slice(2);
    quickResponseBox.innerHTML = "";
    bodyLines.forEach((line) => {
      if (line.trim() !== "") {
        const p = document.createElement("p");
        p.textContent = line;
        quickResponseBox.appendChild(p);
      }
    });
  } catch (error) {
    quickResponseBox.innerHTML = `<p class="text-red-400">Erro ao gerar análise para esta aba.</p>`;
  } finally {
    isAnalysisLoading = false;
  }
}

// Função que usa o LLM para gerar uma análise completa
async function generateFullAnalysis(data, tabName = "visao_geral") {
  try {
    // O prompt e a query do usuário são enviados para o nosso backend seguro.
    const systemPrompt = `Você é um analista de dados esportivos de classe mundial. Sua tarefa é gerar uma análise detalhada com base nos dados em JSON e no contexto da aba solicitada. A resposta deve ser em português, com um título, um subtítulo e no mínimo 4 parágrafos detalhados, sem usar Markdown.`;

    const userQuery = `Com base nos dados JSON a seguir, gere uma análise focada no tópico '${tabName}':\n${JSON.stringify(
      data,
      null,
      2
    )}`;

    const payload = {
      systemPrompt: systemPrompt,
      userQuery: userQuery,
      data: data, // Enviando os dados do jogo também
    };

    const response = await fetch(`${BACKEND_URL}/api/generate-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorResult = await response.json();
      throw new Error(
        errorResult.message || "Erro desconhecido do servidor de IA."
      );
    }

    const result = await response.json();
    const text = result.analysisText; // O backend retornará um JSON com o texto da análise
    return text || "A API de IA não retornou um texto de análise.";
  } catch (error) {
    console.error("Erro ao gerar análise:", error);
    throw new Error(`Falha na comunicação com a IA: ${error.message}`);
  }
}

function quickAnalyze(query) {
  analyzeTeam(query);
}

// --- Função de Simulação de IA ---
// Gera uma análise de texto falsa para visualização do frontend sem chamar a API real.
async function generateMockAnalysis(data, tabName) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // --- Montagem da Análise Detalhada ---
      const teamName = data.team.split(" vs ")[0];
      let title, subtitle, p1, p2, p3, p4;

      switch (tabName) {
        case "estatisticas":
          if (teamName.toLowerCase().includes("vasco")) {
            title = `Análise Tática: ${teamName}`;
            subtitle = `Interpretando os números da temporada.`;
            p1 = `Os números do Vasco da Gama pintam o retrato de um time que busca ser protagonista através da posse de bola, registrando uma média de ${data.stats.possession}. Essa filosofia se traduz em um volume ofensivo considerável, com ${data.stats.shotsPerGame} finalizações por jogo. A precisão nos passes, em ${data.stats.passesSuccess}%, é um indicativo da qualidade técnica do elenco para manter o controle da partida e construir jogadas de forma paciente, principalmente sob a batuta de Philippe Coutinho.`;
            p2 = `Ofensivamente, a equipe marca em média ${data.stats.goalsPerMatch} gols por jogo, um número impulsionado pela eficiência de seu centroavante, Pablo Vegetti. O time cria ${data.stats.bigChancesCreated} grandes chances por partida, mas o aproveitamento ainda pode ser melhorado, visto que desperdiça ${data.stats.bigChancesMissed} delas. A maioria dos gols (${data.stats.goalsFromInsideBox}) surge de jogadas dentro da área, evidenciando a importância de ter um finalizador e da infiltração dos meio-campistas.`;
            p3 = `O calcanhar de Aquiles da equipe reside no sistema defensivo. Sofrer em média ${data.stats.goalsConcededPerMatch} gols por jogo é uma estatística preocupante que impede uma campanha mais sólida. Apesar de um número expressivo de cortes por jogo (${data.stats.clearancesPerGame}), a equipe conseguiu apenas ${data.stats.cleanSheets} partidas sem ser vazada em ${data.stats.matchesPlayed} jogos, o que demonstra uma vulnerabilidade persistente que precisa ser corrigida para que o time possa almejar posições mais altas.`;
            p4 = `No combate físico, o Vasco se mostra um time aguerrido. A média de ${data.stats.tacklesPerGame} desarmes e ${data.stats.interceptionsPerGame} interceptações por jogo indica uma postura ativa na tentativa de recuperação da posse. Além disso, o time vence ${data.stats.aerialDuelsWon}% dos duelos aéreos, uma estatística importante tanto em lances de bola parada defensivos quanto ofensivos, onde Vegetti novamente se destaca como uma ameaça constante para os adversários.`;
            const p5 = `A disciplina é outro ponto que merece atenção. Com uma média de ${data.stats.foulsPerGame} faltas por jogo e um total de ${data.stats.yellowCards} cartões amarelos e ${data.stats.redCards} vermelhos, a equipe por vezes excede na intensidade, o que pode resultar em desfalques importantes e lances de bola parada perigosos para os adversários. Controlar o ímpeto sem perder a competitividade é um desafio para o comando técnico.`;
            const p6 = `Em resumo, a nota Sofascore de ${data.stats.sofascoreRating} reflete um time com um ataque potente e um meio-campo de qualidade, mas que é minado por uma defesa instável. Para evoluir, o Vasco precisa encontrar um equilíbrio tático que permita manter seu volume ofensivo sem se expor excessivamente, transformando a posse de bola em um controle mais efetivo do jogo como um todo.`;
            return resolve([title, subtitle, "", p1, p2, p3, p4, p5, p6].join("\n"));
          }
          // Lógica genérica para outros times
          title = `Análise Tática: ${teamName}`;
          subtitle = `Interpretando os números do campeonato.`;
          p1 = `Os dados do ${teamName} revelam um time de DNA ofensivo. Com uma média de ${data.stats.goalsPerMatch} gols por partida e ${data.stats.shotsPerGame} finalizações, a equipe demonstra um claro volume de jogo no ataque. A criação de ${data.stats.bigChancesCreated} grandes chances por jogo, somada às ${data.stats.assists} assistências na temporada, reforça a capacidade do time de construir jogadas perigosas.`;
          p2 = `A filosofia de jogo é baseada na posse de bola, com uma média de ${data.stats.possession}, o que permite ao time ditar o ritmo da partida. Essa abordagem, no entanto, tem um custo. A equipe sofre em média ${data.stats.goalsConcededPerMatch} gols por jogo, um número que evidencia um desequilíbrio entre os setores.`;
          p3 = `Defensivamente, a equipe realiza ${data.stats.tacklesPerGame} desarmes e ${data.stats.interceptionsPerGame} interceptações por jogo, números que mostram um esforço para recuperar a bola. Os ${data.stats.clearancesPerGame} cortes por jogo indicam uma defesa que trabalha sob pressão. Contudo, os apenas ${data.stats.cleanSheets} jogos sem sofrer gols em ${data.stats.matchesPlayed} partidas indicam que a solidez defensiva é o principal ponto a ser aprimorado.`;
          p4 = `Em suma, a nota Sofascore de ${data.stats.sofascoreRating} reflete um time que empolga no ataque, mas que precisa de ajustes defensivos para transformar seu potencial em uma campanha mais consistente.`;
          break;

        case "proxima_partida":
          if (teamName.toLowerCase().includes("vasco")) {
            title = `Prognóstico: ${data.team}`;
            subtitle = `Análise do confronto contra o ${data.next_match.opponent}.`;
            p1 = `O confronto entre Vasco e Ceará se desenha como um duelo de grande expectativa, especialmente pelo forte apoio da torcida vascaína. As odds de vitória para o Vasco em ${data.odds.win.toFixed(2)} e a esmagadora preferência na votação popular (${data.fan_votes?.home}%) refletem o otimismo e o peso do fator casa. No entanto, o futebol é imprevisível, e o Ceará, mesmo como visitante, buscará surpreender.`;
            p2 = `Taticamente, o Vasco deve assumir o protagonismo da partida, controlando a posse de bola no meio-campo com a liderança de Coutinho e buscando acionar Vegetti na área. A estratégia será testar a defesa do Ceará com volume de jogo e jogadas pelas laterais, explorando a capacidade de cruzamento de Piton. A paciência para furar um provável bloqueio defensivo será fundamental para o sucesso do time da casa.`;
            p3 = `Por outro lado, o Ceará provavelmente adotará uma postura mais reativa. A estratégia deve se concentrar em uma defesa compacta, negando espaços e forçando o Vasco a erros na construção. A aposta será nos contra-ataques rápidos, explorando a velocidade de seus pontas para surpreender a defesa vascaína, que historicamente mostra vulnerabilidades quando atacada em transição.`;
            p4 = `A forma recente de ambos os times adiciona uma camada de incerteza. O Vasco vem de uma classificação emocionante na Copa do Brasil, o que pode trazer um impulso moral, mas também desgaste físico. Já o Ceará busca se reabilitar e sabe que um bom resultado fora de casa pode ser um divisor de águas na sua campanha. O estado físico e mental dos jogadores no dia da partida será decisivo.`;
            const p5 = `O duelo individual entre Pablo Vegetti e a zaga do Ceará será um dos pontos-chave do jogo. A capacidade do centroavante argentino de se impor fisicamente e finalizar será o principal desafio para os defensores visitantes. Do outro lado, a atenção da defesa do Vasco deverá estar voltada para a velocidade dos atacantes do Ceará, exigindo uma cobertura eficiente e concentração máxima para evitar surpresas.`;
            const p6 = `Prognóstico Final: Apesar do claro favoritismo do Vasco, refletido nas odds e no apoio da torcida, a partida tende a ser mais equilibrada do que parece. A previsão é de uma vitória apertada para o Vasco, possivelmente por 2 a 1, mas um empate não pode ser descartado. O resultado dependerá da eficiência do ataque vascaíno em superar a defesa adversária e da capacidade do seu sistema defensivo de conter os contra-ataques do Ceará.`;
            return resolve([title, subtitle, "", p1, p2, p3, p4, p5, p6].join("\n"));
          }
          // Lógica genérica para outros times
          title = `Prognóstico: ${data.team}`;
          subtitle = `Análise do confronto contra o ${data.next_match.opponent}.`;
          p1 = `O cenário para o próximo jogo é um clássico de favoritismo. As odds (@${data.odds.win.toFixed(2)}) e a votação popular (${data.fan_votes?.home || "N/A"}%) indicam uma forte preferência pelo time da casa.`;
          p2 = `Taticamente, espera-se um duelo de estilos. O ${teamName} tentará impor seu jogo de posse de bola, enquanto o ${data.next_match.opponent} provavelmente apostará em uma defesa sólida e transições rápidas.`;
          p3 = `A forma recente de ambos os times (${teamName}: ${data.stats.form} vs ${data.next_match.opponent}: ${data.next_match.opponent_data?.form || "N/A"}) sugere um jogo competitivo.`;
          p4 = `Prognóstico: Considerando o fator casa e o maior poder ofensivo, a previsão aponta para uma vitória do ${teamName}. Contudo, um empate é um resultado plausível.`;
          break;

        case "elenco":
          if (teamName.toLowerCase().includes("vasco")) {
            title = `Análise do Elenco: ${teamName}`;
            subtitle = `Destaques individuais e a espinha dorsal da equipe.`;
            p1 = `O elenco do Vasco da Gama para a temporada atual apresenta uma interessante combinação de jogadores experientes e de renome internacional com jovens talentos promissores. A estrutura da equipe busca um equilíbrio entre a criatividade no meio-campo, um poder de fogo consistente no ataque e uma defesa que, embora desafiada, conta com pilares individuais importantes. A capacidade de integrar essas diferentes peças será o fator determinante para a consistência do time nas competições.`;
            p2 = `No coração do time, a dupla formada por Philippe Coutinho e Pablo Vegetti representa a principal força ofensiva. Coutinho, com sua vasta experiência europeia, atua como o cérebro da equipe, ditando o ritmo, distribuindo passes precisos e sendo uma ameaça constante em finalizações de média distância. À sua frente, Vegetti é a personificação do centroavante clássico: um finalizador letal, forte no jogo aéreo e com um posicionamento de área que o torna a principal referência para converter as chances criadas em gols.`;
            p3 = `A segurança defensiva do time começa com o goleiro Léo Jardim, que se consolidou como um dos jogadores mais importantes e confiáveis do elenco. Suas defesas decisivas e liderança são fundamentais para a estabilidade da equipe. Nas laterais, o Vasco conta com uma dupla de grande importância tática: Lucas Piton, na esquerda, destaca-se pela qualidade no apoio ofensivo e cruzamentos precisos, enquanto Paulo Henrique, na direita, oferece solidez defensiva e velocidade, contribuindo em ambas as fases do jogo.`;
            p4 = `O meio-campo é uma área de equilíbrio crucial, onde Hugo Moura desempenha um papel vital. Atuando como um volante de contenção, sua principal função é proteger a linha defensiva, realizar desarmes e garantir a coesão entre os setores. Sua disciplina tática permite que jogadores mais criativos, como Coutinho, tenham a liberdade necessária para se concentrar na construção das jogadas, fazendo de Moura uma peça-chave para o balanço da equipe.`;
            const p5 = `Olhando para o futuro e para as opções de velocidade no ataque, o Vasco aposta em jovens talentos como Rayan e Nuno Moreira. Rayan, uma das maiores promessas da base, traz imprevisibilidade, drible e capacidade de finalização, sendo uma arma valiosa para quebrar defesas fechadas. Nuno Moreira, por sua vez, oferece velocidade pelos flancos e uma alternativa tática importante para o segundo tempo, injetando energia e buscando jogadas individuais que podem mudar o rumo de uma partida.`;
            const p6 = `Em suma, a espinha dorsal do Vasco é formada pela genialidade de Coutinho, pelo faro de gol de Vegetti, pela segurança de Léo Jardim e pela consistência de suas laterais. O equilíbrio proporcionado por Hugo Moura e a energia dos jovens como Rayan e Nuno Moreira completam um elenco com potencial para competir em alto nível. O sucesso na temporada dependerá da capacidade do time de manter seus principais jogadores em boa forma e de encontrar a solidez defensiva necessária para dar suporte ao seu talentoso ataque.`;
            // Junta todos os parágrafos para a saída
            return resolve([title, subtitle, "", p1, p2, p3, p4, p5, p6].join("\n"));
          } else {
            const keyAttacker =
              data.squad?.attackers?.[0] || "seu principal atacante";
            const keyMidfielder =
              data.squad?.midfielders?.[0] || "seu principal meio-campista";
            const keyDefender =
              data.squad?.defenders?.[0] || "seu principal defensor";
            title = `Análise do Elenco: ${teamName}`;
            subtitle = `Pontos fortes, fracos e jogadores-chave.`;
            p1 = `O elenco do ${teamName} é marcado por um forte poder de fogo no ataque e um meio-campo criativo. A principal força reside na capacidade de criar jogadas e manter a posse de bola, com jogadores tecnicamente qualificados. O ponto fraco, no entanto, parece ser a consistência defensiva, onde o time por vezes cede espaços importantes.`;
            p2 = `Destaque para ${keyAttacker}: Como referência no ataque, sua capacidade de finalização é fundamental. Ele é o ponto focal para converter o volume de jogo em gols, e sua presença na área é uma preocupação constante para os adversários.`;
            p3 = `No meio-campo, ${keyMidfielder} é o motor da equipe. Sua visão de jogo e qualidade no passe são essenciais para ditar o ritmo e conectar a defesa ao ataque. A performance do time muitas vezes passa por sua capacidade de controlar o setor.`;
            p4 = `Na defesa, ${keyDefender} se destaca pela liderança e capacidade de organização. Ele é crucial para tentar trazer a solidez que o time precisa, sendo responsável por comandar a linha defensiva e iniciar a construção das jogadas.`;
          }
          break;

        case "visao_geral":
        default:
          if (teamName.toLowerCase().includes("vasco")) {
            title = `Análise Geral: ${teamName}`;
            subtitle = `Desempenho na temporada e momento atual.`;
            p1 = `O Vasco da Gama atravessa uma temporada de altos e baixos, marcada por uma busca incessante por consistência. Atualmente na ${data.competitions[0].status} do ${data.competitions[0].name}, a equipe demonstra potencial, mas ainda luta para se firmar na parte de cima da tabela. A classificação para a semifinal da Copa do Brasil representa o ponto alto do ano, injetando confiança e mostrando a força do time em jogos eliminatórios.`;
            p2 = `A forma recente (${data.stats.form}) reflete essa irregularidade, alternando vitórias importantes com tropeços inesperados. O último resultado, um empate com classificação nos pênaltis contra o Botafogo, encapsula o espírito do time: uma equipe resiliente, com poder de reação, mas que por vezes encontra dificuldades para controlar os 90 minutos, evidenciando a necessidade de maior equilíbrio tático.`;
            p3 = `O estilo de jogo proposto é de protagonismo, com uma média de posse de bola de ${data.stats.possession} e a utilização predominante da formação ${data.stats.formation}. Essa abordagem visa controlar o jogo através da qualidade técnica de seu meio-campo, liderado por Philippe Coutinho. A intenção é clara: dominar o adversário e construir jogadas ofensivas de forma elaborada.`;
            p4 = `Essa filosofia se traduz em um ataque produtivo, com média de ${data.stats.goalsPerMatch} gols por jogo. No entanto, a mesma ousadia ofensiva expõe vulnerabilidades defensivas, resultando em uma média de ${data.stats.goalsConcededPerMatch} gols sofridos. Encontrar o balanço ideal entre atacar com eficiência e defender com segurança é o principal desafio para o restante da temporada.`;
            const p5 = `O elenco mescla a experiência de jogadores renomados com a energia de jovens talentos. A dependência de figuras-chave como Coutinho e Vegetti é evidente, e a performance da equipe está diretamente atrelada à capacidade deles de decidir jogos. A profundidade do elenco será testada na reta final das competições, exigindo que as peças de reposição mantenham o nível.`;
            const p6 = `Para o futuro, o objetivo do Vasco é claro: transformar o potencial em resultados consistentes. A meta é garantir uma posição confortável no Brasileirão e lutar pelo título da Copa do Brasil. Para isso, será crucial corrigir a instabilidade defensiva e manter a força ofensiva, fazendo do fator casa um diferencial e mostrando maturidade nos confrontos diretos.`;
            return resolve([title, subtitle, "", p1, p2, p3, p4, p5, p6].join("\n"));
          }
          // Lógica genérica para outros times
          title = `Análise Geral: ${teamName}`;
          subtitle = `Desempenho na temporada e momento atual.`;
          const mainCompetition = data.competitions[0];
          p1 = `O ${teamName} vive um momento de busca por regularidade na temporada. Atualmente na ${mainCompetition.status} do(a) ${mainCompetition.name}, com ${mainCompetition.details}, a equipe alterna bons e maus resultados, como reflete sua forma recente de ${data.stats.form}.`;
          p2 = `O último resultado, um ${data.last_match.score} contra o ${data.last_match.opponent} pela ${data.last_match.competition}, exemplifica bem a fase atual: um time competitivo e capaz de marcar gols, mas que também encontra dificuldades para garantir a solidez defensiva.`;
          p3 = `O estilo de jogo da equipe, baseado na formação ${data.stats.formation} e com alta posse de bola (${data.stats.possession}), mostra uma clara intenção de ser protagonista. Isso se traduz em uma média de ${data.stats.goalsPerMatch} gols marcados por jogo, mas também uma vulnerabilidade que resulta em ${data.stats.goalsConcededPerMatch} gols sofridos, em média.`;
          p4 = `Com um elenco que mescla experiência e juventude, o objetivo principal para o restante da temporada é encontrar o equilíbrio entre os setores ofensivo e defensivo para escalar na tabela e alcançar seus objetivos nas competições que disputa.`;
          break;
      }
      // Para os casos que não são o Vasco, a lógica antiga continua
      resolve([title, subtitle, "", p1, p2, p3, p4].join("\n"));
    }, 1200); // Simula um atraso da IA
  });
}

// --- Lógica de conexão com o Backend ---
async function fetchDataFromServer(query) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/football-data?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      // Tenta ler a mensagem de erro do corpo da resposta, senão usa o status http.
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `O servidor respondeu com um erro: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao conectar com o backend:", error);
    // Verifica se é um erro de rede (servidor offline, sem internet) e lança uma mensagem amigável.
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Não foi possível conectar ao servidor. Verifique se ele está rodando e sua conexão com a internet."
      );
    }
    // Re-lança outros erros (como os que já vêm do `if !response.ok`) para serem tratados pela função principal.
    throw error;
  }
}

// --- Lógica de Temas e Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
  const themeToggleButton = document.getElementById("theme-toggle");
  const sunIcon = document.getElementById("theme-icon-sun");
  const moonIcon = document.getElementById("theme-icon-moon");

  const applyTheme = (theme) => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      document.body.classList.remove("light-theme");
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }
  };

  themeToggleButton.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("light-theme")
      ? "dark"
      : "light";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  });

  // Aplica o tema salvo ao carregar a página
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
});
