(()=>{var b="itz-opt-style-";function W(n,e){if(typeof document>"u")return null;let t=n.startsWith(b)?n:`${b}${n}`,i=document.getElementById(t);if(!i){i=document.createElement("style"),i.id=t,i.setAttribute("type","text/css"),i.setAttribute("data-itz-source","itzTikTokOptimizer");let s=document.head||document.documentElement;s&&s.appendChild(i)}return i.textContent!==e&&(i.textContent=e),i}function $(n){if(typeof document>"u")return!1;let e=n.startsWith(b)?n:`${b}${n}`,t=document.getElementById(e);return t&&t.parentNode?(t.parentNode.removeChild(t),!0):!1}function h(n){if(typeof MutationObserver>"u")return null;let{target:e=typeof document<"u"?document.body||document.documentElement||document:null,config:t={childList:!0,subtree:!0},filter:i=null,onBatch:s=()=>{},debounceMs:r=60}=n;if(!e)return null;let a=[],o=null,c=null,p=!1,f=()=>{if(a.length===0)return;let A=a;a=[],p=!0;try{s(A)}catch(y){console.warn("[itzTikTokOptimizer] Batched observer error:",y)}finally{p=!1}},F=new MutationObserver(A=>{if(!p){for(let y=0;y<A.length;y++){let m=A[y];m.target&&m.target.id&&m.target.id.startsWith(b)||m.target&&m.target.getAttribute&&m.target.getAttribute("data-itz-source")||i&&!i(m)||a.push(m)}a.length>0&&(r>0?c||(c=setTimeout(()=>{c=null,f()},r)):o||(o=requestAnimationFrame(()=>{o=null,f()})))}});return F.observe(e,t),{observer:F,disconnect:()=>{c&&clearTimeout(c),o&&cancelAnimationFrame(o),F.disconnect(),a=[]}}}var d=class{constructor(e,t){this.id=e,this.name=t,this.enabled=!1,this.initialized=!1,this.options={},this.styleId=`itz-mod-${e}`,this.observers=[],this.eventListeners=[],this.cleanupTasks=[]}async init(e){this.initialized=!0,this.options=e[this.id.replace("Optimization","Options")]||{}}async enable(e){if(!this.enabled){this.enabled=!0,this.options=e[this.id.replace("Optimization","Options")]||{};try{await this.onEnable(e)}catch(t){console.error(`[itzTikTokOptimizer] Error enabling module ${this.name}:`,t)}}}async disable(){if(this.enabled){this.enabled=!1;try{await this.onDisable()}catch(e){console.error(`[itzTikTokOptimizer] Error disabling module ${this.name}:`,e)}finally{this.teardownResources()}}}async updateOptions(e){this.options={...this.options,...e},this.enabled&&await this.onOptionsUpdated(this.options)}async onEnable(e){}async onDisable(){}async onOptionsUpdated(e){}onNavigate(e){}injectCSS(e){return W(this.styleId,e)}removeCSS(){return $(this.styleId)}registerObserver(e){return e&&this.observers.push(e),e}registerListener(e,t,i,s=!1){e&&e.addEventListener&&(e.addEventListener(t,i,s),this.eventListeners.push({target:e,type:t,handler:i,options:s}))}registerCleanup(e){typeof e=="function"&&this.cleanupTasks.push(e)}teardownResources(){for(let e of this.observers)try{typeof e.disconnect=="function"&&e.disconnect()}catch(t){console.warn(`[itzTikTokOptimizer] Observer cleanup error in ${this.id}:`,t)}this.observers=[];for(let e of this.eventListeners)try{e.target.removeEventListener(e.type,e.handler,e.options)}catch(t){console.warn(`[itzTikTokOptimizer] Listener cleanup error in ${this.id}:`,t)}this.eventListeners=[],this.removeCSS();for(let e of this.cleanupTasks)try{e()}catch(t){console.warn(`[itzTikTokOptimizer] Cleanup task error in ${this.id}:`,t)}this.cleanupTasks=[]}destroy(){this.disable(),this.initialized=!1}},w=class{constructor(){this.modules=new Map,this.currentSettings=null,this.isMasterActive=!0}register(e){return this.modules.set(e.id,e),this}getModule(e){return this.modules.get(e)}getAllModules(){return Array.from(this.modules.values())}async initAll(e){this.currentSettings=e,this.isMasterActive=!!e.masterEnabled;for(let t of this.modules.values())try{await t.init(e),this.isMasterActive&&e[t.id]&&await t.enable(e)}catch(i){console.error(`[itzTikTokOptimizer] Failed initializing module ${t.id}:`,i)}}async syncSettings(e){let t=this.currentSettings||{};this.currentSettings=e;let i=t.masterEnabled!==e.masterEnabled;if(this.isMasterActive=!!e.masterEnabled,!this.isMasterActive){for(let s of this.modules.values())s.enabled&&await s.disable();return}for(let s of this.modules.values()){let r=!!e[s.id];if(i&&r&&!s.enabled)await s.enable(e);else if(!i){if(r&&!s.enabled)await s.enable(e);else if(!r&&s.enabled)await s.disable();else if(r&&s.enabled){let a=s.id.replace("Optimization","Options"),o=JSON.stringify(t[a]||{}),c=JSON.stringify(e[a]||{});o!==c&&await s.updateOptions(e[a]||{})}}}}notifyNavigation(e){if(this.isMasterActive){for(let t of this.modules.values())if(t.enabled&&typeof t.onNavigate=="function")try{t.onNavigate(e)}catch(i){console.warn(`[itzTikTokOptimizer] Navigation handler error in ${t.id}:`,i)}}}getDiagnosticsSummary(){let e={};for(let t of this.modules.values())e[t.id]={name:t.name,enabled:t.enabled,activeObservers:t.observers.length,activeListeners:t.eventListeners.length};return e}};var S="itz_tiktok_optimizer_settings";var U={GET_SETTINGS:"GET_SETTINGS",SETTINGS_UPDATED:"SETTINGS_UPDATED",TOGGLE_MODULE:"TOGGLE_MODULE",TOGGLE_MASTER:"TOGGLE_MASTER",ENABLE_ALL:"ENABLE_ALL",DISABLE_ALL:"DISABLE_ALL",RESET_DEFAULTS:"RESET_DEFAULTS",GET_DIAGNOSTICS:"GET_DIAGNOSTICS",DIAGNOSTICS_RESPONSE:"DIAGNOSTICS_RESPONSE",PAGE_NAVIGATED:"PAGE_NAVIGATED"},u={FEED:"feed",MESSAGES:"messages",NOTIFICATIONS:"notifications",LIVE:"live",SERIES:"series",PROFILE:"profile",VIDEO:"video",EXPLORE:"explore",UNKNOWN:"unknown"},l={MESSAGING:"messagingOptimization",NOTIFICATIONS:"notificationOptimization",FEED:"feedOptimization",LIVE_REMOVAL:"liveRemoval",DRAMA_REMOVAL:"dramaRemoval",MEDIA:"mediaOptimization",ANIMATIONS:"animationReduction",INTERFACE_CLEANUP:"interfaceCleanup",BACKGROUND_ACTIVITY:"backgroundActivityOptimization",DIAGNOSTICS:"performanceDiagnostics"};var H=u.UNKNOWN,D="",V=new Set,j=!1;function J(n){return!n||n==="/"||n==="/foryou"||n==="/following"?u.FEED:n.startsWith("/messages")?u.MESSAGES:n.startsWith("/live")?u.LIVE:n.startsWith("/series")||n.startsWith("/drama")||n.startsWith("/shortdrama")||n.startsWith("/short-drama")?u.SERIES:n.startsWith("/explore")?u.EXPLORE:n.startsWith("/@")&&!n.includes("/video/")?u.PROFILE:n.includes("/video/")?u.VIDEO:u.FEED}function O(){let n=window.location.pathname;if(n===D)return;D=n;let e=J(n),t=H;H=e;for(let i of V)try{i({route:e,previousRoute:t,pathname:n})}catch(s){console.warn("[itzTikTokOptimizer] Route listener error:",s)}}function Y(){if(j||typeof window>"u")return;j=!0,D=window.location.pathname,H=J(D);let n=window.history.pushState;window.history.pushState=function(...t){let i=n.apply(this,t);return setTimeout(O,0),i};let e=window.history.replaceState;window.history.replaceState=function(...t){let i=e.apply(this,t);return setTimeout(O,0),i},window.addEventListener("popstate",O),window.addEventListener("hashchange",O)}function K(n){return V.add(n),()=>V.delete(n)}var se=Object.freeze({masterEnabled:!0,messagingOptimization:!0,messagingOptions:{virtualizeList:!0,deferInboxInit:!0,reducePreviewProcessing:!0},notificationOptimization:!0,notificationOptions:{deferPopoverRender:!0,suppressBadgeAnimation:!0},feedOptimization:!0,feedOptions:{virtualizeFeed:!0,containLayout:!0,throttleScrollWork:!0},liveRemoval:!0,liveOptions:{hideNavEntry:!0,suppressFeedCards:!0,suppressPromos:!0},dramaRemoval:!0,dramaOptions:{hideSeriesCards:!0,hideSeriesNav:!0,hideDramaPromos:!0},mediaOptimization:!0,mediaOptions:{pauseOffscreenVideo:!0,suppressPromoAutoplay:!0},animationReduction:!0,animationOptions:{reduceDecorative:!0,respectReducedMotion:!0},interfaceCleanup:!0,interfaceOptions:{hideAppDownloadBanner:!0,hideFloatingFeedback:!0,hideQrCodePrompts:!0},backgroundActivityOptimization:!0,backgroundOptions:{throttleWhenHidden:!0,pauseMediaOnHidden:!1},performanceDiagnostics:!1,diagnosticsOptions:{measureMutations:!0,measureDomNodes:!0,logToConsole:!1}});function X(){return JSON.parse(JSON.stringify(se))}var q=null;function Q(n,e){if(!e||typeof e!="object")return JSON.parse(JSON.stringify(n));let t={...n};for(let i of Object.keys(n))e[i]===void 0?t[i]=JSON.parse(JSON.stringify(n[i])):typeof n[i]=="object"&&n[i]!==null&&!Array.isArray(n[i])?t[i]={...n[i],...typeof e[i]=="object"&&e[i]!==null?e[i]:{}}:t[i]=e[i];return t}async function Z(){let n=X();if(typeof chrome<"u"&&chrome.storage&&chrome.storage.local)try{let t=(await chrome.storage.local.get([S]))[S];return Q(n,t)}catch(e){console.warn("[itzTikTokOptimizer] Error reading chrome.storage:",e)}return q?Q(n,q):(q=n,n)}function ee(n){if(typeof chrome<"u"&&chrome.storage&&chrome.storage.onChanged){let e=(t,i)=>{i==="local"&&t[S]&&n(t[S].newValue)};return chrome.storage.onChanged.addListener(e),()=>chrome.storage.onChanged.removeListener(e)}return()=>{}}var T=class extends d{constructor(){super(l.MESSAGING,"Messaging Optimization")}async onEnable(e){if(this.isMessagesRoute()){window.location.replace("/");return}this.syncPageInterceptor(!0),this.applyMessagingStyles()}async onDisable(){this.removeCSS(),this.syncPageInterceptor(!1)}syncPageInterceptor(e){typeof window<"u"&&typeof window.postMessage=="function"&&window.postMessage({source:"itz-optimizer-content",dmsBlocked:e},"*")}onNavigate(e){this.enabled&&e.pathname&&e.pathname.startsWith("/messages")&&window.location.replace("/")}isMessagesRoute(){return typeof window<"u"&&window.location.pathname.startsWith("/messages")}applyMessagingStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `)}};function te(n){return!n||typeof n!="string"?n:n.replace(/^[\s·•\-–—]*[\(\[]\s*\d+\+?\s*[\)\]][\s·•\-–—]*/i,"").replace(/[\s·•\-–—]*[\(\[]\s*\d+\+?\s*[\)\]][\s·•\-–—]*$/i,"").trim()}function ie(n){return!n||typeof n!="string"?!1:/[\(\[]\s*\d+\+?\s*[\)\]]/.test(n)}var L="itz-hidden-notification-toast",E="itz-hidden-badge",C=class extends d{constructor(){super(l.NOTIFICATIONS,"Notification Optimization"),this.observer=null}async onEnable(e){this.syncPageInterceptor(!0),this.applyNotificationStyles(),this.eradicateNotificationToasts(),this.eradicateBadges(),this.sanitizeDocumentTitle(),this.setupNotificationObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.syncPageInterceptor(!1),this.restoreSuppressedElements()}syncPageInterceptor(e){typeof window<"u"&&typeof window.postMessage=="function"&&window.postMessage({source:"itz-optimizer-content",notificationsBlocked:e},"*")}sanitizeDocumentTitle(){if(!(typeof document>"u"||!document.title)&&ie(document.title)){let e=te(document.title);document.title!==e&&(document.title=e)}}applyNotificationStyles(){if(!this.enabled)return;let e=`
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

      /* 3. Complete eradication of all red notification badges (99+, red dots, counters) */
      sup[data-e2e="inbox-badge"],
      div[data-e2e="inbox-icon"] sup,
      div[data-e2e="inbox-badge"],
      div[data-e2e="messages-badge"],
      a[href*="/messages"] sup,
      a[href*="/activity"] sup,
      header sup,
      nav sup,
      div[data-e2e="side-nav"] sup,
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

      /* SAFEGUARD: Strictly preserve sidebar icons, photo carousel swap buttons, pagination dots & counters */
      div[data-e2e="side-nav"] svg,
      nav svg,
      header svg,
      div[data-e2e="side-nav"] a svg,
      button[aria-label*="Previous" i],
      button[aria-label*="Next" i],
      div[class*="ArrowButton"],
      div[class*="ButtonArrow"],
      div[class*="SlideControl"],
      div[class*="PhotoCounter"],
      div[class*="Pagination"],
      span[class*="PhotoCounter"] {
        display: inline-block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      /* 4. Notification flyout panel dormant containment when closed */
      div[data-e2e="inbox-panel"]:not([data-opened="true"]),
      div[class*="NotificationPopover"]:not([class*="show"]) {
        display: none !important;
      }
    `;this.injectCSS(e)}eradicateNotificationToasts(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div, [role="alert"], [class*="toast"], [class*="Toast"]');for(let i=0;i<t.length;i++){let s=t[i],r=(s.textContent||"").toLowerCase();if(r.includes("reposted the same video")||r.includes("reposted your video")||r.includes("liked a video you reposted")||r.includes("liked your video")||r.includes("commented on your")||r.includes("started following you")){let o=s.closest('[role="alert"], div[class*="Toast"], div[class*="toast"], div[style*="fixed"]')||s;typeof o.remove=="function"?o.remove():(o.classList.add(L),o.style&&o.style.setProperty&&o.style.setProperty("display","none","important"))}}}eradicateBadges(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('header sup, nav sup, div[data-e2e="side-nav"] sup, a[href*="/messages"] sup, a[href*="/activity"] sup, [data-e2e="inbox-badge"], [data-e2e="messages-badge"], span[class*="RedDot"], div[class*="RedDot"]');for(let s=0;s<t.length;s++){let r=t[s];r.querySelector&&r.querySelector("svg, img")||(r.classList.add(E),r.style&&r.style.setProperty&&r.style.setProperty("display","none","important"))}let i=e.querySelectorAll('a[href*="/messages"] span, a[href*="/activity"] span, div[data-e2e="side-nav"] sup, header sup');for(let s=0;s<i.length;s++){let r=i[s];if(r.querySelector&&r.querySelector("svg, img"))continue;let a=(r.textContent||"").trim();(a==="99+"||a==="99"||/^\d+$/.test(a)&&r.children.length===0)&&(r.classList.add(E),r.style&&r.style.setProperty&&r.style.setProperty("display","none","important"))}}setupNotificationObserver(){this.observer||(this.observer=h({target:typeof document<"u"?document.body||document.documentElement||document:null,config:{childList:!0,subtree:!0},debounceMs:50,filter:e=>e.addedNodes.length>0,onBatch:e=>{this.sanitizeDocumentTitle();for(let t=0;t<e.length;t++){let i=e[t];for(let s=0;s<i.addedNodes.length;s++){let r=i.addedNodes[s];r.nodeType===1&&(this.eradicateNotificationToasts(r),this.eradicateBadges(r))}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){if(typeof document>"u")return;let e=document.querySelectorAll(`.${L}`);for(let i=0;i<e.length;i++)e[i].classList.remove(L),e[i].style.removeProperty("display");let t=document.querySelectorAll(`.${E}`);for(let i=0;i<t.length;i++)t[i].classList.remove(E),t[i].style.removeProperty("display")}};var N=class extends d{constructor(){super(l.FEED,"Feed Optimization"),this.isFeedRoute=!0}async onEnable(e){this.applyFeedStyles()}async onDisable(){this.removeCSS()}onNavigate(e){this.enabled&&(this.isFeedRoute=e.route===u.FEED,this.isFeedRoute&&this.applyFeedStyles())}applyFeedStyles(){if(!this.enabled)return;this.injectCSS(`
      /* 1. Feed Container Layout Containment */
      div[data-e2e="recommend-list-item-container"],
      div[class*="DivItemContainerV2"],
      div[class*="DivFeedContainer"] {
        contain: layout;
      }

      /* 2. Offscreen Feed Item Virtualization */
      /* Instructs Chromium to skip layout & paint passes for offscreen video cards */
      div[data-e2e="feed-item"],
      div[data-e2e="recommend-list-item-container"] {
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

      /* 5. Safeguard multi-photo slide swap buttons, arrows and photo counters */
      button[aria-label*="Previous" i],
      button[aria-label*="Next" i],
      div[class*="ArrowButton"],
      div[class*="ButtonArrow"],
      div[class*="SlideControl"],
      div[class*="PhotoCounter"],
      div[class*="Pagination"],
      span[class*="PhotoCounter"] {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
    `)}};var x="itz-hidden-live-content",I=class extends d{constructor(){super(l.LIVE_REMOVAL,"Live Content Removal"),this.observer=null}async onEnable(e){this.syncPageInterceptor(!0),this.applyLiveStyles(),this.scanAndSuppressLiveElements(),this.setupLiveObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.syncPageInterceptor(!1),this.restoreSuppressedElements()}syncPageInterceptor(e){typeof window<"u"&&typeof window.postMessage=="function"&&window.postMessage({source:"itz-optimizer-content",liveRemovalActive:e},"*")}applyLiveStyles(){if(!this.enabled)return;let e=`
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
      div[class*="LiveCardContainer"],
      .${x} {
        display: none !important;
        height: 0px !important;
        min-height: 0px !important;
        max-height: 0px !important;
        margin: 0px !important;
        padding: 0px !important;
        overflow: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;this.injectCSS(e)}isLiveElement(e){return!e||e.nodeType!==1?!1:!!(e.getAttribute&&e.getAttribute("data-e2e")==="live-card"||e.querySelector&&e.querySelector('a[href*="/live"]')||e.querySelector&&e.querySelector('[data-e2e="live-badge"], span[class*="LiveBadge"]'))}scanAndSuppressLiveElements(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]');for(let i=0;i<t.length;i++){let s=t[i];if(this.isLiveElement(s)){s.classList.add(x),s.style&&s.style.setProperty&&(s.style.setProperty("height","0px","important"),s.style.setProperty("min-height","0px","important"),s.style.setProperty("margin","0px","important"),s.style.setProperty("overflow","hidden","important"),s.style.setProperty("display","none","important"));try{let r=s.getBoundingClientRect?s.getBoundingClientRect():null;if(r&&r.top>=-50&&r.top<=(typeof window<"u"?window.innerHeight:800)/2){let a=s.nextElementSibling;a&&typeof a.scrollIntoView=="function"&&a.scrollIntoView({behavior:"instant",block:"start"})}}catch{}}}}setupLiveObserver(){this.observer||(this.observer=h({target:typeof document<"u"?document.body||document.documentElement||document:null,config:{childList:!0,subtree:!0},debounceMs:80,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let s=0;s<i.addedNodes.length;s++){let r=i.addedNodes[s];r.nodeType===1&&this.scanAndSuppressLiveElements(r)}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){let e=document.querySelectorAll(`.${x}`);for(let t=0;t<e.length;t++)e[t].classList.remove(x)}};var M="itz-hidden-drama-content",v="itz-hidden-drama-button",z=class extends d{constructor(){super(l.DRAMA_REMOVAL,"Short Drama Removal"),this.observer=null}async onEnable(e){if(this.isDramaUrl()){this.preventDramaPageLoading();return}this.applyDramaStyles(),this.suppressSidebarButton(),this.compactSidebarNavigation(),this.scanAndSuppressDramaElements(),this.setupDramaObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.restoreSuppressedElements()}onNavigate(e){if(this.enabled){if(this.isDramaUrl(e.pathname)){this.preventDramaPageLoading();return}this.suppressSidebarButton(),this.compactSidebarNavigation(),this.scanAndSuppressDramaElements()}}isDramaUrl(e){let t=(e||(typeof window<"u"?window.location.pathname:"")).toLowerCase();return t.startsWith("/shortdrama")||t.startsWith("/short-drama")}preventDramaPageLoading(){typeof window>"u"||window.location.replace("/")}applyDramaStyles(){if(!this.enabled)return;let e=`
      /* 1. Complete suppression of Short Drama Button and its wrapper container */
      a[href*="/shortdrama"],
      a[href*="/short-drama"],
      li:has(> a[href*="/shortdrama"]),
      li:has(> a[href*="/short-drama"]),
      div:has(> a[href*="/shortdrama"]),
      div:has(> a[href*="/short-drama"]),
      [data-e2e="shortdrama-side-nav"],
      [data-e2e*="shortdrama"],
      [data-e2e*="short-drama"],
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
      div[data-e2e="side-nav"] hr,
      nav div[class*="Spacer"],
      nav div[class*="Divider"],
      nav hr,
      div[class*="SideNav"] div[class*="Spacer"],
      div[class*="SideNav"] div[class*="Divider"] {
        height: 1px !important;
        min-height: 0 !important;
        margin: 4px 0 !important;
        padding: 0 !important;
      }

      /* Ensure surviving navigation items and icons scale cleanly */
      div[data-e2e="side-nav"] a,
      nav a[href],
      div[class*="SideNav"] a[href],
      div[class*="MainNav"] a[href] {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }

      div[data-e2e="side-nav"] a svg,
      nav a svg,
      div[data-e2e="side-nav"] svg {
        display: inline-block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }

      /* 3. Feed cards, series hubs, and drama promo banners */
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/shortdrama"]),
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/short-drama"]),
      div[data-e2e="shortdrama-card"],
      div[data-e2e="shortdrama-side-nav"],
      div[class*="ShortDrama"] {
        display: none !important;
      }

      /* 4. Class-based fallback */
      .${M} {
        display: none !important;
      }
    `;this.injectCSS(e)}suppressSidebarButton(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('a, button, [role="button"], [role="link"]');for(let i=0;i<t.length;i++){let s=t[i],r=(s.getAttribute("href")||"").toLowerCase(),a=(s.textContent||"").trim().toLowerCase(),o=(s.getAttribute("data-e2e")||"").toLowerCase();if(r.includes("/shortdrama")||r.includes("/short-drama")||o.includes("shortdrama")||o.includes("short-drama")||a==="short dramas"||a==="short drama"||a.startsWith("short drama")){s.classList.add(v);let p=s.closest('li, [role="listitem"]');if(p)p.classList.add(v);else if(s.parentElement&&s.parentElement!==document.body){let f=s.parentElement;(f.children.length===1||f.textContent.trim().toLowerCase()===a)&&f.classList.add(v)}}}}compactSidebarNavigation(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div[class*="Spacer"], div[class*="Divider"], hr');for(let s=0;s<t.length;s++){let r=t[s];r.closest&&r.closest('div[data-e2e="side-nav"], nav')&&r.style&&(r.style.setProperty("margin","2px 0","important"),r.style.setProperty("height","1px","important"),r.style.setProperty("min-height","0px","important"),r.style.setProperty("padding","0","important"))}let i=e.querySelectorAll("ul");for(let s=0;s<i.length;s++){let r=i[s];r.closest&&r.closest('div[data-e2e="side-nav"], nav')&&r.style&&(r.style.setProperty("row-gap","4px","important"),r.style.setProperty("margin-bottom","4px","important"))}}isDramaElement(e){return!e||e.nodeType!==1?!1:!!(e.getAttribute&&(e.getAttribute("data-e2e")==="shortdrama-card"||e.getAttribute("data-e2e")&&e.getAttribute("data-e2e").includes("shortdrama"))||e.querySelector&&e.querySelector('a[href*="/shortdrama"], a[href*="/short-drama"]'))}scanAndSuppressDramaElements(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]');for(let i=0;i<t.length;i++){let s=t[i];this.isDramaElement(s)&&s.classList.add(M)}}setupDramaObserver(){this.observer||(this.observer=h({target:typeof document<"u"?document.body||document.documentElement||document:null,config:{childList:!0,subtree:!0},debounceMs:60,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let s=0;s<i.addedNodes.length;s++){let r=i.addedNodes[s];r.nodeType===1&&(this.suppressSidebarButton(r),this.compactSidebarNavigation(r),this.scanAndSuppressDramaElements(r))}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){if(typeof document>"u")return;document.documentElement&&document.documentElement.style.display==="none"&&(document.documentElement.style.display="");let e=document.querySelectorAll(`.${M}`);for(let i=0;i<e.length;i++)e[i].classList.remove(M);let t=document.querySelectorAll(`.${v}`);for(let i=0;i<t.length;i++)t[i].classList.remove(v)}};var P=class extends d{constructor(){super(l.MEDIA,"Media Optimization"),this.mediaObserver=null,this.trackedVideos=new WeakSet}async onEnable(e){this.applyMediaStyles(),this.setupVideoObserver()}async onDisable(){this.removeCSS(),this.mediaObserver&&(this.mediaObserver.disconnect(),this.mediaObserver=null)}applyMediaStyles(){if(!this.enabled)return;this.injectCSS(`
      /* Video Player Container Containment */
      div[data-e2e="feed-video"],
      div[class*="DivVideoPlayerContainer"],
      div[class*="DivBasicPlayerWrapper"] {
        contain: layout;
      }
    `)}setupVideoObserver(){this.mediaObserver||typeof IntersectionObserver>"u"||this.options.pauseOffscreenVideo!==!1&&(this.mediaObserver=new IntersectionObserver(e=>{for(let t=0;t<e.length;t++){let i=e[t],s=i.target;document.fullscreenElement===s||s.closest(":fullscreen")||(!i.isIntersecting||i.intersectionRatio<.05?!s.paused&&!s.ended&&(s.dataset.itzOffscreenPaused="true",s.pause()):i.intersectionRatio>=.5&&s.dataset.itzOffscreenPaused==="true"&&(delete s.dataset.itzOffscreenPaused,s.play().catch(()=>{})))}},{threshold:[0,.5]}),this.registerObserver(this.mediaObserver),this.observeExistingVideos())}observeExistingVideos(){if(!this.mediaObserver)return;let e=document.querySelectorAll("video");for(let t=0;t<e.length;t++){let i=e[t];this.trackedVideos.has(i)||(this.trackedVideos.add(i),this.mediaObserver.observe(i))}}};var R=class extends d{constructor(){super(l.ANIMATIONS,"Animation Reduction")}async onEnable(e){this.applyAnimationStyles()}async onDisable(){this.removeCSS()}applyAnimationStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `)}};var g="itz-hidden-header-promo",_=class extends d{constructor(){super(l.INTERFACE_CLEANUP,"Interface Cleanup"),this.observer=null}async onEnable(e){this.applyCleanupStyles(),this.cleanHeaderPromos(),this.setupCleanupObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.restoreSuppressedElements()}onNavigate(e){this.enabled&&this.cleanHeaderPromos()}applyCleanupStyles(){if(!this.enabled)return;let e=`
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
    `;this.injectCSS(e)}cleanHeaderPromos(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('a, button, [role="button"], [role="link"]');for(let i=0;i<t.length;i++){let s=t[i],r=(s.textContent||"").trim().toLowerCase(),a=(s.getAttribute("href")||"").toLowerCase();if(r.includes("get coins")||r.includes("get app")||a.includes("/coin")||a.includes("/download")||s.getAttribute("data-e2e")&&(s.getAttribute("data-e2e").includes("coin")||s.getAttribute("data-e2e").includes("download"))){s.classList.add(g),s.parentElement&&s.parentElement.children.length===1&&s.parentElement.classList.add(g);let c=s.nextElementSibling;if(c&&(c.tagName==="SPAN"||c.tagName==="DIV"||c.matches('span, div[class*="Divider"], div[class*="Splitter"], div[class*="Line"]'))){let p=(c.textContent||"").trim();(!p||p==="|"||c.offsetWidth<=2)&&c.classList.add(g)}}}}setupCleanupObserver(){this.observer||(this.observer=h({target:typeof document<"u"?document.body||document.documentElement||document:null,config:{childList:!0,subtree:!0},debounceMs:80,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let s=0;s<i.addedNodes.length;s++){let r=i.addedNodes[s];r.nodeType===1&&this.cleanHeaderPromos(r)}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){if(typeof document>"u")return;let e=document.querySelectorAll(`.${g}`);for(let t=0;t<e.length;t++)e[t].classList.remove(g)}};var k=class extends d{constructor(){super(l.BACKGROUND_ACTIVITY,"Background Activity Optimization"),this.visibilityHandler=null}async onEnable(e){this.setupVisibilityListener(),document.hidden&&this.handleTabHidden()}async onDisable(){this.removeCSS(),this.handleTabVisible()}setupVisibilityListener(){this.visibilityHandler=()=>{this.enabled&&(document.hidden?this.handleTabHidden():this.handleTabVisible())},this.registerListener(document,"visibilitychange",this.visibilityHandler)}handleTabHidden(){if(this.options.throttleWhenHidden===!1)return;if(this.injectCSS(`
      * {
        animation-play-state: paused !important;
      }
    `),this.options.pauseMediaOnHidden){let t=document.querySelectorAll("video");for(let i=0;i<t.length;i++){let s=t[i];!s.paused&&!s.ended&&(s.dataset.itzBgPaused="true",s.pause())}}}handleTabVisible(){if(this.removeCSS(),this.options.pauseMediaOnHidden){let e=document.querySelectorAll('video[data-itz-bg-paused="true"]');for(let t=0;t<e.length;t++){let i=e[t];delete i.dataset.itzBgPaused,i.play().catch(()=>{})}}}};var B=class extends d{constructor(e){super(l.DIAGNOSTICS,"Performance Diagnostics"),this.lifecycleManager=e,this.startTime=Date.now()}async onEnable(e){}async onDisable(){}collectSnapshot(){let e=typeof document<"u"?document.getElementsByTagName("*").length:0,t=typeof performance<"u"&&performance.memory?{usedHeapMB:(performance.memory.usedJSHeapSize/(1024*1024)).toFixed(2),totalHeapMB:(performance.memory.totalJSHeapSize/(1024*1024)).toFixed(2),heapLimitMB:(performance.memory.jsHeapSizeLimit/(1024*1024)).toFixed(2)}:null,i=null;if(typeof performance<"u"&&performance.getEntriesByType){let o=performance.getEntriesByType("paint");if(o&&o.length>0){i={};for(let c of o)i[c.name]=`${Math.round(c.startTime)}ms`}}let s=this.lifecycleManager?this.lifecycleManager.getDiagnosticsSummary():{},r=0,a=0;for(let o of Object.values(s))r+=o.activeObservers||0,a+=o.activeListeners||0;return{timestamp:new Date().toISOString(),url:typeof window<"u"?window.location.pathname:"",dom:{totalNodes:e,status:e>3e3?"High (>3000 nodes)":e>1500?"Moderate":"Optimal"},memory:t,paintMilestones:i,optimizerStats:{totalActiveObservers:r,totalActiveListeners:a,modules:s}}}};var G=null;async function ne(){let n=new w;G=n,n.register(new T),n.register(new C),n.register(new N),n.register(new I),n.register(new z),n.register(new P),n.register(new R),n.register(new _),n.register(new k);let e=new B(n);n.register(e),Y(),K(i=>{n.notifyNavigation(i)});let t=await Z();await n.initAll(t),ee(i=>{n.syncSettings(i)}),typeof chrome<"u"&&chrome.runtime&&chrome.runtime.onMessage&&chrome.runtime.onMessage.addListener((i,s,r)=>{if(!i||!i.type)return!1;if(i.type===U.GET_DIAGNOSTICS){let a=e.collectSnapshot();return r({success:!0,diagnostics:a}),!0}return i.type===U.SETTINGS_UPDATED?(n.syncSettings(i.settings),r({success:!0}),!0):!1}),console.log("%c itzTikTok Optimizer %c Active & Performance Engine Running %c https://itzcrih.it ","background: #e6b422; color: #090b0e; font-weight: bold; padding: 2px 6px; border-radius: 3px 0 0 3px;","background: #121720; color: #eef2ff; padding: 2px 6px;","background: #090b0e; color: #8292a8; font-size: 10px; padding: 2px 6px; border-radius: 0 3px 3px 0;")}ne();typeof document<"u"&&document.readyState==="loading"&&document.addEventListener("DOMContentLoaded",()=>{if(G&&G.isMasterActive){let n=typeof window<"u"?window.location.pathname:"";G.notifyNavigation({route:n.startsWith("/messages")?"messages":"feed",pathname:n})}});})();
