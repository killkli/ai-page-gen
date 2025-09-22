const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/gemini-service-BbqOGSh7.js","assets/ai-vendor-U8uTsjnZ.js","assets/vendor-5RHscoCd.js","assets/react-vendor-Bqsb6Ck2.js"])))=>i.map(i=>d[i]);
import{G as U}from"./ai-vendor-U8uTsjnZ.js";import{c as L}from"./gemini-service-BbqOGSh7.js";const V="modulepreload",W=function(s){return"/ai-page-gen/"+s},D={},I=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let a=function(d){return Promise.all(d.map(l=>Promise.resolve(l).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),c=o?.nonce||o?.getAttribute("nonce");r=a(t.map(d=>{if(d=W(d),d in D)return;D[d]=!0;const l=d.endsWith(".css"),p=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${p}`))return;const g=document.createElement("link");if(g.rel=l?"stylesheet":V,l||(g.as="script"),g.crossOrigin="",g.href=d,c&&g.setAttribute("nonce",c),document.head.appendChild(g),l)return new Promise((u,f)=>{g.addEventListener("load",u),g.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${d}`)))})}))}function i(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return r.then(a=>{for(const o of a||[])o.status==="rejected"&&i(o.reason);return e().catch(i)})};var w=(s=>(s.GEMINI="gemini",s.OPENROUTER="openrouter",s))(w||{}),b=(s=>(s.ACTIVE="active",s.INACTIVE="inactive",s.ERROR="error",s.TESTING="testing",s))(b||{}),S=(s=>(s.DEFAULT="default",s.FASTEST="fastest",s.CHEAPEST="cheapest",s.FALLBACK="fallback",s.LOAD_BALANCE="load_balance",s))(S||{}),v=(s=>(s.API_KEY_INVALID="api_key_invalid",s.QUOTA_EXCEEDED="quota_exceeded",s.MODEL_NOT_AVAILABLE="model_not_available",s.RATE_LIMIT_EXCEEDED="rate_limit_exceeded",s.NETWORK_ERROR="network_error",s.PARSING_ERROR="parsing_error",s.UNKNOWN_ERROR="unknown_error",s))(v||{});class M extends Error{constructor(e){super(e.message),this.name="ProviderError",this.type=e.type,this.provider=e.provider,this.model=e.model,this.originalError=e.originalError,this.retryable=e.retryable}}class q{constructor(e){this.enabled=!0,this.config=e,this.enabled=e.enabled}getConfig(){return{...this.config}}updateConfig(e){this.config={...this.config,...e}}isEnabled(){return this.enabled&&this.config.enabled}setEnabled(e){this.enabled=e}getId(){return this.config.id}getName(){return this.config.name}getType(){return this.config.type}validateApiKey(e){return!!e&&e.trim().length>0}handleError(e,t){console.error(`${this.config.name} - ${t}:`,e);let n="未知錯誤";return e instanceof Error?n=e.message:typeof e=="string"?n=e:e?.message&&(n=e.message),{success:!1,error:n,provider:this.config.name,model:this.getDefaultModel()}}formatResponse(e,t){try{return{success:!0,data:e,provider:this.config.name,model:t,usage:this.extractUsageInfo(e)}}catch(n){return this.handleError(n,"格式化回應數據")}}extractUsageInfo(e){}}class z extends q{constructor(e){super(e),this.ai=new U({apiKey:e.apiKey})}async generateContent(e){try{if(!this.validateApiKey(this.config.apiKey))return this.handleError("API Key 無效","生成內容");const t=this.prepareRequestParams(e),n=await this.executeApiCall(t),r=this.parseApiResponse(n);return this.formatResponse(r,this.getEffectiveModel(e))}catch(t){return this.handleError(t,"生成內容")}}async testConnection(){try{const e={prompt:'測試連接：請以 JSON 格式回應 {"status": "OK"}',options:{maxTokens:100,responseFormat:"json"}},t=await this.generateContent(e);return t.success&&t.data&&typeof t.data=="object"}catch(e){return console.error("Gemini Provider 連接測試失敗:",e),!1}}getProviderInfo(){return{type:w.GEMINI,name:"Google Gemini",description:"Google 的多模態大型語言模型，支援文字和圖像處理",capabilities:{supportedFormats:["json","text"],supportedFunctions:!1,supportedVision:!0,supportedStreaming:!1,maxTokens:32768,supportedLanguages:["zh-TW","zh-CN","en","ja","ko","fr","de","es"]},models:[{id:"gemini-2.5-flash",name:"Gemini 2.5 Flash",description:"最新版本的 Gemini Flash 模型，速度快且準確",contextLength:32768,pricing:{input:15e-5,output:6e-4}},{id:"gemini-pro",name:"Gemini Pro",description:"Gemini Pro 模型，平衡效能和準確性",contextLength:32768,pricing:{input:5e-4,output:.0015}},{id:"gemini-pro-vision",name:"Gemini Pro Vision",description:"支援視覺理解的 Gemini Pro 模型",contextLength:16384,pricing:{input:25e-5,output:5e-4}}],documentationUrl:"https://ai.google.dev/docs",websiteUrl:"https://ai.google.dev/"}}getDefaultModel(){return this.config.model||"gemini-2.5-flash"}prepareRequestParams(e){const t=this.config;return{model:e.options?.model||t.model,contents:[{parts:[{text:e.prompt}]}],config:{responseMimeType:e.options?.responseFormat==="json"?"application/json":"text/plain",temperature:e.options?.temperature??t.settings.temperature,maxOutputTokens:e.options?.maxTokens??t.settings.maxOutputTokens,topP:t.settings.topP,topK:t.settings.topK}}}async executeApiCall(e){return await this.ai.models.generateContent(e)}parseApiResponse(e){if(!e.text)throw new Error("AI 回傳內容為空，請重試或檢查 API 金鑰。");let t=e.text.trim();const n=/^```(\w*)?\s*\n?(.*?)\n?\s*```$/s,r=t.match(n);if(r&&r[2]&&(t=r[2].trim()),!t.startsWith("{")&&!t.startsWith("[")&&(t.includes("{")||t.includes("["))){const i=t.indexOf("{"),a=t.indexOf("[");let o=-1,c=-1;i!==-1&&(a===-1||i<a)?(o=i,c=t.lastIndexOf("}")):a!==-1&&(o=a,c=t.lastIndexOf("]")),o!==-1&&c!==-1&&c>o&&(t=t.substring(o,c+1))}try{return JSON.parse(t)}catch{return console.warn("Gemini 回應 JSON 解析失敗，返回原始文字:",e.text),e.text}}extractUsageInfo(e){}getEffectiveModel(e){const t=this.config;return e.options?.model||t.model}handleError(e,t){let n="無法產生內容。";if(e instanceof Error&&(n+=` 詳細資料： ${e.message}`),e&&typeof e=="object"&&"message"in e){const r=e;r.message.includes("API key not valid")||r.message.includes("API_KEY_INVALID")?n="Gemini API 金鑰無效。請檢查您的設定。":r.message.includes("quota")||r.message.includes("RESOURCE_EXHAUSTED")?n="已超出 API 配額。請稍後再試。":(r.message.toLowerCase().includes("json")||r.message.includes("Unexpected token"))&&(n="AI 模型傳回的資料格式無法解析 (可能不是有效的 JSON)。請嘗試修改您的主題或重試。")}return{success:!1,error:n,provider:this.config.name,model:this.getDefaultModel()}}async getAvailableModels(){try{const e=await fetch("https://generativelanguage.googleapis.com/v1beta/models?key="+this.config.apiKey);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);return((await e.json()).models||[]).filter(r=>r.supportedGenerationMethods&&r.supportedGenerationMethods.includes("generateContent")).map(r=>({id:r.name.replace("models/",""),name:r.displayName||r.name,description:r.description||"",inputTokenLimit:r.inputTokenLimit||0,outputTokenLimit:r.outputTokenLimit||0}))}catch(e){return console.error("獲取 Gemini 模型清單失敗:",e),[{id:"gemini-2.5-flash",name:"Gemini 2.5 Flash",description:"快速響應的 Gemini 模型",inputTokenLimit:1048576,outputTokenLimit:8192},{id:"gemini-pro",name:"Gemini Pro",description:"Gemini 專業版模型",inputTokenLimit:30720,outputTokenLimit:2048},{id:"gemini-pro-vision",name:"Gemini Pro Vision",description:"支援視覺輸入的 Gemini 模型",inputTokenLimit:12288,outputTokenLimit:4096}]}}}class K extends q{constructor(e){super(e),this.baseUrl="https://openrouter.ai/api/v1"}async generateContent(e){try{if(!this.validateApiKey(this.config.apiKey))return this.handleError("API Key 無效","生成內容");const t=this.prepareRequestParams(e),n=await this.executeApiCall(t),r=this.parseApiResponse(n);return this.formatResponse(r,this.getEffectiveModel(e))}catch(t){return this.handleError(t,"生成內容")}}async testConnection(){try{const e={prompt:'測試連接：請以 JSON 格式回應 {"status": "OK"}',options:{maxTokens:100,responseFormat:"json"}},t=await this.generateContent(e);return t.success&&t.data&&typeof t.data=="object"}catch(e){return console.error("OpenRouter Provider 連接測試失敗:",e),!1}}getProviderInfo(){return{type:w.OPENROUTER,name:"OpenRouter",description:"統一存取多個 AI 提供商的模型，包括 OpenAI、Anthropic、Google 等",capabilities:{supportedFormats:["json","text"],supportedFunctions:!0,supportedVision:!0,supportedStreaming:!0,maxTokens:2e5,supportedLanguages:["zh-TW","zh-CN","en","ja","ko","fr","de","es","pt","ru","ar"]},models:[{id:"openai/gpt-4o",name:"GPT-4o",description:"OpenAI 的旗艦模型，支援文字和視覺",contextLength:128e3,pricing:{input:.005,output:.015}},{id:"anthropic/claude-3.5-sonnet",name:"Claude 3.5 Sonnet",description:"Anthropic 的高性能模型",contextLength:2e5,pricing:{input:.003,output:.015}},{id:"google/gemini-2.5-pro",name:"Gemini 2.5 Pro",description:"Google 的先進大型語言模型",contextLength:2e6,pricing:{input:.00125,output:.005}},{id:"mistralai/mistral-large-2411",name:"Mistral Large",description:"Mistral AI 的旗艦模型",contextLength:128e3,pricing:{input:.002,output:.006}},{id:"meta-llama/llama-3.2-90b-vision-instruct",name:"Llama 3.2 90B Vision",description:"Meta 的開源視覺語言模型",contextLength:131072,pricing:{input:9e-4,output:9e-4}}],documentationUrl:"https://openrouter.ai/docs",websiteUrl:"https://openrouter.ai/"}}getDefaultModel(){return this.config.model||"openai/gpt-4o"}prepareRequestParams(e){const t=this.config,n=e.options?.model||t.model;let r=e.prompt;e.options?.responseFormat==="json"&&!r.toLowerCase().includes("json")&&(r=`${r}

Please respond in JSON format.`);const o={model:n,messages:[{role:"user",content:r}],stream:e.options?.stream??t.settings.stream??!1,max_tokens:e.options?.maxTokens??t.settings.max_tokens,temperature:e.options?.temperature??t.settings.temperature,top_p:t.settings.top_p,frequency_penalty:t.settings.frequency_penalty,presence_penalty:t.settings.presence_penalty};return t.settings.provider&&(o.provider=t.settings.provider),Object.keys(o).forEach(c=>{o[c]===void 0&&delete o[c]}),o}async executeApiCall(e){const t=await fetch(`${this.baseUrl}/chat/completions`,{method:"POST",headers:{Authorization:`Bearer ${this.config.apiKey}`,"Content-Type":"application/json","HTTP-Referer":window.location.origin,"X-Title":"AI Learning Page Generator"},body:JSON.stringify(e)});if(!t.ok){const n=await t.json().catch(()=>({}));throw new Error(n.error?.message||`HTTP ${t.status}: ${t.statusText}`)}return await t.json()}parseApiResponse(e){if(!e.choices||e.choices.length===0)throw new Error("OpenRouter 回應格式錯誤：缺少 choices");const t=e.choices[0];if(!t.message||!t.message.content)throw new Error("OpenRouter 回應格式錯誤：缺少訊息內容");const n=t.message.content.trim();console.log("OpenRouter 回應內容長度:",n.length),console.log("OpenRouter 回應內容前100字:",n.substring(0,100)),console.log("OpenRouter 回應內容後100字:",n.substring(Math.max(0,n.length-100)));const r=n.replace(/```json\n/g,"").replace(/\n```/g,"").replace(/```\n/g,"").replace(/```/g,"").trim();if(console.log("OpenRouter 清理後內容前100字:",r.substring(0,100)),r.startsWith("{")||r.startsWith("["))try{const i=JSON.parse(r);return console.log("OpenRouter JSON 解析成功:",typeof i,Object.keys(i||{})),i}catch(i){return console.error("OpenRouter 回應 JSON 解析失敗:",String(i)),console.log("JSON 解析失敗的內容:",r),r}return console.log("OpenRouter 回應不是 JSON 格式，返回清理後文字"),r}extractUsageInfo(e,...t){const n=t[0];if(n&&n.usage)return{promptTokens:n.usage.prompt_tokens,completionTokens:n.usage.completion_tokens,totalTokens:n.usage.total_tokens}}formatResponse(e,t,...n){try{const r=n[0];return{success:!0,data:e,provider:this.config.name,model:t,usage:r?.usage?{promptTokens:r.usage.prompt_tokens,completionTokens:r.usage.completion_tokens,totalTokens:r.usage.total_tokens}:void 0}}catch(r){return this.handleError(r,"格式化回應數據")}}getEffectiveModel(e){const t=this.config;return e.options?.model||t.model}handleError(e,t){let n="無法產生內容。";if(e instanceof Error&&(n+=` 詳細資料： ${e.message}`),e&&typeof e=="object"&&"message"in e){const r=e;r.message.includes("Unauthorized")||r.message.includes("401")?n="OpenRouter API 金鑰無效。請檢查您的設定。":r.message.includes("rate limit")||r.message.includes("429")?n="已超出 API 速率限制。請稍後再試。":r.message.includes("quota")||r.message.includes("insufficient")?n="已超出 API 配額或餘額不足。請檢查您的 OpenRouter 帳戶。":r.message.includes("model")||r.message.includes("not found")?n="所選模型不可用。請嘗試其他模型。":(r.message.includes("timeout")||r.message.includes("network"))&&(n="網路連接超時。請檢查網路連接後重試。")}return{success:!1,error:n,provider:this.config.name,model:this.getDefaultModel()}}async getAvailableModels(){try{const e=await fetch(`${this.baseUrl}/models`,{headers:{Authorization:`Bearer ${this.config.apiKey}`,"Content-Type":"application/json"}});if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);return(await e.json()).data||[]}catch(e){return console.error("獲取 OpenRouter 模型清單失敗:",e),[]}}}class y{constructor(e){this.providers=new Map,this.usageStats=new Map,this.config=e,this.initializeProviders(),this.loadUsageStats()}static getInstance(e){return y.instance||(e||(e={providers:[],fallbackEnabled:!0,timeout:3e4,retryAttempts:3}),y.instance=new y(e)),y.instance}static reloadWithConfig(e){return y.instance=new y(e),y.instance}initializeProviders(){this.config.providers.forEach(e=>{try{const t=this.createProvider(e);this.providers.set(e.id,t)}catch(t){console.error(`初始化 Provider ${e.id} 失敗:`,t)}})}createProvider(e){switch(e.type){case w.GEMINI:return new z(e);case w.OPENROUTER:return new K(e)}}async addProvider(e){try{const t=this.createProvider(e),n=await this.testProvider(e.id,t);if(n.status===b.ERROR)throw new Error(`Provider 測試失敗: ${n.error}`);this.providers.set(e.id,t),this.config.providers.push(e),this.saveConfig(),console.log(`Provider ${e.id} 已成功添加`)}catch(t){throw console.error(`添加 Provider ${e.id} 失敗:`,t),t}}removeProvider(e){this.providers.delete(e),this.config.providers=this.config.providers.filter(t=>t.id!==e),this.usageStats.delete(e),this.saveConfig(),console.log(`Provider ${e} 已移除`)}async updateProvider(e){try{const t=this.createProvider(e),n=await this.testProvider(e.id,t);if(n.status===b.ERROR)throw new Error(`Provider 測試失敗: ${n.error}`);this.providers.set(e.id,t);const r=this.config.providers.findIndex(i=>i.id===e.id);r>=0&&(this.config.providers[r]=e),this.saveConfig(),console.log(`Provider ${e.id} 已更新`)}catch(t){throw console.error(`更新 Provider ${e.id} 失敗:`,t),t}}async testProvider(e,t){const n=Date.now(),r=t||this.providers.get(e);if(!r)return{providerId:e,status:b.ERROR,error:"Provider 不存在",testedAt:new Date().toISOString()};try{const i={prompt:'測試連接：請回應 "OK"',options:{maxTokens:100,responseFormat:"text"}},a=await r.generateContent(i),o=Date.now()-n;return{providerId:e,status:a.success?b.ACTIVE:b.ERROR,responseTime:o,error:a.error,testedAt:new Date().toISOString()}}catch(i){return{providerId:e,status:b.ERROR,error:i instanceof Error?i.message:"未知錯誤",testedAt:new Date().toISOString()}}}async testAllProviders(){const e=[];for(const[t,n]of this.providers){const r=await this.testProvider(t,n);e.push(r)}return e}async generateContent(e,t=S.DEFAULT){const n=await this.selectProvider(t);if(!n)throw new M({type:v.UNKNOWN_ERROR,message:"沒有可用的 Provider",provider:"none",retryable:!1});const r=Date.now();try{const i=await n.provider.generateContent(e),a=Date.now()-r;if(!i.success)throw new M({type:this.mapErrorType(i.error||""),message:i.error||"未知錯誤",provider:n.id,retryable:!0});return this.updateUsageStats(n.id,!0,a,i.usage?.totalTokens||0),{content:i.data,usage:i.usage,metadata:{model:i.model,provider:i.provider,responseTime:a,finishReason:"stop"}}}catch(i){if(this.updateUsageStats(n.id,!1,Date.now()-r,0),this.config.fallbackEnabled&&t!==S.FALLBACK)return console.warn(`Provider ${n.id} 失敗，嘗試 fallback...`),this.generateContent(e,S.FALLBACK);throw i}}async selectProvider(e){const t=Array.from(this.providers.entries()).filter(([n,r])=>r.isEnabled()).map(([n,r])=>({id:n,provider:r}));if(console.log("ProviderManager: 可用的 Provider:",t.map(n=>({id:n.id,type:n.provider.config.type}))),t.length===0)return console.log("ProviderManager: 沒有可用的 Provider"),null;switch(e){case S.DEFAULT:{const n=this.config.defaultProviderId;if(console.log("ProviderManager: 預設 Provider ID:",n),n&&this.providers.has(n)){const r={id:n,provider:this.providers.get(n)};return console.log("ProviderManager: 選擇預設 Provider:",{id:r.id,type:r.provider.config.type}),r}return console.log("ProviderManager: 預設 Provider 不可用，使用第一個可用的 Provider:",t[0].id),t[0]}case S.FASTEST:return this.selectFastestProvider(t);case S.FALLBACK:return this.selectFallbackProvider(t);case S.LOAD_BALANCE:return this.selectLoadBalanceProvider(t);default:return t[0]}}selectFastestProvider(e){let t=e[0],n=this.getAverageResponseTime(t.id);for(const r of e.slice(1)){const i=this.getAverageResponseTime(r.id);i<n&&(t=r,n=i)}return t}selectFallbackProvider(e){for(const t of this.config.providers){const n=e.find(r=>r.id===t.id);if(n)return n}return e[0]}selectLoadBalanceProvider(e){const t=Date.now(),n=Math.floor(t/1e3)%e.length;return e[n]}getAverageResponseTime(e){return this.usageStats.get(e)?.averageResponseTime||1/0}updateUsageStats(e,t,n,r){const i=this.usageStats.get(e)||{providerId:e,totalRequests:0,successfulRequests:0,failedRequests:0,averageResponseTime:0,totalTokensUsed:0,lastUsed:new Date().toISOString()};i.totalRequests++,t?i.successfulRequests++:i.failedRequests++;const a=i.averageResponseTime*(i.totalRequests-1)+n;i.averageResponseTime=a/i.totalRequests,i.totalTokensUsed+=r,i.lastUsed=new Date().toISOString(),this.usageStats.set(e,i),this.saveUsageStats()}mapErrorType(e){const t=e.toLowerCase();return t.includes("api key")||t.includes("invalid")?v.API_KEY_INVALID:t.includes("quota")||t.includes("exhausted")?v.QUOTA_EXCEEDED:t.includes("rate limit")?v.RATE_LIMIT_EXCEEDED:t.includes("model")||t.includes("not found")?v.MODEL_NOT_AVAILABLE:t.includes("network")||t.includes("connection")?v.NETWORK_ERROR:t.includes("json")||t.includes("parsing")?v.PARSING_ERROR:v.UNKNOWN_ERROR}getProviders(){return[...this.config.providers]}getProvider(e){return this.config.providers.find(t=>t.id===e)}getUsageStats(){return Array.from(this.usageStats.values())}setDefaultProvider(e){if(!this.providers.has(e))throw new Error(`Provider ${e} 不存在`);this.config.defaultProviderId=e,this.saveConfig()}saveConfig(){try{localStorage.setItem("provider_manager_config",JSON.stringify(this.config))}catch(e){console.error("保存 Provider 配置失敗:",e)}}loadUsageStats(){try{const e=localStorage.getItem("provider_usage_stats");if(e){const t=JSON.parse(e);this.usageStats=new Map(Object.entries(t))}}catch(e){console.error("載入使用統計失敗:",e)}}saveUsageStats(){try{const e=Object.fromEntries(this.usageStats);localStorage.setItem("provider_usage_stats",JSON.stringify(e))}catch(e){console.error("保存使用統計失敗:",e)}}clearUsageStats(){this.usageStats.clear(),localStorage.removeItem("provider_usage_stats")}exportConfig(){const e={version:"1.0.0",exportedAt:new Date().toISOString(),configs:this.config.providers.map(t=>({...t,apiKey:""})),metadata:{appVersion:"1.0.0",description:"AI Provider 配置匯出"}};return JSON.stringify(e,null,2)}async importConfig(e){try{const t=JSON.parse(e);if(!t.configs||!Array.isArray(t.configs))throw new Error("無效的配置格式");for(const n of t.configs){if(!n.apiKey){console.warn(`跳過 ${n.name}：缺少 API Key`);continue}await this.addProvider({...n,id:`${n.type}_${Date.now()}`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})}}catch(t){throw console.error("匯入配置失敗:",t),t}}}const _="https://api.jsonbin.io/v3",B="$2a$10$0PieG5Wm.V.6svtN4PbaTuVxU4LY0nL2Vaz4N3g2aYlb0cL1NG4Qa";class ${constructor(){this.manager=null,this.initializeManager()}static getInstance(){return $.instance||($.instance=new $),$.instance}async initializeManager(){try{const e=this.loadManagerConfig();this.manager=y.reloadWithConfig(e)}catch(e){console.error("初始化 Provider Manager 失敗:",e);const t={providers:[],fallbackEnabled:!0,timeout:3e4,retryAttempts:3};this.manager=y.reloadWithConfig(t)}}loadManagerConfig(){const e=localStorage.getItem("provider_manager_config");if(e)try{return JSON.parse(e)}catch(r){console.error("解析 Provider 配置失敗:",r)}const t=localStorage.getItem("gemini_api_key"),n=[];if(t){const r={id:"gemini_migrated",name:"Gemini (已遷移)",type:w.GEMINI,enabled:!0,apiKey:t,model:"gemini-2.5-flash",settings:{responseMimeType:"application/json",temperature:.7,maxOutputTokens:8192},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};n.push(r)}return{providers:n,defaultProviderId:n.length>0?n[0].id:void 0,fallbackEnabled:!0,timeout:3e4,retryAttempts:3}}async getManager(){return this.manager||await this.initializeManager(),this.manager}async getProviders(){return(await this.getManager()).getProviders()}async addProvider(e){await(await this.getManager()).addProvider(e),await this.initializeManager()}async updateProvider(e){await(await this.getManager()).updateProvider(e),await this.initializeManager()}async removeProvider(e){(await this.getManager()).removeProvider(e),await this.initializeManager()}async testProvider(e){return await(await this.getManager()).testProvider(e)}async testAllProviders(){return await(await this.getManager()).testAllProviders()}async setDefaultProvider(e){(await this.getManager()).setDefaultProvider(e)}async getUsageStats(){return(await this.getManager()).getUsageStats()}async generateContent(e,t){return await(await this.getManager()).generateContent(e,t)}async exportProviderConfig(){return(await this.getManager()).exportConfig()}async importProviderConfig(e){await(await this.getManager()).importConfig(e)}async shareProviderConfig(e,t,n,r=!1){try{const i={id:`share_${Date.now()}`,name:t,description:n,configs:e.map(c=>({...c,apiKey:"",id:"",createdAt:"",updatedAt:""})),isPublic:r,createdAt:new Date().toISOString(),tags:this.extractTagsFromConfigs(e)},a=await fetch(`${_}/b`,{method:"POST",headers:{"Content-Type":"application/json","X-Master-Key":B},body:JSON.stringify(i)});if(!a.ok)throw new Error(`分享失敗: ${a.statusText}`);return(await a.json()).metadata.id}catch(i){throw console.error("分享 Provider 配置失敗:",i),i}}async loadSharedProviderConfig(e){try{const t=await fetch(`${_}/b/${e}/latest`,{headers:{"X-Master-Key":B}});if(!t.ok)throw new Error(`載入失敗: ${t.statusText}`);return(await t.json()).record}catch(t){throw console.error("載入分享的 Provider 配置失敗:",t),t}}async createProvidersFromShared(e,t){const n=[];for(const r of e.configs){const i=t[r.type];if(!i){console.warn(`跳過 ${r.name}：缺少 ${r.type} API Key`);continue}const a={...r,id:`${r.type}_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,apiKey:i,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),name:`${r.name} (已匯入)`};await this.addProvider(a),n.push(a)}return n}extractTagsFromConfigs(e){const t=new Set;return e.forEach(n=>{if(t.add(n.type),n.type===w.GEMINI)t.add("google"),t.add("multimodal");else if(n.type===w.OPENROUTER){t.add("unified-api");const r=n.model;r.includes("openai")&&t.add("openai"),r.includes("anthropic")&&t.add("anthropic"),r.includes("google")&&t.add("google"),r.includes("meta")&&t.add("meta")}}),Array.from(t)}async clearAllData(){localStorage.removeItem("provider_manager_config"),localStorage.removeItem("provider_usage_stats"),this.manager=null,await this.initializeManager()}async hasConfiguredProviders(){const e=await this.getProviders();return e.length>0&&e.some(t=>t.enabled&&t.apiKey)}async getFirstAvailableProvider(){return(await this.getProviders()).find(t=>t.enabled&&t.apiKey)||null}async migrateLegacyApiKey(){const e=localStorage.getItem("gemini_api_key");if(!e)return;if(!(await this.getProviders()).some(r=>r.type===w.GEMINI)){const r={id:"gemini_migrated",name:"Gemini (已遷移)",type:w.GEMINI,enabled:!0,apiKey:e,model:"gemini-2.5-flash",settings:{responseMimeType:"application/json",temperature:.7,maxOutputTokens:8192},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};try{await this.addProvider(r),await this.setDefaultProvider(r.id),console.log("已成功遷移 Gemini API Key 到新的 Provider 系統")}catch(i){console.error("遷移 Gemini API Key 失敗:",i)}}}async getLegacyApiKey(){return(await this.getFirstAvailableProvider())?.apiKey||null}}const C=$.getInstance(),m=async(s,e="provider-system-call")=>{try{!await C.hasConfiguredProviders()&&e!=="provider-system-call"&&await C.migrateLegacyApiKey();const n={prompt:s,options:{responseFormat:"json",maxTokens:8192,temperature:.7}};console.log("Provider 系統: 生成內容中...");const r=await C.generateContent(n,S.DEFAULT);console.log("Provider 系統回應:",{provider:r.metadata?.provider,model:r.metadata?.model});let i=r.content;if(i&&typeof i=="object"&&i.choices)try{i=i.choices[0].message.content,console.log("✓ 檢測到 OpenRouter 格式，提取內容")}catch(a){console.warn("⚠ OpenRouter 格式提取失敗:",a)}if(typeof i=="string")try{let a=i.replace(/```json\n/g,"").replace(/\n```/g,"").replace(/```\n/g,"").replace(/```/g,"").trim();if(!a.startsWith("{")&&!a.startsWith("[")){const o=Math.min(a.indexOf("{")!==-1?a.indexOf("{"):1/0,a.indexOf("[")!==-1?a.indexOf("["):1/0);if(o!==1/0){const d=a.charAt(o)==="{"?a.lastIndexOf("}"):a.lastIndexOf("]");d>o&&(a=a.substring(o,d+1))}}i=JSON.parse(a),console.log("✓ JSON 解析成功 (Provider 系統)")}catch(a){console.warn("⚠ JSON 解析失敗，返回原始內容:",a),i=r.content}return i}catch(t){if(console.error("Provider 系統錯誤:",t),e&&e.startsWith("AIza")){console.log("回退到原始 Gemini 服務");const{callGemini:n}=await I(async()=>{const{callGemini:r}=await import("./gemini-service-BbqOGSh7.js").then(i=>i.n);return{callGemini:r}},__vite__mapDeps([0,1,2,3]));return await n(s,e)}else throw t}},F=async(s,e)=>{const t=`
    Please generate at least 3 (but more is better if appropriate) clear and distinct learning objectives for the topic: "${s}".
    The objectives should be based on scaffolding theory and gamification, and written in the primary language of the topic.
    For each objective, provide the objective statement, a detailed description, and a concrete teaching example (such as a sample sentence, scenario, or application).
    Output MUST be a valid JSON array of objects, e.g.:
    [
      {
        "objective": "能夠理解${s}的基本概念",
        "description": "此目標幫助學習者建立對${s}的基礎理解和認知框架...",
        "teachingExample": "透過具體例子展示${s}的核心概念，例如..."
      },
      {
        "objective": "能夠應用${s}於實際情境",
        "description": "培養學習者將理論知識轉化為實際應用的能力...",
        "teachingExample": "提供真實情境讓學習者練習應用${s}，如..."
      },
      {
        "objective": "能夠辨識${s}常見的誤區",
        "description": "幫助學習者識別和避免${s}學習中的常見錯誤...",
        "teachingExample": "展示常見誤區的具體例子和正確理解方式..."
      },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(t,e)},Q=async(s,e,t)=>{const n=/english|英語|英文|grammar|vocabulary|pronunciation|speaking|listening|reading|writing/i.test(s),r=`
    Based on the following learning objectives: ${JSON.stringify(t)}
    Please break down the topic "${s}" into at least 3 (but more is better if appropriate) micro-units. For each, provide a sub-topic, a brief explanation, and a concrete teaching example.

    ${n?`
    SPECIAL REQUIREMENTS FOR ENGLISH LEARNING TOPICS:
    For each breakdown item, also include:
    - coreConcept: 該要點的核心學習概念 (core learning concept for this point)
    - teachingSentences: 3-5句教學例句 (array of 3-5 teaching example sentences)
    - teachingTips: 教學要點提示與說明 (teaching tips and explanations)

    Output format for English learning topics:
    [
      {
        "topic": "子主題A",
        "details": "子主題A的簡要說明...",
        "teachingExample": "子主題A的教學示例...",
        "coreConcept": "此要點的核心概念...",
        "teachingSentences": ["例句1", "例句2", "例句3", "例句4", "例句5"],
        "teachingTips": "教學要點與提示說明..."
      }
      // ... 至少3個以上的項目
    ]
    `:`
    Output format for general topics:
    [
      {
        "topic": "子主題A",
        "details": "子主題A的簡要說明...",
        "teachingExample": "子主題A的教學示例..."
      }
      // ... 至少3個以上的項目
    ]
    `}

    The content must be in the primary language of the topic. Only output the JSON array, no explanation or extra text.
  `;return await m(r,e)},Y=async(s,e,t)=>{const n=`
    Based on the following learning objectives: ${JSON.stringify(t)}
    Generate at least 3 (but more is better if appropriate) comprehensive analysis of common misconceptions or difficulties students may have with "${s}".

    Output MUST be a valid JSON array with the following comprehensive structure:
    [
      {
        "point": "易混淆點標題",
        "clarification": "詳細澄清說明",
        "teachingExample": "具體教學示例",
        "errorType": "誤區類型 (概念性/程序性/語言性/理解性)",
        "commonErrors": ["學生典型錯誤示例1", "學生典型錯誤示例2", "學生典型錯誤示例3"],
        "correctVsWrong": [
          {
            "correct": "正確示例",
            "wrong": "錯誤示例",
            "explanation": "對比說明"
          }
        ],
        "preventionStrategy": "預防策略 - 如何防止學生犯錯",
        "correctionMethod": "糾正方法 - 發現錯誤後的補救措施",
        "practiceActivities": ["針對性練習活動1", "針對性練習活動2", "針對性練習活動3"]
      }
    ]

    Requirements:
    - Each confusing point should include ALL fields above
    - commonErrors: Provide at least 3 typical student mistakes
    - correctVsWrong: Provide at least 1 comparison (more if helpful)
    - practiceActivities: Provide at least 3 targeted practice activities
    - All text should be in the primary language of the topic
    - Focus on practical teaching guidance that educators can immediately apply

    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(n,e)},H=async(s,e,t)=>{const n=`
    Based on the following learning objectives: ${JSON.stringify(t)}
    Suggest at least 3 (but more is better if appropriate) engaging, interactive classroom activities (preferably game-like) for the topic "${s}".
    For each activity, provide the following comprehensive fields:
      - title: 活動名稱/主題 (The name of the activity)
      - description: 活動的標題或核心概念 (Brief description of the core concept)
      - objective: 學習目標 (Main learning goal or purpose)
      - timing: 使用時機 (When to use: lesson introduction, during unit, after unit, review, etc.)
      - materials: 所需教具 (Required tools, materials, or props)
      - environment: 環境要求 (Seating arrangement, space needs, equipment conditions)
      - steps: 活動步驟 (Step-by-step process of teacher-student interactions as array)
      - assessmentPoints: 評估重點 (Learning effectiveness observation and assessment criteria as array)

    Output MUST be a valid JSON array of objects, e.g.:
    [
      {
        "title": "遊戲化活動1",
        "description": "活動1的核心概念與玩法簡述...",
        "objective": "活動1的學習目標...",
        "timing": "適用於單元導入/單元後/複習時等...",
        "materials": "所需教材、道具或工具...",
        "environment": "座位安排、空間需求、設備條件...",
        "steps": ["步驟1: 教師說明規則...", "步驟2: 學生分組...", "步驟3: 進行活動..."],
        "assessmentPoints": ["觀察學生參與度", "檢查概念理解程度", "評估協作能力"]
      },
      // ... more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(n,e)},X=async(s,e,t)=>{const n=`
    Based on the following learning objectives: ${JSON.stringify(t)}
    Please generate quiz content for "${s}" in the following JSON structure (no explanation, no extra text):
    {
      "easy": {
        "trueFalse": [
          { "statement": "簡單判斷題1...", "isTrue": true, "explanation": "可選說明1" },
          { "statement": "簡單判斷題2...", "isTrue": false, "explanation": "可選說明2" }
          // ... 至少 5 題，若有更多更好
        ],
        "multipleChoice": [
          { "question": "簡單選擇題1...", "options": ["選項A", "選項B", "選項C"], "correctAnswerIndex": 0 },
          { "question": "簡單選擇題2...", "options": ["選項A", "選項B", "選項C"], "correctAnswerIndex": 1 }
          // ... 至少 5 題，若有更多更好
        ],
        "fillInTheBlanks": [
          { "sentenceWithBlank": "簡單填空題1...____...", "correctAnswer": "正確答案1" },
          { "sentenceWithBlank": "簡單填空題2...____...", "correctAnswer": "正確答案2" }
          // ... 至少 5 題，若有更多更好
        ],
        "sentenceScramble": [
          { "originalSentence": "簡單句子1...", "scrambledWords": ["...", "...", "..."] },
          { "originalSentence": "簡單句子2...", "scrambledWords": ["...", "...", "..."] }
          // ... 至少 5 題，若有更多更好
        ],
        "memoryCardGame": [
          {
            "pairs": [
              { "question": "卡片1正面", "answer": "卡片1背面" },
              { "question": "卡片2正面", "answer": "卡片2背面" },
              { "question": "卡片3正面", "answer": "卡片3背面" },
              { "question": "卡片4正面", "answer": "卡片4背面" },
              { "question": "卡片5正面", "answer": "卡片5背面" }
              // ... 至少 5 組配對，若有更多更好
            ],
            "instructions": "請將每個卡片正面與正確的背面配對。"
          }
        ]
      },
      "normal": { /* same structure as easy, memoryCardGame 只 1 題，pairs 至少 5 組 */ },
      "hard": { /* same structure as easy, memoryCardGame 只 1 題，pairs 至少 5 組 */ }
    }
    For each quiz type (trueFalse, multipleChoice, fillInTheBlanks, sentenceScramble), generate at least 5 questions per difficulty level (easy, normal, hard), but more is better if appropriate.
    For memoryCardGame, generate ONLY 1 question per difficulty, but the "pairs" array inside must contain at least 5 pairs (each pair is a related concept, word/definition, Q&A, or translation relevant to '${s}'), and more is better if appropriate.
    Each memoryCardGame question should include clear "instructions" for the matching task.
    All text must be in the primary language of the topic. Only output the JSON object, no explanation or extra text.
  `;return await m(n,e)},Z=async(s,e,t)=>{const n=`
    Based on the following learning objectives: ${JSON.stringify(t)}
    Please generate a short, natural English conversation (at least 3 lines, but more is better if appropriate, 2 speakers) about the topic "${s}" (use English translation if topic is not English).
    Output MUST be a valid JSON array, e.g.:
    [
      { "speaker": "Speaker A", "line": "Hello! Let's talk about ${s}." },
      { "speaker": "Speaker B", "line": "Great idea! What's the first thing we should discuss regarding ${s}?" },
      { "speaker": "Speaker A", "line": "Perhaps we can start with..." },
      { "speaker": "Speaker B", "line": "I think examples would help." }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(n,e)},Te=async(s,e,t)=>{const n=`
    Transform the following teacher-oriented learning objective into student-friendly, engaging content suitable for interactive learning:
    
    Original Learning Objective:
    ${JSON.stringify(s)}
    
    Transform it into student-centered language that:
    1. Uses "你" (you) instead of "學生" (students)
    2. Makes it personally relevant and motivating
    3. Explains WHY this learning is important to the student
    4. Uses encouraging, accessible language
    5. Includes concrete examples that students can relate to
    6. Makes the learning goal feel achievable and exciting
    
    Output MUST be a valid JSON object with this structure:
    {
      "objective": "學習目標改寫為學生導向的語言",
      "description": "詳細說明為什麼你需要學會這個，以及學會後對你的好處",
      "teachingExample": "具體的、與學生生活相關的例子或應用情境",
      "personalRelevance": "這個學習與你的日常生活、未來發展的關係",
      "encouragement": "鼓勵學生的話語，讓學習感覺有趣且可達成"
    }
    
    Make the content engaging, personal, and motivational. Use Traditional Chinese.
    Do NOT include any explanation or extra text. Only output the JSON object.
  `;return await t(n,e)},Ne=async(s,e,t)=>{const n=`
    Transform the following teacher-oriented content breakdown into student-friendly, digestible learning content:
    
    Original Content Breakdown:
    ${JSON.stringify(s)}
    
    Transform it into student-centered content that:
    1. Uses conversational, friendly tone
    2. Explains concepts in simple, relatable terms
    3. Connects to real-world applications students care about
    4. Includes step-by-step learning guidance
    5. Makes complex topics feel approachable
    6. Uses analogies and examples from student life
    
    Output MUST be a valid JSON object with this structure:
    {
      "title": "子主題標題用學生容易理解的語言表達",
      "introduction": "用友善的語調介紹這個概念，說明為什麼要學習它",
      "keyPoints": ["要點1用簡單語言解釋", "要點2用實際例子說明", "要點3連結到生活應用"],
      "realLifeExamples": ["生活中的例子1", "生活中的例子2", "生活中的例子3"],
      "learningTips": "學習這個概念的小技巧和方法",
      "nextSteps": "學會這個概念後，你可以進一步探索什麼",
      "encouragement": "給學生的鼓勵話語"
    }
    
    Make the content feel like a friendly tutor explaining concepts personally to the student.
    Use Traditional Chinese. Do NOT include any explanation or extra text. Only output the JSON object.
  `;return await t(n,e)},ke=async(s,e,t)=>{const n=`
    Transform the following teacher-oriented confusing point analysis into student-friendly, helpful guidance:
    
    Original Confusing Point:
    ${JSON.stringify(s)}
    
    Transform it into student-centered guidance that:
    1. Acknowledges that confusion is normal and okay
    2. Explains the common mistake without making students feel bad
    3. Provides clear, memorable strategies to avoid the mistake
    4. Uses positive, encouraging language
    5. Includes memorable tricks or mnemonics
    6. Shows both wrong and right examples in a supportive way
    
    Output MUST be a valid JSON object with this structure:
    {
      "title": "易混淆概念的標題用友善語言表達",
      "normalizeConfusion": "告訴學生這種混淆很正常，不用擔心",
      "commonMistake": "用溫和的語言說明常見的錯誤想法",
      "whyItHappens": "解釋為什麼會有這種混淆（讓學生理解而不是感到愚蠢）",
      "clearExplanation": "用簡單明瞭的方式解釋正確概念",
      "rememberingTricks": ["記憶技巧1", "記憶技巧2", "記憶技巧3"],
      "practiceExamples": [
        {
          "situation": "情境描述",
          "wrongThinking": "錯誤的想法",
          "rightThinking": "正確的想法",
          "explanation": "為什麼這樣想是對的"
        }
      ],
      "confidenceBooster": "提升學生信心的話語，讓他們知道掌握這個概念是可以做到的"
    }
    
    Make the content supportive and empowering, helping students learn from mistakes without judgment.
    Use Traditional Chinese. Do NOT include any explanation or extra text. Only output the JSON object.
  `;return await t(n,e)},ee=async(s,e,t)=>{const n=`
    Please generate at least 3 (but more is better if appropriate) clear and distinct learning objectives for the topic: "${s}" appropriate for learning level "${e.name}" (${e.description}).
    The objectives should be based on scaffolding theory and gamification, written in the primary language of the topic, and tailored to the learner's level and capabilities described in: "${e.description}".
    For each objective, provide the objective statement, a detailed description, and a concrete teaching example (such as a sample sentence, scenario, or application).
    Output MUST be a valid JSON array of objects, e.g.:
    [
      {
        "objective": "能夠理解${s}在${e.name}程度的核心概念",
        "description": "此目標針對${e.name}程度學習者的詳細描述...",
        "teachingExample": "針對此目標的具體教學示例..."
      },
      {
        "objective": "能夠應用${s}的${e.name}級技能",
        "description": "此目標的具體說明和期望成果...",
        "teachingExample": "實際應用此技能的示例..."
      },
      {
        "objective": "能夠辨識${s}在此程度的常見誤區",
        "description": "幫助學習者識別和避免常見錯誤...",
        "teachingExample": "常見誤區的具體例子和正確做法..."
      },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(n,t)},te=async(s,e,t,n)=>{const r=/english|英語|英文|grammar|vocabulary|pronunciation|speaking|listening|reading|writing/i.test(s),i=`
    Based on the following learning objectives: ${JSON.stringify(n)}
    Please break down the topic "${s}" into at least 3 (but more is better if appropriate) micro-units appropriate for "${e.name}" level learners (${e.description}). For each, provide a sub-topic, a brief explanation, and a concrete teaching example.
    The content depth and complexity should match the level description: "${e.description}".

    ${r?`
    SPECIAL REQUIREMENTS FOR ENGLISH LEARNING TOPICS:
    For each breakdown item, also include:
    - coreConcept: 該要點的核心學習概念 (core learning concept for this point)
    - teachingSentences: 3-5句教學例句 (array of 3-5 teaching example sentences)
    - teachingTips: 教學要點提示與說明 (teaching tips and explanations)

    Output format for English learning topics:
    [
      {
        "topic": "適合${e.name}的子主題A",
        "details": "子主題A針對${e.name}程度的簡要說明...",
        "teachingExample": "子主題A適合此程度的教學示例...",
        "coreConcept": "此要點的核心概念...",
        "teachingSentences": ["例句1", "例句2", "例句3", "例句4", "例句5"],
        "teachingTips": "教學要點與提示說明..."
      }
    ]
    `:`
    Standard output format:
    [
      { "topic": "適合${e.name}的子主題A", "details": "子主題A針對${e.name}程度的簡要說明...", "teachingExample": "子主題A適合此程度的教學示例..." }
    ]
    `}

    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(i,t)},ne=async(s,e,t,n)=>{const r=`
    Based on the following learning objectives: ${JSON.stringify(n)}
    Generate at least 3 (but more is better if appropriate) comprehensive analysis of common misconceptions or difficulties that "${e.name}" level learners (${e.description}) may have with "${s}".

    Output MUST be a valid JSON array with the following comprehensive structure:
    [
      {
        "point": "適合${e.name}程度的易混淆點標題",
        "clarification": "針對${e.description}的澄清說明",
        "teachingExample": "適合此程度學習者的具體教學示例",
        "errorType": "誤區類型 (概念性/程序性/語言性/理解性)",
        "commonErrors": ["此程度學生的典型錯誤示例1", "此程度學生的典型錯誤示例2", "此程度學生的典型錯誤示例3"],
        "correctVsWrong": [
          {
            "correct": "適合${e.name}程度的正確示例",
            "wrong": "此程度學生常犯的錯誤示例",
            "explanation": "適合此程度的對比說明"
          }
        ],
        "preventionStrategy": "針對${e.name}程度的預防策略",
        "correctionMethod": "適合此程度的糾正方法",
        "practiceActivities": ["適合此程度的練習活動1", "適合此程度的練習活動2", "適合此程度的練習活動3"]
      }
    ]

    Requirements:
    - All content should be appropriate for "${e.description}"
    - Each confusing point should include ALL fields above
    - commonErrors: Provide at least 3 typical student mistakes at this level
    - correctVsWrong: Provide at least 1 comparison (more if helpful)
    - practiceActivities: Provide at least 3 level-appropriate targeted practice activities
    - All text should be in the primary language of the topic
    - Focus on confusion points specific to "${e.name}" level: "${e.description}"

    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(r,t)},re=async(s,e,t,n)=>{const r=`
    Based on the following learning objectives: ${JSON.stringify(n)}
    Suggest at least 3 (but more is better if appropriate) engaging, interactive classroom activities (preferably game-like) for the topic "${s}" suitable for "${e.name}" level learners (${e.description}).
    Activities should match the complexity and capabilities described in: "${e.description}".
    For each activity, provide the following comprehensive fields:
      - title: 活動名稱/主題 (The name of the activity)
      - description: 活動的標題或核心概念 (Brief description of the core concept)
      - objective: 學習目標 (Main learning goal or purpose)
      - timing: 使用時機 (When to use: lesson introduction, during unit, after unit, review, etc.)
      - materials: 所需教具 (Required tools, materials, or props)
      - environment: 環境要求 (Seating arrangement, space needs, equipment conditions)
      - steps: 活動步驟 (Step-by-step process of teacher-student interactions as array)
      - assessmentPoints: 評估重點 (Learning effectiveness observation and assessment criteria as array)

    Output MUST be a valid JSON array of objects, e.g.:
    [
      {
        "title": "適合${e.name}的遊戲化活動1",
        "description": "活動1針對此程度的核心概念與玩法簡述...",
        "objective": "活動1符合${e.name}程度的學習目標...",
        "timing": "適用於單元導入/單元後/複習時等...",
        "materials": "此程度所需教材、道具或工具...",
        "environment": "座位安排、空間需求、設備條件...",
        "steps": ["步驟1: 教師說明規則...", "步驟2: 學生分組...", "步驟3: 進行活動..."],
        "assessmentPoints": ["觀察學生參與度", "檢查概念理解程度", "評估協作能力"]
      },
      // ... more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(r,t)},se=async(s,e,t,n)=>{const r=`
    基於主題「${s}」、選定的學習程度「${e.name}」(${e.description})，
    以及學習目標：${JSON.stringify(n)}

    請產生適合「${e.name}」程度學習者的互動測驗題目。
    題目難度和複雜度應符合：「${e.description}」。

    輸出必須是有效的 JSON 物件，格式如下：
    {
      "easy": {
        "trueFalse": [
          { "statement": "暖身判斷題1...", "isTrue": true, "explanation": "可選說明1" },
          { "statement": "暖身判斷題2...", "isTrue": false, "explanation": "可選說明2" }
          // ... 至少 5 題，若有更多更好
        ],
        "multipleChoice": [
          { "question": "暖身選擇題1...", "options": ["選項A", "選項B", "選項C"], "correctAnswerIndex": 0 },
          { "question": "暖身選擇題2...", "options": ["選項A", "選項B", "選項C"], "correctAnswerIndex": 1 }
          // ... 至少 5 題，若有更多更好
        ],
        "fillInTheBlanks": [
          { "sentenceWithBlank": "暖身填空題1...____...", "correctAnswer": "正確答案1" },
          { "sentenceWithBlank": "暖身填空題2...____...", "correctAnswer": "正確答案2" }
          // ... 至少 5 題，若有更多更好
        ],
        "sentenceScramble": [
          { "originalSentence": "暖身句子1...", "scrambledWords": ["...", "...", "..."] },
          { "originalSentence": "暖身句子2...", "scrambledWords": ["...", "...", "..."] }
          // ... 至少 5 題，若有更多更好
        ],
        "memoryCardGame": [
          {
            "pairs": [
              { "question": "卡片1正面", "answer": "卡片1背面" },
              { "question": "卡片2正面", "answer": "卡片2背面" },
              { "question": "卡片3正面", "answer": "卡片3背面" },
              { "question": "卡片4正面", "answer": "卡片4背面" },
              { "question": "卡片5正面", "answer": "卡片5背面" }
              // ... 至少 5 組配對，若有更多更好
            ],
            "instructions": "請將每個卡片正面與正確的背面配對。"
          }
        ]
      },
      "normal": { /* 符合所選程度的題目，結構同 easy，memoryCardGame 只 1 題，pairs 至少 5 組 */ },
      "hard": { /* 此程度的挑戰題目，結構同 easy，memoryCardGame 只 1 題，pairs 至少 5 組 */ }
    }

    對於每種測驗類型 (trueFalse, multipleChoice, fillInTheBlanks, sentenceScramble)，每個難度等級 (easy, normal, hard) 至少產生 5 題，若有更多更好。
    對於 memoryCardGame，每個難度只產生 1 題，但內部的 "pairs" 陣列必須包含至少 5 組配對（每組配對是與「${s}」相關的概念、詞彙/定義、問答或翻譯），若有更多更好。
    每個 memoryCardGame 題目都應包含清楚的 "instructions" 說明配對任務。
    所有文字使用主題的主要語言。請勿包含任何說明或額外文字，僅輸出 JSON 物件。
  `;return await m(r,t)},ie=async(s,e,t,n)=>{const r=`
    Based on the following learning objectives: ${JSON.stringify(n)}
    Please generate a short, natural English conversation (at least 3 lines, but more is better if appropriate, 2 speakers) about the topic "${s}" (use English translation if topic is not English) appropriate for "${e.name}" level learners (${e.description}).
    Language complexity and vocabulary should match: "${e.description}".
    Output MUST be a valid JSON array, e.g.:
    [
      { "speaker": "Speaker A", "line": "Hello! Let's talk about ${s}." },
      { "speaker": "Speaker B", "line": "Great idea! What's the first thing we should discuss regarding ${s}?" },
      { "speaker": "Speaker A", "line": "Perhaps we can start with..." },
      { "speaker": "Speaker B", "line": "I think examples would help." }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(r,t)},ae=async(s,e,t,n)=>{const r=`
    Please generate at least 3 (but more is better if appropriate) clear and distinct learning objectives for the topic: "${s}" appropriate for learning level "${e.name}" (${e.description}) and English vocabulary level "${t.name}" (${t.wordCount} words: ${t.description}).
    The objectives should be based on scaffolding theory and gamification, written in the primary language of the topic, and tailored to both the learner's level and vocabulary constraints.
    For each objective, provide the objective statement, a detailed description, and a concrete teaching example (such as a sample sentence, scenario, or application).

    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - All English text must use vocabulary within the ${t.wordCount} most common English words
    - Adjust language complexity to match ${t.description}
    - Avoid advanced vocabulary that exceeds this level

    Output MUST be a valid JSON array of objects, e.g.:
    [
      {
        "objective": "能夠理解${s}在${e.name}程度的核心概念（英文內容限制在${t.wordCount}詞彙範圍）",
        "description": "此目標針對${e.name}程度和${t.name}詞彙量學習者的詳細描述...",
        "teachingExample": "使用${t.wordCount}詞彙範圍內的英文例句和教學示例..."
      },
      {
        "objective": "能夠應用${s}的${e.name}級技能（適合${t.name}程度學習者）",
        "description": "培養在詞彙限制下的實際應用能力...",
        "teachingExample": "提供符合${t.wordCount}詞彙量的實際應用情境..."
      },
      {
        "objective": "能夠辨識${s}在此程度和詞彙量的常見誤區",
        "description": "幫助學習者識別和避免在此詞彙程度下的常見錯誤...",
        "teachingExample": "使用簡單詞彙展示常見誤區和正確做法..."
      },
      //...or more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(r,n)},oe=async(s,e,t,n,r)=>{const i=/english|英語|英文|grammar|vocabulary|pronunciation|speaking|listening|reading|writing/i.test(s),a=`
    Based on the following learning objectives: ${JSON.stringify(r)}
    Please break down the topic "${s}" into at least 3 (but more is better if appropriate) micro-units appropriate for "${e.name}" level learners (${e.description}) with English vocabulary level "${t.name}" (${t.wordCount} words: ${t.description}).

    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - All English text must use vocabulary within the ${t.wordCount} most common English words
    - Teaching examples should match ${t.description}
    - Avoid complex words that exceed this vocabulary level
    - Sentence structures should be appropriate for ${t.name} learners

    ${i?`
    SPECIAL REQUIREMENTS FOR ENGLISH LEARNING TOPICS:
    For each breakdown item, also include:
    - coreConcept: 該要點的核心學習概念 (core learning concept for this point)
    - teachingSentences: 3-5句教學例句，使用${t.wordCount}詞彙範圍 (array of 3-5 teaching sentences using vocabulary within ${t.wordCount} words)
    - teachingTips: 教學要點提示與說明 (teaching tips and explanations)

    Output format for English learning topics:
    [
      {
        "topic": "適合${t.name}的子主題A",
        "details": "子主題A針對${t.wordCount}詞彙量的簡要說明...",
        "teachingExample": "子主題A使用${t.name}程度詞彙的教學示例...",
        "coreConcept": "此要點的核心概念...",
        "teachingSentences": ["Simple example 1", "Easy sentence 2", "Basic example 3"],
        "teachingTips": "教學要點與提示說明..."
      }
    ]
    `:`
    Standard output format:
    [
      { "topic": "適合${t.name}的子主題A", "details": "子主題A針對${t.wordCount}詞彙量的簡要說明...", "teachingExample": "子主題A使用${t.name}程度詞彙的教學示例..." }
    ]
    `}

    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(a,n)},ce=async(s,e,t,n,r)=>{const i=`
    Based on the following learning objectives: ${JSON.stringify(r)}
    Generate at least 3 (but more is better if appropriate) comprehensive analysis of common misconceptions or difficulties that "${e.name}" level learners (${e.description}) with English vocabulary level "${t.name}" (${t.wordCount} words: ${t.description}) may have with "${s}".

    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - All explanations must use vocabulary within the ${t.wordCount} most common English words
    - Examples should be appropriate for ${t.description}
    - Focus on confusion points that arise specifically at this vocabulary level

    Output MUST be a valid JSON array with the following comprehensive structure:
    [
      {
        "point": "適合${t.name}詞彙程度的易混淆點標題",
        "clarification": "使用${t.wordCount}詞彙範圍的澄清說明",
        "teachingExample": "適合${t.name}程度的教學示例",
        "errorType": "誤區類型 (概念性/程序性/語言性/理解性)",
        "commonErrors": ["此詞彙程度學生的典型錯誤示例1", "此詞彙程度學生的典型錯誤示例2", "此詞彙程度學生的典型錯誤示例3"],
        "correctVsWrong": [
          {
            "correct": "使用${t.wordCount}詞彙範圍的正確示例",
            "wrong": "此詞彙程度學生常犯的錯誤示例",
            "explanation": "適合此詞彙程度的對比說明"
          }
        ],
        "preventionStrategy": "針對${t.name}詞彙程度的預防策略",
        "correctionMethod": "適合此詞彙程度的糾正方法",
        "practiceActivities": ["適合此詞彙程度的練習活動1", "適合此詞彙程度的練習活動2", "適合此詞彙程度的練習活動3"]
      }
    ]

    All English content must stay within the ${t.wordCount} word vocabulary limit and match ${e.description}.
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(i,n)},le=async(s,e,t,n,r)=>{const i=`
    Based on the following learning objectives: ${JSON.stringify(r)}
    Suggest at least 3 (but more is better if appropriate) engaging, interactive classroom activities (preferably game-like) for the topic "${s}" suitable for "${e.name}" level learners (${e.description}) with English vocabulary level "${t.name}" (${t.wordCount} words: ${t.description}).

    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - Activity instructions must use vocabulary within the ${t.wordCount} most common English words
    - Activity content should match ${t.description}
    - Consider vocabulary limitations when designing complexity

    For each activity, provide the following comprehensive fields:
      - title: 活動名稱/主題 (The name of the activity)
      - description: 活動的標題或核心概念 (Brief description of the core concept)
      - objective: 學習目標 (Main learning goal or purpose)
      - timing: 使用時機 (When to use: lesson introduction, during unit, after unit, review, etc.)
      - materials: 所需教具 (Required tools, materials, or props)
      - environment: 環境要求 (Seating arrangement, space needs, equipment conditions)
      - steps: 活動步驟 (Step-by-step process of teacher-student interactions as array)
      - assessmentPoints: 評估重點 (Learning effectiveness observation and assessment criteria as array)

    Output MUST be a valid JSON array of objects, e.g.:
    [
      {
        "title": "適合${t.name}的遊戲化活動1",
        "description": "活動1針對${t.wordCount}詞彙量的核心概念與玩法簡述...",
        "objective": "活動1符合${t.name}程度的學習目標...",
        "timing": "適用於單元導入/單元後/複習時等...",
        "materials": "適合此詞彙程度的教材、道具或工具...",
        "environment": "座位安排、空間需求、設備條件...",
        "steps": ["步驟1: 教師說明規則...", "步驟2: 學生分組...", "步驟3: 進行活動..."],
        "assessmentPoints": ["觀察學生參與度", "檢查概念理解程度", "評估協作能力"]
      },
      // ... more items
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(i,n)},de=async(s,e,t,n,r)=>{const i=`
    Based on the following learning objectives: ${JSON.stringify(r)}
    Please generate quiz content for "${s}" suitable for learning level "${e.name}" (${e.description}) and English vocabulary level "${t.name}" (${t.wordCount} words: ${t.description}).

    CRITICAL VOCABULARY CONSTRAINTS for English content:
    - All English text in quiz questions, options, and examples must use vocabulary within the ${t.wordCount} most common English words
    - Sentence structures should be appropriate for ${t.description}
    - Avoid advanced vocabulary that exceeds this level

    Output in the following JSON structure (no explanation, no extra text):
    {
      "easy": {
        "trueFalse": [
          { "statement": "簡單判斷題1...", "isTrue": true, "explanation": "可選說明1" },
          { "statement": "簡單判斷題2...", "isTrue": false, "explanation": "可選說明2" }
          // ... 至少 5 題，若有更多更好
        ],
        "multipleChoice": [
          { "question": "簡單選擇題1...", "options": ["選項A", "選項B", "選項C"], "correctAnswerIndex": 0 },
          { "question": "簡單選擇題2...", "options": ["選項A", "選項B", "選項C"], "correctAnswerIndex": 1 }
          // ... 至少 5 題，若有更多更好
        ],
        "fillInTheBlanks": [
          { "sentenceWithBlank": "簡單填空題1...____...", "correctAnswer": "正確答案1" },
          { "sentenceWithBlank": "簡單填空題2...____...", "correctAnswer": "正確答案2" }
          // ... 至少 5 題，若有更多更好
        ],
        "sentenceScramble": [
          { "originalSentence": "簡單句子1...", "scrambledWords": ["...", "...", "..."] },
          { "originalSentence": "簡單句子2...", "scrambledWords": ["...", "...", "..."] }
          // ... 至少 5 題，若有更多更好
        ],
        "memoryCardGame": [
          {
            "pairs": [
              { "question": "卡片1正面", "answer": "卡片1背面" },
              { "question": "卡片2正面", "answer": "卡片2背面" },
              { "question": "卡片3正面", "answer": "卡片3背面" },
              { "question": "卡片4正面", "answer": "卡片4背面" },
              { "question": "卡片5正面", "answer": "卡片5背面" }
              // ... 至少 5 組配對，若有更多更好
            ],
            "instructions": "請將每個卡片正面與正確的背面配對。"
          }
        ]
      },
      "normal": { /* same structure as easy, memoryCardGame 只 1 題，pairs 至少 5 組 */ },
      "hard": { /* same structure as easy, memoryCardGame 只 1 題，pairs 至少 5 組 */ }
    }
    For each quiz type (trueFalse, multipleChoice, fillInTheBlanks, sentenceScramble), generate at least 5 questions per difficulty level (easy, normal, hard), but more is better if appropriate.
    For memoryCardGame, generate ONLY 1 question per difficulty, but the "pairs" array inside must contain at least 5 pairs (each pair is a related concept, word/definition, Q&A, or translation relevant to '${s}'), and more is better if appropriate.
    Each memoryCardGame question should include clear "instructions" for the matching task.
    All text must be in the primary language of the topic. For English learning topics, limit English vocabulary to ${t.wordCount} most common words. Only output the JSON object, no explanation or extra text.
  `;return await m(i,n)},ue=async(s,e,t,n,r)=>{const i=`
    Based on the following learning objectives: ${JSON.stringify(r)}
    Please generate a short, natural English conversation (at least 3 lines, but more is better if appropriate, 2 speakers) about the topic "${s}" (use English translation if topic is not English) appropriate for "${e.name}" level learners (${e.description}) with English vocabulary level "${t.name}" (${t.wordCount} words: ${t.description}).

    CRITICAL VOCABULARY CONSTRAINTS:
    - Use ONLY vocabulary within the ${t.wordCount} most common English words
    - Sentence structures must be appropriate for ${t.description}
    - Conversation complexity should match ${t.name} level
    - Avoid advanced vocabulary that exceeds this level
    - Keep sentences simple and clear for ${t.name} learners

    Output MUST be a valid JSON array, e.g.:
    [
      { "speaker": "Speaker A", "line": "Hello! Let's talk about ${s} using simple words for ${t.name} level." },
      { "speaker": "Speaker B", "line": "Great idea! What should we discuss first about ${s}?" },
      { "speaker": "Speaker A", "line": "Perhaps we can start with..." },
      { "speaker": "Speaker B", "line": "I think examples would help." }
    ]
    Do NOT include any explanation or extra text. Only output the JSON array.
  `;return await m(i,n)},pe=async(s,e,t,n,r,i)=>{const o=(g=>{const u={...g};for(const f of["easy","normal","hard"]){u[f]||(u[f]={});const h=u[f];h.trueFalse=Math.min(Math.max(h.trueFalse||0,0),10),h.multipleChoice=Math.min(Math.max(h.multipleChoice||0,0),10),h.fillInTheBlanks=Math.min(Math.max(h.fillInTheBlanks||0,0),10),h.sentenceScramble=Math.min(Math.max(h.sentenceScramble||0,0),10),h.memoryCardGame=Math.min(Math.max(h.memoryCardGame||0,0),2)}return u})(n),c=async g=>{const u=o[g];let f="";r&&(f=`適合「${r.name}」程度學習者 (${r.description}) 的`);let h="";i&&(h=`
      CRITICAL VOCABULARY CONSTRAINTS for English content:
      - All English text must use vocabulary within the ${i.wordCount} most common English words
      - Examples should be appropriate for ${i.description}
      `);const O=`
      Based on the following learning objectives: ${JSON.stringify(t)}
      Please generate ${f}quiz content for "${s}" with the following specific quantities:

      - True/False questions: ${u.trueFalse} questions
      - Multiple choice questions: ${u.multipleChoice} questions
      - Fill in the blanks questions: ${u.fillInTheBlanks} questions
      - Sentence scramble questions: ${u.sentenceScramble} questions
      - Memory card game questions: ${u.memoryCardGame} questions

      ${h}

      Output MUST be a valid JSON object with this exact structure:
      {
        "trueFalse": [${u.trueFalse>0?`
          { "statement": "是非題題目", "isTrue": true, "explanation": "可選說明" }
          // 總共 ${u.trueFalse} 題`:"// 空陣列，因為設定為 0 題"}],
        "multipleChoice": [${u.multipleChoice>0?`
          { "question": "選擇題題目", "options": ["選項A", "選項B", "選項C", "選項D"], "correctAnswerIndex": 0 }
          // 總共 ${u.multipleChoice} 題`:"// 空陣列，因為設定為 0 題"}],
        "fillInTheBlanks": [${u.fillInTheBlanks>0?`
          { "sentenceWithBlank": "填空題題目，空格用 ____ 表示", "correctAnswer": "正確答案" }
          // 總共 ${u.fillInTheBlanks} 題`:"// 空陣列，因為設定為 0 題"}],
        "sentenceScramble": [${u.sentenceScramble>0?`
          { "originalSentence": "正確的完整句子", "scrambledWords": ["打散", "的", "單字", "陣列"] }
          // 總共 ${u.sentenceScramble} 題`:"// 空陣列，因為設定為 0 題"}],
        "memoryCardGame": [${u.memoryCardGame>0?`
          { "pairs": [{"question": "卡片正面", "answer": "卡片背面"}, ...], "instructions": "遊戲說明" }
          // 總共 ${u.memoryCardGame} 題，每題至少包含 5 對卡片`:"// 空陣列，因為設定為 0 題"}]
      }

      IMPORTANT:
      - Generate EXACTLY the number of questions specified for each type (supports up to 10 questions for most types, 2 for memory card games)
      - If a question type is set to 0, provide an empty array []
      - For memoryCardGame, each question should contain at least 5 pairs in the "pairs" array
      - Maximum limits: trueFalse/multipleChoice/fillInTheBlanks/sentenceScramble up to 10 questions, memoryCardGame up to 2 questions
      - All text must be in the primary language of the topic
      - Do NOT include any explanation or extra text, only output the JSON object
    `;return await m(O,e)},[d,l,p]=await Promise.all([c("easy"),c("normal"),c("hard")]);return{easy:d,normal:l,hard:p}},Ie=async(s,e,t,n,r)=>await pe(s,"",e,t,n,r),Re=async(s,e,t,n,r)=>{const i=/[a-zA-Z]/.test(s),a=`
    Please provide detailed feedback for this ${e} practice work:

    Original Prompt: ${JSON.stringify(t)}
    Student Work: "${s}"

    ${r&&i?`
    VOCABULARY LEVEL CONTEXT:
    - Target level: ${r.name} (${r.wordCount} words: ${r.description})
    - Evaluate if vocabulary usage matches this level
    `:""}

    Provide comprehensive feedback in JSON format:
    {
      "score": 85,
      "strengths": ["具體優點1", "具體優點2"],
      "improvements": ["改進建議1", "改進建議2"],
      "grammarCorrections": [
        {
          "original": "原文片段",
          "corrected": "修正後版本",
          "explanation": "修正原因說明"
        }
      ],
      "vocabularyTips": ["詞彙使用建議1", "詞彙使用建議2"],
      "structureFeedback": "結構和組織回饋",
      "overallComment": "整體評語和鼓勵"
    }

    Evaluation Criteria:
    - Grammar accuracy and sentence structure
    - Vocabulary appropriateness and variety
    - Content relevance to the prompt
    - Clarity and coherence
    - Appropriate use of language for the target level
    ${r?`- Adherence to ${r.name} vocabulary constraints`:""}

    Provide constructive, encouraging feedback that helps the student improve.
    All feedback text should be in Traditional Chinese except for specific English examples in corrections.
    Do NOT include any explanation or extra text outside the JSON structure.
  `;return await m(a,n)},R=async(s,e,t,n,r)=>{const i=`
    Based on the topic "${s}" and learning objectives: ${JSON.stringify(t)}
    Generate 6 sentence-making practice prompts (2 easy, 2 normal, 2 hard difficulty).

    ${n?`The content should be suitable for "${n.name}" level learners (${n.description}).`:""}
    ${r?`
    VOCABULARY CONSTRAINTS for English content:
    - All instructions and keywords must use vocabulary within the ${r.wordCount} most common English words
    - Examples should be appropriate for ${r.description}
    `:""}

    Output MUST be a valid JSON array:
    [
      {
        "id": "sentence_1",
        "instruction": "造句指示說明",
        "keywords": ["關鍵詞1", "關鍵詞2", "關鍵詞3"],
        "exampleSentence": "範例句子",
        "hints": ["提示1", "提示2"],
        "difficulty": "easy"
      }
    ]

    Requirements:
    - Each prompt should include 2-4 keywords that must be used
    - Provide clear instructions in the primary language of the topic
    - Include helpful hints for sentence construction
    - Example sentences should demonstrate proper usage
    - Progressive difficulty from easy to hard

    Do NOT include explanation, only output the JSON array.
  `,a=`
    Based on the topic "${s}" and learning objectives: ${JSON.stringify(t)}
    Generate 6 writing practice prompts (2 easy, 2 normal, 2 hard difficulty).

    ${n?`The content should be suitable for "${n.name}" level learners (${n.description}).`:""}
    ${r?`
    VOCABULARY CONSTRAINTS for English content:
    - All instructions and suggested keywords must use vocabulary within the ${r.wordCount} most common English words
    - Writing requirements should match ${r.description}
    `:""}

    Output MUST be a valid JSON array:
    [
      {
        "id": "writing_1",
        "title": "寫作題目標題",
        "instruction": "詳細的寫作指示",
        "structure": ["段落1：介紹", "段落2：主要內容", "段落3：結論"],
        "keywords": ["建議詞彙1", "建議詞彙2"],
        "minLength": 100,
        "maxLength": 300,
        "exampleOutline": "範例大綱結構",
        "difficulty": "easy"
      }
    ]

    Requirements:
    - Easy: 100-200 words, simple structure
    - Normal: 200-400 words, moderate complexity
    - Hard: 300-600 words, complex structure
    - Provide clear writing guidelines and structure suggestions
    - Include relevant vocabulary recommendations
    - All text in the primary language of the topic

    Do NOT include explanation, only output the JSON array.
  `,[o,c]=await Promise.all([m(i,e),m(a,e)]);return{sentencePractice:o,writingPractice:c,instructions:"這裡提供了造句和寫作練習，幫助學習者提升語言表達能力。造句練習著重於詞彙運用，寫作練習則訓練文章結構和論述能力。完成後可以使用AI批改功能獲得即時回饋。"}},ge=s=>{const e=[];return s.forEach((t,n)=>{if(!t.pairs||!Array.isArray(t.pairs)){e.push(`遊戲 ${n+1}: 缺少 pairs 陣列`);return}const r=new Set,i=new Set;t.pairs.forEach((a,o)=>{if(!a.left||!a.right){e.push(`遊戲 ${n+1}, 配對 ${o+1}: 缺少 left 或 right 內容`);return}r.has(a.left)&&e.push(`遊戲 ${n+1}: 左側內容重複 - "${a.left}"`),i.has(a.right)&&e.push(`遊戲 ${n+1}: 右側內容重複 - "${a.right}"`),r.add(a.left),i.add(a.right)})}),{isValid:e.length===0,issues:e}},je=async(s,e,t)=>{const n=`
    Based on the following transformed student-friendly content, generate quiz questions that help students practice and reinforce their understanding:
    
    Step Type: ${e}
    Content: ${JSON.stringify(s)}
    
    Generate EXACTLY the requested number of questions for each type:
    - True/False: ${t.trueFalse} questions
    - Multiple Choice: ${t.multipleChoice} questions  
    - Memory Card Game: ${t.memoryCardGame} pair set(s)
    
    Quiz Design Principles:
    1. Questions should directly test understanding of the content provided
    2. Use student-friendly language that matches the transformed content tone
    3. Make questions engaging and practical
    4. Include clear explanations for correct answers
    5. For memory card games, create concept-definition or question-answer pairs
    6. Avoid trick questions; focus on genuine comprehension
    
    CRITICAL for Memory Card Games:
    - Each "left" and "right" content must be COMPLETELY UNIQUE across all pairs
    - NO duplicate content on either left or right side
    - Each pair should test a different concept or knowledge point
    - Students should never be confused about which card matches which
    - All content in left column must be distinct from each other
    - All content in right column must be distinct from each other
    - Create clear, unambiguous one-to-one relationships
    
    Output MUST be a valid JSON object with this exact structure:
    {
      "trueFalse": [
        { 
          "statement": "清楚的是非判斷陳述句...", 
          "isTrue": true, 
          "explanation": "解釋為什麼這個陳述是正確/錯誤的..."
        }
        // exactly ${t.trueFalse} items
      ],
      "multipleChoice": [
        { 
          "question": "測試理解的選擇題問題...", 
          "options": ["選項A", "選項B", "選項C", "選項D"], 
          "correctAnswerIndex": 0,
          "explanation": "解釋為什麼這個答案是正確的..."
        }
        // exactly ${t.multipleChoice} items
      ],
      "memoryCardGame": [
        {
          "title": "配對遊戲標題",
          "pairs": [
            { "left": "第一個概念", "right": "第一個概念的定義或對應" },
            { "left": "第二個概念", "right": "第二個概念的定義或對應" },
            { "left": "第三個概念", "right": "第三個概念的定義或對應" },
            { "left": "第四個概念", "right": "第四個概念的定義或對應" },
            { "left": "第五個概念", "right": "第五個概念的定義或對應" }
            // at least 5 pairs per game
          ]
        }
        // exactly ${t.memoryCardGame} games
      ]
    }
    
    All content should be in Traditional Chinese and directly related to the provided learning content.
    Make questions that genuinely help students practice and remember the key concepts.
    Do NOT include any explanation or extra text outside the JSON structure.
  `,r=await m(n,"provider-system-call");if(r.memoryCardGame&&Array.isArray(r.memoryCardGame)){const i=ge(r.memoryCardGame);i.isValid||(console.warn("記憶卡遊戲驗證失敗:",i.issues),r._validationWarnings=i.issues)}return r},P=async(s,e,t,n)=>{const r=`
    Based on the topic "${s}" and learning objectives: ${JSON.stringify(t)}
    Please generate 3-4 learning levels that are specific to this topic. Each level should have a unique name, description, and order.
    The levels should progress from basic understanding to advanced mastery, tailored specifically to the subject matter.

    Output MUST be a valid JSON object with this exact structure:
    {
      "suggestedLevels": [
        {
          "id": "beginner",
          "name": "初學者",
          "description": "適合首次接觸${s}的學習者，著重基礎概念理解",
          "order": 1
        },
        {
          "id": "intermediate",
          "name": "進階者",
          "description": "已具備基礎知識，能進行${s}的實際應用",
          "order": 2
        },
        {
          "id": "advanced",
          "name": "專精者",
          "description": "深度掌握${s}，能分析複雜情況並提供解決方案",
          "order": 3
        }
      ],
      "defaultLevelId": "beginner"
    }

    Make sure to:
    1. Create level names and descriptions that are specific to the topic (not generic)
    2. Use appropriate terminology for the subject area
    3. Ensure descriptions explain what learners at each level can do
    4. Use the primary language of the topic for names and descriptions

    Do NOT include any explanation or extra text. Only output the JSON object.
  `;return await n(r,e)},De=async(s,e,t)=>{console.log(`生成學習程度建議 (Provider 系統): ${s}`);const n=await F(s,e);return await P(s,e,n,t)},Me=s=>{const e=["english","grammar","vocabulary","pronunciation","speaking","writing","reading","listening","conversation","toefl","ielts","toeic","english literature","business english","academic english","phrasal verbs","idioms","prepositions","tenses","articles","adjectives","adverbs","nouns","verbs","英語","英文","文法","單字","發音","口說","寫作","閱讀","聽力","對話","會話","托福","雅思","多益","商業英文","學術英文","片語動詞","慣用語","介系詞","時態","冠詞","形容詞","副詞","名詞","動詞"],t=s.toLowerCase();return e.some(n=>t.includes(n))},_e=async(s,e,t)=>{console.log(`開始生成學習計劃 (Provider 系統): ${s}`);const n=await F(s,e);console.log("✓ 學習目標生成完成");const[r,i,a,o,c,d,l]=await Promise.all([Q(s,e,n),Y(s,e,n),H(s,e,n),X(s,e,n),Z(s,e,n),P(s,e,n,t),R(s,e,n)]);return console.log("✓ 所有內容生成完成 (Provider 系統)"),{learningObjectives:n,contentBreakdown:r,confusingPoints:i,classroomActivities:a,onlineInteractiveQuiz:o,englishConversation:c,learningLevels:d,writingPractice:l}},Be=async(s,e,t,n)=>{console.log(`開始生成學習計劃 (有程度設定, Provider 系統): ${s}, 程度: ${e?.name||"未指定"}`);const r=await ee(s,e,t);console.log("✓ 程度特定學習目標生成完成");const[i,a,o,c,d,l,p]=await Promise.all([te(s,e,t,r),ne(s,e,t,r),re(s,e,t,r),se(s,e,t,r),ie(s,e,t,r),P(s,t,r,n),R(s,t,r,e)]);return console.log("✓ 所有程度特定內容生成完成 (Provider 系統)"),{learningObjectives:r,contentBreakdown:i,confusingPoints:a,classroomActivities:o,onlineInteractiveQuiz:c,englishConversation:d,learningLevels:l,writingPractice:p}},Je=async(s,e,t,n,r)=>{console.log(`開始生成學習計劃 (有程度和詞彙設定, Provider 系統): ${s}, 程度: ${e?.name||"未指定"}, 詞彙: ${t?.name||"未指定"}`);const i=await ae(s,e,t,n);console.log("✓ 程度和詞彙特定學習目標生成完成");const[a,o,c,d,l,p,g]=await Promise.all([oe(s,e,t,n,i),ce(s,e,t,n,i),le(s,e,t,n,i),de(s,e,t,n,i),ue(s,e,t,n,i),P(s,n,i,r),R(s,n,i,e,t)]);return console.log("✓ 所有程度和詞彙特定內容生成完成 (Provider 系統)"),{learningObjectives:i,contentBreakdown:a,confusingPoints:o,classroomActivities:c,onlineInteractiveQuiz:d,englishConversation:l,learningLevels:p,writingPractice:g}},qe=async()=>await C.hasConfiguredProviders(),Fe=async s=>await C.addProvider(s),Ge=async()=>(console.log("Provider 系統初始化中..."),!0),T=async s=>{try{const e=await L(s);let t=e;if(typeof t=="string"){let n=t.trim();const r=/^```(\w*)?\s*\n?(.*?)\n?\s*```$/s,i=n.match(r);if(i&&i[2]&&(n=i[2].trim()),!n.startsWith("{")&&!n.startsWith("[")&&(n.includes("{")||n.includes("["))){const a=n.indexOf("{"),o=n.indexOf("[");let c=-1,d=-1;a!==-1&&(o===-1||a<o)?(c=a,d=n.lastIndexOf("}")):o!==-1&&(c=o,d=n.lastIndexOf("]")),c!==-1&&d!==-1&&d>c&&(n=n.substring(c,d+1))}try{t=JSON.parse(n)}catch{throw console.error("AI 回傳原始內容 (JSON parse 失敗):",e),new Error("AI 模型傳回的資料格式無法解析 (可能不是有效的 JSON)。請嘗試修改您的主題或重試。")}}return t}catch(e){let t="無法產生診斷內容。";throw e instanceof Error&&(t+=` 詳細資料： ${e.message}`),new Error(t)}},me=s=>{const e=new Map;return s.forEach(t=>{e.has(t.questionType)||e.set(t.questionType,{questionType:t.questionType,totalQuestions:0,correctCount:0,accuracy:0,averageTime:0,commonErrors:[],difficultyBreakdown:{easy:{total:0,correct:0,accuracy:0},normal:{total:0,correct:0,accuracy:0},hard:{total:0,correct:0,accuracy:0}}})}),s.forEach(t=>{const n=e.get(t.questionType);n.totalQuestions++,t.isCorrect&&n.correctCount++;const r=n.difficultyBreakdown[t.difficulty];r.total++,t.isCorrect&&r.correct++,r.accuracy=r.total>0?Math.round(r.correct/r.total*100):0}),e.forEach(t=>{t.accuracy=t.totalQuestions>0?Math.round(t.correctCount/t.totalQuestions*100):0;const r=s.filter(i=>i.questionType===t.questionType).filter(i=>i.responseTime).map(i=>i.responseTime);t.averageTime=r.length>0?Math.round(r.reduce((i,a)=>i+a,0)/r.length):void 0}),Array.from(e.values())},he=s=>{if(s.length===0)return 0;const e=s.filter(t=>t.isCorrect).length;return Math.round(e/s.length*100)},fe=s=>s>=80?"advanced":s>=60?"intermediate":"beginner",ye=async(s,e)=>{const t=e.filter(o=>!o.isCorrect),n=e.filter(o=>o.isCorrect),r=t.map(o=>`
    題型: ${o.questionType}
    難度: ${o.difficulty}
    學生答案: ${JSON.stringify(o.userAnswer)}
    正確答案: ${JSON.stringify(o.correctAnswer)}
    嘗試次數: ${o.attempts||1}`).join(`
`),i=n.map(o=>`
    題型: ${o.questionType}
    難度: ${o.difficulty}
    學生答案: ${JSON.stringify(o.userAnswer)}`).join(`
`),a=`
    針對主題「${s}」的測驗表現進行學習診斷分析。
    
    總體表現：
    - 答對題数：${n.length}
    - 答錯題数：${t.length}
    - 正確率：${Math.round(n.length/e.length*100)}%
    
    答錯題目詳細分析：${r}
    
    答對題目詳細分析：${i}
    
    請提供以下 JSON 結構的分析（不要解釋，不要額外文字）：
    {
      "strengths": [
        {
          "area": "學生的具體強項領域",
          "description": "根據答對的題目類型和內容，詳細描述學生的優勢",
          "level": "good|excellent|outstanding",
          "examples": ["從答對題目中提取的具體表現例子"],
          "leverageOpportunities": ["如何利用此強項來改善弱點的具體建議"]
        }
      ],
      "weaknesses": [
        {
          "area": "根據錯誤題目整理出的知識漏洞領域",
          "description": "分析錯誤原因：是概念不清、計算錯誤、還是理解偏差？",
          "severity": "low|medium|high",
          "affectedTopics": ["具體受影響的知識點或技能"],
          "recommendedActions": ["針對此類錯誤的具體改進方法和練習建議"]
        }
      ],
      "learningStyle": "根據答題表現推測的學習風格（如：視覺型、邏輯型、記憶型等）",
      "cognitivePattern": "認知模式分析（如：敬重細節、善於整體把握等）"
    }
    
    請用繁體中文回答，並提供對學生和教師都有價值的教育洞察。特別要針對錯誤題目做出具體分析和改進建議。
  `;try{return await T(a)}catch(o){return console.error("AI 學習分析生成失敗:",o),{strengths:[],weaknesses:[],learningStyle:"無法分析",cognitivePattern:"需要更多數據"}}},we=async(s,e,t,n,r)=>{const i=`
    Generate personalized learning recommendations for a student based on their performance analysis.
    
    Context:
    - Topic: "${s}"
    - Overall Score: ${e}%
    - Learning Level: ${t}
    - Key Strengths: ${n.map(a=>a.area).join(", ")}
    - Areas for Improvement: ${r.map(a=>a.area).join(", ")}
    
    Please provide 3-5 personalized recommendations in the following JSON structure (no explanation, no extra text):
    {
      "recommendations": [
        {
          "category": "immediate|short-term|long-term",
          "priority": "high|medium|low",
          "title": "建議標題",
          "description": "詳細說明為什麼需要這個建議",
          "actionSteps": ["具體行動步驟1", "具體行動步驟2"],
          "expectedOutcome": "預期能達到的成果",
          "estimatedTime": "預估需要投入的時間",
          "resources": ["推薦的學習資源"]
        }
      ]
    }
    
    Focus on actionable, specific recommendations that consider the student's current level and identified strengths/weaknesses.
    Respond in Traditional Chinese (繁體中文).
  `;try{return(await T(i)).recommendations||[]}catch(a){return console.error("AI 個人化建議生成失敗:",a),[]}},ve=async(s,e,t,n,r,i,a)=>{const c=(a?.filter(l=>!l.isCorrect)||[]).map(l=>`
  - ${l.questionType} (難度: ${l.difficulty}): 你的答案「${JSON.stringify(l.userAnswer)}」，正確答案是「${JSON.stringify(l.correctAnswer)}」`).join(""),d=`
    為學生提供關於主題「${s}」的學習回饋和指導。
    
    表現概要：
    - 總分：${e}%
    - 學習水平：${t}
    - 主要強項：${n.map(l=>l.area).join("、")}
    - 需要改進的領域：${r.map(l=>l.area).join("、")}
    
    錯誤題目詳情：${c}
    
    請提供學生友善的回饋，使用以下 JSON 結構（不要解釋，不要額外文字）：
    {
      "encouragementMessage": "根據實際分數給出的鼓勵訊息，要具體且正面",
      "keyStrengths": ["從答對的題目中發現的具體強項", "另一個強項", "第三個強項"],
      "improvementAreas": ["根據錯誤題目整理的具體需加強領域", "另一個需加強領域"],
      "nextSteps": ["針對錯誤題目的具體改進行動", "強化練習建議", "補強知識漏洞的方法"],
      "studyTips": ["針對錯誤類型的實用學習技巧", "加強記憶的方法", "提高理解的策略"],
      "motivationalQuote": "激勵學生繼續努力的結尾話"
    }
    
    使用鼓勵、正向的語言，適合學生閱讀。重點關注成長心態和可實行的建議。
    請用繁體中文回答，特別要針對具體錯誤提供有針對性的改進建議。
  `;try{const l=await T(d);return{studentId:i,overallScore:e,overallLevel:t,encouragementMessage:l.encouragementMessage||"你的學習表現很棒！",keyStrengths:l.keyStrengths||[],improvementAreas:l.improvementAreas||[],nextSteps:l.nextSteps||[],studyTips:l.studyTips||[],motivationalQuote:l.motivationalQuote||"持續努力，你會更進步！"}}catch(l){return console.error("AI 學生回饋生成失敗:",l),{studentId:i,overallScore:e,overallLevel:t,encouragementMessage:"你的學習表現很棒！繼續保持這個學習態度。",keyStrengths:["積極參與測驗","展現學習動機"],improvementAreas:["需要更多練習"],nextSteps:["重新檢視錯誤題目","加強基礎概念","定期練習"],studyTips:["制定規律的學習時間","多做類似練習題","請教老師或同學"],motivationalQuote:"每一次練習都讓你更接近目標！"}}},Se=async(s,e,t,n,r,i)=>{const o=(i?.filter(d=>!d.isCorrect)||[]).map(d=>`
  - 題型: ${d.questionType}, 難度: ${d.difficulty}
    學生答案: ${JSON.stringify(d.userAnswer)}
    正確答案: ${JSON.stringify(d.correctAnswer)}
    嘗試次數: ${d.attempts||1}`).join(""),c=`
    為主題「${s}」提供教學建議，根據學生評量結果。
    
    表現概要：
    - 總體表現：${e}%
    - 強項：${n.map(d=>d.area).join("、")}
    - 需要支援的領域：${r.map(d=>d.area).join("、")}
    - 各題型表現：${t.map(d=>`${d.questionType}: ${d.accuracy}%`).join("、")}
    
    具體錯誤模式分析：${o}
    
    請提供教學建議，使用以下 JSON 結構（不要解釋，不要額外文字）：
    {
      "immediateInterventions": ["根據具體錯誤類型提供的立即介入措施", "針對知識漏洞的急需處理方法"],
      "instructionalStrategies": ["針對錯誤模式的教學策略", "加強理解的教學方法", "預防相似錯誤的策略"],
      "differentiation": ["根據錯誤類型設計的差異化教學", "適合不同學習風格的調整"],
      "parentGuidance": ["家長在家輔導的具體建議", "家庭練習的重點領域"]
    }
    
    重點在於實用、基於證據的教學策略，並針對識別出的強項和弱點提供具體建議。
    請用繁體中文回答，特別要針對學生的具體錯誤提供有針對性的教學建議。
  `;try{const d=await T(c);return{immediateInterventions:d.immediateInterventions||[],instructionalStrategies:d.instructionalStrategies||[],differentiation:d.differentiation||[],parentGuidance:d.parentGuidance||[]}}catch(d){return console.error("AI 教學建議生成失敗:",d),{immediateInterventions:[],instructionalStrategies:[],differentiation:[],parentGuidance:[]}}},Ue=async s=>{try{const e=me(s.responses),t=he(s.responses),n=fe(t),r=await ye(s.topic,s.responses),i=await we(s.topic,t,n,r.strengths,r.weaknesses),a=await ve(s.topic,t,n,r.strengths,r.weaknesses,s.studentId,s.responses),o=await Se(s.topic,t,e,r.strengths,r.weaknesses,s.responses),c={studentId:s.studentId,assessmentDate:new Date().toISOString(),topic:s.topic,overallPerformance:{totalScore:t,level:n,timeSpent:s.endTime&&s.startTime?Math.round((new Date(s.endTime).getTime()-new Date(s.startTime).getTime())/6e4):0},performanceByType:e,learningAnalysis:r,teachingRecommendations:o,personalizedRecommendations:i,progressTracking:{keyMetrics:["正確率提升","回答速度","概念理解深度"],checkpoints:["一週後複習","兩週後小測驗","一個月後綜合評估"],reassessmentSuggestion:"建議在完成建議的學習活動後，於 2-3 週內進行重新評估"}};return{session:s,studentFeedback:a,teacherReport:c,rawData:{responses:s.responses,statistics:e},generatedAt:new Date().toISOString()}}catch(e){throw console.error("生成學習診斷失敗:",e),new Error("無法生成學習診斷報告，請稍後重試")}},Le=(s,e)=>({sessionId:`session_${Date.now()}_${Math.random().toString(36).slice(2,11)}`,studentId:e,topic:s,startTime:new Date().toISOString(),responses:[],isCompleted:!1,metadata:{userAgent:navigator.userAgent,deviceType:/Mobi|Android/i.test(navigator.userAgent)?"mobile":"desktop"}}),Ve=s=>({...s,endTime:new Date().toISOString(),isCompleted:!0}),E="https://api.jsonbin.io/v3/b",A="$2a$10$0PieG5Wm.V.6svtN4PbaTuVxU4LY0nL2Vaz4N3g2aYlb0cL1NG4Qa";async function We(s){const t=await(await fetch(E,{method:"POST",headers:{"Content-Type":"application/json","X-Master-Key":A,"X-Bin-Private":"false"},body:JSON.stringify(s)})).json();if(!t||!t.metadata||!t.metadata.id)throw new Error("無法取得 jsonbin id");return t.metadata.id}async function ze(s){const t=await(await fetch(`https://api.jsonbin.io/v3/b/${s}/latest`,{})).json();if(!t||!t.record)throw new Error("找不到對應的教學方案");return t.record}async function Ke(s){const e={type:"quiz",quiz:s.quiz,topic:s.topic,apiKey:s.apiKey,metadata:s.metadata,createdAt:new Date().toISOString(),supportsDiagnostic:!!s.apiKey},n=await(await fetch(E,{method:"POST",headers:{"Content-Type":"application/json","X-Master-Key":A,"X-Bin-Private":"false"},body:JSON.stringify(e)})).json();if(!n||!n.metadata||!n.metadata.id)throw new Error("無法儲存測驗內容");return n.metadata.id}async function Qe(s){const t=await(await fetch(`https://api.jsonbin.io/v3/b/${s}/latest`,{})).json();if(!t||!t.record)throw new Error("找不到對應的測驗內容");const n=t.record;if(n.type!=="quiz")throw new Error("此連結不是測驗專用分享");return{quiz:n.quiz,topic:n.topic,apiKey:n.apiKey,supportsDiagnostic:n.supportsDiagnostic||!1,metadata:n.metadata}}async function Ye(s){const e={type:"writing",writingPractice:s.writingPractice,topic:s.topic,metadata:s.metadata,createdAt:new Date().toISOString()},n=await(await fetch(E,{method:"POST",headers:{"Content-Type":"application/json","X-Master-Key":A,"X-Bin-Private":"false"},body:JSON.stringify(e)})).json();if(!n||!n.metadata||!n.metadata.id)throw new Error("無法儲存寫作練習內容");return n.metadata.id}async function He(s){const t=await(await fetch(`https://api.jsonbin.io/v3/b/${s}/latest`,{})).json();if(!t||!t.record)throw new Error("找不到對應的寫作練習內容");const n=t.record;if(n.type!=="writing")throw new Error("此連結不是寫作練習專用分享");return{writingPractice:n.writingPractice,topic:n.topic,metadata:n.metadata}}async function Xe(s){const e={type:"student-results",...s,createdAt:new Date().toISOString()},n=await(await fetch(E,{method:"POST",headers:{"Content-Type":"application/json","X-Master-Key":A,"X-Bin-Private":"false"},body:JSON.stringify(e)})).json();if(!n||!n.metadata||!n.metadata.id)throw new Error("無法儲存學生作答結果");return n.metadata.id}async function be(s){const t=await(await fetch(`https://api.jsonbin.io/v3/b/${s}/latest`,{})).json();if(!t||!t.record)throw new Error("找不到對應的學生作答結果");const n=t.record;if(n.type!=="student-results")throw new Error("此連結不是學生作答結果專用分享");return{studentName:n.studentName,topic:n.topic,difficulty:n.difficulty,responses:n.responses,overallScore:n.overallScore,completedAt:n.completedAt,quizBinId:n.quizBinId,quizContent:n.quizContent,metadata:n.metadata,diagnosticReport:n.diagnosticReport}}async function Ze(s,e){const r={type:"student-results",...{...await be(s),diagnosticReport:{...e,generatedAt:new Date().toISOString(),resultsBinId:s},updatedAt:new Date().toISOString()}},a=await(await fetch(`https://api.jsonbin.io/v3/b/${s}`,{method:"PUT",headers:{"Content-Type":"application/json","X-Master-Key":A},body:JSON.stringify(r)})).json();if(!a||!a.metadata)throw new Error("無法更新學生作答結果")}async function et(s){const e={type:"conversation-practice",practice:s.practice,metadata:s.metadata,createdAt:new Date().toISOString()},n=await(await fetch(E,{method:"POST",headers:{"Content-Type":"application/json","X-Master-Key":A,"X-Bin-Private":"false"},body:JSON.stringify(e)})).json();if(!n||!n.metadata||!n.metadata.id)throw new Error("無法儲存英文對話練習內容");return n.metadata.id}async function tt(s){const t=await(await fetch(`https://api.jsonbin.io/v3/b/${s}/latest`,{})).json();if(!t||!t.record)throw new Error("找不到對應的分享內容");return t.record}class $e{async generateConversationPractice(e){const{callGemini:t}=await I(async()=>{const{callGemini:a}=await import("./gemini-service-BbqOGSh7.js").then(o=>o.m);return{callGemini:a}},__vite__mapDeps([0,1,2,3])),n=this.buildConversationPrompt(e),r=await t(n);return{id:`conv_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,...r}}buildConversationPrompt(e){return`
Generate an English conversation practice exercise with the following specifications:

Topic: "${e.topic}"
Scenario: "${e.scenario}"
Difficulty Level: ${e.difficulty}
Number of Participants: ${e.participantCount}
Target Duration: ${e.duration} minutes
${e.focusAreas?`Focus Areas: ${e.focusAreas.join(", ")}`:""}
${e.culturalContext?`Cultural Context: ${e.culturalContext}`:""}

Please generate a comprehensive conversation practice in the following JSON structure (output ONLY the JSON, no explanation):

{
  "title": "Conversation title in English",
  "scenario": "Detailed scenario description",
  "description": "What students will learn from this practice",
  "difficulty": "${e.difficulty}",
  "duration": ${e.duration},
  "participants": ["Role 1", "Role 2"${e.participantCount===3?', "Role 3"':""}],
  "dialogue": [
    {
      "id": "turn_001",
      "speaker": "Role name",
      "text": "English dialogue text",
      "translation": "Chinese translation",
      "pronunciation": "Phonetic transcription for difficult words",
      "keyWords": ["key", "vocabulary", "words"],
      "difficulty": "easy|normal|hard",
      "practicePoint": "What to focus on in this turn",
      "expectedResponseHints": ["Hint 1 for student response", "Hint 2"]
    }
    // Generate at least 8-12 dialogue turns for ${e.difficulty} level
    // Easy: 8-10 turns, Normal: 10-14 turns, Hard: 12-16 turns
  ],
  "vocabulary": [
    {
      "word": "vocabulary word",
      "pronunciation": "/fəˈnetɪk/",
      "meaning": "中文意思",
      "example": "Example sentence in English",
      "difficulty": "easy|normal|hard"
    }
    // Include at least 10-15 vocabulary items relevant to the conversation
  ],
  "practiceGoals": [
    "Learning objective 1",
    "Learning objective 2",
    "Learning objective 3"
    // At least 3-5 clear learning objectives
  ],
  "evaluationCriteria": {
    "pronunciation": 0.3,
    "grammar": 0.25,
    "fluency": 0.25,
    "appropriateness": 0.2
  },
  "culturalNotes": [
    "Cultural insight 1",
    "Cultural insight 2"
    // 2-4 cultural notes if relevant
  ],
  "commonMistakes": [
    "Common mistake 1 with correction",
    "Common mistake 2 with correction"
    // 3-5 common mistakes students might make
  ]
}

Requirements for dialogue generation:
1. Each dialogue turn should be natural and contextually appropriate
2. Include varied sentence structures appropriate for ${e.difficulty} level
3. Incorporate the vocabulary items naturally in the dialogue
4. Provide helpful hints for expected student responses
5. Progress the conversation logically toward a natural conclusion
6. Include appropriate greetings, transitions, and closings
7. For ${e.difficulty} level:
   - Easy: Simple present/past tense, basic vocabulary, short sentences
   - Normal: Mixed tenses, moderate vocabulary, compound sentences
   - Hard: Complex grammar, advanced vocabulary, sophisticated expressions

All text content should be natural English with accurate Chinese translations.
Focus on practical, real-world communication that students can apply.
`}async generateConversationFeedback(e,t,n){const{callGemini:r}=await I(async()=>{const{callGemini:a}=await import("./gemini-service-BbqOGSh7.js").then(o=>o.m);return{callGemini:a}},__vite__mapDeps([0,1,2,3])),i=`
Evaluate this English conversation practice response:

Context: ${n.practicePoint}
Expected Response Hints: ${n.expectedHints.join(", ")}
Difficulty Level: ${n.difficulty}

Original Prompt/Situation: "${e}"
Student Response: "${t}"

Please provide detailed feedback in the following JSON format (output ONLY JSON):

{
  "overallScore": [0-100 integer],
  "pronunciationScore": [0-100 integer, based on word choice and structure],
  "grammarScore": [0-100 integer],
  "fluencyScore": [0-100 integer, based on coherence and naturalness],
  "appropriatenessScore": [0-100 integer, based on context appropriateness],
  "feedback": [
    "Positive feedback point 1",
    "Positive feedback point 2",
    "Area for improvement 1",
    "Area for improvement 2"
  ],
  "suggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2",
    "Alternative expression suggestion"
  ],
  "encouragement": "Encouraging message for the student"
}

Evaluation criteria:
- Pronunciation: Judge based on likely pronunciation of written response
- Grammar: Check sentence structure, tenses, word order
- Fluency: Assess naturalness and coherence of response  
- Appropriateness: How well the response fits the conversational context
- Be constructive and encouraging while providing specific improvement suggestions
- Consider the difficulty level when scoring (more lenient for easy level)
`;return await r(i)}getConversationTemplates(){return[{category:"日常生活 (Daily Life)",scenarios:[{title:"在咖啡廳點餐",scenario:"Student plays customer ordering coffee and snacks",suggestedDifficulty:"easy",participants:["顧客","服務員"]},{title:"問路和指路",scenario:"Tourist asking for directions to nearby attractions",suggestedDifficulty:"easy",participants:["遊客","當地人"]},{title:"在超市購物",scenario:"Shopping for groceries and asking about products",suggestedDifficulty:"normal",participants:["顧客","店員"]}]},{category:"商務英文 (Business English)",scenarios:[{title:"工作面試",scenario:"Job interview for entry-level position",suggestedDifficulty:"hard",participants:["求職者","面試官"]},{title:"會議討論",scenario:"Team meeting discussing project progress",suggestedDifficulty:"hard",participants:["經理","員工A","員工B"]},{title:"客戶服務",scenario:"Handling customer complaints and inquiries",suggestedDifficulty:"normal",participants:["客服代表","顧客"]}]},{category:"旅遊英文 (Travel English)",scenarios:[{title:"機場報到",scenario:"Checking in at the airport and asking about flights",suggestedDifficulty:"normal",participants:["旅客","地勤人員"]},{title:"飯店住宿",scenario:"Checking into hotel and requesting services",suggestedDifficulty:"easy",participants:["房客","櫃台人員"]},{title:"觀光景點",scenario:"Visiting tourist attractions and asking about information",suggestedDifficulty:"normal",participants:["遊客","導遊"]}]},{category:"學術英文 (Academic English)",scenarios:[{title:"課堂討論",scenario:"Participating in classroom discussion about a topic",suggestedDifficulty:"hard",participants:["學生","教授"]},{title:"圖書館詢問",scenario:"Asking librarian for help finding resources",suggestedDifficulty:"normal",participants:["學生","圖書館員"]}]}]}getDifficultyLevels(){return[{level:"easy",description:"初級 - 適合英文基礎學習者",characteristics:["使用基本詞彙和簡單句型","現在式和過去式為主","對話內容直接明確","較短的對話輪次","日常生活場景"]},{level:"normal",description:"中級 - 適合有一定英文基礎的學習者",characteristics:["混合使用多種時態","中等難度詞彙","複合句和複雜句型","需要推理和延伸回應","工作和社交場景"]},{level:"hard",description:"高級 - 適合英文程度較好的學習者",characteristics:["高級詞彙和慣用語","複雜的語法結構","需要批判性思考","抽象概念討論","專業和學術場景"]}]}}const nt=new $e;class Ae{constructor(){this.dbName="AILearningPageGenerator",this.version=1,this.storeName="lessonPlans",this.db=null}async init(){return new Promise((e,t)=>{const n=indexedDB.open(this.dbName,this.version);n.onerror=()=>{t(new Error("Failed to open IndexedDB"))},n.onsuccess=r=>{this.db=r.target.result,e()},n.onupgradeneeded=r=>{const i=r.target.result;if(!i.objectStoreNames.contains(this.storeName)){const a=i.createObjectStore(this.storeName,{keyPath:"id"});a.createIndex("topic","topic",{unique:!1}),a.createIndex("createdAt","createdAt",{unique:!1}),a.createIndex("lastAccessedAt","lastAccessedAt",{unique:!1})}}})}async ensureDB(){if(this.db||await this.init(),!this.db)throw new Error("Database not initialized");return this.db}async saveLessonPlan(e){const t=await this.ensureDB();return new Promise((n,r)=>{const o=t.transaction([this.storeName],"readwrite").objectStore(this.storeName).put(e);o.onsuccess=()=>n(),o.onerror=()=>r(new Error("Failed to save lesson plan"))})}async getAllLessonPlans(){const e=await this.ensureDB();return new Promise((t,n)=>{const o=e.transaction([this.storeName],"readonly").objectStore(this.storeName).index("lastAccessedAt").openCursor(null,"prev"),c=[];o.onsuccess=d=>{const l=d.target.result;l?(c.push(l.value),l.continue()):t(c)},o.onerror=()=>n(new Error("Failed to get lesson plans"))})}async getLessonPlan(e){const t=await this.ensureDB();return new Promise((n,r)=>{const o=t.transaction([this.storeName],"readonly").objectStore(this.storeName).get(e);o.onsuccess=()=>{const c=o.result;n(c||null)},o.onerror=()=>r(new Error("Failed to get lesson plan"))})}async updateLastAccessed(e){const t=await this.getLessonPlan(e);t&&(t.lastAccessedAt=new Date().toISOString(),await this.saveLessonPlan(t))}async deleteLessonPlan(e){const t=await this.ensureDB();return new Promise((n,r)=>{const o=t.transaction([this.storeName],"readwrite").objectStore(this.storeName).delete(e);o.onsuccess=()=>n(),o.onerror=()=>r(new Error("Failed to delete lesson plan"))})}async searchLessonPlans(e){const t=await this.getAllLessonPlans(),n=e.toLowerCase();return t.filter(r=>r.topic.toLowerCase().includes(n))}async getSharedLessonPlans(){return(await this.getAllLessonPlans()).filter(t=>t.metadata?.isShared===!0)}async getLocalLessonPlans(){return(await this.getAllLessonPlans()).filter(t=>!t.metadata?.isShared)}async cleanupOldLessonPlans(e=50){const t=await this.getAllLessonPlans();if(t.length>e){const n=t.slice(e);for(const r of n)await this.deleteLessonPlan(r.id)}}async getStorageStats(){const e=await this.getAllLessonPlans();return{totalCount:e.length,totalSizeEstimate:JSON.stringify(e).length,oldestPlan:e[e.length-1]?.topic,newestPlan:e[0]?.topic}}}const rt=new Ae,Oe=()=>{const s=Date.now(),e=Math.random().toString(36).substr(2,9);return`lesson_${s}_${e}`},st=(s,e)=>{const t=new Date().toISOString();return{id:Oe(),topic:s,createdAt:t,lastAccessedAt:t,content:e,metadata:{totalSections:[e.learningObjectives,e.contentBreakdown,e.confusingPoints,e.classroomActivities,e.quiz,e.writingPractice].filter(Boolean).length,hasQuiz:!!e.quiz,hasWriting:!!e.writingPractice}}};class Ce{constructor(){this.dbName="InteractiveContentDB",this.version=1,this.db=null}async init(){if(!this.db)return new Promise((e,t)=>{const n=indexedDB.open(this.dbName,this.version);n.onerror=()=>{t(new Error("Failed to open InteractiveContent database"))},n.onsuccess=()=>{this.db=n.result,e()},n.onupgradeneeded=r=>{const i=r.target.result;if(!i.objectStoreNames.contains("interactiveContent")){const a=i.createObjectStore("interactiveContent",{keyPath:"lessonPlanId"});a.createIndex("topic","topic",{unique:!1}),a.createIndex("lastAccessedAt","lastAccessedAt",{unique:!1})}}})}ensureDB(){if(!this.db)throw new Error("Database not initialized. Call init() first.");return this.db}async saveVersion(e,t,n,r,i,a){console.log("=== interactiveContentStorage.saveVersion 開始 ==="),console.log("參數:",{lessonPlanId:e,topic:t,transformedData:n,selectedSteps:r,versionName:i,description:a});try{const o=this.ensureDB();console.log("✅ 獲取資料庫連接成功");const c=`version_${Date.now()}`,d=new Date().toISOString();return console.log("生成版本ID:",c),new Promise((l,p)=>{const g=o.transaction(["interactiveContent"],"readwrite"),u=g.objectStore("interactiveContent");console.log("✅ 開始資料庫事務");const f=u.get(e);console.log("查詢現有記錄:",e),f.onsuccess=()=>{console.log("✅ 查詢現有記錄成功");const h=f.result;console.log("現有記錄:",h?`存在，包含 ${h.versions.length} 個版本`:"不存在");const O={id:c,name:i||`版本 ${d.slice(0,19).replace("T"," ")}`,description:a,createdAt:d,lastModifiedAt:d,transformedData:n,selectedSteps:r};console.log("新版本物件:",O);const j={lessonPlanId:e,topic:t,versions:h?[...h.versions,O]:[O],lastAccessedAt:d};console.log("準備保存記錄:",j);const x=u.put(j);x.onsuccess=()=>{console.log("✅ 版本保存成功"),l(c)},x.onerror=G=>{console.error("❌ 保存版本失敗:",G),console.error("putRequest.error:",x.error),p(new Error(`Failed to save interactive content version: ${x.error?.message||"Unknown error"}`))}},f.onerror=h=>{console.error("❌ 查詢現有記錄失敗:",h),console.error("getRequest.error:",f.error),p(new Error(`Failed to get existing interactive content: ${f.error?.message||"Unknown error"}`))},g.onerror=h=>{console.error("❌ 資料庫事務失敗:",h),p(new Error(`Database transaction failed: ${g.error?.message||"Unknown error"}`))}})}catch(o){throw console.error("❌ interactiveContentStorage.saveVersion 異常:",o),o}}async getVersions(e){const t=this.ensureDB();return new Promise((n,r)=>{const o=t.transaction(["interactiveContent"],"readonly").objectStore("interactiveContent").get(e);o.onsuccess=()=>{const c=o.result;n(c?c.versions:[])},o.onerror=()=>{r(new Error("Failed to get interactive content versions"))}})}async getVersion(e,t){return(await this.getVersions(e)).find(r=>r.id===t)||null}async updateVersion(e,t,n){const r=this.ensureDB();return new Promise((i,a)=>{const c=r.transaction(["interactiveContent"],"readwrite").objectStore("interactiveContent"),d=c.get(e);d.onsuccess=()=>{const l=d.result;if(!l){a(new Error("Interactive content record not found"));return}const p=l.versions.findIndex(u=>u.id===t);if(p===-1){a(new Error("Version not found"));return}l.versions[p]={...l.versions[p],...n,lastModifiedAt:new Date().toISOString()};const g=c.put(l);g.onsuccess=()=>i(),g.onerror=()=>a(new Error("Failed to update version"))},d.onerror=()=>{a(new Error("Failed to get interactive content"))}})}async deleteVersion(e,t){const n=this.ensureDB();return new Promise((r,i)=>{const o=n.transaction(["interactiveContent"],"readwrite").objectStore("interactiveContent"),c=o.get(e);c.onsuccess=()=>{const d=c.result;if(!d){i(new Error("Interactive content record not found"));return}if(d.versions=d.versions.filter(l=>l.id!==t),d.versions.length===0){const l=o.delete(e);l.onsuccess=()=>r(),l.onerror=()=>i(new Error("Failed to delete record"))}else{const l=o.put(d);l.onsuccess=()=>r(),l.onerror=()=>i(new Error("Failed to update record"))}},c.onerror=()=>{i(new Error("Failed to get interactive content"))}})}async getAllRecords(){const e=this.ensureDB();return new Promise((t,n)=>{const a=e.transaction(["interactiveContent"],"readonly").objectStore("interactiveContent").getAll();a.onsuccess=()=>{t(a.result)},a.onerror=()=>{n(new Error("Failed to get all interactive content records"))}})}async updateLastAccessed(e){const t=this.ensureDB();return new Promise((n,r)=>{const a=t.transaction(["interactiveContent"],"readwrite").objectStore("interactiveContent"),o=a.get(e);o.onsuccess=()=>{const c=o.result;if(c){c.lastAccessedAt=new Date().toISOString();const d=a.put(c);d.onsuccess=()=>n(),d.onerror=()=>r(new Error("Failed to update last accessed time"))}else n()},o.onerror=()=>{r(new Error("Failed to get interactive content"))}})}}const it=new Ce;class Ee{constructor(){this.synthesis=null,this.recognition=null,this.isRecording=!1,this.initializeSpeechSynthesis(),this.initializeSpeechRecognition()}initializeSpeechSynthesis(){"speechSynthesis"in window&&(this.synthesis=window.speechSynthesis)}isTTSSupported(){return this.synthesis!==null}getAvailableVoices(){return this.synthesis?this.synthesis.getVoices().filter(e=>e.lang.startsWith("en")):[]}speak(e,t={},n,r,i){return new Promise((a,o)=>{if(!this.synthesis){o(new Error("Text-to-Speech not supported in this browser"));return}this.synthesis.cancel();const c=new SpeechSynthesisUtterance(e),l={...{lang:"en-US",rate:1,pitch:1,volume:1},...t};c.lang=l.lang,c.rate=l.rate,c.pitch=l.pitch,c.volume=l.volume;const p=this.getAvailableVoices(),g=p.find(u=>u.lang===l.lang&&!u.name.includes("Google"))||p.find(u=>u.lang===l.lang)||p[0];g&&(c.voice=g),c.onstart=()=>{n?.()},c.onend=()=>{r?.(),a()},c.onerror=u=>{i?.(u),o(u)},this.synthesis.speak(c)})}stopSpeaking(){this.synthesis&&this.synthesis.cancel()}pauseSpeaking(){this.synthesis&&this.synthesis.pause()}resumeSpeaking(){this.synthesis&&this.synthesis.resume()}isSpeaking(){return this.synthesis?.speaking||!1}initializeSpeechRecognition(){const e=window.SpeechRecognition||window.webkitSpeechRecognition||window.mozSpeechRecognition||window.msSpeechRecognition;e&&(this.recognition=new e)}isSTTSupported(){return this.recognition!==null}startRecording(e={},t,n,r,i){return new Promise((a,o)=>{if(!this.recognition){o(new Error("Speech recognition not supported in this browser"));return}if(this.isRecording){o(new Error("Already recording"));return}const d={...{lang:"en-US",continuous:!1,interimResults:!0,maxAlternatives:3},...e};this.recognition.lang=d.lang,this.recognition.continuous=d.continuous,this.recognition.interimResults=d.interimResults,this.recognition.maxAlternatives=d.maxAlternatives,this.recognition.onstart=()=>{this.isRecording=!0,r?.()},this.recognition.onresult=l=>{for(let p=l.resultIndex;p<l.results.length;p++){const g=l.results[p][0].transcript,u=l.results[p][0].confidence;t?.({text:g,confidence:u||.8,isFinal:l.results[p].isFinal})}},this.recognition.onerror=l=>{this.isRecording=!1,n?.(l),o(l)},this.recognition.onend=()=>{this.isRecording=!1,i?.(),a()};try{this.recognition.start()}catch(l){this.isRecording=!1,o(l)}})}stopRecording(){this.recognition&&this.isRecording&&this.recognition.stop()}isCurrentlyRecording(){return this.isRecording}analyzePronunciation(e,t){const n=e.toLowerCase().split(/\s+/),r=t.toLowerCase().split(/\s+/),i=[],a=[];n.forEach(d=>{const l=d.replace(/[.,!?;:]/g,"");r.some(p=>p.replace(/[.,!?;:]/g,"").includes(l)||l.includes(p.replace(/[.,!?;:]/g,"")))?i.push(d):a.push(d)});const o=n.length>0?i.length/n.length*100:0,c=[];return o<70&&c.push("Try speaking more slowly and clearly"),a.length>0&&c.push(`Practice these words: ${a.slice(0,3).join(", ")}`),t.length<e.length*.5&&c.push("Speak louder and closer to the microphone"),{accuracy:Math.round(o),suggestions:c,matchedWords:i,missedWords:a}}getSupportStatus(){const e=navigator.userAgent;let t="Unknown browser";return e.includes("Chrome")?t="Chrome":e.includes("Firefox")?t="Firefox":e.includes("Safari")?t="Safari":e.includes("Edge")&&(t="Edge"),{ttsSupported:this.isTTSSupported(),sttSupported:this.isSTTSupported(),browserInfo:t}}}const at=new Ee;class J{static async encrypt(e,t){try{const n=crypto.getRandomValues(new Uint8Array(16)),r=await crypto.subtle.importKey("raw",new TextEncoder().encode(t),{name:"PBKDF2"},!1,["deriveKey"]),i=await crypto.subtle.deriveKey({name:"PBKDF2",salt:n,iterations:1e5,hash:"SHA-256"},r,{name:"AES-GCM",length:256},!1,["encrypt"]),a=crypto.getRandomValues(new Uint8Array(12)),o=await crypto.subtle.encrypt({name:"AES-GCM",iv:a},i,new TextEncoder().encode(e)),c=new Uint8Array(n.length+a.length+o.byteLength);return c.set(n,0),c.set(a,n.length),c.set(new Uint8Array(o),n.length+a.length),btoa(String.fromCharCode(...c))}catch(n){throw console.error("加密失敗:",n),new Error("加密數據失敗")}}static async decrypt(e,t){try{const n=new Uint8Array(atob(e).split("").map(l=>l.charCodeAt(0))),r=n.slice(0,16),i=n.slice(16,28),a=n.slice(28),o=await crypto.subtle.importKey("raw",new TextEncoder().encode(t),{name:"PBKDF2"},!1,["deriveKey"]),c=await crypto.subtle.deriveKey({name:"PBKDF2",salt:r,iterations:1e5,hash:"SHA-256"},o,{name:"AES-GCM",length:256},!1,["decrypt"]),d=await crypto.subtle.decrypt({name:"AES-GCM",iv:i},c,a);return new TextDecoder().decode(d)}catch(n){throw console.error("解密失敗:",n),new Error("解密數據失敗 - 請檢查密碼是否正確")}}static generateRandomPassword(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";let t="";for(let n=0;n<16;n++)t+=e.charAt(Math.floor(Math.random()*e.length));return t}static validatePasswordStrength(e){const t=[];let n=0;return e.length<8?t.push("密碼長度至少需要 8 個字符"):n+=1,/[a-z]/.test(e)?n+=1:t.push("需要包含小寫字母"),/[A-Z]/.test(e)?n+=1:t.push("需要包含大寫字母"),/[0-9]/.test(e)?n+=1:t.push("需要包含數字"),/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(e)?n+=1:t.push("建議包含特殊字符"),{isValid:n>=3,score:n,feedback:t}}}const N="https://api.jsonbin.io/v3",k="$2a$10$0PieG5Wm.V.6svtN4PbaTuVxU4LY0nL2Vaz4N3g2aYlb0cL1NG4Qa";class ot{static async createEncryptedShare(e,t,n,r){try{const i={providers:e.map(l=>({type:l.type,name:l.name,model:this.getProviderModel(l),apiKey:l.apiKey,settings:this.getProviderSettings(l),description:l.description})),sharedAt:new Date().toISOString()},a=await J.encrypt(JSON.stringify(i),n),o={id:`encrypted_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,name:t,description:r,encryptedData:a,metadata:{version:"1.0",createdAt:new Date().toISOString(),providerTypes:[...new Set(e.map(l=>l.type))],providerCount:e.length,hasEncryption:!0}},c=await fetch(`${N}/b`,{method:"POST",headers:{"Content-Type":"application/json","X-Master-Key":k},body:JSON.stringify(o)});if(!c.ok){const l=await c.text();throw new Error(`上傳失敗: ${c.statusText} - ${l}`)}return(await c.json()).metadata.id}catch(i){throw console.error("創建加密分享失敗:",i),i}}static createLegacyShare(e){return`${window.location.origin}/ai-page-gen/?apikey=${encodeURIComponent(e)}`}static async loadEncryptedShare(e,t){try{const n=await fetch(`${N}/b/${e}/latest`,{headers:{"X-Master-Key":k}});if(!n.ok){const o=await n.text();throw new Error(`載入失敗: ${n.statusText} - ${o}`)}const i=(await n.json()).record;if(!i.metadata?.hasEncryption)throw new Error("這不是一個加密的分享配置");const a=await J.decrypt(i.encryptedData,t);return JSON.parse(a)}catch(n){throw console.error("載入加密分享失敗:",n),n}}static async getSharePreview(e){try{const t=await fetch(`${N}/b/${e}/latest`,{headers:{"X-Master-Key":k}});if(!t.ok){const i=await t.text();throw new Error(`載入預覽失敗: ${t.statusText} - ${i}`)}const r=(await t.json()).record;return{name:r.name,description:r.description,providerTypes:r.metadata.providerTypes,providerCount:r.metadata.providerCount,createdAt:r.metadata.createdAt,hasEncryption:r.metadata.hasEncryption}}catch(t){throw console.error("獲取分享預覽失敗:",t),t}}static generateShareUrl(e){return`${window.location.origin}/ai-page-gen/?provider_share=${encodeURIComponent(e)}`}static parseShareUrl(){const e=new URLSearchParams(window.location.search),t=e.get("provider_share");if(t)return{type:"provider",value:t};const n=e.get("apikey");return n?{type:"legacy",value:n}:{type:null,value:null}}static getProviderModel(e){return e.type==="gemini"?e.model||"gemini-2.5-flash":e.type==="openrouter"?e.model||"openai/gpt-4o":"unknown"}static getProviderSettings(e){return e.type==="gemini"?e.settings||{}:e.type==="openrouter"?e.settings||{}:{}}static validateShareData(e){const t=[];return!e.providers||!Array.isArray(e.providers)?t.push("無效的 providers 數據"):e.providers.forEach((n,r)=>{n.type||t.push(`Provider ${r+1}: 缺少類型`),n.name||t.push(`Provider ${r+1}: 缺少名稱`),n.apiKey||t.push(`Provider ${r+1}: 缺少 API Key`),n.model||t.push(`Provider ${r+1}: 缺少模型`)}),e.sharedAt||t.push("缺少分享時間"),{isValid:t.length===0,errors:t}}static createProviderConfigsFromShare(e,t="分享的"){return e.providers.map((n,r)=>{const i={id:`shared_${Date.now()}_${r}`,name:`${t} ${n.name}`,type:n.type,enabled:!0,apiKey:n.apiKey,description:n.description||`從分享匯入的 ${n.type} 配置`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};return n.type==="gemini"?{...i,model:n.model,settings:n.settings||{responseMimeType:"application/json",temperature:.7,maxOutputTokens:8192}}:n.type==="openrouter"?{...i,model:n.model,settings:n.settings||{temperature:.7,max_tokens:8192}}:i})}static generateShareStats(e){const t={};return e.forEach(n=>{t[n.type]=(t[n.type]||0)+1}),{totalProviders:e.length,providerTypes:t,estimatedCost:"免費",securityLevel:"high"}}}export{he as $,ce as A,le as B,de as C,ue as D,R as E,Ie as F,je as G,Re as H,ze as I,rt as J,We as K,it as L,Ue as M,Ze as N,Le as O,Ve as P,nt as Q,et as R,Ye as S,Ke as T,w as U,z as V,K as W,C as X,b as Y,y as Z,S as _,Je as a,Xe as a0,Qe as a1,He as a2,be as a3,at as a4,tt as a5,J as a6,ot as a7,st as a8,Be as b,_e as c,Ge as d,m as e,Ne as f,De as g,qe as h,Me as i,Te as j,Fe as k,F as l,Q as m,Y as n,H as o,X as p,Z as q,ee as r,te as s,ke as t,ne as u,re as v,se as w,ie as x,ae as y,oe as z};
