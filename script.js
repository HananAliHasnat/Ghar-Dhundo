/* ═══════════════════════════════════════════════════════════
   GharDhundo — GB Rental Portal
   script.js
   ═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────
   1. DOM READY
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initFavoriteButtons();
  initChatbot();
});

/* ─────────────────────────────────────────
   2. SEARCH TAB SWITCHING
───────────────────────────────────────── */

/**
 * setTab — activates the clicked search tab
 * Called inline via onclick="setTab(this)"
 * @param {HTMLElement} el - the tab button that was clicked
 */
function setTab(el) {
  document.querySelectorAll('.search-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  el.classList.add('active');
}

/* ─────────────────────────────────────────
   3. VOICE SEARCH
───────────────────────────────────────── */

/**
 * voiceSearch — triggers browser's Web Speech API if available,
 * otherwise shows a friendly prompt.
 * Called inline via onclick="voiceSearch()"
 */
function voiceSearch() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert(
      '🎤 Voice search is not supported in this browser.\n\n' +
      'Try Chrome or Edge, or type your query manually.\n\n' +
      'Example: "Show me rooms near KIU under 10,000 PKR"'
    );
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';       // change to 'ur-PK' for Urdu
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // Visual feedback: pulse the button
  const voiceBtn = document.querySelector('.voice-btn');
  voiceBtn.style.background = 'rgba(74,127,165,0.25)';
  voiceBtn.style.borderColor = 'var(--sky)';
  voiceBtn.textContent = '🔴';

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const locationInput = document.querySelector('.search-field input[type="text"]');
    if (locationInput) {
      locationInput.value = transcript;
      locationInput.focus();
    }
    resetVoiceBtn(voiceBtn);
  };

  recognition.onerror = () => {
    alert('🎤 Could not hear you clearly. Please try again.');
    resetVoiceBtn(voiceBtn);
  };

  recognition.onend = () => {
    resetVoiceBtn(voiceBtn);
  };
}

/**
 * resetVoiceBtn — restores voice button to default state
 * @param {HTMLElement} btn
 */
function resetVoiceBtn(btn) {
  btn.style.background = '';
  btn.style.borderColor = '';
  btn.textContent = '🎤';
}

/* ─────────────────────────────────────────
   4. SCROLL-TRIGGERED FADE-IN ANIMATIONS
───────────────────────────────────────── */

/**
 * initScrollAnimations — uses IntersectionObserver to add
 * the 'visible' class to .fade-in elements as they scroll
 * into view, with a staggered delay per batch.
 */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger each element in the batch by 80ms
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

/* ─────────────────────────────────────────
   5. FAVORITE (HEART) TOGGLE ON CARDS
───────────────────────────────────────── */

/**
 * initFavoriteButtons — attaches click handlers to all
 * .card-fav buttons for a toggle-heart effect.
 */
function initFavoriteButtons() {
  document.querySelectorAll('.card-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent card click-through

      const isFaved = btn.textContent.trim() === '♥';

      if (isFaved) {
        btn.textContent = '♡';
        btn.style.color = '';
        btn.classList.remove('active');
      } else {
        btn.textContent = '♥';
        btn.style.color = '#e05e5e';
        btn.classList.add('active');
      }
    });
  });
}

/* ─────────────────────────────────────────
   6. CHATBOT WIDGET
───────────────────────────────────────── */

// Simulated bot responses (replace with real API in production)
const BOT_REPLIES = [
  'I found 12 rooms near KIU under 8,000 PKR. Shall I show the top 3 matches?',
  'Based on your preferences, the best match is a furnished room in Jutial at 7,500 PKR/month. Interested?',
  'The average rent for a 1-bedroom in Gilgit is around 12,000–18,000 PKR. Would you like to filter by area?',
  'I can help you contact the landlord directly. Would you like their WhatsApp number?',
  'Great news — this property is verified and AI-flagged as a Fair Price. Safe to proceed! ✓',
  'You can use voice search — just click the 🎤 button and say your requirements in Urdu or English.',
  'Girls hostels in Jutial start from 4,000 PKR/month and include meals and CCTV security.',
  'KIU students usually prefer rooms in Jutial or Aga Khan Road — very close to campus!',
];

let chatOpen   = false;
let replyIndex = 0;

/**
 * initChatbot — wires up the chatbot FAB, close button,
 * send button, and Enter key on the input.
 */
function initChatbot() {
  const fab       = document.getElementById('chatFab');
  const sendBtn   = document.getElementById('chatSendBtn');
  const chatInput = document.getElementById('chatInput');

  if (fab)     fab.addEventListener('click', toggleChat);
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
}

/**
 * toggleChat — opens or closes the chat window.
 */
function toggleChat() {
  chatOpen = !chatOpen;

  const window_el = document.getElementById('chatWindow');
  const fab       = document.getElementById('chatFab');

  if (window_el) window_el.classList.toggle('open', chatOpen);
  if (fab)       fab.textContent = chatOpen ? '✕' : '💬';
}

/**
 * sendMessage — reads the input, appends a user bubble,
 * then after a short delay appends a bot reply bubble.
 */
function sendMessage() {
  const input    = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');

  if (!input || !messages) return;

  const text = input.value.trim();
  if (!text) return;

  // Append user message
  appendMessage(messages, 'user', text);
  input.value = '';

  // Append bot reply after 700ms delay
  setTimeout(() => {
    const reply = BOT_REPLIES[replyIndex % BOT_REPLIES.length];
    replyIndex++;
    appendMessage(messages, 'bot', reply);
  }, 700);
}

/**
 * appendMessage — creates a message bubble and scrolls to bottom.
 * @param {HTMLElement} container - .chat-messages element
 * @param {'user'|'bot'} role
 * @param {string} text
 */
function appendMessage(container, role, text) {
  const msgEl = document.createElement('div');
  msgEl.className = `msg ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;

  msgEl.appendChild(bubble);
  container.appendChild(msgEl);

  // Scroll to latest message
  container.scrollTop = container.scrollHeight;
}

/* ─────────────────────────────────────────
   7. UTILITY — expose globals for inline HTML
      (setTab and voiceSearch used via onclick)
───────────────────────────────────────── */
window.setTab      = setTab;
window.voiceSearch = voiceSearch;
window.toggleChat  = toggleChat;