const STORAGE_KEY = "campus-fit-quest-state-v1";

const modes = [
  { id: "normal", icon: "○", name: "正常", note: "拉伸+快走" },
  { id: "low", icon: "◐", name: "低电量", note: "3分钟也算" },
  { id: "revive", icon: "↻", name: "复活", note: "不补历史" },
  { id: "challenge", icon: "◇", name: "挑战", note: "状态很好" },
];

const tabs = [
  { id: "today", icon: "⌂", label: "今日" },
  { id: "challenge", icon: "◈", label: "挑战" },
  { id: "benefits", icon: "券", label: "权益" },
  { id: "planet", icon: "◎", label: "星球" },
  { id: "me", icon: "☰", label: "我的" },
];

const tasksByMode = {
  normal: [
    { id: "stretch-10", name: "晚饭后舒展 10 分钟", minutes: 10, energy: 32, type: "拉伸" },
    { id: "walk-1200", name: "校园快走 1200 步", minutes: 12, energy: 38, type: "有氧" },
    { id: "squat-20", name: "宿舍深蹲 20 个", minutes: 6, energy: 24, type: "力量" },
  ],
  low: [
    { id: "neck-3", name: "3 分钟肩颈拉伸", minutes: 3, energy: 16, type: "低电量" },
    { id: "stand-300", name: "站起来走 300 步", minutes: 4, energy: 14, type: "轻启动" },
    { id: "breath-1", name: "深呼吸 1 分钟", minutes: 1, energy: 8, type: "减压" },
  ],
  revive: [
    { id: "restart-5", name: "重新上线 5 分钟", minutes: 5, energy: 26, type: "复活" },
    { id: "no-debt", name: "不补昨天，只动今天", minutes: 4, energy: 18, type: "安抚" },
    { id: "walk-dorm", name: "从宿舍走到楼下", minutes: 3, energy: 12, type: "重启" },
  ],
  challenge: [
    { id: "campus-run-task", name: "校园跑 1.5km", minutes: 15, energy: 100, type: "校园跑" },
    { id: "core-8", name: "核心训练 8 分钟", minutes: 8, energy: 44, type: "力量" },
    { id: "badminton-20", name: "羽毛球挥拍 20 分钟", minutes: 20, energy: 60, type: "球类" },
  ],
};

const challenges = [
  {
    id: "dorm",
    title: "寝室不摆烂协议",
    desc: "本周寝室累计完成 8 次轻运动，点亮寝室徽章。",
    progress: 6,
    target: 8,
    action: "完成今日寝室打卡",
  },
  {
    id: "club",
    title: "跑步社共同挑战",
    desc: "社团累计 100 公里，不展示个人排名，只展示共同进度。",
    progress: 72,
    target: 100,
    action: "贡献 1.5km",
  },
  {
    id: "campus",
    title: "全校期末减压拉伸",
    desc: "已有 368 人参与，目标 500 人一起把压力降下来。",
    progress: 368,
    target: 500,
    action: "加入减压计划",
  },
  {
    id: "buddy",
    title: "今日运动搭子",
    desc: "你和搭子各完成 1 个轻任务，即可点亮双人徽章。",
    progress: 1,
    target: 2,
    action: "提醒搭子上线",
  },
];

const benefits = [
  {
    id: "fit-test",
    shop: "东门星动健身",
    tag: "减脂训练",
    distance: "距离学校东门 320m",
    offer: "0 元体测 + 体验课",
    until: "有效期至 2026-05-31",
  },
  {
    id: "pilates",
    shop: "轻氧普拉提馆",
    tag: "肩颈体态",
    distance: "距离图书馆 650m",
    offer: "体态评估券 + 首课 5 折",
    until: "有效期至 2026-06-10",
  },
  {
    id: "badminton",
    shop: "南门羽毛球馆",
    tag: "球类挑战",
    distance: "距离操场 480m",
    offer: "低峰时段 19.9 元场地券",
    until: "还剩 5 张",
  },
];

const badgeDefs = [
  ["restart", "重新启动", "↻"],
  ["small-step", "不完全躺平", "◐"],
  ["weekly", "本周小进步", "↑"],
  ["stable", "稳定发挥", "≋"],
  ["night-run", "校园夜跑者", "☾"],
  ["buddy", "寝室战友", "◆"],
  ["benefit", "权益探索家", "券"],
  ["revive", "低谷反弹", "↗"],
  ["cert", "校园运动达人", "★"],
];

const defaultState = {
  loggedIn: false,
  privacyStatus: null,
  tab: "today",
  detail: null,
  mode: "low",
  offline: false,
  completedTasks: [],
  claimedBenefits: [],
  joinedChallenges: [],
  pushStyle: "吐槽陪伴型",
  energyEvents: [],
  badges: [],
  route: null,
  cancellation: null,
  agreementChecked: false,
  permissions: {
    定位: "已开启",
    相机: "已开启",
    通知: "已开启",
    健康数据: "未开启",
    存储: "已开启",
  },
};

