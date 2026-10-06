/* 表紙の「6つの領域」タイル：アイコン・色・件数 */
(function(){
  const el = document.getElementById("coverDomains");
  if (!el) return;

  const ICON = {
    1: '<circle cx="9" cy="12" r="5"/><circle cx="16.5" cy="8.5" r="2.8"/><circle cx="16" cy="16.5" r="2.3"/>',
    2: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
    3: '<path d="M12 2.8l7.2 3v5.4c0 4.6-3 8.2-7.2 10-4.2-1.8-7.2-5.4-7.2-10V5.8l7.2-3z"/><path d="M9 12.2l2.2 2.2L15.4 10"/>',
    4: '<path d="M7 2.8c0 5.2 10 5.2 10 9.2s-10 4-10 9.2"/><path d="M17 2.8c0 5.2-10 5.2-10 9.2s10 4 10 9.2"/><path d="M8.2 8.2h7.6M8.2 15.8h7.6"/>',
    5: '<path d="M12 21.5v-10"/><path d="M12 12.5c0-4.2-3.2-7.4-7.5-7.4 0 4.2 3.2 7.4 7.5 7.4z"/><path d="M12 14.5c0-3.4 2.6-6 6.5-6 0 3.4-2.6 6-6.5 6z"/>',
    6: '<path d="M12 3.2l8.6 4.6-8.6 4.6-8.6-4.6L12 3.2z"/><path d="M3.4 12.2l8.6 4.6 8.6-4.6"/><path d="M3.4 16.8l8.6 4.6 8.6-4.6"/>'
  };
  const ACCENT = {1: "#0b6e69", 2: "#e4572e", 3: "#3446a8", 4: "#8a5a00", 5: "#2f7d32", 6: "#a2306b"};
  const PAGE = {1: "domains/ipsc.html", 2: "domains/car-t.html", 3: "domains/immune.html", 4: "domains/hsc.html", 5: "domains/msc.html", 6: "domains/tissue.html"};

  el.innerHTML = [1, 2, 3, 4, 5, 6].map(ch => {
    const rows = DATA.filter(d => d[2] === ch);
    const ap = rows.filter(d => d[1] === "A").length;
    const tr = rows.filter(d => d[1] === "T").length;
    return `<a class="dtile" href="${PAGE[ch]}" style="--c:${ACCENT[ch]}">
      <span class="dicon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON[ch]}</svg></span>
      <span class="dno">0${ch}</span>
      <span class="dname">${CH[ch]}</span>
      <span class="dnum">${ap}<small>承認</small></span>
      <span class="dsub">全${rows.length}件 ｜ 治験中 ${tr}件</span>
      <span class="darrow" aria-hidden="true">→</span>
    </a>`;
  }).join("");
})();
