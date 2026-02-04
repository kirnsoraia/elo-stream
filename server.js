import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações (Use variáveis de ambiente no Render para segurança)
const FACEIT_API_KEY = process.env.FACEIT_API_KEY;
const FACEIT_ID = "33681498-8f83-4903-8884-2a945f782c5f"; // Recomendo usar o ID interno da Faceit
const FACEIT_NICK = "Kirn0bs";
const STEAM_ID_64 = "76561198953388206";

// Variáveis para o cálculo de "Hoje"
let eloAoIniciar = null;
let ultimaAtualizacao = new Date().getDate();

async function getFaceitData() {
    try {
        const res = await fetch(`https://open.faceit.com/data/v4/players?nickname=${FACEIT_NICK}`, {
            headers: { 'Authorization': `Bearer ${process.env.FACEIT_API_KEY}` }
        });
        const data = await res.json();
        
        // Tenta pegar dados do CS2, se não houver, tenta CSGO
        const game = data.games?.cs2 || data.games?.csgo;
        
        if (!game) return { lvl: 0, elo: 0, ganhoHoje: "0" };

        const elo = game.faceit_elo || 0;
        const lvl = game.skill_level || 0;

        const hoje = new Date().getDate();
        if (eloAoIniciar === null || hoje !== ultimaAtualizacao) {
            eloAoIniciar = elo;
            ultimaAtualizacao = hoje;
        }

        const dif = elo - eloAoIniciar;
        return { lvl, elo, ganhoHoje: dif >= 0 ? `+${dif}` : dif };
    } catch (e) {
        return { lvl: "Erro", elo: 0, ganhoHoje: "0" };
    }
}
async function getPremierData() {
    try {
        // A API da Steam para Premier costuma ser instável. 
        // Usaremos uma alternativa comum para Premier Stats ou manteremos a sua lógica:
        const res = await fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key=${process.env.STEAM_API_KEY}&appid=730&steamid=${STEAM_ID_64}`);
        const data = await res.json();
        
        const rating = data.playerstats?.stats?.find(s => s.name === "competitiverank_11")?.value;
        
        if (!rating || rating === 0) return "Unranked (Hoje: 0)";
        
        // Se quiser o ganho diário do Premier, precisaria de um banco de dados, 
        // mas para o texto fixo como na imagem:
        return `${rating.toLocaleString('pt-BR')} (Hoje: 0)`;
    } catch (e) {
        return "Unranked (Hoje: 0)";
    }
}

app.get("/", async (req, res) => {
    const faceit = await getFaceitData();
    const premier = await getPremierData();

    // Formatação IDÊNTICA à imagem
    const resultado = `Faceit level: ${faceit.lvl} - ${faceit.elo.toLocaleString('pt-BR')} elo (Hoje: ${faceit.ganhoHoje}) | Premier: ${premier}`;
    
    res.send(resultado);
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
