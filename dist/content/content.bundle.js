(()=>{var b="itz-opt-style-",F="data-itz-optimized";function j(r,e){if(typeof document>"u")return null;let t=r.startsWith(b)?r:`${b}${r}`,i=document.getElementById(t);if(!i){i=document.createElement("style"),i.id=t,i.setAttribute("type","text/css"),i.setAttribute("data-itz-source","itzTikTokOptimizer");let s=document.head||document.documentElement;s&&s.appendChild(i)}return i.textContent!==e&&(i.textContent=e),i}function $(r){if(typeof document>"u")return!1;let e=r.startsWith(b)?r:`${b}${r}`,t=document.getElementById(e);return t&&t.parentNode?(t.parentNode.removeChild(t),!0):!1}function J(r,e){if(!r||!r.dataset)return;let t=r.getAttribute(F)||"";t.includes(e)||r.setAttribute(F,t?`${t} ${e}`:e)}function X(r,e){if(!r||!r.getAttribute)return!1;let t=r.getAttribute(F);return!!(t&&t.includes(e))}function p(r){if(typeof MutationObserver>"u")return null;let{target:e=typeof document<"u"?document.body:null,config:t={childList:!0,subtree:!0},filter:i=null,onBatch:s=()=>{},debounceMs:a=60}=r;if(!e)return null;let n=[],o=null,c=null,m=!1,f=()=>{if(n.length===0)return;let O=n;n=[],m=!0;try{s(O)}catch(y){console.warn("[itzTikTokOptimizer] Batched observer error:",y)}finally{m=!1}},G=new MutationObserver(O=>{if(!m){for(let y=0;y<O.length;y++){let h=O[y];h.target&&h.target.id&&h.target.id.startsWith(b)||h.target&&h.target.getAttribute&&h.target.getAttribute("data-itz-source")||i&&!i(h)||n.push(h)}n.length>0&&(a>0?c||(c=setTimeout(()=>{c=null,f()},a)):o||(o=requestAnimationFrame(()=>{o=null,f()})))}});return G.observe(e,t),{observer:G,disconnect:()=>{c&&clearTimeout(c),o&&cancelAnimationFrame(o),G.disconnect(),n=[]}}}var d=class{constructor(e,t){this.id=e,this.name=t,this.enabled=!1,this.initialized=!1,this.options={},this.styleId=`itz-mod-${e}`,this.observers=[],this.eventListeners=[],this.cleanupTasks=[]}async init(e){this.initialized=!0,this.options=e[this.id.replace("Optimization","Options")]||{}}async enable(e){if(!this.enabled){this.enabled=!0,this.options=e[this.id.replace("Optimization","Options")]||{};try{await this.onEnable(e)}catch(t){console.error(`[itzTikTokOptimizer] Error enabling module ${this.name}:`,t)}}}async disable(){if(this.enabled){this.enabled=!1;try{await this.onDisable()}catch(e){console.error(`[itzTikTokOptimizer] Error disabling module ${this.name}:`,e)}finally{this.teardownResources()}}}async updateOptions(e){this.options={...this.options,...e},this.enabled&&await this.onOptionsUpdated(this.options)}async onEnable(e){}async onDisable(){}async onOptionsUpdated(e){}onNavigate(e){}injectCSS(e){return j(this.styleId,e)}removeCSS(){return $(this.styleId)}registerObserver(e){return e&&this.observers.push(e),e}registerListener(e,t,i,s=!1){e&&e.addEventListener&&(e.addEventListener(t,i,s),this.eventListeners.push({target:e,type:t,handler:i,options:s}))}registerCleanup(e){typeof e=="function"&&this.cleanupTasks.push(e)}teardownResources(){for(let e of this.observers)try{typeof e.disconnect=="function"&&e.disconnect()}catch(t){console.warn(`[itzTikTokOptimizer] Observer cleanup error in ${this.id}:`,t)}this.observers=[];for(let e of this.eventListeners)try{e.target.removeEventListener(e.type,e.handler,e.options)}catch(t){console.warn(`[itzTikTokOptimizer] Listener cleanup error in ${this.id}:`,t)}this.eventListeners=[],this.removeCSS();for(let e of this.cleanupTasks)try{e()}catch(t){console.warn(`[itzTikTokOptimizer] Cleanup task error in ${this.id}:`,t)}this.cleanupTasks=[]}destroy(){this.disable(),this.initialized=!1}},A=class{constructor(){this.modules=new Map,this.currentSettings=null,this.isMasterActive=!0}register(e){return this.modules.set(e.id,e),this}getModule(e){return this.modules.get(e)}getAllModules(){return Array.from(this.modules.values())}async initAll(e){this.currentSettings=e,this.isMasterActive=!!e.masterEnabled;for(let t of this.modules.values())try{await t.init(e),this.isMasterActive&&e[t.id]&&await t.enable(e)}catch(i){console.error(`[itzTikTokOptimizer] Failed initializing module ${t.id}:`,i)}}async syncSettings(e){let t=this.currentSettings||{};this.currentSettings=e;let i=t.masterEnabled!==e.masterEnabled;if(this.isMasterActive=!!e.masterEnabled,!this.isMasterActive){for(let s of this.modules.values())s.enabled&&await s.disable();return}for(let s of this.modules.values()){let a=!!e[s.id];if(i&&a&&!s.enabled)await s.enable(e);else if(!i){if(a&&!s.enabled)await s.enable(e);else if(!a&&s.enabled)await s.disable();else if(a&&s.enabled){let n=s.id.replace("Optimization","Options"),o=JSON.stringify(t[n]||{}),c=JSON.stringify(e[n]||{});o!==c&&await s.updateOptions(e[n]||{})}}}}notifyNavigation(e){if(this.isMasterActive){for(let t of this.modules.values())if(t.enabled&&typeof t.onNavigate=="function")try{t.onNavigate(e)}catch(i){console.warn(`[itzTikTokOptimizer] Navigation handler error in ${t.id}:`,i)}}}getDiagnosticsSummary(){let e={};for(let t of this.modules.values())e[t.id]={name:t.name,enabled:t.enabled,activeObservers:t.observers.length,activeListeners:t.eventListeners.length};return e}};var S="itz_tiktok_optimizer_settings";var q={GET_SETTINGS:"GET_SETTINGS",SETTINGS_UPDATED:"SETTINGS_UPDATED",TOGGLE_MODULE:"TOGGLE_MODULE",TOGGLE_MASTER:"TOGGLE_MASTER",ENABLE_ALL:"ENABLE_ALL",DISABLE_ALL:"DISABLE_ALL",RESET_DEFAULTS:"RESET_DEFAULTS",GET_DIAGNOSTICS:"GET_DIAGNOSTICS",DIAGNOSTICS_RESPONSE:"DIAGNOSTICS_RESPONSE",PAGE_NAVIGATED:"PAGE_NAVIGATED"},u={FEED:"feed",MESSAGES:"messages",NOTIFICATIONS:"notifications",LIVE:"live",SERIES:"series",PROFILE:"profile",VIDEO:"video",EXPLORE:"explore",UNKNOWN:"unknown"},l={MESSAGING:"messagingOptimization",NOTIFICATIONS:"notificationOptimization",FEED:"feedOptimization",LIVE_REMOVAL:"liveRemoval",DRAMA_REMOVAL:"dramaRemoval",MEDIA:"mediaOptimization",ANIMATIONS:"animationReduction",INTERFACE_CLEANUP:"interfaceCleanup",BACKGROUND_ACTIVITY:"backgroundActivityOptimization",DIAGNOSTICS:"performanceDiagnostics"};var H=u.UNKNOWN,D="",U=new Set,Y=!1;function K(r){return!r||r==="/"||r==="/foryou"||r==="/following"?u.FEED:r.startsWith("/messages")?u.MESSAGES:r.startsWith("/live")?u.LIVE:r.startsWith("/series")||r.startsWith("/drama")||r.startsWith("/shortdrama")||r.startsWith("/short-drama")?u.SERIES:r.startsWith("/explore")?u.EXPLORE:r.startsWith("/@")&&!r.includes("/video/")?u.PROFILE:r.includes("/video/")?u.VIDEO:u.FEED}function L(){let r=window.location.pathname;if(r===D)return;D=r;let e=K(r),t=H;H=e;for(let i of U)try{i({route:e,previousRoute:t,pathname:r})}catch(s){console.warn("[itzTikTokOptimizer] Route listener error:",s)}}function Q(){if(Y||typeof window>"u")return;Y=!0,D=window.location.pathname,H=K(D);let r=window.history.pushState;window.history.pushState=function(...t){let i=r.apply(this,t);return setTimeout(L,0),i};let e=window.history.replaceState;window.history.replaceState=function(...t){let i=e.apply(this,t);return setTimeout(L,0),i},window.addEventListener("popstate",L),window.addEventListener("hashchange",L)}function Z(r){return U.add(r),()=>U.delete(r)}var ae=Object.freeze({masterEnabled:!0,messagingOptimization:!0,messagingOptions:{virtualizeList:!0,deferInboxInit:!0,reducePreviewProcessing:!0},notificationOptimization:!0,notificationOptions:{deferPopoverRender:!0,suppressBadgeAnimation:!0},feedOptimization:!0,feedOptions:{virtualizeFeed:!0,containLayout:!0,throttleScrollWork:!0},liveRemoval:!0,liveOptions:{hideNavEntry:!0,suppressFeedCards:!0,suppressPromos:!0},dramaRemoval:!0,dramaOptions:{hideSeriesCards:!0,hideSeriesNav:!0,hideDramaPromos:!0},mediaOptimization:!0,mediaOptions:{pauseOffscreenVideo:!0,suppressPromoAutoplay:!0},animationReduction:!0,animationOptions:{reduceDecorative:!0,respectReducedMotion:!0},interfaceCleanup:!0,interfaceOptions:{hideAppDownloadBanner:!0,hideFloatingFeedback:!0,hideQrCodePrompts:!0},backgroundActivityOptimization:!0,backgroundOptions:{throttleWhenHidden:!0,pauseMediaOnHidden:!1},performanceDiagnostics:!1,diagnosticsOptions:{measureMutations:!0,measureDomNodes:!0,logToConsole:!1}});function ee(){return JSON.parse(JSON.stringify(ae))}var V=null;function te(r,e){if(!e||typeof e!="object")return JSON.parse(JSON.stringify(r));let t={...r};for(let i of Object.keys(r))e[i]===void 0?t[i]=JSON.parse(JSON.stringify(r[i])):typeof r[i]=="object"&&r[i]!==null&&!Array.isArray(r[i])?t[i]={...r[i],...typeof e[i]=="object"&&e[i]!==null?e[i]:{}}:t[i]=e[i];return t}async function ie(){let r=ee();if(typeof chrome<"u"&&chrome.storage&&chrome.storage.local)try{let t=(await chrome.storage.local.get([S]))[S];return te(r,t)}catch(e){console.warn("[itzTikTokOptimizer] Error reading chrome.storage:",e)}return V?te(r,V):(V=r,r)}function se(r){if(typeof chrome<"u"&&chrome.storage&&chrome.storage.onChanged){let e=(t,i)=>{i==="local"&&t[S]&&r(t[S].newValue)};return chrome.storage.onChanged.addListener(e),()=>chrome.storage.onChanged.removeListener(e)}return()=>{}}var T=class extends d{constructor(){super(l.MESSAGING,"Messaging Optimization"),this.isChatRoute=!1,this.listObserver=null}async onEnable(e){this.applyMessagingStyles(),this.updateRouteState(window.location.pathname.startsWith("/messages"))}async onDisable(){this.removeCSS(),this.listObserver&&(this.listObserver.disconnect(),this.listObserver=null)}onNavigate(e){if(!this.enabled)return;let t=e.route===u.MESSAGES||e.pathname.startsWith("/messages");this.updateRouteState(t)}updateRouteState(e){this.isChatRoute=e,this.applyMessagingStyles(),e?this.attachScopedChatObserver():this.listObserver&&(this.listObserver.disconnect(),this.listObserver=null)}applyMessagingStyles(){if(!this.enabled)return;let e=`
      /* 1. Conversation List Item Virtualization */
      /* Blazing-fast scrolling for 100+ conversations & large group chats */
      div[data-e2e="chat-item"],
      div[class*="ConversationItem"],
      div[class*="ChatListItem"],
      div[class*="chat-item"] {
        content-visibility: auto;
        contain-intrinsic-size: 72px;
        contain: layout style;
      }

      /* 2. Message Bubbles layout containment */
      div[data-e2e="message-item"],
      div[class*="MessageItem"],
      div[class*="ChatMessage"] {
        contain: layout style;
      }

      /* 3. Conversation avatar and status badge containment */
      div[data-e2e="chat-avatar"],
      div[class*="AvatarContainer"] {
        contain: paint layout;
      }
    `;!this.isChatRoute&&this.options.deferInboxInit!==!1&&(e+=`
        /* Background messaging drawer dormancy */
        div[data-e2e="message-panel"]:not([data-active="true"]),
        div[class*="MessagePanel"]:not([class*="active"]),
        div[class*="ChatDrawerContainer"]:not([class*="open"]) {
          content-visibility: hidden;
          contain: strict;
        }
      `),this.injectCSS(e)}attachScopedChatObserver(){if(this.listObserver)return;let e=document.querySelector('div[data-e2e="chat-list"], div[class*="ChatList"], div[class*="ConversationList"]');if(e)this.listObserver=p({target:e,config:{childList:!0,subtree:!1},debounceMs:100,onBatch:t=>{let i=e.querySelectorAll('div[data-e2e="chat-item"]');for(let s=0;s<i.length;s++){let a=i[s];X(a,"msg-opt")||J(a,"msg-opt")}}}),this.listObserver&&this.registerObserver(this.listObserver);else{let t=p({target:document.body,config:{childList:!0,subtree:!0},debounceMs:200,filter:i=>i.addedNodes.length>0,onBatch:()=>{if(!this.isChatRoute||this.listObserver)return;document.querySelector('div[data-e2e="chat-list"], div[class*="ChatList"]')&&(t.disconnect(),this.attachScopedChatObserver())}});t&&this.registerObserver(t)}}};var w="itz-hidden-notification-toast",E="itz-hidden-badge",W="itz-intercept-notifications",N=class extends d{constructor(){super(l.NOTIFICATIONS,"Notification Optimization"),this.observer=null}async onEnable(e){this.injectPageNotificationInterceptor(),this.applyNotificationStyles(),this.eradicateNotificationToasts(),this.eradicateBadges(),this.setupNotificationObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.removePageNotificationInterceptor(),this.restoreSuppressedElements()}injectPageNotificationInterceptor(){if(typeof document>"u"||document.getElementById(W))return;let e=document.createElement("script");e.id=W,e.setAttribute("data-itz-source","itzTikTokOptimizer"),e.textContent=`
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

        // 2. Intercept fetch notice polling
        try {
          const originalFetch = window.fetch;
          if (originalFetch) {
            window.fetch = function(...args) {
              const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
              if (url && (
                url.includes('/api/notice/') ||
                url.includes('/api/v1/notice/') ||
                url.includes('/notice/multi/') ||
                url.includes('/notice/count/') ||
                url.includes('/passport/web/account/notice/')
              )) {
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

        // 3. Intercept XMLHttpRequest notice polling
        try {
          const originalOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._itzUrl = typeof url === 'string' ? url : '';
            return originalOpen.call(this, method, url, ...rest);
          };

          const originalSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.send = function(...args) {
            if (this._itzUrl && (
              this._itzUrl.includes('/api/notice/') ||
              this._itzUrl.includes('/notice/multi/') ||
              this._itzUrl.includes('/notice/count/')
            )) {
              Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
              Object.defineProperty(this, 'status', { value: 200, configurable: true });
              Object.defineProperty(this, 'responseText', {
                value: JSON.stringify({ status_code: 0, notice_count: 0, data: [], data_count: 0 }),
                configurable: true
              });
              Object.defineProperty(this, 'response', {
                value: JSON.stringify({ status_code: 0, notice_count: 0, data: [], data_count: 0 }),
                configurable: true
              });
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
    `;let t=document.head||document.documentElement;t&&t.appendChild(e)}removePageNotificationInterceptor(){if(typeof document>"u")return;let e=document.getElementById(W);e&&e.parentNode&&e.parentNode.removeChild(e)}applyNotificationStyles(){if(!this.enabled)return;let e=`
      /* 1. Complete eradication of all floating notification toast cards (bottom-right popups) */
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
      div[role="alert"]:has(img),
      div[role="alert"]:has(button),
      div[style*="fixed"][style*="bottom"][style*="right"],
      div[style*="fixed"][style*="right"][style*="bottom"],
      .${w} {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }

      /* 2. Complete eradication of all red notification badges (99+, dots, counters) */
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

      /* 3. Notification flyout panel dormant containment when closed */
      div[data-e2e="inbox-panel"]:not([data-opened="true"]),
      div[class*="NotificationPopover"]:not([class*="show"]) {
        display: none !important;
      }
    `;this.injectCSS(e)}eradicateNotificationToasts(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div, [role="alert"], [class*="toast"], [class*="Toast"]');for(let i=0;i<t.length;i++){let s=t[i],a=(s.textContent||"").toLowerCase();if(a.includes("reposted the same video")||a.includes("reposted your video")||a.includes("liked a video you reposted")||a.includes("liked your video")||a.includes("commented on your")||a.includes("started following you")){let o=s.closest('[role="alert"], div[class*="Toast"], div[class*="toast"], div[style*="fixed"]')||s;o.classList.add(w),o.style&&o.style.setProperty&&o.style.setProperty("display","none","important")}}}eradicateBadges(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('sup, span[class*="Badge"], span[class*="badge"], div[class*="Badge"], div[class*="badge"]');for(let s=0;s<t.length;s++)t[s].classList.add(E),t[s].style&&t[s].style.setProperty&&t[s].style.setProperty("display","none","important");let i=e.querySelectorAll("span, div, sup");for(let s=0;s<i.length;s++){let a=i[s],n=(a.textContent||"").trim();(n==="99+"||n==="99"||/^\d+$/.test(n)&&a.children.length===0)&&a.closest('a[href*="/messages"], div[data-e2e="side-nav"], header, nav')&&(a.classList.add(E),a.style&&a.style.setProperty&&a.style.setProperty("display","none","important"))}}setupNotificationObserver(){this.observer||(this.observer=p({target:document.body,config:{childList:!0,subtree:!0},debounceMs:50,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let s=0;s<i.addedNodes.length;s++){let a=i.addedNodes[s];a.nodeType===1&&(this.eradicateNotificationToasts(a),this.eradicateBadges(a))}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){if(typeof document>"u")return;let e=document.querySelectorAll(`.${w}`);for(let i=0;i<e.length;i++)e[i].classList.remove(w),e[i].style.removeProperty("display");let t=document.querySelectorAll(`.${E}`);for(let i=0;i<t.length;i++)t[i].classList.remove(E),t[i].style.removeProperty("display")}};var C=class extends d{constructor(){super(l.FEED,"Feed Optimization"),this.isFeedRoute=!0}async onEnable(e){this.applyFeedStyles()}async onDisable(){this.removeCSS()}onNavigate(e){this.enabled&&(this.isFeedRoute=e.route===u.FEED,this.isFeedRoute&&this.applyFeedStyles())}applyFeedStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `;this.injectCSS(e)}isLiveElement(e){return!e||e.nodeType!==1?!1:!!(e.getAttribute&&e.getAttribute("data-e2e")==="live-card"||e.querySelector&&e.querySelector('a[href*="/live"]')||e.querySelector&&e.querySelector('[data-e2e="live-badge"], span[class*="LiveBadge"]'))}scanAndSuppressLiveElements(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]');for(let i=0;i<t.length;i++){let s=t[i];this.isLiveElement(s)&&s.classList.add(I)}}setupLiveObserver(){this.observer||(this.observer=p({target:document.body,config:{childList:!0,subtree:!0},debounceMs:80,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let s=0;s<i.addedNodes.length;s++){let a=i.addedNodes[s];a.nodeType===1&&this.scanAndSuppressLiveElements(a)}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){let e=document.querySelectorAll(`.${I}`);for(let t=0;t<e.length;t++)e[t].classList.remove(I)}};var M="itz-hidden-drama-content",v="itz-hidden-drama-button",z=class extends d{constructor(){super(l.DRAMA_REMOVAL,"Short Drama Removal"),this.observer=null}async onEnable(e){if(this.isDramaUrl()){this.preventDramaPageLoading();return}this.applyDramaStyles(),this.suppressSidebarButton(),this.compactSidebarNavigation(),this.scanAndSuppressDramaElements(),this.setupDramaObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.restoreSuppressedElements()}onNavigate(e){if(this.enabled){if(this.isDramaUrl(e.pathname)){this.preventDramaPageLoading();return}this.suppressSidebarButton(),this.compactSidebarNavigation(),this.scanAndSuppressDramaElements()}}isDramaUrl(e){let t=(e||(typeof window<"u"?window.location.pathname:"")).toLowerCase();return t.startsWith("/shortdrama")||t.startsWith("/short-drama")||t.startsWith("/series")||t.startsWith("/drama")}preventDramaPageLoading(){typeof window>"u"||(document&&document.documentElement&&(document.documentElement.style.display="none"),window.location.replace("/"))}applyDramaStyles(){if(!this.enabled)return;let e=`
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

      /* Pull Messages group directly below Friends */
      div[data-e2e="side-nav"] ul:has(a[href*="/messages"]),
      div[data-e2e="side-nav"] div:has(> a[href*="/messages"]),
      div[data-e2e="side-nav"] div:has(> div > a[href*="/messages"]),
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
    `;this.injectCSS(e)}suppressSidebarButton(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('a, button, [role="button"], [role="link"]');for(let i=0;i<t.length;i++){let s=t[i],a=(s.getAttribute("href")||"").toLowerCase(),n=(s.textContent||"").trim().toLowerCase(),o=(s.getAttribute("data-e2e")||"").toLowerCase();if(a.includes("/shortdrama")||a.includes("/short-drama")||a.includes("/series")||a.includes("/drama")||o.includes("shortdrama")||o.includes("short-drama")||n==="short dramas"||n==="short drama"||n.startsWith("short drama")){s.classList.add(v);let m=s.closest('li, [role="listitem"]');if(m)m.classList.add(v);else if(s.parentElement&&s.parentElement!==document.body){let f=s.parentElement;(f.children.length===1||f.textContent.trim().toLowerCase()===n)&&f.classList.add(v)}}}}compactSidebarNavigation(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelector?e.querySelector('a[href*="/messages"]'):null;if(t){let s=t.closest('ul, div[class*="NavSection"], div[class*="List"]');if(s&&s.style){s.style.setProperty("margin-top","4px","important"),s.style.setProperty("padding-top","0px","important");let a=s.previousElementSibling;for(;a;){if(!(a.textContent||"").trim()||a.matches&&a.matches('hr, div[class*="Divider"], div[class*="Spacer"], div[class*="Line"]'))a.style&&(a.style.setProperty("margin","2px 0","important"),a.style.setProperty("height","1px","important"),a.style.setProperty("min-height","0px","important"));else{a.style&&(a.style.setProperty("min-height","0px","important"),a.style.setProperty("margin-bottom","2px","important"),a.style.setProperty("padding-bottom","0px","important"));break}a=a.previousElementSibling}}}let i=e.querySelector?e.querySelector('a[href*="/friends"]'):null;if(i){let s=i.closest('ul, div[class*="NavSection"], div[class*="List"]');s&&s.style&&(s.style.setProperty("min-height","0px","important"),s.style.setProperty("margin-bottom","2px","important"))}}isDramaElement(e){return!e||e.nodeType!==1?!1:!!(e.getAttribute&&(e.getAttribute("data-e2e")==="series-card"||e.getAttribute("data-e2e")==="drama-card"||e.getAttribute("data-e2e")==="shortdrama-card"||e.getAttribute("data-e2e")&&e.getAttribute("data-e2e").includes("shortdrama"))||e.querySelector&&e.querySelector('a[href*="/shortdrama"], a[href*="/short-drama"], a[href*="/series/"], a[href*="/drama/"]'))}scanAndSuppressDramaElements(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]');for(let i=0;i<t.length;i++){let s=t[i];this.isDramaElement(s)&&s.classList.add(M)}}setupDramaObserver(){this.observer||(this.observer=p({target:document.body,config:{childList:!0,subtree:!0},debounceMs:60,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let s=0;s<i.addedNodes.length;s++){let a=i.addedNodes[s];a.nodeType===1&&(this.suppressSidebarButton(a),this.compactSidebarNavigation(a),this.scanAndSuppressDramaElements(a))}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){if(typeof document>"u")return;document.documentElement&&document.documentElement.style.display==="none"&&(document.documentElement.style.display="");let e=document.querySelectorAll(`.${M}`);for(let i=0;i<e.length;i++)e[i].classList.remove(M);let t=document.querySelectorAll(`.${v}`);for(let i=0;i<t.length;i++)t[i].classList.remove(v)}};var R=class extends d{constructor(){super(l.MEDIA,"Media Optimization"),this.mediaObserver=null,this.trackedVideos=new WeakSet}async onEnable(e){this.applyMediaStyles(),this.setupVideoObserver()}async onDisable(){this.removeCSS(),this.mediaObserver&&(this.mediaObserver.disconnect(),this.mediaObserver=null)}applyMediaStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `)}setupVideoObserver(){this.mediaObserver||typeof IntersectionObserver>"u"||this.options.pauseOffscreenVideo!==!1&&(this.mediaObserver=new IntersectionObserver(e=>{for(let t=0;t<e.length;t++){let i=e[t],s=i.target;document.fullscreenElement===s||s.closest(":fullscreen")||(!i.isIntersecting||i.intersectionRatio<.05?!s.paused&&!s.ended&&(s.dataset.itzOffscreenPaused="true",s.pause()):i.intersectionRatio>=.5&&s.dataset.itzOffscreenPaused==="true"&&(delete s.dataset.itzOffscreenPaused,s.play().catch(()=>{})))}},{threshold:[0,.5]}),this.registerObserver(this.mediaObserver),this.observeExistingVideos())}observeExistingVideos(){if(!this.mediaObserver)return;let e=document.querySelectorAll("video");for(let t=0;t<e.length;t++){let i=e[t];this.trackedVideos.has(i)||(this.trackedVideos.add(i),this.mediaObserver.observe(i))}}};var _=class extends d{constructor(){super(l.ANIMATIONS,"Animation Reduction")}async onEnable(e){this.applyAnimationStyles()}async onDisable(){this.removeCSS()}applyAnimationStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `;this.injectCSS(e)}cleanHeaderPromos(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('a, button, [role="button"], [role="link"]');for(let i=0;i<t.length;i++){let s=t[i],a=(s.textContent||"").trim().toLowerCase(),n=(s.getAttribute("href")||"").toLowerCase();if(a.includes("get coins")||a.includes("get app")||n.includes("/coin")||n.includes("/download")||s.getAttribute("data-e2e")&&(s.getAttribute("data-e2e").includes("coin")||s.getAttribute("data-e2e").includes("download"))){s.classList.add(g),s.parentElement&&s.parentElement.children.length===1&&s.parentElement.classList.add(g);let c=s.nextElementSibling;if(c&&(c.tagName==="SPAN"||c.tagName==="DIV"||c.matches('span, div[class*="Divider"], div[class*="Splitter"], div[class*="Line"]'))){let m=(c.textContent||"").trim();(!m||m==="|"||c.offsetWidth<=2)&&c.classList.add(g)}}}}setupCleanupObserver(){this.observer||(this.observer=p({target:document.body,config:{childList:!0,subtree:!0},debounceMs:80,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let s=0;s<i.addedNodes.length;s++){let a=i.addedNodes[s];a.nodeType===1&&this.cleanHeaderPromos(a)}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){if(typeof document>"u")return;let e=document.querySelectorAll(`.${g}`);for(let t=0;t<e.length;t++)e[t].classList.remove(g)}};var P=class extends d{constructor(){super(l.BACKGROUND_ACTIVITY,"Background Activity Optimization"),this.visibilityHandler=null}async onEnable(e){this.setupVisibilityListener(),document.hidden&&this.handleTabHidden()}async onDisable(){this.removeCSS(),this.handleTabVisible()}setupVisibilityListener(){this.visibilityHandler=()=>{this.enabled&&(document.hidden?this.handleTabHidden():this.handleTabVisible())},this.registerListener(document,"visibilitychange",this.visibilityHandler)}handleTabHidden(){if(this.options.throttleWhenHidden===!1)return;if(this.injectCSS(`
      * {
        animation-play-state: paused !important;
      }
    `),this.options.pauseMediaOnHidden){let t=document.querySelectorAll("video");for(let i=0;i<t.length;i++){let s=t[i];!s.paused&&!s.ended&&(s.dataset.itzBgPaused="true",s.pause())}}}handleTabVisible(){if(this.removeCSS(),this.options.pauseMediaOnHidden){let e=document.querySelectorAll('video[data-itz-bg-paused="true"]');for(let t=0;t<e.length;t++){let i=e[t];delete i.dataset.itzBgPaused,i.play().catch(()=>{})}}}};var B=class extends d{constructor(e){super(l.DIAGNOSTICS,"Performance Diagnostics"),this.lifecycleManager=e,this.startTime=Date.now()}async onEnable(e){}async onDisable(){}collectSnapshot(){let e=typeof document<"u"?document.getElementsByTagName("*").length:0,t=typeof performance<"u"&&performance.memory?{usedHeapMB:(performance.memory.usedJSHeapSize/(1024*1024)).toFixed(2),totalHeapMB:(performance.memory.totalJSHeapSize/(1024*1024)).toFixed(2),heapLimitMB:(performance.memory.jsHeapSizeLimit/(1024*1024)).toFixed(2)}:null,i=null;if(typeof performance<"u"&&performance.getEntriesByType){let o=performance.getEntriesByType("paint");if(o&&o.length>0){i={};for(let c of o)i[c.name]=`${Math.round(c.startTime)}ms`}}let s=this.lifecycleManager?this.lifecycleManager.getDiagnosticsSummary():{},a=0,n=0;for(let o of Object.values(s))a+=o.activeObservers||0,n+=o.activeListeners||0;return{timestamp:new Date().toISOString(),url:typeof window<"u"?window.location.pathname:"",dom:{totalNodes:e,status:e>3e3?"High (>3000 nodes)":e>1500?"Moderate":"Optimal"},memory:t,paintMilestones:i,optimizerStats:{totalActiveObservers:a,totalActiveListeners:n,modules:s}}}};async function re(){let r=new A;r.register(new T),r.register(new N),r.register(new C),r.register(new x),r.register(new z),r.register(new R),r.register(new _),r.register(new k),r.register(new P);let e=new B(r);r.register(e),Q(),Z(i=>{r.notifyNavigation(i)});let t=await ie();await r.initAll(t),se(i=>{r.syncSettings(i)}),typeof chrome<"u"&&chrome.runtime&&chrome.runtime.onMessage&&chrome.runtime.onMessage.addListener((i,s,a)=>{if(!i||!i.type)return!1;if(i.type===q.GET_DIAGNOSTICS){let n=e.collectSnapshot();return a({success:!0,diagnostics:n}),!0}return i.type===q.SETTINGS_UPDATED?(r.syncSettings(i.settings),a({success:!0}),!0):!1}),console.log("%c itzTikTok Optimizer %c Active & Performance Engine Running %c https://itzcrih.it ","background: #e6b422; color: #090b0e; font-weight: bold; padding: 2px 6px; border-radius: 3px 0 0 3px;","background: #121720; color: #eef2ff; padding: 2px 6px;","background: #090b0e; color: #8292a8; font-size: 10px; padding: 2px 6px; border-radius: 0 3px 3px 0;")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",re):re();})();
