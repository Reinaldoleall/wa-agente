const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    // É AQUI QUE VOCÊ MUDA A FORMA DELE RESPONDER
    systemInstruction: `Você é um assistente virtual amigável e muito atencioso. 
    Seu objetivo é conversar com as pessoas de forma educada, prestativa e acolhedora.
    Regras:
    1. Seja muito simpático, empático e use emojis.
    2. Responda às perguntas da melhor forma possível, sempre disposto a ajudar.
    3. NÃO tente vender nenhum produto ou serviço. Você está aqui apenas para conversar e ser útil.
    4. Mantenha um tom de voz leve, amigável e respeitoso.
    5. tudo sobre contabilidade vc tenha respostas atualizadas e reais`
});

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'sessao_nova' }),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', (qr) => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('✅ Bot pronto e rodando!'));

client.on('message', async msg => {
    if (msg.from === 'status@broadcast' || msg.fromMe) return;
    try {
        const chat = model.startChat();
        const result = await chat.sendMessage(msg.body);
        msg.reply(result.response.text());
    } catch (error) {
        console.error('Erro:', error.message);
    }
});

client.initialize();
