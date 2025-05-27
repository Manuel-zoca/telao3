const path = require('path');
const fs = require('fs');
const { handleTabela } = require('./tabelaHandler');

const gruposComHorarios = [
    {
        id: "120363252308434038@g.us",
        horarios: ["06:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"],
    },
    {
        id: "120363417514741662@g.us",
        horarios: ["06:35", "08:00", "08:35", "09:00", "09:35", "10:00", "10:35", "11:00", "11:35", "12:00", "12:35", "13:00", "13:35", "14:00", "14:35", "15:00", "15:35", "16:00", "16:35", "17:00", "17:35", "18:00", "18:35", "19:00", "19:35", "20:00", "20:35", "21:00", "21:35", "22:00"],
    },
];

function getHoraAtual() {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
}

const formasDePagamento = `
📱Formas de Pagamento Atualizadas📱 💳
 
1. M-PESA 📱  
   - Número: 848619531  
   - DINIS MARTA

2. E-MOLA 💸  
   - Número: 872960710  
   - MANUEL ZOCA

3. BIM 🏦  
   - Conta nº: 1059773792  
   - CHONGO MANUEL

Após efetuar o pagamento, por favor, envie o comprovante da transferência juntamente com seu contato.
`.trim();

async function verificarEnvioTabela(sock) {
    const horaAtual = getHoraAtual();

    for (const grupo of gruposComHorarios) {
        if (grupo.horarios.includes(horaAtual)) {
            console.log(`⏰ Enviando tabela automática para o grupo ${grupo.id} às ${horaAtual}`);
            
            // Envia a tabela
            await handleTabela(sock, {
                key: { remoteJid: grupo.id }
            });

            // Aguarda 10 segundos e envia formas de pagamento
            await new Promise(resolve => setTimeout(resolve, 20000));
            await sock.sendMessage(grupo.id, { text: formasDePagamento });
            console.log(`✅ Formas de pagamento enviadas ao grupo ${grupo.id}`);
            
        }
    }
}

module.exports = { verificarEnvioTabela };