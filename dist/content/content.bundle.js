(()=>{var b="itz-opt-style-";function V(s,e){if(typeof document>"u")return null;let t=s.startsWith(b)?s:`${b}${s}`,i=document.getElementById(t);if(!i){i=document.createElement("style"),i.id=t,i.setAttribute("type","text/css"),i.setAttribute("data-itz-source","itzTikTokOptimizer");let r=document.head||document.documentElement;r&&r.appendChild(i)}return i.textContent!==e&&(i.textContent=e),i}function $(s){if(typeof document>"u")return!1;let e=s.startsWith(b)?s:`${b}${s}`,t=document.getElementById(e);return t&&t.parentNode?(t.parentNode.removeChild(t),!0):!1}function h(s){if(typeof MutationObserver>"u")return null;let{target:e=typeof document<"u"?document.body:null,config:t={childList:!0,subtree:!0},filter:i=null,onBatch:r=()=>{},debounceMs:n=60}=s;if(!e)return null;let a=[],o=null,c=null,p=!1,f=()=>{if(a.length===0)return;let w=a;a=[],p=!0;try{r(w)}catch(y){console.warn("[itzTikTokOptimizer] Batched observer error:",y)}finally{p=!1}},B=new MutationObserver(w=>{if(!p){for(let y=0;y<w.length;y++){let m=w[y];m.target&&m.target.id&&m.target.id.startsWith(b)||m.target&&m.target.getAttribute&&m.target.getAttribute("data-itz-source")||i&&!i(m)||a.push(m)}a.length>0&&(n>0?c||(c=setTimeout(()=>{c=null,f()},n)):o||(o=requestAnimationFrame(()=>{o=null,f()})))}});return B.observe(e,t),{observer:B,disconnect:()=>{c&&clearTimeout(c),o&&cancelAnimationFrame(o),B.disconnect(),a=[]}}}var d=class{constructor(e,t){this.id=e,this.name=t,this.enabled=!1,this.initialized=!1,this.options={},this.styleId=`itz-mod-${e}`,this.observers=[],this.eventListeners=[],this.cleanupTasks=[]}async init(e){this.initialized=!0,this.options=e[this.id.replace("Optimization","Options")]||{}}async enable(e){if(!this.enabled){this.enabled=!0,this.options=e[this.id.replace("Optimization","Options")]||{};try{await this.onEnable(e)}catch(t){console.error(`[itzTikTokOptimizer] Error enabling module ${this.name}:`,t)}}}async disable(){if(this.enabled){this.enabled=!1;try{await this.onDisable()}catch(e){console.error(`[itzTikTokOptimizer] Error disabling module ${this.name}:`,e)}finally{this.teardownResources()}}}async updateOptions(e){this.options={...this.options,...e},this.enabled&&await this.onOptionsUpdated(this.options)}async onEnable(e){}async onDisable(){}async onOptionsUpdated(e){}onNavigate(e){}injectCSS(e){return V(this.styleId,e)}removeCSS(){return $(this.styleId)}registerObserver(e){return e&&this.observers.push(e),e}registerListener(e,t,i,r=!1){e&&e.addEventListener&&(e.addEventListener(t,i,r),this.eventListeners.push({target:e,type:t,handler:i,options:r}))}registerCleanup(e){typeof e=="function"&&this.cleanupTasks.push(e)}teardownResources(){for(let e of this.observers)try{typeof e.disconnect=="function"&&e.disconnect()}catch(t){console.warn(`[itzTikTokOptimizer] Observer cleanup error in ${this.id}:`,t)}this.observers=[];for(let e of this.eventListeners)try{e.target.removeEventListener(e.type,e.handler,e.options)}catch(t){console.warn(`[itzTikTokOptimizer] Listener cleanup error in ${this.id}:`,t)}this.eventListeners=[],this.removeCSS();for(let e of this.cleanupTasks)try{e()}catch(t){console.warn(`[itzTikTokOptimizer] Cleanup task error in ${this.id}:`,t)}this.cleanupTasks=[]}destroy(){this.disable(),this.initialized=!1}},O=class{constructor(){this.modules=new Map,this.currentSettings=null,this.isMasterActive=!0}register(e){return this.modules.set(e.id,e),this}getModule(e){return this.modules.get(e)}getAllModules(){return Array.from(this.modules.values())}async initAll(e){this.currentSettings=e,this.isMasterActive=!!e.masterEnabled;for(let t of this.modules.values())try{await t.init(e),this.isMasterActive&&e[t.id]&&await t.enable(e)}catch(i){console.error(`[itzTikTokOptimizer] Failed initializing module ${t.id}:`,i)}}async syncSettings(e){let t=this.currentSettings||{};this.currentSettings=e;let i=t.masterEnabled!==e.masterEnabled;if(this.isMasterActive=!!e.masterEnabled,!this.isMasterActive){for(let r of this.modules.values())r.enabled&&await r.disable();return}for(let r of this.modules.values()){let n=!!e[r.id];if(i&&n&&!r.enabled)await r.enable(e);else if(!i){if(n&&!r.enabled)await r.enable(e);else if(!n&&r.enabled)await r.disable();else if(n&&r.enabled){let a=r.id.replace("Optimization","Options"),o=JSON.stringify(t[a]||{}),c=JSON.stringify(e[a]||{});o!==c&&await r.updateOptions(e[a]||{})}}}}notifyNavigation(e){if(this.isMasterActive){for(let t of this.modules.values())if(t.enabled&&typeof t.onNavigate=="function")try{t.onNavigate(e)}catch(i){console.warn(`[itzTikTokOptimizer] Navigation handler error in ${t.id}:`,i)}}}getDiagnosticsSummary(){let e={};for(let t of this.modules.values())e[t.id]={name:t.name,enabled:t.enabled,activeObservers:t.observers.length,activeListeners:t.eventListeners.length};return e}};var S="itz_tiktok_optimizer_settings";var G={GET_SETTINGS:"GET_SETTINGS",SETTINGS_UPDATED:"SETTINGS_UPDATED",TOGGLE_MODULE:"TOGGLE_MODULE",TOGGLE_MASTER:"TOGGLE_MASTER",ENABLE_ALL:"ENABLE_ALL",DISABLE_ALL:"DISABLE_ALL",RESET_DEFAULTS:"RESET_DEFAULTS",GET_DIAGNOSTICS:"GET_DIAGNOSTICS",DIAGNOSTICS_RESPONSE:"DIAGNOSTICS_RESPONSE",PAGE_NAVIGATED:"PAGE_NAVIGATED"},u={FEED:"feed",MESSAGES:"messages",NOTIFICATIONS:"notifications",LIVE:"live",SERIES:"series",PROFILE:"profile",VIDEO:"video",EXPLORE:"explore",UNKNOWN:"unknown"},l={MESSAGING:"messagingOptimization",NOTIFICATIONS:"notificationOptimization",FEED:"feedOptimization",LIVE_REMOVAL:"liveRemoval",DRAMA_REMOVAL:"dramaRemoval",MEDIA:"mediaOptimization",ANIMATIONS:"animationReduction",INTERFACE_CLEANUP:"interfaceCleanup",BACKGROUND_ACTIVITY:"backgroundActivityOptimization",DIAGNOSTICS:"performanceDiagnostics"};var F=u.UNKNOWN,D="",H=new Set,X=!1;function J(s){return!s||s==="/"||s==="/foryou"||s==="/following"?u.FEED:s.startsWith("/messages")?u.MESSAGES:s.startsWith("/live")?u.LIVE:s.startsWith("/series")||s.startsWith("/drama")||s.startsWith("/shortdrama")||s.startsWith("/short-drama")?u.SERIES:s.startsWith("/explore")?u.EXPLORE:s.startsWith("/@")&&!s.includes("/video/")?u.PROFILE:s.includes("/video/")?u.VIDEO:u.FEED}function A(){let s=window.location.pathname;if(s===D)return;D=s;let e=J(s),t=F;F=e;for(let i of H)try{i({route:e,previousRoute:t,pathname:s})}catch(r){console.warn("[itzTikTokOptimizer] Route listener error:",r)}}function Y(){if(X||typeof window>"u")return;X=!0,D=window.location.pathname,F=J(D);let s=window.history.pushState;window.history.pushState=function(...t){let i=s.apply(this,t);return setTimeout(A,0),i};let e=window.history.replaceState;window.history.replaceState=function(...t){let i=e.apply(this,t);return setTimeout(A,0),i},window.addEventListener("popstate",A),window.addEventListener("hashchange",A)}function K(s){return H.add(s),()=>H.delete(s)}var re=Object.freeze({masterEnabled:!0,messagingOptimization:!0,messagingOptions:{virtualizeList:!0,deferInboxInit:!0,reducePreviewProcessing:!0},notificationOptimization:!0,notificationOptions:{deferPopoverRender:!0,suppressBadgeAnimation:!0},feedOptimization:!0,feedOptions:{virtualizeFeed:!0,containLayout:!0,throttleScrollWork:!0},liveRemoval:!0,liveOptions:{hideNavEntry:!0,suppressFeedCards:!0,suppressPromos:!0},dramaRemoval:!0,dramaOptions:{hideSeriesCards:!0,hideSeriesNav:!0,hideDramaPromos:!0},mediaOptimization:!0,mediaOptions:{pauseOffscreenVideo:!0,suppressPromoAutoplay:!0},animationReduction:!0,animationOptions:{reduceDecorative:!0,respectReducedMotion:!0},interfaceCleanup:!0,interfaceOptions:{hideAppDownloadBanner:!0,hideFloatingFeedback:!0,hideQrCodePrompts:!0},backgroundActivityOptimization:!0,backgroundOptions:{throttleWhenHidden:!0,pauseMediaOnHidden:!1},performanceDiagnostics:!1,diagnosticsOptions:{measureMutations:!0,measureDomNodes:!0,logToConsole:!1}});function Q(){return JSON.parse(JSON.stringify(re))}var q=null;function Z(s,e){if(!e||typeof e!="object")return JSON.parse(JSON.stringify(s));let t={...s};for(let i of Object.keys(s))e[i]===void 0?t[i]=JSON.parse(JSON.stringify(s[i])):typeof s[i]=="object"&&s[i]!==null&&!Array.isArray(s[i])?t[i]={...s[i],...typeof e[i]=="object"&&e[i]!==null?e[i]:{}}:t[i]=e[i];return t}async function ee(){let s=Q();if(typeof chrome<"u"&&chrome.storage&&chrome.storage.local)try{let t=(await chrome.storage.local.get([S]))[S];return Z(s,t)}catch(e){console.warn("[itzTikTokOptimizer] Error reading chrome.storage:",e)}return q?Z(s,q):(q=s,s)}function te(s){if(typeof chrome<"u"&&chrome.storage&&chrome.storage.onChanged){let e=(t,i)=>{i==="local"&&t[S]&&s(t[S].newValue)};return chrome.storage.onChanged.addListener(e),()=>chrome.storage.onChanged.removeListener(e)}return()=>{}}var W="itz-intercept-messaging",T=class extends d{constructor(){super(l.MESSAGING,"Messaging Optimization")}async onEnable(e){if(this.isMessagesRoute()){window.location.replace("/");return}this.injectPageMessagingInterceptor(),this.applyMessagingStyles()}async onDisable(){this.removeCSS(),this.removePageMessagingInterceptor()}onNavigate(e){this.enabled&&e.pathname&&e.pathname.startsWith("/messages")&&window.location.replace("/")}isMessagesRoute(){return typeof window<"u"&&window.location.pathname.startsWith("/messages")}injectPageMessagingInterceptor(){if(typeof document>"u"||document.getElementById(W))return;let e=document.createElement("script");e.id=W,e.setAttribute("data-itz-source","itzTikTokOptimizer"),e.textContent=`
      (function() {
        // 1. Intercept fetch for all Direct Messaging / IM / Chat endpoints
        try {
          var origFetch = window.fetch;
          if (origFetch) {
            window.fetch = function(...args) {
              var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
              var lowerUrl = (url || '').toLowerCase();

              if (
                lowerUrl.includes('/web/im/') ||
                lowerUrl.includes('/api/v1/web/im/') ||
                lowerUrl.includes('/v1/im/') ||
                lowerUrl.includes('/api/im/') ||
                lowerUrl.includes('/im/message/') ||
                lowerUrl.includes('/im/conversation/') ||
                lowerUrl.includes('/im/chat/') ||
                lowerUrl.includes('/im/batch/') ||
                lowerUrl.includes('/im/user/') ||
                lowerUrl.includes('/im/sync/') ||
                lowerUrl.includes('/message/list/') ||
                lowerUrl.includes('/chat/list/')
              ) {
                return Promise.resolve(new Response(JSON.stringify({
                  status_code: 0,
                  status_msg: '',
                  data: [],
                  messages: [],
                  conversations: [],
                  user_list: [],
                  has_more: false,
                  next_cursor: 0
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }));
              }
              return origFetch.apply(this, args);
            };
          }
        } catch (e) {}

        // 2. Intercept XMLHttpRequest for Direct Messaging / IM
        try {
          var origOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._itzImUrl = (typeof url === 'string' ? url : '').toLowerCase();
            return origOpen.call(this, method, url, ...rest);
          };

          var origSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.send = function(...args) {
            if (this._itzImUrl && (
              this._itzImUrl.includes('/web/im/') ||
              this._itzImUrl.includes('/v1/im/') ||
              this._itzImUrl.includes('/api/im/') ||
              this._itzImUrl.includes('/im/message/') ||
              this._itzImUrl.includes('/im/conversation/')
            )) {
              Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
              Object.defineProperty(this, 'status', { value: 200, configurable: true });
              var emptyData = JSON.stringify({
                status_code: 0,
                data: [],
                messages: [],
                conversations: []
              });
              Object.defineProperty(this, 'responseText', { value: emptyData, configurable: true });
              Object.defineProperty(this, 'response', { value: emptyData, configurable: true });
              setTimeout(() => {
                if (typeof this.onreadystatechange === 'function') this.onreadystatechange();
                if (typeof this.onload === 'function') this.onload();
              }, 0);
              return;
            }
            return origSend.apply(this, args);
          };
        } catch (e) {}

        // 3. Neuter WebSockets connecting to IM gateways
        try {
          var OriginalWS = window.WebSocket;
          if (OriginalWS) {
            window.WebSocket = function(url, protocols) {
              var lowerUrl = (typeof url === 'string' ? url : '').toLowerCase();
              if (lowerUrl.includes('im') || lowerUrl.includes('frontier')) {
                var mockSocket = {
                  url: url,
                  readyState: 3, // CLOSED
                  bufferedAmount: 0,
                  send: function() {},
                  close: function() {},
                  addEventListener: function() {},
                  removeEventListener: function() {},
                  dispatchEvent: function() { return false; },
                  onopen: null,
                  onmessage: null,
                  onerror: null,
                  onclose: null
                };
                return mockSocket;
              }
              return new OriginalWS(url, protocols);
            };
            window.WebSocket.prototype = OriginalWS.prototype;
            window.WebSocket.CONNECTING = 0;
            window.WebSocket.OPEN = 1;
            window.WebSocket.CLOSING = 2;
            window.WebSocket.CLOSED = 3;
          }
        } catch (e) {}
      })();
    `;let t=document.head||document.documentElement;t&&t.appendChild(e)}removePageMessagingInterceptor(){if(typeof document>"u")return;let e=document.getElementById(W);e&&e.parentNode&&e.parentNode.removeChild(e)}applyMessagingStyles(){if(!this.enabled)return;this.injectCSS(`
      /* 1. Hide Messages button from left sidebar navigation */
      a[href*="/messages"],
      li:has(a[href*="/messages"]),
      div:has(> a[href*="/messages"]),
      div:has(> div > a[href*="/messages"]),
      div[data-e2e*="messages"] {
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 0 !important;
        min-height: 0 !important;
        border: none !important;
        overflow: hidden !important;
      }

      /* 2. Completely destroy all messaging panels, chat lists, and message drawers */
      div[data-e2e="message-panel"],
      div[data-e2e="chat-list"],
      div[data-e2e="message-list"],
      div[class*="MessagePanel"],
      div[class*="ChatList"],
      div[class*="ConversationList"],
      div[class*="ChatDrawer"],
      div[class*="DivConversationList"] {
        display: none !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
      }
    `)}};var L="itz-hidden-notification-toast",E="itz-hidden-badge",j="itz-intercept-notifications",N=class extends d{constructor(){super(l.NOTIFICATIONS,"Notification Optimization"),this.observer=null}async onEnable(e){this.injectPageNotificationInterceptor(),this.applyNotificationStyles(),this.eradicateNotificationToasts(),this.eradicateBadges(),this.sanitizeDocumentTitle(),this.setupNotificationObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.removePageNotificationInterceptor(),this.restoreSuppressedElements()}injectPageNotificationInterceptor(){if(typeof document>"u"||document.getElementById(j))return;let e=document.createElement("script");e.id=j,e.setAttribute("data-itz-source","itzTikTokOptimizer"),e.textContent=`
      (function() {
        // 1. Neuter Web Notifications API
        try {
          if (window.Notification) {
            Object.defineProperty(window.Notification, 'permission', {
              get: function() { return 'denied'; },
              set: function() {},
              configurable: true
            });
            window.Notification.requestPermission = function() {
              return Promise.resolve('denied');
            };
          }
          if (window.ServiceWorkerRegistration && window.ServiceWorkerRegistration.prototype) {
            window.ServiceWorkerRegistration.prototype.showNotification = function() {
              return Promise.resolve();
            };
          }
        } catch (e) {}

        // 2. Title Sanitizer - Strips [99+], (99+), [1] from browser tab title
        try {
          var cleanTitle = function(t) {
            if (!t || typeof t !== 'string') return t;
            return t.replace(/^\\[\\d+\\+?\\]\\s*/, '').replace(/^\\(\\d+\\+?\\)\\s*/, '');
          };
          if (document.title) {
            document.title = cleanTitle(document.title);
          }
          var titleDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'title') ||
                          Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'title');
          if (titleDesc && titleDesc.set) {
            var origSet = titleDesc.set;
            Object.defineProperty(document, 'title', {
              set: function(val) {
                origSet.call(this, cleanTitle(val));
              },
              get: function() {
                return titleDesc.get.call(this);
              },
              configurable: true
            });
          }
        } catch (e) {}

        // 3. Intercept fetch notice polling
        try {
          var originalFetch = window.fetch;
          if (originalFetch) {
            window.fetch = function(...args) {
              var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
              var lowerUrl = (url || '').toLowerCase();
              if (
                lowerUrl.includes('/api/notice/') ||
                lowerUrl.includes('/api/v1/notice/') ||
                lowerUrl.includes('/notice/multi/') ||
                lowerUrl.includes('/notice/count/') ||
                lowerUrl.includes('/passport/web/account/notice/') ||
                lowerUrl.includes('/notification/')
              ) {
                return Promise.resolve(new Response(JSON.stringify({
                  status_code: 0,
                  status_msg: '',
                  notice_count: 0,
                  data: [],
                  data_count: 0,
                  has_more: false,
                  user_list: [],
                  total: 0
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }));
              }
              return originalFetch.apply(this, args);
            };
          }
        } catch (e) {}

        // 4. Intercept XMLHttpRequest notice polling
        try {
          var originalOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._itzUrl = (typeof url === 'string' ? url : '').toLowerCase();
            return originalOpen.call(this, method, url, ...rest);
          };

          var originalSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.send = function(...args) {
            if (this._itzUrl && (
              this._itzUrl.includes('/api/notice/') ||
              this._itzUrl.includes('/notice/multi/') ||
              this._itzUrl.includes('/notice/count/') ||
              this._itzUrl.includes('/notification/')
            )) {
              Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
              Object.defineProperty(this, 'status', { value: 200, configurable: true });
              var emptyData = JSON.stringify({ status_code: 0, notice_count: 0, data: [], data_count: 0 });
              Object.defineProperty(this, 'responseText', { value: emptyData, configurable: true });
              Object.defineProperty(this, 'response', { value: emptyData, configurable: true });
              setTimeout(() => {
                if (typeof this.onreadystatechange === 'function') this.onreadystatechange();
                if (typeof this.onload === 'function') this.onload();
              }, 0);
              return;
            }
            return originalSend.apply(this, args);
          };
        } catch (e) {}
      })();
    `;let t=document.head||document.documentElement;t&&t.appendChild(e)}removePageNotificationInterceptor(){if(typeof document>"u")return;let e=document.getElementById(j);e&&e.parentNode&&e.parentNode.removeChild(e)}sanitizeDocumentTitle(){typeof document>"u"||!document.title||(document.title=document.title.replace(/^\[\d+\+?\]\s*/,"").replace(/^\(\d+\+?\)\s*/,""))}applyNotificationStyles(){if(!this.enabled)return;let e=`
      /* 1. Complete eradication of all floating notification toast cards and container lines */
      div[class*="Toast"],
      div[class*="toast"],
      div[class*="NoticeToast"],
      div[class*="PushNotice"],
      div[class*="PushNotification"],
      div[class*="NotificationToast"],
      div[class*="DivToastWrapper"],
      div[class*="FloatingNotice"],
      div[data-e2e*="toast"],
      div[data-e2e*="push-notification"],
      div[data-e2e*="notice-popup"],
      div[data-e2e*="floating-notice"],
      div[role="alert"],
      div[style*="fixed"][style*="bottom"][style*="right"],
      div[style*="fixed"][style*="right"][style*="bottom"],
      .${L} {
        all: unset !important;
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        outline: none !important;
        overflow: hidden !important;
      }

      /* 2. Hide Activity button from left sidebar navigation */
      a[href*="/activity"],
      li:has(a[href*="/activity"]),
      div:has(> a[href*="/activity"]),
      div[data-e2e*="activity"],
      span[data-e2e*="activity"] {
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 0 !important;
        min-height: 0 !important;
        border: none !important;
        overflow: hidden !important;
      }

      /* 3. Complete eradication of all red notification badges (99+, dots, counters) */
      sup[data-e2e="inbox-badge"],
      div[data-e2e="inbox-icon"] sup,
      div[data-e2e="inbox-badge"],
      div[data-e2e="messages-badge"],
      span[data-e2e*="badge"],
      div[data-e2e*="badge"],
      sup,
      span[class*="Badge"],
      div[class*="Badge"],
      span[class*="badge"],
      div[class*="badge"],
      span[class*="Dot"],
      div[class*="Dot"],
      span[class*="RedDot"],
      div[class*="RedDot"],
      span[class*="pulse"],
      .${E} {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
        font-size: 0 !important;
        line-height: 0 !important;
      }

      /* 4. Notification flyout panel dormant containment when closed */
      div[data-e2e="inbox-panel"]:not([data-opened="true"]),
      div[class*="NotificationPopover"]:not([class*="show"]) {
        display: none !important;
      }
    `;this.injectCSS(e)}eradicateNotificationToasts(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div, [role="alert"], [class*="toast"], [class*="Toast"]');for(let i=0;i<t.length;i++){let r=t[i],n=(r.textContent||"").toLowerCase();if(n.includes("reposted the same video")||n.includes("reposted your video")||n.includes("liked a video you reposted")||n.includes("liked your video")||n.includes("commented on your")||n.includes("started following you")){let o=r.closest('[role="alert"], div[class*="Toast"], div[class*="toast"], div[style*="fixed"]')||r;typeof o.remove=="function"?o.remove():(o.classList.add(L),o.style&&o.style.setProperty&&o.style.setProperty("display","none","important"))}}}eradicateBadges(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('sup, span[class*="Badge"], span[class*="badge"], div[class*="Badge"], div[class*="badge"]');for(let r=0;r<t.length;r++)t[r].classList.add(E),t[r].style&&t[r].style.setProperty&&t[r].style.setProperty("display","none","important");let i=e.querySelectorAll("span, div, sup");for(let r=0;r<i.length;r++){let n=i[r],a=(n.textContent||"").trim();(a==="99+"||a==="99"||/^\d+$/.test(a)&&n.children.length===0)&&n.closest('a[href*="/messages"], a[href*="/activity"], div[data-e2e="side-nav"], header, nav')&&(n.classList.add(E),n.style&&n.style.setProperty&&n.style.setProperty("display","none","important"))}}setupNotificationObserver(){this.observer||(this.observer=h({target:document.body,config:{childList:!0,subtree:!0},debounceMs:50,filter:e=>e.addedNodes.length>0,onBatch:e=>{this.sanitizeDocumentTitle();for(let t=0;t<e.length;t++){let i=e[t];for(let r=0;r<i.addedNodes.length;r++){let n=i.addedNodes[r];n.nodeType===1&&(this.eradicateNotificationToasts(n),this.eradicateBadges(n))}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){if(typeof document>"u")return;let e=document.querySelectorAll(`.${L}`);for(let i=0;i<e.length;i++)e[i].classList.remove(L),e[i].style.removeProperty("display");let t=document.querySelectorAll(`.${E}`);for(let i=0;i<t.length;i++)t[i].classList.remove(E),t[i].style.removeProperty("display")}};var C=class extends d{constructor(){super(l.FEED,"Feed Optimization"),this.isFeedRoute=!0}async onEnable(e){this.applyFeedStyles()}async onDisable(){this.removeCSS()}onNavigate(e){this.enabled&&(this.isFeedRoute=e.route===u.FEED,this.isFeedRoute&&this.applyFeedStyles())}applyFeedStyles(){if(!this.enabled)return;this.injectCSS(`
      /* 1. Feed Container Layout Containment */
      div[data-e2e="recommend-list-item-container"],
      div[class*="DivItemContainerV2"],
      div[class*="DivFeedContainer"] {
        contain: layout;
      }

      /* 2. Offscreen Feed Item Virtualization */
      /* Instructs Chromium to skip layout & paint passes for offscreen video cards */
      div[data-e2e="feed-item"],
      div[data-e2e="recommend-list-item-container"] > div {
        content-visibility: auto;
        contain-intrinsic-size: 700px;
      }

      /* 3. Action bar containment (Likes, Comments, Shares, Bookmarks) */
      div[data-e2e="feed-action-item"],
      div[class*="DivActionItemContainer"] {
        contain: layout style;
      }

      /* 4. Author info bar containment */
      div[data-e2e="feed-author-info"],
      div[class*="DivAuthorContainer"] {
        contain: layout style;
      }
    `)}};var I="itz-hidden-live-content",x=class extends d{constructor(){super(l.LIVE_REMOVAL,"Live Content Removal"),this.observer=null}async onEnable(e){this.applyLiveStyles(),this.scanAndSuppressLiveElements(),this.setupLiveObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.restoreSuppressedElements()}applyLiveStyles(){if(!this.enabled)return;let e=`
      /* 1. Main Navigation LIVE link (Sidebar & Header) */
      a[href*="/live"],
      a[data-e2e="nav-live"],
      div[data-e2e="live-side-nav"],
      li:has(> a[href*="/live"]) {
        display: none !important;
      }

      /* 2. LIVE Cards in Feed via semantic :has() selectors */
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/live"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e="live-badge"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e="live-card"]),
      div[data-e2e="feed-item"]:has(a[href*="/live"]),
      div[data-e2e="live-card"],
      div[class*="DivLiveContainer"],
      div[class*="LiveCardContainer"] {
        display: none !important;
      }

      /* 3. Class-based fallback for dynamic elements */
      .${I} {
        display: none !important;
      }
    `;this.injectCSS(e)}isLiveElement(e){return!e||e.nodeType!==1?!1:!!(e.getAttribute&&e.getAttribute("data-e2e")==="live-card"||e.querySelector&&e.querySelector('a[href*="/live"]')||e.querySelector&&e.querySelector('[data-e2e="live-badge"], span[class*="LiveBadge"]'))}scanAndSuppressLiveElements(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]');for(let i=0;i<t.length;i++){let r=t[i];this.isLiveElement(r)&&r.classList.add(I)}}setupLiveObserver(){this.observer||(this.observer=h({target:document.body,config:{childList:!0,subtree:!0},debounceMs:80,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let r=0;r<i.addedNodes.length;r++){let n=i.addedNodes[r];n.nodeType===1&&this.scanAndSuppressLiveElements(n)}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){let e=document.querySelectorAll(`.${I}`);for(let t=0;t<e.length;t++)e[t].classList.remove(I)}};var M="itz-hidden-drama-content",v="itz-hidden-drama-button",z=class extends d{constructor(){super(l.DRAMA_REMOVAL,"Short Drama Removal"),this.observer=null}async onEnable(e){if(this.isDramaUrl()){this.preventDramaPageLoading();return}this.applyDramaStyles(),this.suppressSidebarButton(),this.compactSidebarNavigation(),this.scanAndSuppressDramaElements(),this.setupDramaObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.restoreSuppressedElements()}onNavigate(e){if(this.enabled){if(this.isDramaUrl(e.pathname)){this.preventDramaPageLoading();return}this.suppressSidebarButton(),this.compactSidebarNavigation(),this.scanAndSuppressDramaElements()}}isDramaUrl(e){let t=(e||(typeof window<"u"?window.location.pathname:"")).toLowerCase();return t.startsWith("/shortdrama")||t.startsWith("/short-drama")||t.startsWith("/series")||t.startsWith("/drama")}preventDramaPageLoading(){typeof window>"u"||(document&&document.documentElement&&(document.documentElement.style.display="none"),window.location.replace("/"))}applyDramaStyles(){if(!this.enabled)return;let e=`
      /* 1. Complete suppression of Short Drama Button and its wrapper container */
      a[href*="/shortdrama"],
      a[href*="/short-drama"],
      a[href*="/series"],
      a[href*="/drama"],
      li:has(a[href*="/shortdrama"]),
      li:has(a[href*="/short-drama"]),
      li:has(a[href*="/series"]),
      li:has(a[href*="/drama"]),
      div:has(> a[href*="/shortdrama"]),
      div:has(> a[href*="/short-drama"]),
      div:has(> a[href*="/series"]),
      div:has(> a[href*="/drama"]),
      div:has(> div > a[href*="/shortdrama"]),
      div:has(> div > a[href*="/short-drama"]),
      [data-e2e*="shortdrama"],
      [data-e2e*="short-drama"],
      [data-e2e*="drama"],
      [data-e2e*="series"],
      .${v} {
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        line-height: 0 !important;
        border: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        overflow: hidden !important;
      }

      /* 2. Seamless scaling, elimination of void & layout organization */
      /* Normalizes flex spacing so no empty hole or "missed button" gap exists */
      nav ul,
      div[data-e2e="side-nav"] ul,
      div[class*="SideNav"] ul,
      div[class*="MainNav"] ul,
      div[class*="NavWrapper"] {
        display: flex !important;
        flex-direction: column !important;
        row-gap: 4px !important;
      }

      /* Eliminate void between upper nav (Friends) and lower nav (Messages) */
      div[data-e2e="side-nav"] > div,
      div[class*="SideNav"] > div,
      div[class*="MainNav"] > div,
      div[class*="NavWrapper"] > div,
      div[data-e2e="side-nav"] ul,
      div[class*="SideNav"] ul {
        min-height: 0 !important;
        flex-grow: 0 !important;
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }

      /* Pull lower navigation group (Upload, Profile, Messages) directly below Friends */
      div[data-e2e="side-nav"] ul:has(a[href*="/upload"]),
      div[data-e2e="side-nav"] div:has(> a[href*="/upload"]),
      div[data-e2e="side-nav"] ul:has(a[href*="/@"]),
      div[data-e2e="side-nav"] ul:has(a[href*="/messages"]),
      div[data-e2e="side-nav"] div:has(> a[href*="/messages"]),
      div[data-e2e="side-nav"] div:has(> div > a[href*="/messages"]),
      div[class*="SideNav"] ul:has(a[href*="/upload"]),
      div[class*="SideNav"] div:has(a[href*="/upload"]),
      div[class*="SideNav"] ul:has(a[href*="/messages"]),
      div[class*="SideNav"] div:has(a[href*="/messages"]) {
        margin-top: 4px !important;
        padding-top: 0 !important;
      }

      /* Collapse large spacers between upper and lower nav */
      div[data-e2e="side-nav"] div[class*="Spacer"],
      div[data-e2e="side-nav"] div[class*="Divider"],
      div[class*="SideNav"] div[class*="Spacer"],
      div[class*="SideNav"] div[class*="Divider"] {
        height: 1px !important;
        min-height: 0 !important;
        margin: 4px 0 !important;
      }

      /* Ensure surviving navigation items (For You, Explore, Following, Friends) scale cleanly */
      div[data-e2e="side-nav"] a,
      nav a[href],
      div[class*="SideNav"] a[href],
      div[class*="MainNav"] a[href] {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }

      /* 3. Feed cards, series hubs, and drama promo banners */
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/shortdrama"]),
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/short-drama"]),
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/series"]),
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/drama"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e*="series"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e*="drama"]),
      div[data-e2e="series-card"],
      div[data-e2e="drama-card"],
      div[data-e2e="shortdrama-card"],
      div[data-e2e="series-side-nav"],
      div[data-e2e="drama-banner"],
      div[class*="SeriesPromoContainer"],
      div[class*="DramaBanner"],
      div[class*="ShortDrama"] {
        display: none !important;
      }

      /* 4. Class-based fallback */
      .${M} {
        display: none !important;
      }
    `;this.injectCSS(e)}suppressSidebarButton(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('a, button, [role="button"], [role="link"]');for(let i=0;i<t.length;i++){let r=t[i],n=(r.getAttribute("href")||"").toLowerCase(),a=(r.textContent||"").trim().toLowerCase(),o=(r.getAttribute("data-e2e")||"").toLowerCase();if(n.includes("/shortdrama")||n.includes("/short-drama")||n.includes("/series")||n.includes("/drama")||o.includes("shortdrama")||o.includes("short-drama")||a==="short dramas"||a==="short drama"||a.startsWith("short drama")){r.classList.add(v);let p=r.closest('li, [role="listitem"]');if(p)p.classList.add(v);else if(r.parentElement&&r.parentElement!==document.body){let f=r.parentElement;(f.children.length===1||f.textContent.trim().toLowerCase()===a)&&f.classList.add(v)}}}}compactSidebarNavigation(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelector?e.querySelector('a[href*="/upload"], a[href*="/@"], a[href*="/profile"], a[href*="/messages"]'):null;if(t){let r=t.closest('ul, div[class*="NavSection"], div[class*="List"]');if(r&&r.style){r.style.setProperty("margin-top","4px","important"),r.style.setProperty("padding-top","0px","important");let n=r.previousElementSibling;for(;n;){if(!(n.textContent||"").trim()||n.matches&&n.matches('hr, div[class*="Divider"], div[class*="Spacer"], div[class*="Line"]'))n.style&&(n.style.setProperty("margin","2px 0","important"),n.style.setProperty("height","1px","important"),n.style.setProperty("min-height","0px","important"));else{n.style&&(n.style.setProperty("min-height","0px","important"),n.style.setProperty("margin-bottom","2px","important"),n.style.setProperty("padding-bottom","0px","important"));break}n=n.previousElementSibling}}}let i=e.querySelector?e.querySelector('a[href*="/friends"]'):null;if(i){let r=i.closest('ul, div[class*="NavSection"], div[class*="List"]');r&&r.style&&(r.style.setProperty("min-height","0px","important"),r.style.setProperty("margin-bottom","2px","important"))}}isDramaElement(e){return!e||e.nodeType!==1?!1:!!(e.getAttribute&&(e.getAttribute("data-e2e")==="series-card"||e.getAttribute("data-e2e")==="drama-card"||e.getAttribute("data-e2e")==="shortdrama-card"||e.getAttribute("data-e2e")&&e.getAttribute("data-e2e").includes("shortdrama"))||e.querySelector&&e.querySelector('a[href*="/shortdrama"], a[href*="/short-drama"], a[href*="/series/"], a[href*="/drama/"]'))}scanAndSuppressDramaElements(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]');for(let i=0;i<t.length;i++){let r=t[i];this.isDramaElement(r)&&r.classList.add(M)}}setupDramaObserver(){this.observer||(this.observer=h({target:document.body,config:{childList:!0,subtree:!0},debounceMs:60,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let r=0;r<i.addedNodes.length;r++){let n=i.addedNodes[r];n.nodeType===1&&(this.suppressSidebarButton(n),this.compactSidebarNavigation(n),this.scanAndSuppressDramaElements(n))}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){if(typeof document>"u")return;document.documentElement&&document.documentElement.style.display==="none"&&(document.documentElement.style.display="");let e=document.querySelectorAll(`.${M}`);for(let i=0;i<e.length;i++)e[i].classList.remove(M);let t=document.querySelectorAll(`.${v}`);for(let i=0;i<t.length;i++)t[i].classList.remove(v)}};var _=class extends d{constructor(){super(l.MEDIA,"Media Optimization"),this.mediaObserver=null,this.trackedVideos=new WeakSet}async onEnable(e){this.applyMediaStyles(),this.setupVideoObserver()}async onDisable(){this.removeCSS(),this.mediaObserver&&(this.mediaObserver.disconnect(),this.mediaObserver=null)}applyMediaStyles(){if(!this.enabled)return;this.injectCSS(`
      /* Video Player Container Containment */
      div[data-e2e="feed-video"],
      div[class*="DivVideoPlayerContainer"],
      div[class*="DivBasicPlayerWrapper"] {
        contain: layout;
      }

      /* Thumbnail grid item containment */
      div[data-e2e="user-post-item"],
      div[class*="DivItemContainer"] {
        contain: layout style;
      }
    `)}setupVideoObserver(){this.mediaObserver||typeof IntersectionObserver>"u"||this.options.pauseOffscreenVideo!==!1&&(this.mediaObserver=new IntersectionObserver(e=>{for(let t=0;t<e.length;t++){let i=e[t],r=i.target;document.fullscreenElement===r||r.closest(":fullscreen")||(!i.isIntersecting||i.intersectionRatio<.05?!r.paused&&!r.ended&&(r.dataset.itzOffscreenPaused="true",r.pause()):i.intersectionRatio>=.5&&r.dataset.itzOffscreenPaused==="true"&&(delete r.dataset.itzOffscreenPaused,r.play().catch(()=>{})))}},{threshold:[0,.5]}),this.registerObserver(this.mediaObserver),this.observeExistingVideos())}observeExistingVideos(){if(!this.mediaObserver)return;let e=document.querySelectorAll("video");for(let t=0;t<e.length;t++){let i=e[t];this.trackedVideos.has(i)||(this.trackedVideos.add(i),this.mediaObserver.observe(i))}}};var P=class extends d{constructor(){super(l.ANIMATIONS,"Animation Reduction")}async onEnable(e){this.applyAnimationStyles()}async onDisable(){this.removeCSS()}applyAnimationStyles(){if(!this.enabled)return;this.injectCSS(`
      /* 1. Stop continuous spinning vinyl record animation */
      div[data-e2e="music-cover"],
      div[class*="AlbumArt"],
      div[class*="DivMusicArt"],
      div[class*="DiscContainer"] {
        animation: none !important;
        transform: none !important;
      }

      /* 2. Suppress ambient glow and pulse animations */
      div[class*="GlowEffect"],
      span[class*="PulseEffect"],
      div[class*="LiveAvatarGlow"] {
        animation: none !important;
        box-shadow: none !important;
      }

      /* 3. Reduce expensive transition durations on hover cards */
      div[data-e2e="recommend-list-item-container"],
      div[data-e2e="user-post-item"],
      button {
        transition-duration: 0.08s !important;
      }

      /* 4. Disable floating engagement particle animations */
      canvas[class*="HeartAnimation"],
      div[class*="LikeBurstAnimation"] {
        display: none !important;
      }

      /* SAFEGUARD: Always preserve critical loading spinners */
      div[class*="Loading"],
      div[class*="Spinner"],
      svg[class*="LoadingCircle"] {
        animation: initial !important;
        display: initial !important;
      }
    `)}};var g="itz-hidden-header-promo",k=class extends d{constructor(){super(l.INTERFACE_CLEANUP,"Interface Cleanup"),this.observer=null}async onEnable(e){this.applyCleanupStyles(),this.cleanHeaderPromos(),this.setupCleanupObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.restoreSuppressedElements()}onNavigate(e){this.enabled&&this.cleanHeaderPromos()}applyCleanupStyles(){if(!this.enabled)return;let e=`
      /* 1. Header Capsule: Remove "Get Coins", "Get App" and Divider - leave ONLY Profile */
      header a[href*="/coin"],
      header a[href*="/download"],
      div[data-e2e="header-right"] a[href*="/coin"],
      div[data-e2e="header-right"] a[href*="/download"],
      div[data-e2e="header-right"] [data-e2e*="coin"],
      div[data-e2e="header-right"] [data-e2e*="download"],
      div[class*="HeaderRight"] a[href*="/coin"],
      div[class*="HeaderRight"] a[href*="/download"],
      div[class*="HeaderRight"] div:has(> a[href*="/coin"]),
      div[class*="HeaderRight"] div:has(> a[href*="/download"]),
      div[class*="HeaderRight"] span[class*="Divider"],
      div[class*="HeaderRight"] div[class*="Divider"],
      div[class*="HeaderRight"] span[class*="Splitter"],
      div[class*="HeaderRight"] div[class*="Splitter"],
      div[class*="HeaderRight"] span[class*="Line"],
      header span[class*="Divider"],
      header div[class*="Divider"],
      header span[class*="Splitter"],
      .${g} {
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 0 !important;
        min-width: 0 !important;
        border: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
        visibility: hidden !important;
      }

      /* Cleanly shrink the header capsule background around the profile avatar */
      div[data-e2e="header-right"] div[class*="Capsule"]:not(:has(a[href*="/coin"]):not(:has(a[href*="/download"]))),
      div[class*="HeaderRight"] div[class*="Container"]:has(a[href*="/@"]) {
        background: transparent !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }

      /* 2. Desktop App Download Banners & Sticky Floating Guides */
      div[data-e2e="download-guide-container"],
      div[data-e2e="download-app-banner"],
      div[class*="DivDownloadGuide"],
      div[class*="DivAppDownloadBanner"],
      div[class*="DownloadButtonContainer"],
      a[href*="/download-app"],
      a[data-e2e="nav-download"] {
        display: none !important;
      }

      /* 3. Floating Feedback & Survey Widgets */
      div[data-e2e="feedback-bubble"],
      div[class*="DivFeedbackContainer"],
      div[class*="DivSurveyPrompt"],
      button[aria-label*="Feedback" i] {
        display: none !important;
      }

      /* 4. QR Code Download Modals and Flyouts */
      div[data-e2e="qr-code-container"],
      div[class*="DivQrCodeContainer"],
      div[class*="AppQrCodeModal"] {
        display: none !important;
      }

      /* 5. Non-essential promotional banners */
      div[data-e2e="banner-container"],
      div[class*="DivBannerWrapper"] {
        display: none !important;
      }
    `;this.injectCSS(e)}cleanHeaderPromos(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('a, button, [role="button"], [role="link"]');for(let i=0;i<t.length;i++){let r=t[i],n=(r.textContent||"").trim().toLowerCase(),a=(r.getAttribute("href")||"").toLowerCase();if(n.includes("get coins")||n.includes("get app")||a.includes("/coin")||a.includes("/download")||r.getAttribute("data-e2e")&&(r.getAttribute("data-e2e").includes("coin")||r.getAttribute("data-e2e").includes("download"))){r.classList.add(g),r.parentElement&&r.parentElement.children.length===1&&r.parentElement.classList.add(g);let c=r.nextElementSibling;if(c&&(c.tagName==="SPAN"||c.tagName==="DIV"||c.matches('span, div[class*="Divider"], div[class*="Splitter"], div[class*="Line"]'))){let p=(c.textContent||"").trim();(!p||p==="|"||c.offsetWidth<=2)&&c.classList.add(g)}}}}setupCleanupObserver(){this.observer||(this.observer=h({target:document.body,config:{childList:!0,subtree:!0},debounceMs:80,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let r=0;r<i.addedNodes.length;r++){let n=i.addedNodes[r];n.nodeType===1&&this.cleanHeaderPromos(n)}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){if(typeof document>"u")return;let e=document.querySelectorAll(`.${g}`);for(let t=0;t<e.length;t++)e[t].classList.remove(g)}};var R=class extends d{constructor(){super(l.BACKGROUND_ACTIVITY,"Background Activity Optimization"),this.visibilityHandler=null}async onEnable(e){this.setupVisibilityListener(),document.hidden&&this.handleTabHidden()}async onDisable(){this.removeCSS(),this.handleTabVisible()}setupVisibilityListener(){this.visibilityHandler=()=>{this.enabled&&(document.hidden?this.handleTabHidden():this.handleTabVisible())},this.registerListener(document,"visibilitychange",this.visibilityHandler)}handleTabHidden(){if(this.options.throttleWhenHidden===!1)return;if(this.injectCSS(`
      * {
        animation-play-state: paused !important;
      }
    `),this.options.pauseMediaOnHidden){let t=document.querySelectorAll("video");for(let i=0;i<t.length;i++){let r=t[i];!r.paused&&!r.ended&&(r.dataset.itzBgPaused="true",r.pause())}}}handleTabVisible(){if(this.removeCSS(),this.options.pauseMediaOnHidden){let e=document.querySelectorAll('video[data-itz-bg-paused="true"]');for(let t=0;t<e.length;t++){let i=e[t];delete i.dataset.itzBgPaused,i.play().catch(()=>{})}}}};var U=class extends d{constructor(e){super(l.DIAGNOSTICS,"Performance Diagnostics"),this.lifecycleManager=e,this.startTime=Date.now()}async onEnable(e){}async onDisable(){}collectSnapshot(){let e=typeof document<"u"?document.getElementsByTagName("*").length:0,t=typeof performance<"u"&&performance.memory?{usedHeapMB:(performance.memory.usedJSHeapSize/(1024*1024)).toFixed(2),totalHeapMB:(performance.memory.totalJSHeapSize/(1024*1024)).toFixed(2),heapLimitMB:(performance.memory.jsHeapSizeLimit/(1024*1024)).toFixed(2)}:null,i=null;if(typeof performance<"u"&&performance.getEntriesByType){let o=performance.getEntriesByType("paint");if(o&&o.length>0){i={};for(let c of o)i[c.name]=`${Math.round(c.startTime)}ms`}}let r=this.lifecycleManager?this.lifecycleManager.getDiagnosticsSummary():{},n=0,a=0;for(let o of Object.values(r))n+=o.activeObservers||0,a+=o.activeListeners||0;return{timestamp:new Date().toISOString(),url:typeof window<"u"?window.location.pathname:"",dom:{totalNodes:e,status:e>3e3?"High (>3000 nodes)":e>1500?"Moderate":"Optimal"},memory:t,paintMilestones:i,optimizerStats:{totalActiveObservers:n,totalActiveListeners:a,modules:r}}}};async function ie(){let s=new O;s.register(new T),s.register(new N),s.register(new C),s.register(new x),s.register(new z),s.register(new _),s.register(new P),s.register(new k),s.register(new R);let e=new U(s);s.register(e),Y(),K(i=>{s.notifyNavigation(i)});let t=await ee();await s.initAll(t),te(i=>{s.syncSettings(i)}),typeof chrome<"u"&&chrome.runtime&&chrome.runtime.onMessage&&chrome.runtime.onMessage.addListener((i,r,n)=>{if(!i||!i.type)return!1;if(i.type===G.GET_DIAGNOSTICS){let a=e.collectSnapshot();return n({success:!0,diagnostics:a}),!0}return i.type===G.SETTINGS_UPDATED?(s.syncSettings(i.settings),n({success:!0}),!0):!1}),console.log("%c itzTikTok Optimizer %c Active & Performance Engine Running %c https://itzcrih.it ","background: #e6b422; color: #090b0e; font-weight: bold; padding: 2px 6px; border-radius: 3px 0 0 3px;","background: #121720; color: #eef2ff; padding: 2px 6px;","background: #090b0e; color: #8292a8; font-size: 10px; padding: 2px 6px; border-radius: 0 3px 3px 0;")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ie):ie();})();
