/* =========================================================
   University Lab Notes — shared vanilla JS
   1) fetch()-loads the central nav.html fragment into every page
   2) renders a shared footer from one template (no extra request)
   3) mobile nav toggle + active-link highlighting
   4) auto-builds an on-page Table of Contents from h2/h3
   5) adds copy buttons to <pre><code> blocks
   No frameworks, no build step — safe to include as a single
   <script src="/script.js" defer> tag on every page.
   ========================================================= */

(function () {
  "use strict";

  function highlightActiveLink() {
    var key = document.body.getAttribute("data-nav-key");
    if (!key) return;
    var link = document.querySelector('.site-nav a[data-nav-key="' + key + '"]');
    if (link) link.classList.add("is-active");
  }

  function wireMobileToggle() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function loadNav() {
    var mount = document.getElementById("site-header");
    if (!mount) return Promise.resolve();

    return fetch("/nav.html")
      .then(function (res) {
        if (!res.ok) throw new Error("nav.html request failed: " + res.status);
        return res.text();
      })
      .then(function (html) {
        mount.innerHTML = html;
        wireMobileToggle();
        highlightActiveLink();
      })
      .catch(function (err) {
        // Fail safe: keep the page usable even if the fragment can't load
        // (e.g. testing over file:// instead of a local HTTP server).
        console.error("Navigation failed to load:", err);
        mount.innerHTML =
          '<header class="site-header"><a class="site-brand" href="/">Egyetemi segédanyagok</a></header>';
      });
  }

  function renderFooter() {
    var mount = document.getElementById("site-footer");
    if (!mount) return;
    var year = new Date().getFullYear();
    mount.innerHTML =
      '<footer class="site-footer">' +
      '<nav>' +
      '<a href="/">Kezdőlap</a>' +
      '<a href="/about.html">Rólam</a>' +
      '<a href="/privacy-policy.html">Adatvédelem</a>' +
      '<a href="https://www.buymeacoffee.com/YOUR-USERNAME" target="_blank" rel="noopener">Támogasd a kurzust ☕</a>' +
      "</nav>" +
      "<p>&copy; " + year + " Egyetemi segédanyagok. Minden anyag az oktató saját munkája.</p>" +
      "</footer>";
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function buildTableOfContents() {
    var tocList = document.querySelector("#toc-list");
    var tocContainer = document.querySelector(".toc");
    var content = document.querySelector("main.content");
    if (!tocList || !content) return;

    var headings = content.querySelectorAll("h2, h3");
    if (headings.length === 0) {
      if (tocContainer) tocContainer.style.display = "none";
      return;
    }

    headings.forEach(function (heading) {
      if (!heading.id) heading.id = slugify(heading.textContent);
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + heading.id;
      a.textContent = heading.textContent;
      if (heading.tagName === "H3") a.style.paddingLeft = "0.75rem";
      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  function addCopyButtons() {
    document.querySelectorAll("pre > code").forEach(function (codeBlock) {
      var pre = codeBlock.parentElement;
      var button = document.createElement("button");
      button.className = "copy-btn";
      button.type = "button";
      button.textContent = "Másolás";
      button.addEventListener("click", function () {
        navigator.clipboard
          .writeText(codeBlock.textContent)
          .then(function () {
            button.textContent = "Másolva!";
            setTimeout(function () {
              button.textContent = "Másolás";
            }, 1500);
          })
          .catch(function () {
            button.textContent = "Nyomj Ctrl+C-t";
          });
      });
      pre.appendChild(button);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadNav();
    renderFooter();
    buildTableOfContents();
    addCopyButtons();
  });
})();
