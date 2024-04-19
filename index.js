const TelegramBot = require('node-telegram-bot-api');
const { spawn } = require('child_process');

// Ganti 'YOUR_BOT_TOKEN' dengan token bot Anda
const bot = new TelegramBot('7160246347:AAGNBIzRGkksBvxDf4zfJEDGmL_A6sPW_vg', { polling: true });

// Fungsi untuk mendapatkan waktu dalam format tertentu
function getCurrentTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  const dateString = now.toLocaleDateString();
  const dayString = now.toLocaleDateString('en-US', { weekday: 'long' });
  return `${timeString} ${dateString} ${dayString}`;
}

// Tanggapi pesan
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const message = "Halo! Saya adalah bot Telegram. Berikut adalah daftar command yang tersedia:\n\n"
                + "/start - Menampilkan daftar command yang tersedia\n"
                + "/browser [URL] [time] [thread] [rate] [proxyfile] - Menjalankan browser dengan parameter yang diberikan";
  bot.sendMessage(chatId, message);
});

// Tanggapi pesan
bot.onText(/\/browser (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username;
  const time = getCurrentTime();
  console.log('\x1b[36m%s\x1b[0m', `${time} - ${username} menggunakan bot dengan command /browser`);

  const args = match[1].split(' '); // Memisahkan argumen
  const url = args[0];
  const timeArg = args[1];
  const thread = args[2];
  const rate = args[3];
  const proxyFile = args[4];

  // Jalankan child process untuk menjalankan browser.js
  const browserProcess = spawn('node', ['browser.js', url, timeArg, thread, rate, proxyFile], { cwd: __dirname });

  // Tangani output dari child process
  browserProcess.stdout.on('data', (data) => {
    console.log('\x1b[33m%s\x1b[0m', `${time} - ${username} - stdout: ${data}`);
    bot.sendMessage(chatId, `stdout: ${data}`);
  });

  // Tangani error dari child process
  browserProcess.stderr.on('data', (data) => {
    console.error('\x1b[31m%s\x1b[0m', `${time} - ${username} - stderr: ${data}`);
    bot.sendMessage(chatId, `stderr: ${data}`);
  });

  // Tangani selesainya child process
  browserProcess.on('close', (code) => {
    console.log('\x1b[32m%s\x1b[0m', `${time} - ${username} - child process exited with code ${code}`);
    bot.sendMessage(chatId, `child process exited with code ${code}`);
  });
});
