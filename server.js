// ======================================================
// HUQUQIY AI 2.0 — OVOZNI MATNGA AYLANTIRISH
// ======================================================

async function transcribeAudio(audioBase64, format = 'webm', lang = 'uz') {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY topilmadi.');
  }

  const language =
    lang === 'ru' ? 'ru' :
    lang === 'en' ? 'en' :
    'uz';

  const response = await fetch(
    'https://openrouter.ai/api/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
        'X-Title': 'Huquqiy AI'
      },
      body: JSON.stringify({
        model: process.env.STT_MODEL || 'openai/whisper-1',
        input_audio: {
          data: audioBase64,
          format: format
        },
        language: language
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      'Ovozni matnga aylantirishda xatolik.'
    );
  }

  return data.text || '';
}


// ======================================================
// HUQUQIY AI 2.0 — HUQUQIY YO'NALISHLAR
// ======================================================

const LEGAL_AREAS = {
  family: {
    uz: 'Oila huquqi',
    ru: 'Семейное право',
    en: 'Family law'
  },

  divorce: {
    uz: 'Nikohdan ajratish',
    ru: 'Расторжение брака',
    en: 'Divorce'
  },

  aliment: {
    uz: 'Aliment',
    ru: 'Алименты',
    en: 'Child support'
  },

  children: {
    uz: 'Farzandlar masalasi',
    ru: 'Вопросы детей',
    en: 'Children'
  },

  property: {
    uz: 'Mol-mulk',
    ru: 'Имущество',
    en: 'Property'
  },

  inheritance: {
    uz: 'Meros',
    ru: 'Наследство',
    en: 'Inheritance'
  },

  labour: {
    uz: 'Mehnat huquqi',
    ru: 'Трудовое право',
    en: 'Employment law'
  },

  housing: {
    uz: 'Uy-joy masalalari',
    ru: 'Жилищные вопросы',
    en: 'Housing'
  },

  consumer: {
    uz: 'Iste’molchi huquqlari',
    ru: 'Права потребителей',
    en: 'Consumer rights'
  }
};


// ======================================================
// HUQUQIY AI 2.0 — RASMIY MANBALAR
// ======================================================

const LEGAL_SOURCES = [
  {
    title: 'LexUZ',
    description: {
      uz: 'O‘zbekiston Respublikasi qonunchilik ma’lumotlari milliy bazasi.',
      ru: 'Национальная база данных законодательства Республики Узбекистан.',
      en: 'National legislation database of Uzbekistan.'
    },
    url: 'https://lex.uz'
  },

  {
    title: 'Oliy sud',
    description: {
      uz: 'O‘zbekiston Respublikasi Oliy sudining rasmiy axborot manbasi.',
      ru: 'Официальный информационный ресурс Верховного суда.',
      en: 'Official information resource of the Supreme Court.'
    },
    url: 'https://sud.uz'
  },

  {
    title: 'my.sud.uz',
    description: {
      uz: 'Sudlarga elektron murojaat qilish xizmatlari.',
      ru: 'Электронные сервисы обращения в суд.',
      en: 'Electronic court services.'
    },
    url: 'https://my.sud.uz'
  }
];


// ======================================================
// HUQUQIY AI 2.0 — YANGI BOSH SAHIFA
// ======================================================

