const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const cors = require("cors");
const qrcode = require("qrcode-terminal");
const path = require("path");
const { executablePath } = require("puppeteer"); // Garante o caminho do navegador

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Inicializa o cliente WhatsApp com autenticação local
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: executablePath(), // Usa o navegador baixado pelo puppeteer
        args: ["--no-sandbox", "--disable-setuid-sandbox"], // Recomendado para headless
    },
});

// Geração do QR Code
client.on("qr", (qr) => {
    console.log("📱 Escaneie o QR Code abaixo para conectar o bot ao WhatsApp:");
    qrcode.generate(qr, { small: true }); // Mostra no terminal
});

// Quando o cliente estiver pronto
client.on("ready", () => {
    console.log("✅ WhatsApp Bot está pronto e conectado!");
});

// Inicializa o cliente
client.initialize();

// Serve a pasta 'public' para frontend (caso tenha interface)
app.use(express.static(path.join(__dirname, "public")));

// Endpoint padrão: carrega o HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Função para gerar intervalo aleatório
function getRandomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Endpoint para envio de mensagens
app.post("/send", async (req, res) => {
    const { numbers, message } = req.body;

    if (!numbers || !message) {
        return res.status(400).json({ error: "Número e mensagem são obrigatórios!" });
    }

    const messageStatus = [];

    try {
        for (let i = 0; i < numbers.length; i++) {
            const number = numbers[i];
            const formattedNumber = number.includes("@c.us") ? number : `${number}@c.us`;

            await client.sendMessage(formattedNumber, message);
            console.log(`✅ Mensagem enviada para ${number}`);

            messageStatus.push({ number });

            // Aguarda de 5 a 8 segundos
            await new Promise(resolve => setTimeout(resolve, getRandomInterval(5000, 8000)));

            // Aguarda de 5 a 8 minutos entre contatos, exceto após o último
            if (i < numbers.length - 1) {
                await new Promise(resolve => setTimeout(resolve, getRandomInterval(300000, 480000)));
            }
        }

        res.json({ success: "Mensagens enviadas com sucesso!", status: messageStatus });

    } catch (error) {
        console.error("❌ Erro ao enviar mensagens:", error);
        res.status(500).json({ error: "Erro ao enviar mensagens" });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