let state = loadState();
let toast = "";
let reward = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultState, ...saved } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function patch(next) {
  state = { ...state, ...next };
  saveState();
  render();
}

function energyTotal() {
  return state.energyEvents.reduce((sum, event) => sum + event.delta, 0);
}

function level() {
  return Math.max(1, Math.floor(energyTotal() / 500) + 1);
}

function totalMinutes() {
  const all = Object.values(tasksByMode).flat();
  return state.completedTasks.reduce((sum, id) => {
    if (id === "campus-run-flow") return sum + 15;
    const task = all.find((t) => t.id === id);
    return sum + (task ? task.minutes : 0);
  }, 0);
}

function reviveCount() {
  const reviveIds = tasksByMode.revive.map((t) => t.id);
  return state.completedTasks.filter((id) => reviveIds.includes(id)).length;
}

function cancellationDayInfo() {
  if (!state.cancellation) return null;
  const elapsed = Math.floor((Date.now() - state.cancellation.enteredAt) / 86400000);
  const day = Math.min(7, elapsed + 1);
  const remaining = Math.max(0, 7 - elapsed);
  return { day, remaining };
}

function showToast(message) {
  toast = message;
  render();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast = "";
    render();
  }, 2200);
}

function addEnergy(delta, type, badge) {
  const event = {
    id: `${type}-${Date.now()}`,
    type,
    delta,
    at: Date.now(),
  };
  state.energyEvents = [...state.energyEvents, event];
  if (badge && !state.badges.includes(badge)) {
    state.badges = [...state.badges, badge];
  }
  reward = `+${delta} 能量`;
  saveState();
  render();
  window.setTimeout(() => {
    reward = null;
    render();
  }, 1100);
}

function planetSvg(sizeClass = "") {
  const levelNow = level();
  const ring = levelNow >= 3 ? "#ffd166" : "#60d8ff";
  return `
    <svg class="planet ${sizeClass}" viewBox="0 0 140 140" role="img" aria-label="星球等级 ${levelNow}">
      <defs>
        <linearGradient id="planetGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#60d8ff"/>
          <stop offset="48%" stop-color="#62e6a7"/>
          <stop offset="100%" stop-color="#ff79b0"/>
        </linearGradient>
      </defs>
      <ellipse cx="70" cy="78" rx="58" ry="18" fill="none" stroke="${ring}" stroke-width="8" opacity=".8" transform="rotate(-14 70 78)"/>
      <circle cx="70" cy="66" r="42" fill="url(#planetGradient)"/>
      <path d="M42 58c18 8 42 9 62 1" stroke="rgba(255,255,255,.45)" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="88" cy="45" r="5" fill="#fff7c7"/>
      <circle cx="54" cy="76" r="7" fill="rgba(16,23,53,.22)"/>
    </svg>
  `;
}

function shell(content, withTabs = true) {
  const offlineBanner =
    state.offline && state.loggedIn
      ? `<div class="offline-bar">当前离线，运动数据会在联网后自动同步</div>`
      : "";
  return `
    <div class="desktop-shell">
      <div class="phone-frame">
        <div class="app">
          <main class="app-main">${offlineBanner}${content}</main>
          ${reward ? `<div class="reward-pop">${reward}</div>` : ""}
          ${toast ? `<div class="toast">${toast}</div>` : ""}
          ${withTabs && state.loggedIn ? renderTabs() : ""}
          ${state.privacyStatus === null ? renderPrivacyModal() : ""}
        </div>
      </div>
    </div>
  `;
}

function renderTabs() {
  return `
    <nav class="bottom-tabs" aria-label="底部导航">
      ${tabs
        .map(
          (tab) => `
            <button class="tab-btn ${state.tab === tab.id ? "active" : ""}" data-action="tab" data-tab="${tab.id}">
              <span class="tab-icon">${tab.icon}</span>
              <span>${tab.label}</span>
            </button>
          `,
        )
        .join("")}
    </nav>
  `;
}

function renderPrivacyModal() {
  return `
    <div class="modal-backdrop">
      <section class="modal">
        <div class="eyebrow">首次启动隐私说明</div>
        <h2>使用前请确认隐私与权限边界</h2>
        <p class="muted">我们只收集手机号、昵称头像、运动记录和可选校园位置，用于登录、运动激励、校园跑和附近权益推荐。</p>
        <p><strong>不会申请通讯录、麦克风或全部相册，不会后台持续定位，不会把健康数据提供给第三方。</strong></p>
        <div class="stack">
          <button class="btn" data-action="accept-privacy">同意并继续</button>
          <button class="btn ghost" data-action="browse-only">不同意，仅浏览基础功能</button>
        </div>
      </section>
    </div>
  `;
}