function homePageV2(lang) {
  lang = getLang(lang);

  const text = {
    uz: {
      badge: 'RAQAMLI HUQUQIY YORDAM',
      title: 'Huquqiy muammoingizni tushuning.',
      accent: 'To‘g‘ri yechimga boring.',
      desc:
        'Vaziyatingizni yozing yoki ovoz orqali ayting. Huquqiy AI muhim faktlarni aniqlaydi, sizga kerakli savollarni beradi va keyingi huquqiy qadamlarni tushuntiradi.',

      start: 'Savol-javobni boshlash',
      free: 'Vaziyatni erkin yozish',

      services: 'Huquqiy xizmatlar',
      servicesDesc:
        'Muammoingizga mos yo‘nalishni tanlang.',

      divorce: 'Nikohdan ajratish',
      divorceDesc:
        'Nikoh, yarashish, farzandlar va ajrashish tartibi.',

      aliment: 'Aliment',
      alimentDesc:
        'Farzandlar soni, daromad va aliment masalalarini tahlil qilish.',

      children: 'Farzandlar',
      childrenDesc:
        'Farzandning yashash joyi, ota-ona huquqlari va manfaatlari.',

      property: 'Mol-mulk',
      propertyDesc:
        'Nikoh davrida orttirilgan mol-mulk va uni bo‘lish masalalari.',

      court: 'Sudga murojaat',
      courtDesc:
        'Da’vo arizasi va sudga murojaat qilish jarayoni.',

      documents: 'Hujjat tayyorlash',
      documentsDesc:
        'Huquqiy hujjat loyihalarini bosqichma-bosqich tayyorlash.',

      sources: 'Qonun manbalari',
      sourcesDesc:
        'Huquqiy ma’lumotlarni rasmiy manbalar orqali tekshiring.',

      how: 'Huquqiy AI qanday ishlaydi?',

      s1: 'Muammoni ayting',
      s1d: 'Yozing yoki telefon orqali ovoz bilan tushuntiring.',

      s2: 'Savollarga javob bering',
      s2d:
        'Tizim vaziyatingizga qarab kerakli savollarni bittadan beradi.',

      s3: 'Huquqiy tahlil',
      s3d:
        'Javoblaringiz asosida huquqiy masalalar aniqlanadi.',

      s4: 'Keyingi qadam',
      s4d:
        'Qonuniy manbalar, tavsiyalar va kerakli hujjatlar ko‘rsatiladi.'
    },

    ru: {
      badge: 'ЦИФРОВАЯ ЮРИДИЧЕСКАЯ ПОМОЩЬ',
      title: 'Разберитесь в своей правовой ситуации.',
      accent: 'Найдите следующий шаг.',
      desc:
        'Опишите ситуацию текстом или голосом. Huquqiy AI уточнит важные факты, задаст необходимые вопросы и объяснит возможные следующие шаги.',

      start: 'Начать вопросы',
      free: 'Описать ситуацию',

      services: 'Юридические услуги',
      servicesDesc: 'Выберите подходящее направление.',

      divorce: 'Расторжение брака',
      divorceDesc:
        'Брак, примирение, дети и порядок расторжения брака.',

      aliment: 'Алименты',
      alimentDesc:
        'Количество детей, доход и вопросы алиментов.',

      children: 'Дети',
      childrenDesc:
        'Место проживания ребёнка и права родителей.',

      property: 'Имущество',
      propertyDesc:
        'Имущество, приобретённое в браке, и вопросы его раздела.',

      court: 'Обращение в суд',
      courtDesc:
        'Исковое заявление и порядок обращения в суд.',

      documents: 'Подготовка документов',
      documentsDesc:
        'Пошаговая подготовка проектов юридических документов.',

      sources: 'Правовые источники',
      sourcesDesc:
        'Проверяйте правовую информацию по официальным источникам.',

      how: 'Как работает Huquqiy AI?',

      s1: 'Опишите проблему',
      s1d: 'Напишите или расскажите голосом.',

      s2: 'Ответьте на вопросы',
      s2d: 'Система задаёт вопросы в зависимости от вашей ситуации.',

      s3: 'Правовой анализ',
      s3d: 'Ответы объединяются в одну правовую ситуацию.',

      s4: 'Следующий шаг',
      s4d: 'Получите источники, дальнейшие действия и документы.'
    },

    en: {
      badge: 'DIGITAL LEGAL ASSISTANCE',
      title: 'Understand your legal situation.',
      accent: 'Know your next step.',
      desc:
        'Describe your situation by text or voice. Huquqiy AI identifies important facts, asks relevant questions and explains the next legal steps.',

      start: 'Start questionnaire',
      free: 'Describe situation',

      services: 'Legal services',
      servicesDesc: 'Choose the area that matches your problem.',

      divorce: 'Divorce',
      divorceDesc:
        'Marriage, reconciliation, children and divorce procedure.',

      aliment: 'Child support',
      alimentDesc:
        'Children, income and child-support related issues.',

      children: 'Children',
      childrenDesc:
        'Residence of children, parental rights and interests.',

      property: 'Property',
      propertyDesc:
        'Marital property and division of property.',

      court: 'Court',
      courtDesc:
        'Statements of claim and the court application process.',

      documents: 'Documents',
      documentsDesc:
        'Prepare legal document drafts step by step.',

      sources: 'Legal sources',
      sourcesDesc:
        'Verify legal information using official sources.',

      how: 'How does Huquqiy AI work?',

      s1: 'Describe the problem',
      s1d: 'Type or explain it using your phone microphone.',

      s2: 'Answer questions',
      s2d: 'The system asks relevant questions based on your situation.',

      s3: 'Legal analysis',
      s3d: 'Your answers are combined into one legal situation.',

      s4: 'Next step',
      s4d: 'See legal sources, next actions and relevant documents.'
    }
  }[lang];

  return layout(
    lang,
    `
    <main class="v2-home">

      <section class="v2-hero">

        <div class="v2-hero-copy">

          <div class="v2-eyebrow">
            § ${text.badge}
          </div>

          <h1>
            ${text.title}
            <span>${text.accent}</span>
          </h1>

          <p>
            ${text.desc}
          </p>

          <div class="v2-hero-actions">

            <a
              class="v2-btn v2-primary"
              href="/questionnaire${q(lang)}"
            >
              ${text.start} →
            </a>

            <a
              class="v2-btn v2-secondary"
              href="/ai${q(lang)}"
            >
              ${text.free}
            </a>

          </div>

        </div>


        <div class="v2-path">

          <div class="v2-path-title">
            <span>HUQUQIY AI</span>
            <b>Huquqiy yo‘l xaritasi</b>
          </div>

          <div class="v2-path-item">
            <i>01</i>
            <div>
              <strong>${text.s1}</strong>
              <p>${text.s1d}</p>
            </div>
          </div>

          <div class="v2-path-item">
            <i>02</i>
            <div>
              <strong>${text.s2}</strong>
              <p>${text.s2d}</p>
            </div>
          </div>

          <div class="v2-path-item">
            <i>03</i>
            <div>
              <strong>${text.s3}</strong>
              <p>${text.s3d}</p>
            </div>
          </div>

          <div class="v2-path-item">
            <i>04</i>
            <div>
              <strong>${text.s4}</strong>
              <p>${text.s4d}</p>
            </div>
          </div>

        </div>

      </section>


      <section class="v2-services">

        <div class="v2-section-heading">

          <div>
            <small>HUQUQIY AI</small>
            <h2>${text.services}</h2>
          </div>

          <p>${text.servicesDesc}</p>

        </div>


        <div class="v2-service-grid">

          ${serviceCard(
            '01',
            '⚖',
            text.divorce,
            text.divorceDesc,
            '/questionnaire' + q(lang)
          )}

          ${serviceCard(
            '02',
            '₽',
            text.aliment,
            text.alimentDesc,
            '/questionnaire' + q(lang)
          )}

          ${serviceCard(
            '03',
            '◇',
            text.children,
            text.childrenDesc,
            '/questionnaire' + q(lang)
          )}

          ${serviceCard(
            '04',
            '⌂',
            text.property,
            text.propertyDesc,
            '/questionnaire' + q(lang)
          )}

          ${serviceCard(
            '05',
            '§',
            text.court,
            text.courtDesc,
            '/court' + q(lang)
          )}

          ${serviceCard(
            '06',
            '▤',
            text.documents,
            text.documentsDesc,
            '/claim' + q(lang)
          )}

        </div>

      </section>


      <section class="v2-sources">

        <div class="v2-section-heading">

          <div>
            <small>RASMIY MANBALAR</small>
            <h2>${text.sources}</h2>
          </div>

          <p>${text.sourcesDesc}</p>

        </div>

        <div class="v2-source-grid">

          ${LEGAL_SOURCES.map(source => `
            <a
              class="v2-source"
              href="${source.url}"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="v2-source-icon">§</div>

              <div>
                <strong>${source.title}</strong>
                <p>${source.description[lang]}</p>
              </div>

              <span>↗</span>
            </a>
          `).join('')}

        </div>

      </section>


      <section class="v2-process">

        <div class="v2-section-heading">

          <div>
            <small>JARAYON</small>
            <h2>${text.how}</h2>
          </div>

        </div>

        <div class="v2-process-grid">

          ${processItem('01', text.s1, text.s1d)}
          ${processItem('02', text.s2, text.s2d)}
          ${processItem('03', text.s3, text.s3d)}
          ${processItem('04', text.s4, text.s4d)}

        </div>

      </section>

    </main>
    `
  );
}


