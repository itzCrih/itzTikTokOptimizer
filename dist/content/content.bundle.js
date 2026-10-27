(()=>{var h="itz-opt-style-",R="data-itz-optimized";function V(s,e){if(typeof document>"u")return null;let t=s.startsWith(h)?s:`${h}${s}`,i=document.getElementById(t);if(!i){i=document.createElement("style"),i.id=t,i.setAttribute("type","text/css"),i.setAttribute("data-itz-source","itzTikTokOptimizer");let n=document.head||document.documentElement;n&&n.appendChild(i)}return i.textContent!==e&&(i.textContent=e),i}function U(s){if(typeof document>"u")return!1;let e=s.startsWith(h)?s:`${h}${s}`,t=document.getElementById(e);return t&&t.parentNode?(t.parentNode.removeChild(t),!0):!1}function j(s,e){if(!s||!s.dataset)return;let t=s.getAttribute(R)||"";t.includes(e)||s.setAttribute(R,t?`${t} ${e}`:e)}function q(s,e){if(!s||!s.getAttribute)return!1;let t=s.getAttribute(R);return!!(t&&t.includes(e))}function p(s){if(typeof MutationObserver>"u")return null;let{target:e=typeof document<"u"?document.body:null,config:t={childList:!0,subtree:!0},filter:i=null,onBatch:n=()=>{},debounceMs:r=60}=s;if(!e)return null;let c=[],d=null,u=null,x=!1,F=()=>{if(c.length===0)return;let y=c;c=[],x=!0;try{n(y)}catch(f){console.warn("[itzTikTokOptimizer] Batched observer error:",f)}finally{x=!1}},k=new MutationObserver(y=>{if(!x){for(let f=0;f<y.length;f++){let m=y[f];m.target&&m.target.id&&m.target.id.startsWith(h)||m.target&&m.target.getAttribute&&m.target.getAttribute("data-itz-source")||i&&!i(m)||c.push(m)}c.length>0&&(r>0?u||(u=setTimeout(()=>{u=null,F()},r)):d||(d=requestAnimationFrame(()=>{d=null,F()})))}});return k.observe(e,t),{observer:k,disconnect:()=>{u&&clearTimeout(u),d&&cancelAnimationFrame(d),k.disconnect(),c=[]}}}var a=class{constructor(e,t){this.id=e,this.name=t,this.enabled=!1,this.initialized=!1,this.options={},this.styleId=`itz-mod-${e}`,this.observers=[],this.eventListeners=[],this.cleanupTasks=[]}async init(e){this.initialized=!0,this.options=e[this.id.replace("Optimization","Options")]||{}}async enable(e){if(!this.enabled){this.enabled=!0,this.options=e[this.id.replace("Optimization","Options")]||{};try{await this.onEnable(e)}catch(t){console.error(`[itzTikTokOptimizer] Error enabling module ${this.name}:`,t)}}}async disable(){if(this.enabled){this.enabled=!1;try{await this.onDisable()}catch(e){console.error(`[itzTikTokOptimizer] Error disabling module ${this.name}:`,e)}finally{this.teardownResources()}}}async updateOptions(e){this.options={...this.options,...e},this.enabled&&await this.onOptionsUpdated(this.options)}async onEnable(e){}async onDisable(){}async onOptionsUpdated(e){}onNavigate(e){}injectCSS(e){return V(this.styleId,e)}removeCSS(){return U(this.styleId)}registerObserver(e){return e&&this.observers.push(e),e}registerListener(e,t,i,n=!1){e&&e.addEventListener&&(e.addEventListener(t,i,n),this.eventListeners.push({target:e,type:t,handler:i,options:n}))}registerCleanup(e){typeof e=="function"&&this.cleanupTasks.push(e)}teardownResources(){for(let e of this.observers)try{typeof e.disconnect=="function"&&e.disconnect()}catch(t){console.warn(`[itzTikTokOptimizer] Observer cleanup error in ${this.id}:`,t)}this.observers=[];for(let e of this.eventListeners)try{e.target.removeEventListener(e.type,e.handler,e.options)}catch(t){console.warn(`[itzTikTokOptimizer] Listener cleanup error in ${this.id}:`,t)}this.eventListeners=[],this.removeCSS();for(let e of this.cleanupTasks)try{e()}catch(t){console.warn(`[itzTikTokOptimizer] Cleanup task error in ${this.id}:`,t)}this.cleanupTasks=[]}destroy(){this.disable(),this.initialized=!1}},b=class{constructor(){this.modules=new Map,this.currentSettings=null,this.isMasterActive=!0}register(e){return this.modules.set(e.id,e),this}getModule(e){return this.modules.get(e)}getAllModules(){return Array.from(this.modules.values())}async initAll(e){this.currentSettings=e,this.isMasterActive=!!e.masterEnabled;for(let t of this.modules.values())try{await t.init(e),this.isMasterActive&&e[t.id]&&await t.enable(e)}catch(i){console.error(`[itzTikTokOptimizer] Failed initializing module ${t.id}:`,i)}}async syncSettings(e){let t=this.currentSettings||{};this.currentSettings=e;let i=t.masterEnabled!==e.masterEnabled;if(this.isMasterActive=!!e.masterEnabled,!this.isMasterActive){for(let n of this.modules.values())n.enabled&&await n.disable();return}for(let n of this.modules.values()){let r=!!e[n.id];if(i&&r&&!n.enabled)await n.enable(e);else if(!i){if(r&&!n.enabled)await n.enable(e);else if(!r&&n.enabled)await n.disable();else if(r&&n.enabled){let c=n.id.replace("Optimization","Options"),d=JSON.stringify(t[c]||{}),u=JSON.stringify(e[c]||{});d!==u&&await n.updateOptions(e[c]||{})}}}}notifyNavigation(e){if(this.isMasterActive){for(let t of this.modules.values())if(t.enabled&&typeof t.onNavigate=="function")try{t.onNavigate(e)}catch(i){console.warn(`[itzTikTokOptimizer] Navigation handler error in ${t.id}:`,i)}}}getDiagnosticsSummary(){let e={};for(let t of this.modules.values())e[t.id]={name:t.name,enabled:t.enabled,activeObservers:t.observers.length,activeListeners:t.eventListeners.length};return e}};var v="itz_tiktok_optimizer_settings";var _={GET_SETTINGS:"GET_SETTINGS",SETTINGS_UPDATED:"SETTINGS_UPDATED",TOGGLE_MODULE:"TOGGLE_MODULE",TOGGLE_MASTER:"TOGGLE_MASTER",ENABLE_ALL:"ENABLE_ALL",DISABLE_ALL:"DISABLE_ALL",RESET_DEFAULTS:"RESET_DEFAULTS",GET_DIAGNOSTICS:"GET_DIAGNOSTICS",DIAGNOSTICS_RESPONSE:"DIAGNOSTICS_RESPONSE",PAGE_NAVIGATED:"PAGE_NAVIGATED"},l={FEED:"feed",MESSAGES:"messages",NOTIFICATIONS:"notifications",LIVE:"live",SERIES:"series",PROFILE:"profile",VIDEO:"video",EXPLORE:"explore",UNKNOWN:"unknown"},o={MESSAGING:"messagingOptimization",NOTIFICATIONS:"notificationOptimization",FEED:"feedOptimization",LIVE_REMOVAL:"liveRemoval",DRAMA_REMOVAL:"dramaRemoval",MEDIA:"mediaOptimization",ANIMATIONS:"animationReduction",INTERFACE_CLEANUP:"interfaceCleanup",BACKGROUND_ACTIVITY:"backgroundActivityOptimization",DIAGNOSTICS:"performanceDiagnostics"};var B=l.UNKNOWN,g="",G=new Set,H=!1;function W(s){return!s||s==="/"||s==="/foryou"||s==="/following"?l.FEED:s.startsWith("/messages")?l.MESSAGES:s.startsWith("/live")?l.LIVE:s.startsWith("/series")||s.startsWith("/drama")?l.SERIES:s.startsWith("/explore")?l.EXPLORE:s.startsWith("/@")&&!s.includes("/video/")?l.PROFILE:s.includes("/video/")?l.VIDEO:l.FEED}function S(){let s=window.location.pathname;if(s===g)return;g=s;let e=W(s),t=B;B=e;for(let i of G)try{i({route:e,previousRoute:t,pathname:s})}catch(n){console.warn("[itzTikTokOptimizer] Route listener error:",n)}}function $(){if(H||typeof window>"u")return;H=!0,g=window.location.pathname,B=W(g);let s=window.history.pushState;window.history.pushState=function(...t){let i=s.apply(this,t);return setTimeout(S,0),i};let e=window.history.replaceState;window.history.replaceState=function(...t){let i=e.apply(this,t);return setTimeout(S,0),i},window.addEventListener("popstate",S),window.addEventListener("hashchange",S)}function J(s){return G.add(s),()=>G.delete(s)}var ee=Object.freeze({masterEnabled:!0,messagingOptimization:!0,messagingOptions:{virtualizeList:!0,deferInboxInit:!0,reducePreviewProcessing:!0},notificationOptimization:!0,notificationOptions:{deferPopoverRender:!0,suppressBadgeAnimation:!0},feedOptimization:!0,feedOptions:{virtualizeFeed:!0,containLayout:!0,throttleScrollWork:!0},liveRemoval:!0,liveOptions:{hideNavEntry:!0,suppressFeedCards:!0,suppressPromos:!0},dramaRemoval:!0,dramaOptions:{hideSeriesCards:!0,hideSeriesNav:!0,hideDramaPromos:!0},mediaOptimization:!0,mediaOptions:{pauseOffscreenVideo:!0,suppressPromoAutoplay:!0},animationReduction:!0,animationOptions:{reduceDecorative:!0,respectReducedMotion:!0},interfaceCleanup:!0,interfaceOptions:{hideAppDownloadBanner:!0,hideFloatingFeedback:!0,hideQrCodePrompts:!0},backgroundActivityOptimization:!0,backgroundOptions:{throttleWhenHidden:!0,pauseMediaOnHidden:!1},performanceDiagnostics:!1,diagnosticsOptions:{measureMutations:!0,measureDomNodes:!0,logToConsole:!1}});function K(){return JSON.parse(JSON.stringify(ee))}var P=null;function Y(s,e){if(!e||typeof e!="object")return JSON.parse(JSON.stringify(s));let t={...s};for(let i of Object.keys(s))e[i]===void 0?t[i]=JSON.parse(JSON.stringify(s[i])):typeof s[i]=="object"&&s[i]!==null&&!Array.isArray(s[i])?t[i]={...s[i],...typeof e[i]=="object"&&e[i]!==null?e[i]:{}}:t[i]=e[i];return t}async function X(){let s=K();if(typeof chrome<"u"&&chrome.storage&&chrome.storage.local)try{let t=(await chrome.storage.local.get([v]))[v];return Y(s,t)}catch(e){console.warn("[itzTikTokOptimizer] Error reading chrome.storage:",e)}return P?Y(s,P):(P=s,s)}function Q(s){if(typeof chrome<"u"&&chrome.storage&&chrome.storage.onChanged){let e=(t,i)=>{i==="local"&&t[v]&&s(t[v].newValue)};return chrome.storage.onChanged.addListener(e),()=>chrome.storage.onChanged.removeListener(e)}return()=>{}}var E=class extends a{constructor(){super(o.MESSAGING,"Messaging Optimization"),this.isChatRoute=!1,this.listObserver=null}async onEnable(e){this.applyMessagingStyles(),this.updateRouteState(window.location.pathname.startsWith("/messages"))}async onDisable(){this.removeCSS(),this.listObserver&&(this.listObserver.disconnect(),this.listObserver=null)}onNavigate(e){if(!this.enabled)return;let t=e.route===l.MESSAGES||e.pathname.startsWith("/messages");this.updateRouteState(t)}updateRouteState(e){this.isChatRoute=e,this.applyMessagingStyles(),e?this.attachScopedChatObserver():this.listObserver&&(this.listObserver.disconnect(),this.listObserver=null)}applyMessagingStyles(){if(!this.enabled)return;let e=`
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
      `),this.injectCSS(e)}attachScopedChatObserver(){if(this.listObserver)return;let e=document.querySelector('div[data-e2e="chat-list"], div[class*="ChatList"], div[class*="ConversationList"]');if(e)this.listObserver=p({target:e,config:{childList:!0,subtree:!1},debounceMs:100,onBatch:t=>{let i=e.querySelectorAll('div[data-e2e="chat-item"]');for(let n=0;n<i.length;n++){let r=i[n];q(r,"msg-opt")||j(r,"msg-opt")}}}),this.listObserver&&this.registerObserver(this.listObserver);else{let t=p({target:document.body,config:{childList:!0,subtree:!0},debounceMs:200,filter:i=>i.addedNodes.length>0,onBatch:()=>{if(!this.isChatRoute||this.listObserver)return;document.querySelector('div[data-e2e="chat-list"], div[class*="ChatList"]')&&(t.disconnect(),this.attachScopedChatObserver())}});t&&this.registerObserver(t)}}};var O=class extends a{constructor(){super(o.NOTIFICATIONS,"Notification Optimization"),this.isPanelOpen=!1}async onEnable(e){this.applyNotificationStyles(),this.setupPanelListeners()}async onDisable(){this.removeCSS()}setupPanelListeners(){let e=t=>{t.target.closest('div[data-e2e="inbox-icon"], button[aria-label*="Inbox" i], button[aria-label*="Notification" i]')&&(this.isPanelOpen=!this.isPanelOpen,this.applyNotificationStyles())};this.registerListener(document,"click",e,{capture:!0,passive:!0})}applyNotificationStyles(){if(!this.enabled)return;let e=`
      /* 1. Notification Items Layout Containment & Virtualization */
      div[data-e2e="inbox-item"],
      div[class*="InboxItem"],
      div[class*="NotificationItem"] {
        content-visibility: auto;
        contain-intrinsic-size: 64px;
        contain: layout style;
      }

      /* 2. Badge keyframe animation suppression */
      /* Keeps the count and red dot visible, but removes the 60fps continuous pulse */
      sup[data-e2e="inbox-badge"],
      div[data-e2e="inbox-icon"] sup,
      span[class*="BadgePulse"],
      div[class*="BadgeWrapper"] span[class*="pulse"] {
        animation: none !important;
        transition: none !important;
      }
    `;this.options.deferPopoverRender!==!1&&!this.isPanelOpen&&(e+=`
        /* Defer closed notification popover rendering until opened */
        div[data-e2e="inbox-panel"]:not([data-opened="true"]):not(:hover),
        div[class*="NotificationPopover"]:not([class*="show"]):not([class*="open"]):not(:hover) {
          content-visibility: hidden;
          contain: strict;
        }
      `),this.injectCSS(e)}};var A=class extends a{constructor(){super(o.FEED,"Feed Optimization"),this.isFeedRoute=!0}async onEnable(e){this.applyFeedStyles()}async onDisable(){this.removeCSS()}onNavigate(e){this.enabled&&(this.isFeedRoute=e.route===l.FEED,this.isFeedRoute&&this.applyFeedStyles())}applyFeedStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `)}};var T="itz-hidden-live-content",D=class extends a{constructor(){super(o.LIVE_REMOVAL,"Live Content Removal"),this.observer=null}async onEnable(e){this.applyLiveStyles(),this.scanAndSuppressLiveElements(),this.setupLiveObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.restoreSuppressedElements()}applyLiveStyles(){if(!this.enabled)return;let e=`
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
      .${T} {
        display: none !important;
      }
    `;this.injectCSS(e)}isLiveElement(e){return!e||e.nodeType!==1?!1:!!(e.getAttribute&&e.getAttribute("data-e2e")==="live-card"||e.querySelector&&e.querySelector('a[href*="/live"]')||e.querySelector&&e.querySelector('[data-e2e="live-badge"], span[class*="LiveBadge"]'))}scanAndSuppressLiveElements(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]');for(let i=0;i<t.length;i++){let n=t[i];this.isLiveElement(n)&&n.classList.add(T)}}setupLiveObserver(){this.observer||(this.observer=p({target:document.body,config:{childList:!0,subtree:!0},debounceMs:80,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let n=0;n<i.addedNodes.length;n++){let r=i.addedNodes[n];r.nodeType===1&&this.scanAndSuppressLiveElements(r)}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){let e=document.querySelectorAll(`.${T}`);for(let t=0;t<e.length;t++)e[t].classList.remove(T)}};var L="itz-hidden-drama-content",I=class extends a{constructor(){super(o.DRAMA_REMOVAL,"Short Drama Removal"),this.observer=null}async onEnable(e){this.applyDramaStyles(),this.scanAndSuppressDramaElements(),this.setupDramaObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.restoreSuppressedElements()}applyDramaStyles(){if(!this.enabled)return;let e=`
      /* 1. Series/Drama Navigation & Banners */
      a[href*="/series/"],
      a[href*="/drama/"],
      div[data-e2e="series-side-nav"],
      div[data-e2e="drama-banner"],
      div[class*="SeriesPromoContainer"],
      div[class*="DramaBanner"] {
        display: none !important;
      }

      /* 2. Feed cards with drama / series links via :has() */
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/series/"]),
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/drama/"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e="series-card"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e="drama-card"]),
      div[data-e2e="series-card"],
      div[data-e2e="drama-card"] {
        display: none !important;
      }

      /* 3. Class-based fallback */
      .${L} {
        display: none !important;
      }
    `;this.injectCSS(e)}isDramaElement(e){return!e||e.nodeType!==1?!1:!!(e.getAttribute&&(e.getAttribute("data-e2e")==="series-card"||e.getAttribute("data-e2e")==="drama-card")||e.querySelector&&e.querySelector('a[href*="/series/"], a[href*="/drama/"]'))}scanAndSuppressDramaElements(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]');for(let i=0;i<t.length;i++){let n=t[i];this.isDramaElement(n)&&n.classList.add(L)}}setupDramaObserver(){this.observer||(this.observer=p({target:document.body,config:{childList:!0,subtree:!0},debounceMs:80,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let n=0;n<i.addedNodes.length;n++){let r=i.addedNodes[n];r.nodeType===1&&this.scanAndSuppressDramaElements(r)}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){let e=document.querySelectorAll(`.${L}`);for(let t=0;t<e.length;t++)e[t].classList.remove(L)}};var C=class extends a{constructor(){super(o.MEDIA,"Media Optimization"),this.mediaObserver=null,this.trackedVideos=new WeakSet}async onEnable(e){this.applyMediaStyles(),this.setupVideoObserver()}async onDisable(){this.removeCSS(),this.mediaObserver&&(this.mediaObserver.disconnect(),this.mediaObserver=null)}applyMediaStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `)}setupVideoObserver(){this.mediaObserver||typeof IntersectionObserver>"u"||this.options.pauseOffscreenVideo!==!1&&(this.mediaObserver=new IntersectionObserver(e=>{for(let t=0;t<e.length;t++){let i=e[t],n=i.target;document.fullscreenElement===n||n.closest(":fullscreen")||(!i.isIntersecting||i.intersectionRatio<.05?!n.paused&&!n.ended&&(n.dataset.itzOffscreenPaused="true",n.pause()):i.intersectionRatio>=.5&&n.dataset.itzOffscreenPaused==="true"&&(delete n.dataset.itzOffscreenPaused,n.play().catch(()=>{})))}},{threshold:[0,.5]}),this.registerObserver(this.mediaObserver),this.observeExistingVideos())}observeExistingVideos(){if(!this.mediaObserver)return;let e=document.querySelectorAll("video");for(let t=0;t<e.length;t++){let i=e[t];this.trackedVideos.has(i)||(this.trackedVideos.add(i),this.mediaObserver.observe(i))}}};var N=class extends a{constructor(){super(o.ANIMATIONS,"Animation Reduction")}async onEnable(e){this.applyAnimationStyles()}async onDisable(){this.removeCSS()}applyAnimationStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `)}};var M=class extends a{constructor(){super(o.INTERFACE_CLEANUP,"Interface Cleanup")}async onEnable(e){this.applyCleanupStyles()}async onDisable(){this.removeCSS()}applyCleanupStyles(){if(!this.enabled)return;this.injectCSS(`
      /* 1. "Get App" / Desktop Download Banners & Sticky Bars */
      div[data-e2e="download-guide-container"],
      div[data-e2e="download-app-banner"],
      div[class*="DivDownloadGuide"],
      div[class*="DivAppDownloadBanner"],
      div[class*="DownloadButtonContainer"],
      a[href*="/download-app"],
      a[data-e2e="nav-download"] {
        display: none !important;
      }

      /* 2. Floating Feedback & Survey Widgets */
      div[data-e2e="feedback-bubble"],
      div[class*="DivFeedbackContainer"],
      div[class*="DivSurveyPrompt"],
      button[aria-label*="Feedback" i] {
        display: none !important;
      }

      /* 3. QR Code Download Modals and Flyouts */
      div[data-e2e="qr-code-container"],
      div[class*="DivQrCodeContainer"],
      div[class*="AppQrCodeModal"] {
        display: none !important;
      }

      /* 4. Non-essential promotional banners */
      div[data-e2e="banner-container"],
      div[class*="DivBannerWrapper"] {
        display: none !important;
      }
    `)}};var w=class extends a{constructor(){super(o.BACKGROUND_ACTIVITY,"Background Activity Optimization"),this.visibilityHandler=null}async onEnable(e){this.setupVisibilityListener(),document.hidden&&this.handleTabHidden()}async onDisable(){this.removeCSS(),this.handleTabVisible()}setupVisibilityListener(){this.visibilityHandler=()=>{this.enabled&&(document.hidden?this.handleTabHidden():this.handleTabVisible())},this.registerListener(document,"visibilitychange",this.visibilityHandler)}handleTabHidden(){if(this.options.throttleWhenHidden===!1)return;if(this.injectCSS(`
      * {
        animation-play-state: paused !important;
      }
    `),this.options.pauseMediaOnHidden){let t=document.querySelectorAll("video");for(let i=0;i<t.length;i++){let n=t[i];!n.paused&&!n.ended&&(n.dataset.itzBgPaused="true",n.pause())}}}handleTabVisible(){if(this.removeCSS(),this.options.pauseMediaOnHidden){let e=document.querySelectorAll('video[data-itz-bg-paused="true"]');for(let t=0;t<e.length;t++){let i=e[t];delete i.dataset.itzBgPaused,i.play().catch(()=>{})}}}};var z=class extends a{constructor(e){super(o.DIAGNOSTICS,"Performance Diagnostics"),this.lifecycleManager=e,this.startTime=Date.now()}async onEnable(e){}async onDisable(){}collectSnapshot(){let e=typeof document<"u"?document.getElementsByTagName("*").length:0,t=typeof performance<"u"&&performance.memory?{usedHeapMB:(performance.memory.usedJSHeapSize/(1024*1024)).toFixed(2),totalHeapMB:(performance.memory.totalJSHeapSize/(1024*1024)).toFixed(2),heapLimitMB:(performance.memory.jsHeapSizeLimit/(1024*1024)).toFixed(2)}:null,i=null;if(typeof performance<"u"&&performance.getEntriesByType){let d=performance.getEntriesByType("paint");if(d&&d.length>0){i={};for(let u of d)i[u.name]=`${Math.round(u.startTime)}ms`}}let n=this.lifecycleManager?this.lifecycleManager.getDiagnosticsSummary():{},r=0,c=0;for(let d of Object.values(n))r+=d.activeObservers||0,c+=d.activeListeners||0;return{timestamp:new Date().toISOString(),url:typeof window<"u"?window.location.pathname:"",dom:{totalNodes:e,status:e>3e3?"High (>3000 nodes)":e>1500?"Moderate":"Optimal"},memory:t,paintMilestones:i,optimizerStats:{totalActiveObservers:r,totalActiveListeners:c,modules:n}}}};async function Z(){let s=new b;s.register(new E),s.register(new O),s.register(new A),s.register(new D),s.register(new I),s.register(new C),s.register(new N),s.register(new M),s.register(new w);let e=new z(s);s.register(e),$(),J(i=>{s.notifyNavigation(i)});let t=await X();await s.initAll(t),Q(i=>{s.syncSettings(i)}),typeof chrome<"u"&&chrome.runtime&&chrome.runtime.onMessage&&chrome.runtime.onMessage.addListener((i,n,r)=>{if(!i||!i.type)return!1;if(i.type===_.GET_DIAGNOSTICS){let c=e.collectSnapshot();return r({success:!0,diagnostics:c}),!0}return i.type===_.SETTINGS_UPDATED?(s.syncSettings(i.settings),r({success:!0}),!0):!1}),console.log("%c itzTikTok Optimizer %c Active & Performance Engine Running %c https://itzcrih.it ","background: #e6b422; color: #090b0e; font-weight: bold; padding: 2px 6px; border-radius: 3px 0 0 3px;","background: #121720; color: #eef2ff; padding: 2px 6px;","background: #090b0e; color: #8292a8; font-size: 10px; padding: 2px 6px; border-radius: 0 3px 3px 0;")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Z):Z();})();