function renderLogin() {
  return shell(
    `
      <section class="login-screen">
        <div class="login-brand">
          ${planetSvg()}
          <h1>校园运动星球</h1>
          <p class="muted">和过去的自己比赛，用运动点亮校园权益。</p>
        </div>
        <div class="card login-panel stack">
          <label class="form-field">
            <span class="small muted">手机号</span>
            <input id="phone" value="13800138000" inputmode="tel" />
          </label>
          <label class="form-field">
            <span class="small muted">验证码</span>
            <input id="code" value="0526" inputmode="numeric" />
          </label>
          <label class="check-row">
            <input id="agreement" type="checkbox" ${state.agreementChecked ? "checked" : ""} />
            <span>我已阅读并同意
              <button class="link-btn" data-action="detail" data-detail="terms">《用户服务协议》</button>
              <button class="link-btn" data-action="detail" data-detail="privacy">《隐私政策》</button>
            </span>
          </label>
          <button class="btn" data-action="login">手机号验证码登录</button>
          <div class="two-col">
            <button class="btn secondary" data-action="login-provider" data-provider="wechat">微信授权</button>
            <button class="btn secondary" data-action="login-provider" data-provider="apple">Apple ID</button>
          </div>
          <button class="btn ghost" data-action="guest">游客模式体验</button>
        </div>
      </section>
    `,
    false,
  );
}

function renderToday() {
  if (state.route) return renderRun();
  const tasks = tasksByMode[state.mode];
  const assistant =
    state.mode === "revive"
      ? "你不是失败了，只是暂停更新了。现在完成一个重启任务就好。"
      : state.mode === "low"
        ? "今天先别卷，动 3 分钟就算星球续命成功。"
        : state.mode === "challenge"
          ? "状态不错，校园跑和社团任务都可以试试。"
          : "你最近最稳定的时间是晚饭后，要不要延续一下。";

  return `
    <div class="screen-title">
      <div>
        <div class="eyebrow">Campus Fit Quest</div>
        <h1>今日星球</h1>
      </div>
      <button class="icon-btn" title="模拟离线" data-action="offline">${state.offline ? "联网" : "离线"}</button>
    </div>
    <section class="card hero-card">
      <div class="row">
        <div>
          <div class="muted small">当前能量</div>
          <div class="energy-number">${energyTotal()}</div>
          <div class="pill">Lv.${level()} 校园运动探索者</div>
        </div>
        ${planetSvg("small-planet")}
      </div>
      <div class="card assistant-card section">
        <strong>星球小助手</strong>
        <p class="muted">${assistant}</p>
      </div>
    </section>

    <section class="section">
      <div class="row">
        <h2>状态模式</h2>
        <span class="small muted">承认状态波动</span>
      </div>
      <div class="mode-grid">
        ${modes
          .map(
            (mode) => `
              <button class="mode-btn ${state.mode === mode.id ? "active" : ""}" data-action="mode" data-mode="${mode.id}">
                <span>${mode.icon}</span>${mode.name}<br><small>${mode.note}</small>
              </button>
            `,
          )
          .join("")}
      </div>
    </section>

    <section class="section stack">
      <div class="row"><h2>今日推荐任务</h2><span class="pill">${tasks.length} 个</span></div>
      ${tasks.map(renderTask).join("")}
    </section>

    <section class="card task-card">
      <div class="row">
        <div>
          <h3>校园跑路线</h3>
          <p class="muted">操场、图书馆、东门三个点位，完成奖励 100 能量。</p>
        </div>
        <button class="btn" data-action="open-run">开始</button>
      </div>
    </section>
  `;
}

function renderTask(task) {
  const done = state.completedTasks.includes(task.id);
  return `
    <article class="card task-card ${done ? "done" : ""}">
      <div class="row">
        <div>
          <h3>${task.name}</h3>
          <div class="task-meta">
            <span class="pill">${task.minutes} 分钟</span>
            <span class="pill">+${task.energy} 能量</span>
            <span class="pill">${task.type}</span>
          </div>
        </div>
        <button class="btn ${done ? "secondary" : ""}" ${done ? "disabled" : ""} data-action="complete-task" data-task="${task.id}">
          ${done ? "已完成" : "完成"}
        </button>
      </div>
    </article>
  `;
}