function serviceCard(number, icon, title, description, href) {
  return `
    <a class="v2-service-card" href="${href}">

      <span class="v2-card-number">
        ${number}
      </span>

      <div class="v2-service-icon">
        ${icon}
      </div>

      <h3>${title}</h3>

      <p>${description}</p>

      <div class="v2-card-arrow">
        →
      </div>

    </a>
  `;
}


function processItem(number, title, description) {
  return `
    <div class="v2-process-item">

      <span>${number}</span>

      <strong>${title}</strong>

      <p>${description}</p>

    </div>
  `;
}


// ======================================================
// HUQUQIY AI 2.0 — YANGI AI + MOBIL VOICE
// ======================================================

function aiPageV2(lang) {
  lang = getLang(lang);

  const txt = {
    uz: {
      title: 'Huquqiy masalangizni bayon qiling',
      desc:
        'Vaziyatni yozishingiz yoki mikrofon orqali aytishingiz mumkin.',
      placeholder:
        'Masalan: Turmush o‘rtog‘im bilan ajrashmoqchiman. Ikki nafar farzandimiz bor...',
      record: 'Ovoz bilan aytish',
      stop: 'Yozishni to‘xtatish',
      listening: 'Ovoz yozilmoqda...',
      converting: 'Ovoz matnga aylantirilmoqda...',
      ready: 'Matn tayyor. Tekshirib, tahlilni boshlashingiz mumkin.',
      denied:
        'Mikrofonga ruxsat berilmadi. Brauzer sozlamalaridan mikrofon ruxsatini yoqing.',
      unsupported:
        'Ushbu brauzerda ovoz yozish imkoniyati mavjud emas.',
      analyze: 'Huquqiy tahlil qilish',
      tip:
        'Aniqroq tahlil uchun muhim faktlarni imkon qadar batafsil ayting.'
    },

    ru: {
      title: 'Опишите вашу правовую ситуацию',
      desc:
        'Вы можете написать ситуацию или рассказать её голосом.',
      placeholder:
        'Например: Мы хотим развестись. У нас двое несовершеннолетних детей...',
      record: 'Сказать голосом',
      stop: 'Остановить запись',
      listening: 'Идёт запись...',
      converting: 'Преобразуем голос в текст...',
      ready: 'Текст готов. Проверьте его и начните анализ.',
      denied:
        'Нет доступа к микрофону. Разрешите использование микрофона в настройках браузера.',
      unsupported:
        'Запись голоса не поддерживается этим браузером.',
      analyze: 'Провести правовой анализ',
      tip:
        'Для более точного анализа укажите важные факты вашей ситуации.'
    },

    en: {
      title: 'Describe your legal situation',
      desc:
        'Type your situation or explain it using your microphone.',
      placeholder:
        'Example: My spouse and I want to divorce. We have two minor children...',
      record: 'Speak',
      stop: 'Stop recording',
      listening: 'Recording...',
      converting: 'Converting speech to text...',
      ready: 'Transcript ready. Review it and start the analysis.',
      denied:
        'Microphone access was denied. Allow microphone access in your browser settings.',
      unsupported:
        'Voice recording is not supported by this browser.',
      analyze: 'Analyze legal situation',
      tip:
        'Include the important facts of your situation for a more accurate analysis.'
    }
  }[lang];

  return layout(
    lang,
    `
    <div class="app">

      ${sidebar(lang, 'ai')}

      <main>

        <div class="head">

          <small>HUQUQIY AI</small>

          <h1>${txt.title}</h1>

          <p>${txt.desc}</p>

        </div>


        <div class="surface v2-ai-box">

          <form
            method="POST"
            action="/ai-result${q(lang)}"
            id="legalAiForm"
          >

            <div class="v2-editor">

              <textarea
                id="aiQuestion"
                name="question"
                required
                placeholder="${txt.placeholder}"
              ></textarea>


              <div class="v2-editor-bottom">

                <button
                  type="button"
                  id="voiceBtn"
                  class="v2-voice"
                >
                  <span id="voiceIcon">🎙</span>
                  <span id="voiceLabel">${txt.record}</span>
                </button>

                <span
                  id="voiceTimer"
                  class="v2-timer"
                ></span>

              </div>

            </div>


            <div
              id="voiceStatus"
              class="v2-voice-status"
            >
              ${txt.tip}
            </div>


            <button
              class="v2-btn v2-primary v2-analyze"
              type="submit"
            >
              ✦ ${txt.analyze}
            </button>

          </form>

        </div>

      </main>

    </div>


    <script>

    (function(){

      const voiceBtn =
        document.getElementById('voiceBtn');

      const voiceLabel =
        document.getElementById('voiceLabel');

      const voiceIcon =
        document.getElementById('voiceIcon');

      const status =
        document.getElementById('voiceStatus');

      const textarea =
        document.getElementById('aiQuestion');

      const timer =
        document.getElementById('voiceTimer');


      let recorder = null;
      let stream = null;
      let chunks = [];
      let recording = false;
      let seconds = 0;
      let interval = null;


      const TEXT = ${JSON.stringify(txt)};
      const LANG = ${JSON.stringify(lang)};


      function formatTime(value){

        const min =
          String(Math.floor(value / 60))
          .padStart(2,'0');

        const sec =
          String(value % 60)
          .padStart(2,'0');

        return min + ':' + sec;
      }


      function startTimer(){

        seconds = 0;

        timer.textContent = '00:00';

        interval = setInterval(function(){

          seconds++;

          timer.textContent =
            formatTime(seconds);

        },1000);
      }


      function stopTimer(){

        if(interval){
          clearInterval(interval);
        }

        interval = null;
      }


      function getFormat(mime){

        mime = String(mime || '').toLowerCase();

        if(mime.includes('webm')){
          return 'webm';
        }

        if(mime.includes('mp4')){
          return 'm4a';
        }

        if(mime.includes('ogg')){
          return 'ogg';
        }

        if(mime.includes('wav')){
          return 'wav';
        }

        return 'webm';
      }


      async function blobToBase64(blob){

        return new Promise(function(resolve,reject){

          const reader =
            new FileReader();

          reader.onloadend = function(){

            const result =
              String(reader.result || '');

            const comma =
              result.indexOf(',');

            resolve(
              comma >= 0
                ? result.slice(comma + 1)
                : result
            );
          };

          reader.onerror = reject;

          reader.readAsDataURL(blob);

        });
      }


      async function startRecording(){

        if(
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia ||
          !window.MediaRecorder
        ){
          status.textContent =
            TEXT.unsupported;

          return;
        }


        try{

          stream =
            await navigator.mediaDevices
            .getUserMedia({
              audio:true
            });


          let options = {};


          if(
            MediaRecorder.isTypeSupported &&
            MediaRecorder.isTypeSupported(
              'audio/webm;codecs=opus'
            )
          ){
            options.mimeType =
              'audio/webm;codecs=opus';
          }

          else if(
            MediaRecorder.isTypeSupported &&
            MediaRecorder.isTypeSupported(
              'audio/mp4'
            )
          ){
            options.mimeType =
              'audio/mp4';
          }


          recorder =
            new MediaRecorder(
              stream,
              options
            );


          chunks = [];


          recorder.ondataavailable =
            function(event){

              if(
                event.data &&
                event.data.size > 0
              ){
                chunks.push(event.data);
              }
            };


          recorder.onstop =
            sendRecording;


          recorder.start();


          recording = true;

          voiceBtn.classList.add('recording');

          voiceIcon.textContent = '■';

          voiceLabel.textContent =
            TEXT.stop;

          status.textContent =
            TEXT.listening;

          startTimer();

        }

        catch(error){

          console.error(error);

          status.textContent =
            TEXT.denied;
        }
      }


      function stopRecording(){

        if(
          !recorder ||
          recorder.state === 'inactive'
        ){
          return;
        }


        recorder.stop();

        recording = false;

        voiceBtn.classList.remove('recording');

        voiceIcon.textContent = '🎙';

        voiceLabel.textContent =
          TEXT.record;

        stopTimer();


        if(stream){

          stream
          .getTracks()
          .forEach(function(track){
            track.stop();
          });

        }

      }


      async function sendRecording(){

        try{

          status.textContent =
            TEXT.converting;


          const mime =
            recorder.mimeType ||
            chunks[0]?.type ||
            'audio/webm';


          const blob =
            new Blob(
              chunks,
              { type:mime }
            );


          const base64 =
            await blobToBase64(blob);


          const response =
            await fetch(
              '/transcribe?lang=' +
              encodeURIComponent(LANG),
              {
                method:'POST',

                headers:{
                  'Content-Type':
                    'application/json'
                },

                body:JSON.stringify({
                  audio:base64,
                  format:getFormat(mime)
                })
              }
            );


          const data =
            await response.json();


          if(!response.ok){

            throw new Error(
              data.error ||
              'Transcription error'
            );
          }


          const transcript =
            String(data.text || '').trim();


          if(transcript){

            const old =
              textarea.value.trim();

            textarea.value =
              old
                ? old + '\\n' + transcript
                : transcript;

            textarea.focus();
          }


          status.textContent =
            TEXT.ready;

        }

        catch(error){

          console.error(error);

          status.textContent =
            error.message ||
            'Voice error';
        }

      }


      voiceBtn.addEventListener(
        'click',
        function(){

          if(recording){
            stopRecording();
          }
          else{
            startRecording();
          }

        }
      );

    })();

    </script>
    `
  );
}


