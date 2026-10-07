const fs = require('fs');

// Patch DaftarKunjungan
let daftarPath = 'src/pages/admin/DaftarKunjungan.jsx';
let daftarContent = fs.readFileSync(daftarPath, 'utf8');

const oldDaftar =             // TTS Voice Announcement
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel(); // clear previous

                // Reformat nomor untuk dibaca dengan baik. misal "A001" jd "A 0 0 1" atau dibaca "A satu"  
                const textNomor = nomorAntrean.split('').join(' ');

                const textToSpeak = \\\Panggilan untuk nomor antrean, \, atas nama, \, 
silakan menuju ke \\\\;                                                                             
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'id-ID';
                utterance.rate = 0.9;
                utterance.pitch = 1;

                window.speechSynthesis.speak(utterance);
            } else {
                alert('Browser Anda tidak mendukung fitur suara (Text-to-Speech).');
            };

const newDaftar =             // TTS Voice Announcement Using Online Service (Google Translate)
            const textNomor = nomorAntrean.split('').join(' ');
            const textToSpeak = \\\Panggilan untuk nomor antrean, \, atas nama, \, silakan menuju ke \\\\;
            const audioUrl = \\\https://translate.googleapis.com/translate_tts?ie=UTF-8&q=\&tl=id&client=tw-ob\\\;
            const audio = new Audio(audioUrl);
            audio.play().catch(e => console.error('Audio playback failed:', e));;

daftarContent = daftarContent.replace(/\\/\\/ TTS Voice Announcement[\\s\\S]+?alert\\('Browser Anda tidak mendukung fitur suara \\(Text-to-Speech\\).'\\);\\s+\\}/g, newDaftar);

fs.writeFileSync(daftarPath, daftarContent);

// Patch AntreanPoli
let poliPath = 'src/pages/medis/AntreanPoli.jsx';
let poliContent = fs.readFileSync(poliPath, 'utf8');

const oldPoli =                 if (action === 'panggil') {
                    const item = antrean.find(a => a.id === id);
                    if (item && user?.nama_poli) {
                        const text = \\\Nomor antrean, \, pasien atas nama \, silakan menuju \\\\;
                        const speech = new SpeechSynthesisUtterance(text);
                        speech.lang = 'id-ID';
                        speech.rate = 0.9;
                        speech.pitch = 1;
                        window.speechSynthesis.speak(speech);
                    }
                };

const newPoli =                 if (action === 'panggil') {
                    const item = antrean.find(a => a.id === id);
                    if (item && user?.nama_poli) {
                        const textNomor = item.nomor_antrean.split('').join(' ');
                        const text = \\\Panggilan untuk nomor antrean, \, atas nama \, silakan menuju \\\\;
                        const audioUrl = \\\https://translate.googleapis.com/translate_tts?ie=UTF-8&q=\&tl=id&client=tw-ob\\\;
                        const audio = new Audio(audioUrl);
                        audio.play().catch(e => console.error('Audio playback failed:', e));
                    }
                };

poliContent = poliContent.replace(/\\s+if \\(action === 'panggil'\\) \\{[\\s\\S]+?window\\.speechSynthesis\\.speak\\(speech\\);\\s+\\}\\s+\\}/g, '\n' + newPoli);

// Add missing FiVolume2 import to AntreanPoli
if (!poliContent.includes('FiVolume2')) {
    poliContent = poliContent.replace('FiRefreshCw } from \\'react-icons/fi\\';', 'FiRefreshCw, FiVolume2 } from \\'react-icons/fi\\';');
}

fs.writeFileSync(poliPath, poliContent);
console.log('done patched');