function renderRun() {
  const route = state.route;
  const routeChoices = [
    ["loop", "星光操场环线", "1.5km · 15分钟 · 100能量"],
    ["library", "图书馆减压线", "1.1km · 12分钟 · 72能量"],
    ["gate", "东门权益探索线", "1.8km · 18分钟 · 120能量"],
  ];
  const points = ["起点：宿舍区", "操场打卡点", "图书馆打卡点", "终点：东门"];

  if (route.stage === "complete") {
    return `
      <div class="screen-title">
        <button class="icon-btn" data-action="close-run">←</button>
        <h2>校园跑完成</h2>
      </div>
      <section class="card hero-card stack">
        <div class="row">
          <div>
            <div class="eyebrow">Route Complete</div>
            <h1>校园夜跑者徽章已点亮</h1>
            <p class="muted">能量 +100。正式版本将通过 GPS + 二维码点位验证真实到达。</p>
          </div>
          ${planetSvg("small-planet")}
        </div>
        <button class="btn" data-action="close-run">回到今日</button>
      </section>
    `;
  }

  return `
    <div class="screen-title">
      <button class="icon-btn" data-action="close-run">←</button>
      <h2>校园跑</h2>
      <span class="pill">模拟 GPS/扫码</span>
    </div>
    <section class="card task-card stack">
      ${renderRunMap(route.step)}
      <div class="stack">
        ${routeChoices
          .map(
            ([id, name, meta]) => `
              <button class="route-choice ${route.selected === id ? "active" : ""}" data-action="select-route" data-route="${id}">
                <strong>${name}</strong><br><span class="muted small">${meta}</span>
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="progress" style="--value:${Math.min(100, (route.step / (points.length - 1)) * 100)}%"><span></span></div>
      <div>
        ${points
          .map(
            (point, index) => `
              <div class="checkpoint ${index < route.step ? "done" : index === route.step ? "current" : ""}">
                <span class="checkpoint-dot">${index + 1}</span>
                <span>${point}</span>
              </div>
            `,
          )
          .join("")}
      </div>
      <button class="btn" data-action="next-point">
        ${route.step >= points.length - 1 ? "完成路线并领取奖励" : "模拟到达下一点"}
      </button>
    </section>
  `;
}

function renderRunMap(step = 0) {
  const path = step > 0 ? Math.min(1, step / 3) : 0.08;
  return `
    <svg class="run-map" viewBox="0 0 330 190" role="img" aria-label="校园跑路线图">
      <rect x="18" y="20" width="86" height="52" rx="12" fill="rgba(96,216,255,.18)" stroke="rgba(255,255,255,.18)"/>
      <rect x="210" y="28" width="90" height="58" rx="12" fill="rgba(255,209,102,.16)" stroke="rgba(255,255,255,.18)"/>
      <ellipse cx="112" cy="138" rx="68" ry="28" fill="rgba(98,230,167,.14)" stroke="rgba(98,230,167,.45)" stroke-width="6"/>
      <rect x="218" y="126" width="74" height="38" rx="10" fill="rgba(255,121,176,.16)" stroke="rgba(255,255,255,.18)"/>
      <path d="M62 102 C92 72, 150 82, 174 113 S238 158, 270 112" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="11" stroke-linecap="round"/>
      <path d="M62 102 C92 72, 150 82, 174 113 S238 158, 270 112" fill="none" stroke="#ffd166" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="${path} 1"/>
      ${[
        [62, 102, "起"],
        [112, 138, "操"],
        [210, 86, "图"],
        [270, 112, "终"],
      ]
        .map(
          ([x, y, label], index) => `
            <circle cx="${x}" cy="${y}" r="13" fill="${index <= step ? "#62e6a7" : "#2d355d"}" stroke="#fff" stroke-opacity=".45"/>
            <text x="${x}" y="${y + 5}" text-anchor="middle" fill="#11162c" font-size="12" font-weight="900">${label}</text>
          `,
        )
        .join("")}
    </svg>
  `;
}

function renderChallenge() {
  return `
    <div class="screen-title">
      <div>
        <div class="eyebrow">Light Social</div>
        <h1>挑战</h1>
      </div>
      <span class="pill">不排名</span>
    </div>
    <section class="stack">
      ${challenges
        .map((item) => {
          const joined = state.joinedChallenges.includes(item.id);
          const progress = Math.min(100, (item.progress / item.target) * 100);
          return `
            <article class="card challenge-card stack">
              <div>
                <h3>${item.title}</h3>
                <p class="muted">${item.desc}</p>
              </div>
              <div class="progress" style="--value:${progress}%"><span></span></div>
              <div class="row">
                <span class="small muted">${item.progress}/${item.target}</span>
                <button class="btn ${joined ? "secondary" : ""}" data-action="join-challenge" data-challenge="${item.id}">
                  ${joined ? "今日已参与" : item.action}
                </button>
              </div>
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderBenefits() {
  return `
    <div class="screen-title">
      <div>
        <div class="eyebrow">Campus Benefits</div>
        <h1>权益</h1>
      </div>
      <span class="pill">合作商家</span>
    </div>
    <section class="card hero-card">
      <h2>运动兴趣分析</h2>
      <p class="muted">根据最近任务，系统识别你对 <strong>减脂训练</strong> 和 <strong>肩颈放松</strong> 兴趣较高，为你推荐以下校园周边权益。</p>
      <div class="tags">
        <span class="pill">减脂任务 5 次</span>
        <span class="pill">拉伸任务 4 次</span>
        <span class="pill">权益转化模拟</span>
      </div>
    </section>
    <section class="section stack">
      ${benefits.map(renderBenefit).join("")}
    </section>
  `;
}

function renderBenefit(item) {
  const claimed = state.claimedBenefits.includes(item.id);
  return `
    <article class="card benefit-card stack">
      <div class="row">
        <div>
          <h3>${item.shop}</h3>
          <div class="tags">
            <span class="pill">${item.tag}</span>
            <span class="pill">${item.distance}</span>
          </div>
        </div>
        <span class="pill">合作商家</span>
      </div>
      <div>
        <strong>${item.offer}</strong>
        <p class="muted small">${item.until}</p>
      </div>
      ${claimed ? `<div class="benefit-code">核销码 CFQ-${item.id.toUpperCase().slice(0, 4)}-0526</div>` : ""}
      <button class="btn ${claimed ? "secondary" : ""}" data-action="claim-benefit" data-benefit="${item.id}">
        ${claimed ? "已领取 · 待核销" : "领取权益"}
      </button>
    </article>
  `;
}

function renderPlanet() {
  const unlocked = new Set(state.badges);
  const taskCount = state.completedTasks.length;
  const minutesCount = totalMinutes();
  const reviveDone = reviveCount();
  const allActions = taskCount + state.joinedChallenges.length;
  const certProgress = Math.min(100, Math.round(((taskCount + state.badges.length * 2) / 16) * 100));
  return `
    <div class="screen-title">
      <div>
        <div class="eyebrow">My Planet</div>
        <h1>星球档案</h1>
      </div>
      <span class="pill">认证进度 ${certProgress}%</span>
    </div>
    <section class="card hero-card">
      <div class="row">
        <div>
          <div class="energy-number">Lv.${level()}</div>
          <p class="muted">总能量 ${energyTotal()} · 本周运动 ${taskCount} 次 · 中断后重启 ${reviveDone} 次</p>
        </div>
        ${planetSvg()}
      </div>
    </section>
    <section class="section card task-card">
      <h2>与上周的我对比</h2>
      <table class="compare-table">
        <thead><tr><th>指标</th><th>上周</th><th>本周</th></tr></thead>
        <tbody>
          <tr><td>运动次数</td><td>2 次</td><td>${taskCount} 次</td></tr>
          <tr><td>累计时长</td><td>35 分钟</td><td>${minutesCount} 分钟</td></tr>
          <tr><td>完成任务</td><td>5 个</td><td>${allActions} 个</td></tr>
          <tr><td>中断后重启</td><td>0 次</td><td>${reviveDone} 次</td></tr>
        </tbody>
      </table>
      <p class="muted">${taskCount === 0 ? "动一下就有数据，星球在等你启程。" : "你没有打败别人，但你超过了上周的自己。"}</p>
    </section>
    <section class="section">
      <h2>个人最佳</h2>
      <div class="data-grid">
        ${[
          ["最长连续运动", "5 天"],
          ["单周最多运动", "4 次"],
          ["最长校园跑", "2.1km"],
          ["稳定时段", "晚饭后"],
        ]
          .map(([label, value]) => `<div class="data-tile"><span class="muted small">${label}</span><strong>${value}</strong></div>`)
          .join("")}
      </div>
    </section>
    <section class="section">
      <h2>成就徽章墙</h2>
      <div class="badge-grid">
        ${badgeDefs
          .map(
            ([id, name, icon]) => `
              <div class="badge ${unlocked.has(id) ? "" : "locked"}">
                <span>${icon}</span>${name}
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderMe() {
  if (state.detail) return renderDetail(state.detail);
  const modules = [
    ["profile", "个人资料", "昵称、学校、运动目标"],
    ["permissions", "权限管理中心", "定位、相机、通知、健康数据的用途和降级方案"],
    ["data", "个人信息管理", "查看、导出、删除、撤回同意"],
    ["push", "通知与提醒", "推送风格、免打扰、频率控制"],
    ["push-center", "推送预览中心", "6 类推送文案 · 频率控制 · 场景策略"],
    ["devices", "登录设备管理", "当前设备、异地登录、踢出设备"],
    ["teen", "青少年模式", "时长限制、时段限制、内容过滤"],
    ["terms", "用户服务协议", "服务规则与责任边界"],
    ["privacy", "隐私政策", "最小必要、第三方共享、用户权利"],
    ["cancel", "注销账号流程", "告知、验证、7 天冷静期、可撤回"],
    ["about", "关于产品", "版本、备案、SDK、投诉举报"],
  ];
  return `
    <div class="screen-title">
      <div>
        <div class="eyebrow">Settings</div>
        <h1>我的</h1>
      </div>
      <button class="icon-btn" data-action="reset">重置</button>
    </div>
    <section class="card hero-card">
      <div class="row">
        <div>
          <h2>谢同学</h2>
          <p class="muted">星球电量稳定恢复中 · 华东校园试点</p>
          <div class="tags"><span class="pill">温和提醒</span><span class="pill">Local First</span></div>
        </div>
        ${planetSvg("small-planet")}
      </div>
    </section>
    <section class="section settings-list">
      ${modules
        .map(
          ([id, title, desc]) => `
            <button class="card setting-row" data-action="detail" data-detail="${id}">
              <span><strong>${title}</strong><p>${desc}</p></span><span>›</span>
            </button>
          `,
        )
        .join("")}
    </section>
    <div class="two-col">
      <button class="btn secondary" data-action="logout">退出登录</button>
      <button class="btn danger" data-action="detail" data-detail="cancel">注销账号</button>
    </div>
  `;
}

function renderDetail(detail) {
  const titleMap = {
    profile: "个人资料",
    permissions: "权限管理中心",
    data: "个人信息管理",
    push: "通知与提醒",
    "push-center": "推送预览中心",
    devices: "登录设备管理",
    teen: "青少年模式",
    terms: "用户服务协议",
    privacy: "隐私政策",
    cancel: "注销账号流程",
    about: "关于产品",
  };
  return `
    <div class="screen-title">
      <button class="icon-btn" data-action="detail" data-detail="">←</button>
      <h2>${titleMap[detail] || "详情"}</h2>
    </div>
    ${detailContent(detail)}
  `;
}

function detailContent(detail) {
  if (detail === "permissions") {
    const rows = [
      ["定位", "校园跑、附近权益", "手动选择校园"],
      ["相机", "扫码打卡、扫码核销", "手动输入验证码"],
      ["通知", "运动提醒、权益到期", "站内消息中心"],
      ["健康数据", "步数、心率同步", "手动记录"],
      ["存储", "头像上传", "不上传头像"],
    ];
    return `<section class="stack">${rows
      .map(
        ([name, use, fallback]) => `
          <article class="card setting-row">
            <span><strong>${name} · ${state.permissions[name]}</strong><p>用途：${use}<br>拒绝降级：${fallback}</p></span>
            <button class="btn secondary" data-action="toggle-permission" data-permission="${name}">修改</button>
          </article>
        `,
      )
      .join("")}</section>`;
  }

  if (detail === "devices") {
    return `
      <section class="stack">
        ${[
          ["iPhone 15 · 当前设备", "上海 · 2026-05-10 09:20", true],
          ["微信内置浏览器", "杭州 · 2026-05-08 21:16", false],
          ["MacBook Chrome", "上海 · 2026-05-06 15:42", false],
        ]
          .map(
            ([name, meta, current]) => `
              <article class="card setting-row">
                <span><strong>${name}</strong><p>最后使用：${meta}</p></span>
                <button class="btn ${current ? "secondary" : "danger"}" ${current ? "disabled" : ""} data-action="kick-device">${current ? "当前" : "踢出"}</button>
              </article>
            `,
          )
          .join("")}
      </section>
    `;
  }

  if (detail === "cancel") {
    const info = cancellationDayInfo();
    if (info) {
      return `
        <section class="card task-card stack">
          <h3>注销冷静期进行中</h3>
          <div class="progress" style="--value:${(info.day / 7) * 100}%"><span></span></div>
          <p class="muted">第 ${info.day} / 7 天 · 还剩 ${info.remaining} 天到期真实删除。</p>
          <p class="muted small">期间随时可撤回，撤回后账号、能量、徽章、权益保持原样。</p>
          <button class="btn" data-action="cancel-withdraw">撤回注销，继续使用</button>
        </section>
        <section class="card task-card stack">
          <h3>到期后将删除的数据</h3>
          <p class="muted small">手机号绑定、运动记录、能量事件流、已领取权益、徽章、设置偏好；不可恢复。</p>
        </section>
      `;
    }
    return `
      <section class="card task-card stack">
        <h3>注销路径不比注册更难</h3>
        <p class="muted">步骤 1 告知：能量、权益、徽章、运动记录将删除且不可恢复。</p>
        <p class="muted">步骤 2 身份验证：手机号验证码确认本人操作。</p>
        <p class="muted">步骤 3 冷静期：进入 7 天冷静期，期间可撤回。</p>
        <p class="muted">步骤 4 到期删除：冷静期后真实删除服务端数据。</p>
        <button class="btn danger" data-action="cancel-start">模拟进入 7 天冷静期</button>
      </section>
    `;
  }

  if (detail === "push-center") {
    const buckets = [
      ["轻启动型", "用户当天还没开始运动", [
        "今天不要求燃烧卡路里，先完成 3 分钟拉伸就算赢。",
        "你的星球电量有点低，走 800 步就能恢复一点。",
      ]],
      ["情绪安抚型", "用户中断 / 长期未完成", [
        "你不是失败了，只是暂停了几天。今天可以重新开始。",
        "星球没有怪你，它只是有点想你。",
      ]],
      ["自我进步型", "已有运动记录的用户", [
        "你这周已经运动 3 次，比上周多 1 次。",
        "你最近最稳定的运动时间是晚饭后，要不要今天也来 10 分钟？",
      ]],
      ["场景触发型", "结合大学生时间节奏", [
        "下课后的 10 分钟，适合让身体重新开机。",
        "晚饭后散步 15 分钟，给星球充一点温和能量。",
      ]],
      ["趣味人格型", "增强记忆点 · 星球小助手", [
        "小星球巡逻报告：你已经坐太久了。",
        "警告：宿舍床正在试图吞噬你，请立即进行低强度反抗。",
      ]],
      ["权益召回型", "商业转化", [
        "你最近完成了 4 次减脂任务，可以领取一次体测体验券。",
        "本周羽毛球挑战参与人数已达 36 人，低峰场地券还剩 5 张。",
      ]],
    ];
    return `
      <section class="card task-card stack">
        <h3>推送策略</h3>
        <p class="muted small">每日上限 1-2 条 · 22:30-8:00 免打扰 · 连续忽略自动降频 · 用户可按类型关闭。</p>
      </section>
      <section class="stack">
        ${buckets
          .map(
            ([name, when, msgs]) => `
              <article class="card task-card stack">
                <div>
                  <strong>${name}</strong>
                  <p class="muted small">${when}</p>
                </div>
                <div class="stack">
                  ${msgs.map((m) => `<div class="push-bubble">${m}</div>`).join("")}
                </div>
              </article>
            `,
          )
          .join("")}
      </section>
    `;
  }

  if (detail === "push") {
    return `
      <section class="card task-card stack">
        <h3>提醒风格</h3>
        <div class="stack">
          ${["温柔鼓励型", "吐槽陪伴型", "效率管理型", "健身认真型"]
            .map(
              (style) => `
                <button class="route-choice ${state.pushStyle === style ? "active" : ""}" data-action="push-style" data-style="${style}">
                  ${style}<br><span class="muted small">${pushExample(style)}</span>
                </button>
              `,
            )
            .join("")}
        </div>
        <p class="muted">每日最多 1-2 条，22:30 到 8:00 免打扰，连续忽略会自动降频。</p>
      </section>
    `;
  }

  if (detail === "data") {
    return `
      <section class="stack">
        <article class="card task-card"><h3>已收集数据</h3><p class="muted">昵称、学校、运动任务记录、权益领取记录、权限状态、本地设置。</p></article>
        <button class="btn secondary" data-action="export-data">导出我的数据</button>
        <button class="btn danger" data-action="reset">删除本地体验数据</button>
      </section>
    `;
  }

  if (detail === "teen") {
    return `<section class="card task-card"><h3>青少年模式</h3><p class="muted">启用后限制夜间使用、隐藏商业权益推荐、限制付费转化，并需要监护密码退出。</p><button class="btn secondary" data-action="generic">开启模式</button></section>`;
  }

  if (detail === "profile") {
    return `<section class="card task-card stack"><label class="form-field"><span>昵称</span><input value="谢同学"></label><label class="form-field"><span>学校</span><input value="华东校园试点"></label><label class="form-field"><span>运动目标</span><input value="先恢复运动习惯，再尝试校园跑"></label><button class="btn" data-action="generic">保存</button></section>`;
  }

  if (detail === "about") {
    return `<section class="card task-card stack"><h3>校园运动星球 v0.1.0</h3><p class="muted">第三方 SDK：MVP 暂无。备案信息：沪 ICP 备 20260510 号-演示。客服与投诉：support@campus-fit.example，7 个工作日响应。</p><p class="muted">边界声明：不承诺学分加分，不接入教务系统，不申请无关权限。</p></section>`;
  }

  if (detail === "terms") {
    return `<section class="card task-card"><h3>用户服务协议</h3><p class="muted">用户应基于真实运动行为使用本产品。平台提供运动激励、轻社交挑战和周边权益推荐服务，不替代专业医疗建议。权益由合作商家提供，页面会清晰标注合作关系。</p></section>`;
  }

  if (detail === "privacy") {
    return `<section class="card task-card"><h3>隐私政策</h3><p class="muted">我们遵循最小必要原则，仅为登录、运动记录、校园跑、权益推荐和安全风控处理个人信息。用户可在设置中查询、更正、删除、导出个人信息，并可撤回授权。</p></section>`;
  }

  return `<section class="card task-card"><p class="muted">功能建设中。</p></section>`;
}

function pushExample(style) {
  return {
    温柔鼓励型: "今天做一点点也很好。",
    吐槽陪伴型: "床又赢了？起来反抗 3 分钟。",
    效率管理型: "当前还差 1 个任务完成今日目标。",
    健身认真型: "建议完成 15 分钟低强度有氧。",
  }[style];
}

function renderMain() {
  const screens = {
    today: renderToday,
    challenge: renderChallenge,
    benefits: renderBenefits,
    planet: renderPlanet,
    me: renderMe,
  };
  return shell(screens[state.tab]());
}

function render() {
  const root = document.getElementById("root");
  if (!state.loggedIn && state.detail) {
    root.innerHTML = shell(renderDetail(state.detail), false);
    return;
  }
  root.innerHTML = state.loggedIn ? renderMain() : renderLogin();
}

function completeTask(taskId) {
  const task = Object.values(tasksByMode)
    .flat()
    .find((item) => item.id === taskId);
  if (!task || state.completedTasks.includes(taskId)) return;
  state.completedTasks = [...state.completedTasks, taskId];
  const badge = taskId.includes("restart") || state.mode === "revive" ? "restart" : task.energy >= 40 ? "stable" : "small-step";
  addEnergy(task.energy, "TASK_COMPLETE", badge);
  showToast(`完成「${task.name}」，星球电量恢复了`);
}

function handleClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "accept-privacy") patch({ privacyStatus: "accepted" });
  if (action === "browse-only") patch({ privacyStatus: "browse" });
  if (action === "login" || action === "login-provider") {
    const checked = document.getElementById("agreement")?.checked;
    if (!checked && state.privacyStatus !== "browse") {
      showToast("请先勾选协议，默认不会替你同意");
      return;
    }
    patch({ loggedIn: true, privacyStatus: state.privacyStatus || "accepted" });
    showToast("登录成功，今日任务已准备好");
  }
  if (action === "guest") patch({ loggedIn: true, privacyStatus: state.privacyStatus || "browse" });
  if (action === "tab") patch({ tab: target.dataset.tab, detail: null, route: null });
  if (action === "offline") patch({ offline: !state.offline });
  if (action === "mode") patch({ mode: target.dataset.mode });
  if (action === "complete-task") completeTask(target.dataset.task);
  if (action === "open-run") patch({ route: { selected: "loop", step: 0, stage: "progress" } });
  if (action === "close-run") patch({ route: null });
  if (action === "select-route") patch({ route: { ...state.route, selected: target.dataset.route } });
  if (action === "next-point") {
    const nextStep = state.route.step + 1;
    if (nextStep >= 4) {
      const already = state.completedTasks.includes("campus-run-flow");
      state.completedTasks = [...new Set([...state.completedTasks, "campus-run-flow"])];
      state.route = { ...state.route, stage: "complete" };
      if (!already) addEnergy(100, "CAMPUS_RUN_COMPLETE", "night-run");
      showToast("校园跑完成，徽章已点亮");
      saveState();
      render();
    } else {
      patch({ route: { ...state.route, step: nextStep } });
    }
  }
  if (action === "join-challenge") {
    const id = target.dataset.challenge;
    if (!state.joinedChallenges.includes(id)) {
      state.joinedChallenges = [...state.joinedChallenges, id];
      addEnergy(18, "CHALLENGE_JOIN", id === "buddy" || id === "dorm" ? "buddy" : "weekly");
      showToast("已加入挑战，今日贡献已记录");
    }
  }
  if (action === "claim-benefit") {
    const id = target.dataset.benefit;
    if (!state.claimedBenefits.includes(id)) {
      state.claimedBenefits = [...state.claimedBenefits, id];
      addEnergy(10, "BENEFIT_CLAIM", "benefit");
      showToast("权益已领取，核销码已生成");
    }
  }
  if (action === "detail") patch({ tab: state.loggedIn ? "me" : state.tab, detail: target.dataset.detail || null });
  if (action === "push-style") patch({ pushStyle: target.dataset.style });
  if (action === "toggle-permission") {
    const key = target.dataset.permission;
    const next = state.permissions[key] === "已开启" ? "未开启" : "已开启";
    patch({ permissions: { ...state.permissions, [key]: next } });
  }
  if (action === "export-data") {
    navigator.clipboard?.writeText(JSON.stringify(state, null, 2));
    showToast("已模拟导出数据，并复制到剪贴板");
  }
  if (action === "kick-device") showToast("已模拟踢出该设备");
  if (action === "cancel-start") {
    patch({ cancellation: { enteredAt: Date.now() } });
    showToast("已进入 7 天冷静期，第 7 天到期后真实删除");
  }
  if (action === "cancel-withdraw") {
    patch({ cancellation: null });
    showToast("已撤回注销，账号继续使用");
  }
  if (action === "generic") showToast("设置已保存");
  if (action === "logout") patch({ loggedIn: false, detail: null, route: null });
  if (action === "reset") {
    localStorage.removeItem(STORAGE_KEY);
    state = { ...defaultState, privacyStatus: "accepted", loggedIn: true };
    saveState();
    showToast("体验数据已重置");
    render();
  }
}

document.addEventListener("change", (event) => {
  if (event.target && event.target.id === "agreement") {
    state.agreementChecked = !!event.target.checked;
    saveState();
  }
});

document.addEventListener("click", handleClick);
render();