// ======================================================
// HUQUQIY AI 2.0 CSS
// BUNI MAVJUD CSS TEMPLATE ICHIGA QO'SHING
// ======================================================

const CSS_V2 = `

.v2-home{
  width:min(1220px,92%);
  margin:auto;
}

.v2-hero{
  min-height:620px;
  display:grid;
  grid-template-columns:1.05fr .95fr;
  align-items:center;
  gap:75px;
  padding:75px 0;
}

.v2-eyebrow{
  display:inline-flex;
  padding:8px 12px;
  border:1px solid #dfcfad;
  background:#faf6ed;
  color:#846326;
  border-radius:6px;
  font-size:10px;
  font-weight:800;
  letter-spacing:1.1px;
}

.v2-hero h1{
  max-width:720px;
  margin:22px 0;
  font-family:Georgia,"Times New Roman",serif;
  font-size:58px;
  line-height:1.06;
  letter-spacing:-2px;
  font-weight:500;
  color:#0b1f36;
}

.v2-hero h1 span{
  display:block;
  color:#315b99;
}

.v2-hero-copy>p{
  max-width:650px;
  margin:0;
  color:#69798c;
  line-height:1.8;
  font-size:15px;
}

.v2-hero-actions{
  display:flex;
  flex-wrap:wrap;
  gap:11px;
  margin-top:30px;
}

.v2-btn{
  min-height:48px;
  padding:12px 20px;
  border:0;
  border-radius:8px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:12px;
  font-weight:750;
  cursor:pointer;
  transition:.18s;
}

.v2-btn:hover{
  transform:translateY(-1px);
}

.v2-primary{
  background:#0b1f36;
  color:white;
  box-shadow:0 9px 25px rgba(11,31,54,.15);
}

.v2-primary:hover{
  background:#173653;
}

.v2-secondary{
  background:white;
  color:#0b1f36;
  border:1px solid #d7dde5;
}

.v2-path{
  padding:29px;
  background:#fff;
  border:1px solid #dce2e8;
  border-radius:14px;
  box-shadow:0 25px 65px rgba(11,31,54,.1);
}

.v2-path-title{
  padding-bottom:20px;
  margin-bottom:5px;
  border-bottom:1px solid #e7eaee;
}

.v2-path-title span{
  display:block;
  margin-bottom:6px;
  color:#aa8445;
  font-size:9px;
  font-weight:800;
  letter-spacing:1px;
}

.v2-path-title b{
  color:#0b1f36;
  font-family:Georgia,serif;
  font-size:21px;
}

.v2-path-item{
  display:flex;
  gap:17px;
  padding:19px 0;
  border-bottom:1px solid #edf0f3;
}

.v2-path-item:last-child{
  border-bottom:0;
  padding-bottom:3px;
}

.v2-path-item i{
  width:34px;
  height:34px;
  flex:0 0 34px;
  border-radius:50%;
  display:grid;
  place-items:center;
  background:#f2f5f8;
  color:#405c7d;
  font-size:9px;
  font-style:normal;
  font-weight:800;
}

.v2-path-item strong{
  color:#172d47;
  font-size:12px;
}

.v2-path-item p{
  margin:5px 0 0;
  color:#788697;
  font-size:11px;
  line-height:1.55;
}

.v2-services,
.v2-sources,
.v2-process{
  padding:70px 0;
}

.v2-section-heading{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:25px;
  margin-bottom:30px;
}

.v2-section-heading small{
  color:#a17b3c;
  font-size:9px;
  font-weight:800;
  letter-spacing:1.2px;
}

.v2-section-heading h2{
  margin:8px 0 0;
  font-family:Georgia,serif;
  color:#0b1f36;
  font-size:35px;
  font-weight:500;
}

.v2-section-heading>p{
  max-width:430px;
  margin:0;
  color:#778598;
  font-size:12px;
  line-height:1.6;
}

.v2-service-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:15px;
}

.v2-service-card{
  min-height:250px;
  position:relative;
  padding:25px;
  overflow:hidden;
  background:white;
  border:1px solid #e0e4e9;
  border-radius:11px;
  transition:.2s;
}

.v2-service-card:hover{
  transform:translateY(-4px);
  border-color:#b9c5d2;
  box-shadow:0 18px 45px rgba(11,31,54,.08);
}

.v2-card-number{
  position:absolute;
  right:21px;
  top:17px;
  font-family:Georgia,serif;
  font-size:34px;
  color:#0b1f36;
  opacity:.07;
}

.v2-service-icon{
  width:45px;
  height:45px;
  margin-bottom:25px;
  display:grid;
  place-items:center;
  border:1px solid #dde3e9;
  border-radius:8px;
  background:#f7f9fb;
  color:#173653;
  font-size:18px;
}

.v2-service-card h3{
  margin:0 0 10px;
  color:#0b1f36;
  font-family:Georgia,serif;
  font-size:19px;
}

.v2-service-card p{
  margin:0;
  color:#778598;
  font-size:11px;
  line-height:1.7;
}

.v2-card-arrow{
  position:absolute;
  bottom:22px;
  right:23px;
  color:#a67d3d;
  font-size:18px;
}

.v2-sources{
  border-top:1px solid #e3e7eb;
}

.v2-source-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:14px;
}

.v2-source{
  padding:20px;
  display:grid;
  grid-template-columns:42px 1fr auto;
  align-items:center;
  gap:14px;
  background:white;
  border:1px solid #e0e4e9;
  border-radius:10px;
  transition:.18s;
}

.v2-source:hover{
  border-color:#b7c3d0;
  box-shadow:0 10px 30px rgba(11,31,54,.06);
}

.v2-source-icon{
  width:42px;
  height:42px;
  display:grid;
  place-items:center;
  background:#0b1f36;
  color:#d2b273;
  border-radius:8px;
  font-family:Georgia,serif;
}

.v2-source strong{
  color:#0b1f36;
  font-size:12px;
}

.v2-source p{
  margin:4px 0 0;
  color:#7d8997;
  font-size:10px;
  line-height:1.5;
}

.v2-source>span{
  color:#9a783f;
}

.v2-process{
  border-top:1px solid #e3e7eb;
  padding-bottom:100px;
}

.v2-process-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:1px;
  background:#dfe4e9;
  border:1px solid #dfe4e9;
  border-radius:11px;
  overflow:hidden;
}

.v2-process-item{
  min-height:190px;
  padding:25px;
  background:white;
}

.v2-process-item>span{
  display:block;
  margin-bottom:30px;
  color:#aa8445;
  font-family:Georgia,serif;
  font-size:19px;
}

.v2-process-item strong{
  display:block;
  color:#0b1f36;
  font-size:12px;
}

.v2-process-item p{
  margin:8px 0 0;
  color:#7a8797;
  font-size:10px;
  line-height:1.6;
}

.v2-ai-box{
  padding:30px;
}

.v2-editor{
  border:1px solid #d5dce4;
  border-radius:12px;
  background:#fff;
  overflow:hidden;
  transition:.18s;
}

.v2-editor:focus-within{
  border-color:#8195ad;
  box-shadow:0 0 0 4px rgba(55,85,120,.07);
}

.v2-editor textarea{
  min-height:220px;
  padding:20px;
  border:0 !important;
  border-radius:0;
  box-shadow:none !important;
  resize:vertical;
  font-size:14px;
  line-height:1.75;
}

.v2-editor-bottom{
  min-height:60px;
  padding:10px 13px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  border-top:1px solid #edf0f3;
  background:#fafbfc;
}

.v2-voice{
  min-height:38px;
  padding:8px 13px;
  border:1px solid #d8dfe7;
  border-radius:8px;
  background:white;
  color:#31465f;
  font-size:11px;
  font-weight:700;
}

.v2-voice.recording{
  border-color:#d8a4a4;
  background:#fff3f3;
  color:#9e3333;
}

.v2-timer{
  color:#9e3333;
  font-size:11px;
  font-weight:700;
}

.v2-voice-status{
  min-height:22px;
  margin:12px 2px 18px;
  color:#7c8998;
  font-size:10px;
}

.v2-analyze{
  width:100%;
}

@media(max-width:900px){

  .v2-hero{
    grid-template-columns:1fr;
    min-height:auto;
    gap:35px;
    padding:50px 0;
  }

  .v2-service-grid,
  .v2-source-grid{
    grid-template-columns:repeat(2,1fr);
  }

  .v2-process-grid{
    grid-template-columns:repeat(2,1fr);
  }
}

@media(max-width:560px){

  .v2-home{
    width:92%;
  }

  .v2-hero{
    padding:35px 0 45px;
  }

  .v2-hero h1{
    font-size:39px;
    letter-spacing:-1.2px;
  }

  .v2-hero-copy>p{
    font-size:13px;
  }

  .v2-hero-actions{
    flex-direction:column;
  }

  .v2-hero-actions .v2-btn{
    width:100%;
  }

  .v2-path{
    padding:21px;
  }

  .v2-service-grid,
  .v2-source-grid,
  .v2-process-grid{
    grid-template-columns:1fr;
  }

  .v2-services,
  .v2-sources,
  .v2-process{
    padding:48px 0;
  }

  .v2-section-heading{
    display:block;
  }

  .v2-section-heading h2{
    font-size:29px;
  }

  .v2-section-heading>p{
    margin-top:10px;
  }

  .v2-service-card{
    min-height:215px;
  }

  .v2-ai-box{
    padding:17px;
  }

  .v2-editor textarea{
    min-height:190px;
    padding:16px;
  }
}

`;
