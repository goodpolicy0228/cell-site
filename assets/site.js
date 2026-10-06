/* 共通処理：サイトマップ、フッター、品目一覧、国別バー、領域タイル */
(function(){
  const $ = id => document.getElementById(id);
  const ROOT = document.body.dataset.root || "";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const countBy = (cc, st, rows = DATA) => rows.filter(d => (!cc || d[0] === cc) && (!st || d[1] === st)).length;

  /* ===== サイトマップ（ナビゲーション）===== */
  const NAV = [
    ["index.html", "表紙"],
    ["basics.html", "01 基礎"],
    ["numbers.html", "02 全体像・地域"],
    ["domains.html", "03 領域"],
    ["list.html", "04 全品目"],
    ["regulation.html", "05 制度"],
    ["themes.html", "06 横断テーマ"],
    ["japan-ips.html", "07 日本のiPS"],
    ["caution.html", "08 注意点"],
    ["sources.html", "09 出典"]
  ];
  const here = location.pathname.split("/").pop() || "index.html";
  const inDomains = location.pathname.includes("/domains/");
  const isActive = h => h === here || (h === "domains.html" && inDomains);

  const navEl = $("site-nav");
  if (navEl) {
    navEl.innerHTML = `<nav class="topnav" aria-label="サイトマップ"><div class="wrap">
      <a class="brand" href="${ROOT}index.html">世界の細胞医療</a>
      <div class="navlinks">${NAV.map(([h, l]) => `<a href="${ROOT}${h}"${isActive(h) ? ' class="on" aria-current="page"' : ""}>${l}</a>`).join("")}</div>
    </div></nav>`;
  }

  const footEl = $("site-footer");
  if (footEl) {
    footEl.innerHTML = `<footer><div class="wrap">
      <p class="big">世界の細胞医療</p>
      <p style="margin:8px 0 0">生きた細胞で治す医療の、しくみと現在地。調査基準日 2026年10月2日。</p>
      <p style="margin:14px 0 0;color:#9fb3ae">この情報は治療の助言ではありません。治療の判断は、医師と十分に相談してください。</p>
    </div></footer>`;
  }

  /* 先頭へ戻るボタン */
  const toTop = $("toTop");
  if (toTop) {
    window.addEventListener("scroll", () => toTop.classList.toggle("show", window.scrollY > 900), {passive: true});
    toTop.addEventListener("click", () => window.scrollTo({top: 0, behavior: "smooth"}));
  }

  /* ===== 品目カード ===== */
  function card(d){
    const s = STATUS[d[1]];
    return `<article class="item ${d[1]}">
      <div class="top"><span class="badge ${s.badge}">${esc(s.label)}</span><span class="ch">第${d[2]}章 ${esc(CH[d[2]])}</span></div>
      <h4>${esc(d[3])}</h4>
      <p class="tg">対象：${esc(d[4])}</p>
      <p class="st">${esc(d[5])}</p>
      <p class="src">出典 ${esc(d[6])}</p>
    </article>`;
  }

  function chipRow(el, items, key, st, onChange){
    el.innerHTML = items.map(([v, l, n]) =>
      `<button class="chip" type="button" data-v="${esc(v)}" aria-pressed="${st[key] === v}">${esc(l)}<span class="c">${n}</span></button>`).join("");
    el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { st[key] = b.dataset.v; onChange(); }));
  }

  /* 品目一覧（一覧ページ・領域ページ共通）。body の data-chapter があれば、その領域だけを表示 */
  function mountList(){
    const groups = $("groups");
    if (!groups) return;
    const fixed = Number(document.body.dataset.chapter) || null;
    const base = fixed ? DATA.filter(d => d[2] === fixed) : DATA;
    const total = base.length;
    const st = {country: "all", status: "all", chapter: fixed ? String(fixed) : "all", q: ""};
    const cnt = (c, s) => countBy(c, s, base);

    const match = d =>
      (st.country === "all" || d[0] === st.country) &&
      (st.status === "all" || d[1] === st.status) &&
      (st.chapter === "all" || String(d[2]) === st.chapter) &&
      (!st.q || (d[3] + " " + d[4] + " " + d[5]).toLowerCase().includes(st.q.toLowerCase()));

    function render(){
      const shown = base.filter(match);
      if ($("count")) $("count").innerHTML = `表示中 <b>${shown.length}</b> / ${total}件`;
      groups.innerHTML = ORDER.map(cc => {
        const items = shown.filter(d => d[0] === cc).sort((a, b) => ST_ORDER.indexOf(a[1]) - ST_ORDER.indexOf(b[1]));
        if (!items.length) return "";
        return `<div class="group"><h3>${COUNTRY[cc]} <span class="n">${items.length}件（全${cnt(cc, null)}件中）</span></h3><div class="grid">${items.map(card).join("")}</div></div>`;
      }).join("");
      if ($("empty")) $("empty").style.display = shown.length ? "none" : "block";
    }

    function sync(){
      if ($("fCountry")) chipRow($("fCountry"), [["all", "すべての国", total], ...ORDER.map(c => [c, COUNTRY[c], cnt(c, null)])], "country", st, () => { sync(); render(); });
      if ($("fStatus")) chipRow($("fStatus"), [["all", "すべての状態", total], ...ST_ORDER.map(s => [s, STATUS[s].label, cnt(null, s)])], "status", st, () => { sync(); render(); });
      if ($("fChapter")) chipRow($("fChapter"), [["all", "すべての領域", DATA.length], ...[1, 2, 3, 4, 5, 6].map(c => [String(c), `${c}. ${CH[c]}`, DATA.filter(d => d[2] === c).length])], "chapter", st, () => { sync(); render(); });
    }

    if ($("q")) $("q").addEventListener("input", e => { st.q = e.target.value.trim(); render(); });
    sync();
    render();
  }

  /* ===== 国別の状態バー（数字ページ）===== */
  function renderBars(){
    const el = $("barRows");
    if (!el) return;
    el.innerHTML = ORDER.map(cc => {
      const n = {};
      ST_ORDER.forEach(s => n[s] = countBy(cc, s));
      const sum = ST_ORDER.reduce((a, s) => a + n[s], 0);
      const segs = ST_ORDER.filter(s => n[s] > 0).map(s =>
        `<div class="seg-${s}" style="flex:${n[s]} 1 0" title="${STATUS[s].label} ${n[s]}件">${n[s]}</div>`).join("");
      return `<div class="brow">
        <div class="cn">${COUNTRY[cc]}</div>
        <div class="stack" role="img" aria-label="${COUNTRY[cc]} ${sum}件">${segs}</div>
        <div class="cnt">計 ${sum}件 ｜ 承認 ${n.A}件 ／ 治験中 ${n.T}件</div>
      </div>`;
    }).join("");
    if ($("barTotal")) $("barTotal").textContent =
      `${DATA.length}件（承認 ${countBy(null, "A")} ／ 治験中 ${countBy(null, "T")} ／ 中止・中断 ${countBy(null, "D")} ／ 取消・失効 ${countBy(null, "R")} ／ 未承認 ${countBy(null, "N")} ／ 未確認 ${countBy(null, "U")}）`;
  }

  /* ===== 領域タイル・カード（領域ページへのリンク）===== */
  const DOMAIN_PAGE = {1: "domains/ipsc.html", 2: "domains/car-t.html", 3: "domains/immune.html", 4: "domains/hsc.html", 5: "domains/msc.html", 6: "domains/tissue.html"};
  function renderDomains(id, style){
    const el = $(id);
    if (!el) return;
    el.innerHTML = [1, 2, 3, 4, 5, 6].map(ch => {
      const ap = DATA.filter(d => d[2] === ch && d[1] === "A").length;
      const all = DATA.filter(d => d[2] === ch).length;
      if (style === "tile") {
        return `<a class="dom" href="${ROOT}${DOMAIN_PAGE[ch]}">
          <div class="k">第${ch}章 ｜ 全${all}件</div>
          <div class="v">${ap}<span class="unit"> 承認</span></div>
          <div class="t">${esc(CH[ch])}</div></a>`;
      }
      return `<article class="card">
        <div class="k" style="font-size:12px;color:var(--muted)">第${ch}章 ｜ 全${all}件</div>
        <div class="big" style="margin-top:2px">${esc(CH[ch])}</div>
        <p>${esc(CH_DESC[ch])}</p>
        <div class="ex"><b>承認 ${ap}件</b></div>
        <a class="btn" href="${ROOT}${DOMAIN_PAGE[ch]}">この領域のページへ →</a>
      </article>`;
    }).join("");
  }

  /* ===== 領域ページの概況 ===== */
  function renderDomainStats(){
    const el = $("domainStats");
    const ch = Number(document.body.dataset.chapter);
    if (!el || !ch) return;
    const rows = DATA.filter(d => d[2] === ch);
    const items = [
      ["承認（確認済み）", rows.filter(d => d[1] === "A").length],
      ["治験中", rows.filter(d => d[1] === "T").length],
      ["中止・取消など", rows.filter(d => ["D", "R"].includes(d[1])).length],
      ["全品目", rows.length]
    ];
    el.innerHTML = items.map(([l, n]) => `<div class="stat"><div class="n">${n}</div><div class="l">${l}</div></div>`).join("");
  }

  renderBars();
  renderDomains("domainTiles", "tile");
  renderDomains("domainCards", "card");
  renderDomainStats();
  mountList();
})();
