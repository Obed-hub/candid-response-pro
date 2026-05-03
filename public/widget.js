(function() {
  if (window.__userpov_initialized) return;
  window.__userpov_initialized = true;

  const script = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    for (let s of scripts) {
      if (s.getAttribute('data-userpov') || s.getAttribute('data-feedback-pro')) return s;
    }
    return scripts[scripts.length - 1];
  })();

  const slug = script.getAttribute('data-userpov') || script.getAttribute('data-feedback-pro');
  const mode = (script.getAttribute('data-mode') || 'feedback').toLowerCase(); 
  const isStandalone = script.getAttribute('data-standalone') === 'true';
  const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? window.location.origin 
    : 'https://userpov.online';

  if (!slug) {
    console.error('userpov: Missing data-userpov attribute (business slug).');
    return;
  }

  // Prevent recursion if script is loaded inside the widget's own iframe
  if (window.self !== window.top) return;

  // Prevent loading on the platform's own feedback/community pages to avoid self-embedding loops
  const path = window.location.pathname;
  if (path.startsWith('/feedback/') || path.startsWith('/community/')) {
    // Only allow if it's NOT the base domain or if explicitly allowed (rare)
    if (window.location.hostname === 'userpov.online' || window.location.hostname === 'localhost') {
       return;
    }
  }

  // Handle Standalone Roadmap Mode
  if (mode === 'roadmap') {
    const containerId = script.getAttribute('data-container') || 'userpov-roadmap';
    const target = document.getElementById(containerId) || document.querySelector('[data-userpov-container]');
    
    if (target) {
      const iframe = document.createElement('iframe');
      iframe.src = `${baseUrl}/community/${slug}?embed=true&standalone=true`;
      iframe.style.width = '100%';
      iframe.style.height = script.getAttribute('data-height') || '800px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      target.appendChild(iframe);
      
      // Still listen for messages but don't need UI toggles
      window.addEventListener('message', function(e) {
        if (e.data.type === 'init-settings') {
          settings = e.data.settings;
          // Roadmap mode doesn't need triggers usually, but we keep the logic just in case
        }
      });
      return; // Stop here, no widget button needed
    } else {
      console.warn(`userpov: Container #${containerId} not found. Falling back to widget mode.`);
    }
  }

  // Inject Styles
  const style = document.createElement('style');
  style.innerHTML = `
    .fb-pro-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 20px;
      background: #fbbd08; /* Honey Yellow */
      color: #000;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(251, 189, 8, 0.3);
      z-index: 2147483647;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      font-family: system-ui, -apple-system, sans-serif;
      font-weight: 600;
      font-size: 14px;
    }
    .fb-pro-widget-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(251, 189, 8, 0.4); }
    .fb-pro-widget-btn span { transition: opacity 0.3s ease; }
    
    .fb-pro-iframe-container {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 400px;
      height: 600px;
      max-width: calc(100vw - 48px);
      max-height: calc(100vh - 120px);
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      z-index: 2147483646;
      overflow: hidden;
      display: none;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      border: 1px solid rgba(0,0,0,0.05);
    }
    .fb-pro-iframe-container.open { display: block; opacity: 1; transform: translateY(0); }

    @media (max-width: 480px) {
      .fb-pro-iframe-container {
        bottom: 0;
        right: 0;
        width: 100%;
        height: 85vh; /* Don't cover 100% to keep some context */
        max-width: 100%;
        max-height: 85vh;
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
        transform: translateY(100%);
      }
      .fb-pro-iframe-container.open {
        transform: translateY(0);
      }
      .fb-pro-widget-btn {
        bottom: 16px;
        right: 16px;
        padding: 10px 16px;
        font-size: 13px;
      }
    }

    .fb-pro-visual-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 2147483645;
      background: rgba(0,0,0,0.8);
      display: none;
      cursor: crosshair;
    }
    .fb-pro-visual-toolbar {
      position: fixed;
      top: 20px; left: 50%;
      transform: translateX(-50%);
      background: #fff;
      padding: 10px 20px;
      border-radius: 12px;
      display: flex;
      gap: 15px;
      align-items: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 2147483647;
    }

    .fb-pro-backdrop {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(2px);
      z-index: 2147483645;
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .fb-pro-backdrop.open { display: block; opacity: 1; }
  `;
  document.head.appendChild(style);

  // State
  let isOpen = false;
  let settings = null;
  let hasTriggered = false;
  let sessionKey = 'fb_pro_triggered_' + slug;

  // Create UI
  const btn = document.createElement('button');
  btn.className = 'fb-pro-widget-btn';
  const buttonText = mode === 'community' ? 'Community Roadmap' : 'Send a Message';
  const btnIcon = mode === 'community' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
  btn.innerHTML = `${btnIcon} <span id="userpov-rotating-text">${buttonText}</span>`;
  document.body.appendChild(btn);

  // Rotating text logic for feedback mode
  if (mode !== 'community') {
    const rotationTexts = ['Send a Message', 'Talk to us', 'Feedback', 'Have a suggestion?', 'Questions?'];
    let textIdx = 0;
    setInterval(() => {
      const span = document.getElementById('userpov-rotating-text');
      if (span && !isOpen) {
        span.style.opacity = '0';
        span.style.transform = 'scale(0.95)';
        setTimeout(() => {
          // Randomize next text (but different from current)
          let nextIdx;
          do {
            nextIdx = Math.floor(Math.random() * rotationTexts.length);
          } while (nextIdx === textIdx);
          textIdx = nextIdx;
          
          span.innerText = rotationTexts[textIdx];
          span.style.opacity = '1';
          span.style.transform = 'scale(1)';
        }, 300);
      }
    }, 5000);
  }

  const container = document.createElement('div');
  container.className = 'fb-pro-iframe-container';
  const iframe = document.createElement('iframe');
  iframe.src = mode === 'community' 
    ? `${baseUrl}/community/${slug}?embed=true`
    : `${baseUrl}/feedback/${slug}?embed=true`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  container.appendChild(iframe);
  
  const backdrop = document.createElement('div');
  backdrop.className = 'fb-pro-backdrop';
  backdrop.onclick = () => toggleWidget(false);

  document.body.appendChild(backdrop);
  document.body.appendChild(container);

  // Toggle Function
  function toggleWidget(forceState) {
    isOpen = forceState !== undefined ? forceState : !isOpen;
    if (isOpen) {
      container.classList.add('open');
      backdrop.classList.add('open');
      btn.style.display = 'none';
    } else {
      container.classList.remove('open');
      backdrop.classList.remove('open');
      btn.style.display = 'flex';
    }
  }

  btn.onclick = () => {
    if (mode === 'community' && isStandalone) {
      window.open(`${baseUrl}/community/${slug}`, '_blank');
    } else {
      toggleWidget(true);
    }
  };

  // Handle Messages from Iframe
  window.addEventListener('message', function(e) {
    if (e.data === 'close-widget') toggleWidget(false);
    if (e.data === 'start-visual-feedback') startVisualFeedback();
    if (e.data === 'close-widget') toggleWidget(false);
    if (e.data.type === 'init-settings') {
      settings = e.data.settings;
      if (settings && settings.button_text && mode !== 'community') {
        const textNode = btn.childNodes[btn.childNodes.length - 1];
        if (textNode.nodeType === Node.TEXT_NODE) {
          textNode.textContent = ' ' + settings.button_text;
        } else {
          // If icon is missing or something else, just set text
          btn.innerHTML = `${btnIcon} ${settings.button_text}`;
        }
      }
      initSmartTriggers();
    }
  });

  // Smart Triggers Logic
  function initSmartTriggers() {
    if (!settings || !settings.smart_triggers || !Array.isArray(settings.smart_triggers) || hasTriggered) return;
    
    // Check if already triggered recently (short cooldown: 30s)
    const lastTrigger = localStorage.getItem(sessionKey);
    if (lastTrigger && (Date.now() - parseInt(lastTrigger)) < 30000) { 
      console.log('userpov: Trigger on cooldown');
      hasTriggered = true;
      return;
    }

    const triggers = settings.smart_triggers;
    console.log('userpov: Initializing triggers', triggers);
    const currentUrl = window.location.href.toLowerCase();

    triggers.forEach(trigger => {
      if (!trigger.is_enabled) return;

      switch (trigger.trigger_type) {
        case 'time_on_page':
          const delay = trigger.conditions.delay_seconds || 30;
          setTimeout(() => fireTrigger(trigger), delay * 1000);
          break;

        case 'scroll_depth':
          const depth = trigger.conditions.scroll_percentage || 75;
          const scrollHandler = () => {
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrolled >= depth) {
              fireTrigger(trigger);
              window.removeEventListener('scroll', scrollHandler);
            }
          };
          window.addEventListener('scroll', scrollHandler);
          break;

        case 'exit_intent':
        case 'pricing_dropoff':
        case 'checkout_abandonment':
          const paths = trigger.conditions?.url_contains || [];
          const currentPath = window.location.pathname.toLowerCase();
          const isTargetPage = trigger.trigger_type === 'exit_intent' || paths.some(p => 
            currentUrl.includes(p.toLowerCase()) || 
            currentPath.includes(p.toLowerCase())
          );
          
          if (isTargetPage) {
            console.log('userpov: Active trigger', trigger.trigger_type);
            
            // Desktop: Mouse Leave (Exit Intent)
            const desktopExitHandler = (e) => {
              if (e.clientY <= 0) {
                fireTrigger(trigger);
                document.removeEventListener('mouseleave', desktopExitHandler);
              }
            };
            document.addEventListener('mouseleave', desktopExitHandler);
            
            // Mobile: Visibility Change (User switches tabs or goes to home)
            const mobileExitHandler = () => {
              if (document.visibilityState === 'hidden') {
                fireTrigger(trigger);
                document.removeEventListener('visibilitychange', mobileExitHandler);
              }
            };
            document.addEventListener('visibilitychange', mobileExitHandler);

            // Fallback: Time on Page if they are just idle (only for specialized triggers)
            if (trigger.trigger_type !== 'exit_intent') {
              setTimeout(() => fireTrigger(trigger), 60000);
            }
          }
          break;
      }
    });
  }

  function fireTrigger(trigger) {
    if (hasTriggered || isOpen) return;
    hasTriggered = true;
    localStorage.setItem(sessionKey, Date.now().toString());

    console.log('userpov: Firing Trigger - ' + trigger.trigger_type);
    
    // Log event in database via iframe
    iframe.contentWindow.postMessage({
      type: 'log-trigger-event',
      triggerId: trigger.id,
      triggerType: trigger.trigger_type,
      url: window.location.href
    }, '*');

    // Show widget
    toggleWidget(true);

    // Notify iframe to show specific prompt and log event
    setTimeout(() => {
      iframe.contentWindow.postMessage({ 
        type: 'set-prompt', 
        message: trigger.prompt_text,
        triggerId: trigger.id,
        triggerType: trigger.trigger_type,
        url: window.location.href
      }, '*');
    }, 500);
  }

  // Visual Feedback (Screenshot)
  async function startVisualFeedback() {
    toggleWidget(false);
    btn.style.display = 'none';

    // Load html2canvas if not exists
    if (typeof html2canvas === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(script);
      await new Promise(r => script.onload = r);
    }

    const canvas = await html2canvas(document.body, {
      useCORS: true,
      scale: 1,
      logging: false
    });

    const overlay = document.createElement('div');
    overlay.className = 'fb-pro-visual-overlay';
    overlay.style.display = 'block';
    
    const ctx = canvas.getContext('2d');
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    overlay.appendChild(canvas);

    const toolbar = document.createElement('div');
    toolbar.className = 'fb-pro-visual-toolbar';
    toolbar.innerHTML = `
      <span style="font-size: 14px; font-weight: bold; color: #333;">Draw to mark issue</span>
      <button id="fb-clear" style="padding: 5px 10px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer;">Clear</button>
      <button id="fb-done" style="padding: 5px 15px; border: none; border-radius: 4px; background: #0072ff; color: #fff; cursor: pointer; font-weight: bold;">Done</button>
      <button id="fb-cancel" style="padding: 5px 10px; border: none; background: transparent; cursor: pointer; color: #666;">Cancel</button>
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(toolbar);

    // Drawing Logic
    let drawing = false;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    canvas.onmousedown = (e) => {
      drawing = true;
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };
    canvas.onmousemove = (e) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    };
    canvas.onmouseup = () => drawing = false;

    document.getElementById('fb-done').onclick = () => {
      const dataUrl = canvas.toDataURL('image/png');
      iframe.contentWindow.postMessage({ type: 'visual-data', dataUrl }, '*');
      cleanup();
      toggleWidget(true);
    };

    document.getElementById('fb-cancel').onclick = () => {
      cleanup();
      toggleWidget(true);
    };

    function cleanup() {
      overlay.remove();
      toolbar.remove();
      btn.style.display = 'flex';
    }
  }
  // Expose toggle globally
  window.toggleUserPOVWidget = toggleWidget;
})();
