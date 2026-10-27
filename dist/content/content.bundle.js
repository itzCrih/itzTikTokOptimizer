(()=>{var g="itz-opt-style-",B="data-itz-optimized";function U(s,e){if(typeof document>"u")return null;let t=s.startsWith(g)?s:`${g}${s}`,i=document.getElementById(t);if(!i){i=document.createElement("style"),i.id=t,i.setAttribute("type","text/css"),i.setAttribute("data-itz-source","itzTikTokOptimizer");let r=document.head||document.documentElement;r&&r.appendChild(i)}return i.textContent!==e&&(i.textContent=e),i}function W(s){if(typeof document>"u")return!1;let e=s.startsWith(g)?s:`${g}${s}`,t=document.getElementById(e);return t&&t.parentNode?(t.parentNode.removeChild(t),!0):!1}function q(s,e){if(!s||!s.dataset)return;let t=s.getAttribute(B)||"";t.includes(e)||s.setAttribute(B,t?`${t} ${e}`:e)}function j(s,e){if(!s||!s.getAttribute)return!1;let t=s.getAttribute(B);return!!(t&&t.includes(e))}function p(s){if(typeof MutationObserver>"u")return null;let{target:e=typeof document<"u"?document.body:null,config:t={childList:!0,subtree:!0},filter:i=null,onBatch:r=()=>{},debounceMs:n=60}=s;if(!e)return null;let d=[],l=null,u=null,h=!1,f=()=>{if(d.length===0)return;let S=d;d=[],h=!0;try{r(S)}catch(b){console.warn("[itzTikTokOptimizer] Batched observer error:",b)}finally{h=!1}},_=new MutationObserver(S=>{if(!h){for(let b=0;b<S.length;b++){let m=S[b];m.target&&m.target.id&&m.target.id.startsWith(g)||m.target&&m.target.getAttribute&&m.target.getAttribute("data-itz-source")||i&&!i(m)||d.push(m)}d.length>0&&(n>0?u||(u=setTimeout(()=>{u=null,f()},n)):l||(l=requestAnimationFrame(()=>{l=null,f()})))}});return _.observe(e,t),{observer:_,disconnect:()=>{u&&clearTimeout(u),l&&cancelAnimationFrame(l),_.disconnect(),d=[]}}}var a=class{constructor(e,t){this.id=e,this.name=t,this.enabled=!1,this.initialized=!1,this.options={},this.styleId=`itz-mod-${e}`,this.observers=[],this.eventListeners=[],this.cleanupTasks=[]}async init(e){this.initialized=!0,this.options=e[this.id.replace("Optimization","Options")]||{}}async enable(e){if(!this.enabled){this.enabled=!0,this.options=e[this.id.replace("Optimization","Options")]||{};try{await this.onEnable(e)}catch(t){console.error(`[itzTikTokOptimizer] Error enabling module ${this.name}:`,t)}}}async disable(){if(this.enabled){this.enabled=!1;try{await this.onDisable()}catch(e){console.error(`[itzTikTokOptimizer] Error disabling module ${this.name}:`,e)}finally{this.teardownResources()}}}async updateOptions(e){this.options={...this.options,...e},this.enabled&&await this.onOptionsUpdated(this.options)}async onEnable(e){}async onDisable(){}async onOptionsUpdated(e){}onNavigate(e){}injectCSS(e){return U(this.styleId,e)}removeCSS(){return W(this.styleId)}registerObserver(e){return e&&this.observers.push(e),e}registerListener(e,t,i,r=!1){e&&e.addEventListener&&(e.addEventListener(t,i,r),this.eventListeners.push({target:e,type:t,handler:i,options:r}))}registerCleanup(e){typeof e=="function"&&this.cleanupTasks.push(e)}teardownResources(){for(let e of this.observers)try{typeof e.disconnect=="function"&&e.disconnect()}catch(t){console.warn(`[itzTikTokOptimizer] Observer cleanup error in ${this.id}:`,t)}this.observers=[];for(let e of this.eventListeners)try{e.target.removeEventListener(e.type,e.handler,e.options)}catch(t){console.warn(`[itzTikTokOptimizer] Listener cleanup error in ${this.id}:`,t)}this.eventListeners=[],this.removeCSS();for(let e of this.cleanupTasks)try{e()}catch(t){console.warn(`[itzTikTokOptimizer] Cleanup task error in ${this.id}:`,t)}this.cleanupTasks=[]}destroy(){this.disable(),this.initialized=!1}},E=class{constructor(){this.modules=new Map,this.currentSettings=null,this.isMasterActive=!0}register(e){return this.modules.set(e.id,e),this}getModule(e){return this.modules.get(e)}getAllModules(){return Array.from(this.modules.values())}async initAll(e){this.currentSettings=e,this.isMasterActive=!!e.masterEnabled;for(let t of this.modules.values())try{await t.init(e),this.isMasterActive&&e[t.id]&&await t.enable(e)}catch(i){console.error(`[itzTikTokOptimizer] Failed initializing module ${t.id}:`,i)}}async syncSettings(e){let t=this.currentSettings||{};this.currentSettings=e;let i=t.masterEnabled!==e.masterEnabled;if(this.isMasterActive=!!e.masterEnabled,!this.isMasterActive){for(let r of this.modules.values())r.enabled&&await r.disable();return}for(let r of this.modules.values()){let n=!!e[r.id];if(i&&n&&!r.enabled)await r.enable(e);else if(!i){if(n&&!r.enabled)await r.enable(e);else if(!n&&r.enabled)await r.disable();else if(n&&r.enabled){let d=r.id.replace("Optimization","Options"),l=JSON.stringify(t[d]||{}),u=JSON.stringify(e[d]||{});l!==u&&await r.updateOptions(e[d]||{})}}}}notifyNavigation(e){if(this.isMasterActive){for(let t of this.modules.values())if(t.enabled&&typeof t.onNavigate=="function")try{t.onNavigate(e)}catch(i){console.warn(`[itzTikTokOptimizer] Navigation handler error in ${t.id}:`,i)}}}getDiagnosticsSummary(){let e={};for(let t of this.modules.values())e[t.id]={name:t.name,enabled:t.enabled,activeObservers:t.observers.length,activeListeners:t.eventListeners.length};return e}};var y="itz_tiktok_optimizer_settings";var G={GET_SETTINGS:"GET_SETTINGS",SETTINGS_UPDATED:"SETTINGS_UPDATED",TOGGLE_MODULE:"TOGGLE_MODULE",TOGGLE_MASTER:"TOGGLE_MASTER",ENABLE_ALL:"ENABLE_ALL",DISABLE_ALL:"DISABLE_ALL",RESET_DEFAULTS:"RESET_DEFAULTS",GET_DIAGNOSTICS:"GET_DIAGNOSTICS",DIAGNOSTICS_RESPONSE:"DIAGNOSTICS_RESPONSE",PAGE_NAVIGATED:"PAGE_NAVIGATED"},c={FEED:"feed",MESSAGES:"messages",NOTIFICATIONS:"notifications",LIVE:"live",SERIES:"series",PROFILE:"profile",VIDEO:"video",EXPLORE:"explore",UNKNOWN:"unknown"},o={MESSAGING:"messagingOptimization",NOTIFICATIONS:"notificationOptimization",FEED:"feedOptimization",LIVE_REMOVAL:"liveRemoval",DRAMA_REMOVAL:"dramaRemoval",MEDIA:"mediaOptimization",ANIMATIONS:"animationReduction",INTERFACE_CLEANUP:"interfaceCleanup",BACKGROUND_ACTIVITY:"backgroundActivityOptimization",DIAGNOSTICS:"performanceDiagnostics"};var P=c.UNKNOWN,A="",F=new Set,H=!1;function $(s){return!s||s==="/"||s==="/foryou"||s==="/following"?c.FEED:s.startsWith("/messages")?c.MESSAGES:s.startsWith("/live")?c.LIVE:s.startsWith("/series")||s.startsWith("/drama")||s.startsWith("/shortdrama")||s.startsWith("/short-drama")?c.SERIES:s.startsWith("/explore")?c.EXPLORE:s.startsWith("/@")&&!s.includes("/video/")?c.PROFILE:s.includes("/video/")?c.VIDEO:c.FEED}function O(){let s=window.location.pathname;if(s===A)return;A=s;let e=$(s),t=P;P=e;for(let i of F)try{i({route:e,previousRoute:t,pathname:s})}catch(r){console.warn("[itzTikTokOptimizer] Route listener error:",r)}}function J(){if(H||typeof window>"u")return;H=!0,A=window.location.pathname,P=$(A);let s=window.history.pushState;window.history.pushState=function(...t){let i=s.apply(this,t);return setTimeout(O,0),i};let e=window.history.replaceState;window.history.replaceState=function(...t){let i=e.apply(this,t);return setTimeout(O,0),i},window.addEventListener("popstate",O),window.addEventListener("hashchange",O)}function Y(s){return F.add(s),()=>F.delete(s)}var te=Object.freeze({masterEnabled:!0,messagingOptimization:!0,messagingOptions:{virtualizeList:!0,deferInboxInit:!0,reducePreviewProcessing:!0},notificationOptimization:!0,notificationOptions:{deferPopoverRender:!0,suppressBadgeAnimation:!0},feedOptimization:!0,feedOptions:{virtualizeFeed:!0,containLayout:!0,throttleScrollWork:!0},liveRemoval:!0,liveOptions:{hideNavEntry:!0,suppressFeedCards:!0,suppressPromos:!0},dramaRemoval:!0,dramaOptions:{hideSeriesCards:!0,hideSeriesNav:!0,hideDramaPromos:!0},mediaOptimization:!0,mediaOptions:{pauseOffscreenVideo:!0,suppressPromoAutoplay:!0},animationReduction:!0,animationOptions:{reduceDecorative:!0,respectReducedMotion:!0},interfaceCleanup:!0,interfaceOptions:{hideAppDownloadBanner:!0,hideFloatingFeedback:!0,hideQrCodePrompts:!0},backgroundActivityOptimization:!0,backgroundOptions:{throttleWhenHidden:!0,pauseMediaOnHidden:!1},performanceDiagnostics:!1,diagnosticsOptions:{measureMutations:!0,measureDomNodes:!0,logToConsole:!1}});function K(){return JSON.parse(JSON.stringify(te))}var V=null;function X(s,e){if(!e||typeof e!="object")return JSON.parse(JSON.stringify(s));let t={...s};for(let i of Object.keys(s))e[i]===void 0?t[i]=JSON.parse(JSON.stringify(s[i])):typeof s[i]=="object"&&s[i]!==null&&!Array.isArray(s[i])?t[i]={...s[i],...typeof e[i]=="object"&&e[i]!==null?e[i]:{}}:t[i]=e[i];return t}async function Q(){let s=K();if(typeof chrome<"u"&&chrome.storage&&chrome.storage.local)try{let t=(await chrome.storage.local.get([y]))[y];return X(s,t)}catch(e){console.warn("[itzTikTokOptimizer] Error reading chrome.storage:",e)}return V?X(s,V):(V=s,s)}function Z(s){if(typeof chrome<"u"&&chrome.storage&&chrome.storage.onChanged){let e=(t,i)=>{i==="local"&&t[y]&&s(t[y].newValue)};return chrome.storage.onChanged.addListener(e),()=>chrome.storage.onChanged.removeListener(e)}return()=>{}}var D=class extends a{constructor(){super(o.MESSAGING,"Messaging Optimization"),this.isChatRoute=!1,this.listObserver=null}async onEnable(e){this.applyMessagingStyles(),this.updateRouteState(window.location.pathname.startsWith("/messages"))}async onDisable(){this.removeCSS(),this.listObserver&&(this.listObserver.disconnect(),this.listObserver=null)}onNavigate(e){if(!this.enabled)return;let t=e.route===c.MESSAGES||e.pathname.startsWith("/messages");this.updateRouteState(t)}updateRouteState(e){this.isChatRoute=e,this.applyMessagingStyles(),e?this.attachScopedChatObserver():this.listObserver&&(this.listObserver.disconnect(),this.listObserver=null)}applyMessagingStyles(){if(!this.enabled)return;let e=`
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
      `),this.injectCSS(e)}attachScopedChatObserver(){if(this.listObserver)return;let e=document.querySelector('div[data-e2e="chat-list"], div[class*="ChatList"], div[class*="ConversationList"]');if(e)this.listObserver=p({target:e,config:{childList:!0,subtree:!1},debounceMs:100,onBatch:t=>{let i=e.querySelectorAll('div[data-e2e="chat-item"]');for(let r=0;r<i.length;r++){let n=i[r];j(n,"msg-opt")||q(n,"msg-opt")}}}),this.listObserver&&this.registerObserver(this.listObserver);else{let t=p({target:document.body,config:{childList:!0,subtree:!0},debounceMs:200,filter:i=>i.addedNodes.length>0,onBatch:()=>{if(!this.isChatRoute||this.listObserver)return;document.querySelector('div[data-e2e="chat-list"], div[class*="ChatList"]')&&(t.disconnect(),this.attachScopedChatObserver())}});t&&this.registerObserver(t)}}};var L=class extends a{constructor(){super(o.NOTIFICATIONS,"Notification Optimization"),this.isPanelOpen=!1}async onEnable(e){this.applyNotificationStyles(),this.setupPanelListeners()}async onDisable(){this.removeCSS()}setupPanelListeners(){let e=t=>{t.target.closest('div[data-e2e="inbox-icon"], button[aria-label*="Inbox" i], button[aria-label*="Notification" i]')&&(this.isPanelOpen=!this.isPanelOpen,this.applyNotificationStyles())};this.registerListener(document,"click",e,{capture:!0,passive:!0})}applyNotificationStyles(){if(!this.enabled)return;let e=`
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
      `),this.injectCSS(e)}};var T=class extends a{constructor(){super(o.FEED,"Feed Optimization"),this.isFeedRoute=!0}async onEnable(e){this.applyFeedStyles()}async onDisable(){this.removeCSS()}onNavigate(e){this.enabled&&(this.isFeedRoute=e.route===c.FEED,this.isFeedRoute&&this.applyFeedStyles())}applyFeedStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `)}};var C="itz-hidden-live-content",I=class extends a{constructor(){super(o.LIVE_REMOVAL,"Live Content Removal"),this.observer=null}async onEnable(e){this.applyLiveStyles(),this.scanAndSuppressLiveElements(),this.setupLiveObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.restoreSuppressedElements()}applyLiveStyles(){if(!this.enabled)return;let e=`
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
      .${C} {
        display: none !important;
      }
    `;this.injectCSS(e)}isLiveElement(e){return!e||e.nodeType!==1?!1:!!(e.getAttribute&&e.getAttribute("data-e2e")==="live-card"||e.querySelector&&e.querySelector('a[href*="/live"]')||e.querySelector&&e.querySelector('[data-e2e="live-badge"], span[class*="LiveBadge"]'))}scanAndSuppressLiveElements(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]');for(let i=0;i<t.length;i++){let r=t[i];this.isLiveElement(r)&&r.classList.add(C)}}setupLiveObserver(){this.observer||(this.observer=p({target:document.body,config:{childList:!0,subtree:!0},debounceMs:80,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let r=0;r<i.addedNodes.length;r++){let n=i.addedNodes[r];n.nodeType===1&&this.scanAndSuppressLiveElements(n)}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){let e=document.querySelectorAll(`.${C}`);for(let t=0;t<e.length;t++)e[t].classList.remove(C)}};var w="itz-hidden-drama-content",v="itz-hidden-drama-button",N=class extends a{constructor(){super(o.DRAMA_REMOVAL,"Short Drama Removal"),this.observer=null}async onEnable(e){if(this.isDramaUrl()){this.preventDramaPageLoading();return}this.applyDramaStyles(),this.suppressSidebarButton(),this.scanAndSuppressDramaElements(),this.setupDramaObserver()}async onDisable(){this.removeCSS(),this.observer&&(this.observer.disconnect(),this.observer=null),this.restoreSuppressedElements()}onNavigate(e){if(this.enabled){if(this.isDramaUrl(e.pathname)){this.preventDramaPageLoading();return}this.suppressSidebarButton(),this.scanAndSuppressDramaElements()}}isDramaUrl(e){let t=(e||(typeof window<"u"?window.location.pathname:"")).toLowerCase();return t.startsWith("/shortdrama")||t.startsWith("/short-drama")||t.startsWith("/series")||t.startsWith("/drama")}preventDramaPageLoading(){typeof window>"u"||(document&&document.documentElement&&(document.documentElement.style.display="none"),window.location.replace("/"))}applyDramaStyles(){if(!this.enabled)return;let e=`
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

      /* 2. Seamless scaling & layout organization of surviving sidebar buttons */
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
      .${w} {
        display: none !important;
      }
    `;this.injectCSS(e)}suppressSidebarButton(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('a, button, [role="button"], [role="link"]');for(let i=0;i<t.length;i++){let r=t[i],n=(r.getAttribute("href")||"").toLowerCase(),d=(r.textContent||"").trim().toLowerCase(),l=(r.getAttribute("data-e2e")||"").toLowerCase();if(n.includes("/shortdrama")||n.includes("/short-drama")||n.includes("/series")||n.includes("/drama")||l.includes("shortdrama")||l.includes("short-drama")||d==="short dramas"||d==="short drama"||d.startsWith("short drama")){r.classList.add(v);let h=r.closest('li, [role="listitem"]');if(h)h.classList.add(v);else if(r.parentElement&&r.parentElement!==document.body){let f=r.parentElement;(f.children.length===1||f.textContent.trim().toLowerCase()===d)&&f.classList.add(v)}}}}isDramaElement(e){return!e||e.nodeType!==1?!1:!!(e.getAttribute&&(e.getAttribute("data-e2e")==="series-card"||e.getAttribute("data-e2e")==="drama-card"||e.getAttribute("data-e2e")==="shortdrama-card"||e.getAttribute("data-e2e")&&e.getAttribute("data-e2e").includes("shortdrama"))||e.querySelector&&e.querySelector('a[href*="/shortdrama"], a[href*="/short-drama"], a[href*="/series/"], a[href*="/drama/"]'))}scanAndSuppressDramaElements(e=document){if(!e||!e.querySelectorAll)return;let t=e.querySelectorAll('div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]');for(let i=0;i<t.length;i++){let r=t[i];this.isDramaElement(r)&&r.classList.add(w)}}setupDramaObserver(){this.observer||(this.observer=p({target:document.body,config:{childList:!0,subtree:!0},debounceMs:60,filter:e=>e.addedNodes.length>0,onBatch:e=>{for(let t=0;t<e.length;t++){let i=e[t];for(let r=0;r<i.addedNodes.length;r++){let n=i.addedNodes[r];n.nodeType===1&&(this.suppressSidebarButton(n),this.scanAndSuppressDramaElements(n))}}}}),this.observer&&this.registerObserver(this.observer))}restoreSuppressedElements(){if(typeof document>"u")return;document.documentElement&&document.documentElement.style.display==="none"&&(document.documentElement.style.display="");let e=document.querySelectorAll(`.${w}`);for(let i=0;i<e.length;i++)e[i].classList.remove(w);let t=document.querySelectorAll(`.${v}`);for(let i=0;i<t.length;i++)t[i].classList.remove(v)}};var M=class extends a{constructor(){super(o.MEDIA,"Media Optimization"),this.mediaObserver=null,this.trackedVideos=new WeakSet}async onEnable(e){this.applyMediaStyles(),this.setupVideoObserver()}async onDisable(){this.removeCSS(),this.mediaObserver&&(this.mediaObserver.disconnect(),this.mediaObserver=null)}applyMediaStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `)}setupVideoObserver(){this.mediaObserver||typeof IntersectionObserver>"u"||this.options.pauseOffscreenVideo!==!1&&(this.mediaObserver=new IntersectionObserver(e=>{for(let t=0;t<e.length;t++){let i=e[t],r=i.target;document.fullscreenElement===r||r.closest(":fullscreen")||(!i.isIntersecting||i.intersectionRatio<.05?!r.paused&&!r.ended&&(r.dataset.itzOffscreenPaused="true",r.pause()):i.intersectionRatio>=.5&&r.dataset.itzOffscreenPaused==="true"&&(delete r.dataset.itzOffscreenPaused,r.play().catch(()=>{})))}},{threshold:[0,.5]}),this.registerObserver(this.mediaObserver),this.observeExistingVideos())}observeExistingVideos(){if(!this.mediaObserver)return;let e=document.querySelectorAll("video");for(let t=0;t<e.length;t++){let i=e[t];this.trackedVideos.has(i)||(this.trackedVideos.add(i),this.mediaObserver.observe(i))}}};var x=class extends a{constructor(){super(o.ANIMATIONS,"Animation Reduction")}async onEnable(e){this.applyAnimationStyles()}async onDisable(){this.removeCSS()}applyAnimationStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `)}};var z=class extends a{constructor(){super(o.INTERFACE_CLEANUP,"Interface Cleanup")}async onEnable(e){this.applyCleanupStyles()}async onDisable(){this.removeCSS()}applyCleanupStyles(){if(!this.enabled)return;this.injectCSS(`
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
    `)}};var k=class extends a{constructor(){super(o.BACKGROUND_ACTIVITY,"Background Activity Optimization"),this.visibilityHandler=null}async onEnable(e){this.setupVisibilityListener(),document.hidden&&this.handleTabHidden()}async onDisable(){this.removeCSS(),this.handleTabVisible()}setupVisibilityListener(){this.visibilityHandler=()=>{this.enabled&&(document.hidden?this.handleTabHidden():this.handleTabVisible())},this.registerListener(document,"visibilitychange",this.visibilityHandler)}handleTabHidden(){if(this.options.throttleWhenHidden===!1)return;if(this.injectCSS(`
      * {
        animation-play-state: paused !important;
      }
    `),this.options.pauseMediaOnHidden){let t=document.querySelectorAll("video");for(let i=0;i<t.length;i++){let r=t[i];!r.paused&&!r.ended&&(r.dataset.itzBgPaused="true",r.pause())}}}handleTabVisible(){if(this.removeCSS(),this.options.pauseMediaOnHidden){let e=document.querySelectorAll('video[data-itz-bg-paused="true"]');for(let t=0;t<e.length;t++){let i=e[t];delete i.dataset.itzBgPaused,i.play().catch(()=>{})}}}};var R=class extends a{constructor(e){super(o.DIAGNOSTICS,"Performance Diagnostics"),this.lifecycleManager=e,this.startTime=Date.now()}async onEnable(e){}async onDisable(){}collectSnapshot(){let e=typeof document<"u"?document.getElementsByTagName("*").length:0,t=typeof performance<"u"&&performance.memory?{usedHeapMB:(performance.memory.usedJSHeapSize/(1024*1024)).toFixed(2),totalHeapMB:(performance.memory.totalJSHeapSize/(1024*1024)).toFixed(2),heapLimitMB:(performance.memory.jsHeapSizeLimit/(1024*1024)).toFixed(2)}:null,i=null;if(typeof performance<"u"&&performance.getEntriesByType){let l=performance.getEntriesByType("paint");if(l&&l.length>0){i={};for(let u of l)i[u.name]=`${Math.round(u.startTime)}ms`}}let r=this.lifecycleManager?this.lifecycleManager.getDiagnosticsSummary():{},n=0,d=0;for(let l of Object.values(r))n+=l.activeObservers||0,d+=l.activeListeners||0;return{timestamp:new Date().toISOString(),url:typeof window<"u"?window.location.pathname:"",dom:{totalNodes:e,status:e>3e3?"High (>3000 nodes)":e>1500?"Moderate":"Optimal"},memory:t,paintMilestones:i,optimizerStats:{totalActiveObservers:n,totalActiveListeners:d,modules:r}}}};async function ee(){let s=new E;s.register(new D),s.register(new L),s.register(new T),s.register(new I),s.register(new N),s.register(new M),s.register(new x),s.register(new z),s.register(new k);let e=new R(s);s.register(e),J(),Y(i=>{s.notifyNavigation(i)});let t=await Q();await s.initAll(t),Z(i=>{s.syncSettings(i)}),typeof chrome<"u"&&chrome.runtime&&chrome.runtime.onMessage&&chrome.runtime.onMessage.addListener((i,r,n)=>{if(!i||!i.type)return!1;if(i.type===G.GET_DIAGNOSTICS){let d=e.collectSnapshot();return n({success:!0,diagnostics:d}),!0}return i.type===G.SETTINGS_UPDATED?(s.syncSettings(i.settings),n({success:!0}),!0):!1}),console.log("%c itzTikTok Optimizer %c Active & Performance Engine Running %c https://itzcrih.it ","background: #e6b422; color: #090b0e; font-weight: bold; padding: 2px 6px; border-radius: 3px 0 0 3px;","background: #121720; color: #eef2ff; padding: 2px 6px;","background: #090b0e; color: #8292a8; font-size: 10px; padding: 2px 6px; border-radius: 0 3px 3px 0;")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ee):ee();})();
