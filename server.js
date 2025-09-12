// 1. Importar os pacotes necessários
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// 2. Configurar o servidor Express
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Habilitar Middlewares
app.use(cors()); // Permite que o frontend (em outra porta) acesse esta API
app.use(express.json()); // Permite que o servidor entenda JSON no corpo das requisições

// 4. Recuperar as chaves de API do ambiente (de forma segura)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

// --- Validação das Chaves ---
if (!GEMINI_API_KEY || !API_FOOTBALL_KEY) {
    console.error("ERRO: As chaves de API (GEMINI_API_KEY, API_FOOTBALL_KEY) não foram encontradas no arquivo .env");
    process.exit(1); // Encerra o processo se as chaves não estiverem configuradas
}

// --- Endpoint para buscar dados de futebol ---
app.get('/api/football-data', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: "O parâmetro 'query' é obrigatório." });
    }

    const API_HOST = "v3.api-football.com";
    const axiosConfig = {
        headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_FOOTBALL_KEY
        }
    };

    try {
        // 1. Buscar o ID do time
        const teamResponse = await axios.get(`https://${API_HOST}/teams?search=${encodeURIComponent(query)}`, axiosConfig);

        if (!teamResponse.data.response || teamResponse.data.results === 0) {
            return res.status(404).json({ message: "Time não encontrado." });
        }
        const teamInfo = teamResponse.data.response[0];
        const teamId = teamInfo.team.id;

        // 2. Buscar a próxima partida do time
        const fixtureResponse = await axios.get(`https://${API_HOST}/fixtures?team=${teamId}&next=1`, axiosConfig);

        if (!fixtureResponse.data.response || fixtureResponse.data.results === 0) {
            return res.status(404).json({ message: `Nenhuma próxima partida encontrada para ${teamInfo.team.name}.` });
        }
        const fixture = fixtureResponse.data.response[0];
        const fixtureId = fixture.fixture.id;
        const leagueId = fixture.league.id;
        const season = fixture.league.season;
        const gameTitle = `${fixture.teams.home.name} vs ${fixture.teams.away.name}`;
        const homeLogo = fixture.teams.home.logo;
        const awayLogo = fixture.teams.away.logo;

        // 3. Buscar as odds para a partida (usando a Bet365 como exemplo, ID=1)
        const oddsResponse = await axios.get(`https://${API_HOST}/odds?fixture=${fixtureId}&bookmaker=1`, axiosConfig);
        
        let oddsData = { win: 0.00, draw: 0.00, loss: 0.00 };
        if (oddsResponse.data.results > 0) {
            const bookmaker = oddsResponse.data.response[0];
            const matchWinnerOdds = bookmaker.bookmakers[0]?.bets.find(bet => bet.name === "Match Winner");
            if (matchWinnerOdds) {
                const homeOdd = matchWinnerOdds.values.find(v => v.value === 'Home')?.odd;
                const awayOdd = matchWinnerOdds.values.find(v => v.value === 'Away')?.odd;
                const drawOdd = matchWinnerOdds.values.find(v => v.value === 'Draw')?.odd;

                oddsData.draw = parseFloat(drawOdd || 0);
                if (teamId === fixture.teams.home.id) {
                    oddsData.win = parseFloat(homeOdd || 0);
                    oddsData.loss = parseFloat(awayOdd || 0);
                } else {
                    oddsData.win = parseFloat(awayOdd || 0);
                    oddsData.loss = parseFloat(homeOdd || 0);
                }
            }
        }

        // 4. Buscar estatísticas gerais do time na liga
        const statsResponse = await axios.get(`https://${API_HOST}/teams/statistics?league=${leagueId}&season=${season}&team=${teamId}`, axiosConfig);
        
        let statsData = {
            form: 'N/A',
            avgGoalsFor: 'N/A',
            avgGoalsAgainst: 'N/A',
            formation: 'N/A'
        };
        if (statsResponse.data.results > 0 && statsResponse.data.response) {
            const teamStats = statsResponse.data.response;
            statsData.form = teamStats.form || 'N/A';
            statsData.avgGoalsFor = teamStats.goals.for.average.total || 'N/A';
            statsData.avgGoalsAgainst = teamStats.goals.against.average.total || 'N/A';
            statsData.formation = teamStats.lineups[0]?.formation || 'N/A';
        }

        // 5. Montar o objeto de resposta final
        const adaptedData = {
            team: gameTitle,
            logos: {
                home: homeLogo,
                away: awayLogo
            },
            stats: statsData,
            odds: oddsData
        };

        res.json(adaptedData);

    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Erro desconhecido";
        console.error("Erro ao buscar dados da API-Football:", errorMessage);
        res.status(500).json({ message: `Erro ao contatar a API de futebol: ${errorMessage}` });
    }
});

// --- Endpoint para gerar a análise com a IA ---
app.post('/api/generate-analysis', async (req, res) => {
    const { systemPrompt, userQuery } = req.body;

    if (!systemPrompt || !userQuery) {
        return res.status(400).json({ message: "Os parâmetros 'systemPrompt' e 'userQuery' são obrigatórios." });
    }

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
        const response = await axios.post(geminiApiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const analysisText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!analysisText) {
            return res.status(500).json({ message: "A API de IA retornou uma resposta vazia." });
        }

        // Retorna o texto da análise no formato esperado pelo frontend
        res.json({ analysisText });

    } catch (error) {
        console.error("Erro ao chamar a API do Gemini:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Erro ao gerar a análise de IA." });
    }
});

// 5. Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Frontend pode acessar em: http://localhost:${PORT}`);
});

// Exporta o app para ser usado pela Vercel
module.exports = app;