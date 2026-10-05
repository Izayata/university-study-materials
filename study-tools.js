/* Study tools for the kidolgozott tételek under
   /tetelek/de-ttk-matematika-bsc/<subject>/ (algebra, analizis) — loaded only
   on those pages, never site-wide (script.js stays as it is).

   Progressive enhancement: every page is a complete article without this
   file. The inline <head> script on those pages adds the "js" class to
   <html>, and style.css hides the answer (.tetel-answer) and the not-yet-
   shown proof steps only under that class. The hidden content is still in
   the DOM, so crawlers and find-in-page see it.

   What it adds:
   - a "Kidolgozás megjelenítése" toggle in front of .tetel-answer
   - stepwise proofs: .proof-steps[data-steps] > ol > li, revealed one by one
   - a "Tudom / Gyakorolnom kell" self-rating at the end of the answer,
     kept in localStorage (per browser, nothing is sent anywhere)
   - on a subject's landing page: status badges on the cards, a progress
     summary and a "Véletlen tétel" button */
(function () {
  "use strict";

  /* One progress record per subject folder under /tetelek/de-ttk-matematika-bsc/
     (algebra, analizis, ...), so the subjects don't mix. Algebra keeps the key
     it was published with, which readers already have saved progress under. */
  var subject = (window.location.pathname.match(/\/tetelek\/de-ttk-matematika-bsc\/([^\/]+)\//) || [])[1] || "algebra";
  var STORAGE_KEY = subject === "algebra" ? "fj-algebra-progress" : "fj-" + subject + "-progress";

  function readProgress() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function writeProgress(progress) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      /* storage blocked (private window, site data cleared): the page still works */
    }
  }

  function makeButton(label, modifier) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "study-btn" + (modifier ? " " + modifier : "");
    button.textContent = label;
    return button;
  }

  function makeControls() {
    var bar = document.createElement("div");
    bar.className = "study-controls";
    return bar;
  }

  /* ---------- Reveal toggle ---------- */

  function setupAnswer(answer) {
    if (!answer.id) answer.id = "kidolgozas";

    var bar = makeControls();
    var toggle = makeButton("Kidolgozás megjelenítése", "study-btn--primary");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", answer.id);
    bar.appendChild(toggle);
    answer.parentNode.insertBefore(bar, answer);

    function setOpen(open) {
      answer.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Kidolgozás elrejtése" : "Kidolgozás megjelenítése";
    }

    toggle.addEventListener("click", function () {
      setOpen(!answer.classList.contains("is-open"));
    });

    answer.openAnswer = function () {
      setOpen(true);
    };
  }

  /* A link (the table of contents, or a #hash in the address) can point at a
     heading inside the still-closed answer: open it first, or the jump lands
     on nothing. */
  function openAnswerContaining(id) {
    if (!id) return false;
    var target = document.getElementById(id);
    var answer = target && target.closest(".tetel-answer");
    if (answer && !answer.classList.contains("is-open") && answer.openAnswer) {
      answer.openAnswer();
      return true;
    }
    return false;
  }

  function setupAnchorOpening() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest('a[href^="#"]');
      if (!link) return;
      openAnswerContaining(decodeURIComponent(link.getAttribute("href").slice(1)));
    });

    function onHash() {
      var id = decodeURIComponent(window.location.hash.slice(1));
      if (openAnswerContaining(id)) {
        var target = document.getElementById(id);
        if (target) target.scrollIntoView();
      }
    }
    window.addEventListener("hashchange", onHash);
    onHash();
  }

  /* ---------- Stepwise proofs ---------- */

  function setupSteps(box) {
    var list = box.querySelector("ol");
    if (!list) return;
    var steps = Array.prototype.slice.call(list.children);
    if (steps.length < 2) return;

    steps.forEach(function (step) {
      step.classList.add("proof-steps__step");
    });

    var shown = 0;
    var bar = makeControls();
    var next = makeButton("Következő lépés");
    var all = makeButton("Az összes lépés");
    var reset = makeButton("Újrakezdés");
    var status = document.createElement("span");
    status.className = "study-status";
    status.setAttribute("aria-live", "polite");
    bar.appendChild(next);
    bar.appendChild(all);
    bar.appendChild(reset);
    bar.appendChild(status);
    box.appendChild(bar);

    function render() {
      steps.forEach(function (step, index) {
        step.classList.toggle("is-shown", index < shown);
      });
      next.disabled = all.disabled = shown >= steps.length;
      reset.disabled = shown === 0;
      status.textContent = shown + " / " + steps.length + " lépés";
    }

    next.addEventListener("click", function () {
      shown = Math.min(shown + 1, steps.length);
      render();
    });
    all.addEventListener("click", function () {
      shown = steps.length;
      render();
    });
    reset.addEventListener("click", function () {
      shown = 0;
      render();
    });
    render();
  }

  /* ---------- Self-rating ---------- */

  function setupRating(answer, tetelId) {
    var progress = readProgress();
    var wrap = document.createElement("div");
    wrap.className = "study-rate";
    var prompt = document.createElement("p");
    prompt.textContent = "Hogy ment? Csak a saját böngésződben marad meg.";
    var bar = makeControls();
    bar.style.margin = "0";
    var known = makeButton("Tudom");
    var practice = makeButton("Gyakorolnom kell");
    bar.appendChild(known);
    bar.appendChild(practice);
    wrap.appendChild(prompt);
    wrap.appendChild(bar);
    answer.appendChild(wrap);

    function render() {
      known.setAttribute("aria-pressed", progress[tetelId] === "known" ? "true" : "false");
      practice.setAttribute("aria-pressed", progress[tetelId] === "practice" ? "true" : "false");
    }

    function choose(value) {
      if (progress[tetelId] === value) delete progress[tetelId];
      else progress[tetelId] = value;
      writeProgress(progress);
      render();
    }

    known.addEventListener("click", function () {
      choose("known");
    });
    practice.addEventListener("click", function () {
      choose("practice");
    });
    render();
  }

  /* ---------- Landing page: badges, summary, random tétel ---------- */

  function setupLanding(tools) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".item-card[data-tetel]"));
    var progress = readProgress();
    var known = 0;
    var practice = 0;

    cards.forEach(function (card) {
      var state = progress[card.getAttribute("data-tetel")];
      if (state !== "known" && state !== "practice") return;
      var badge = document.createElement("span");
      badge.className = "study-badge" + (state === "known" ? " study-badge--known" : "");
      badge.textContent = state === "known" ? "Tudom" : "Gyakorolnom kell";
      card.appendChild(badge);
      if (state === "known") known += 1;
      else practice += 1;
    });

    var status = document.createElement("span");
    status.className = "study-status";
    if (known + practice > 0) {
      status.textContent =
        known + " / " + cards.length + " tételt jelöltél késznek, " + practice + " gyakorlandó.";
    }

    var random = makeButton("Véletlen tétel", "study-btn--primary");
    random.addEventListener("click", function () {
      if (cards.length === 0) return;
      var pick = cards[Math.floor(Math.random() * cards.length)];
      window.location.href = pick.getAttribute("href");
    });

    tools.appendChild(random);
    tools.appendChild(status);
    tools.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var tetelId = document.body.getAttribute("data-tetel");

    document.querySelectorAll(".tetel-answer").forEach(function (answer) {
      setupAnswer(answer);
      if (tetelId) setupRating(answer, tetelId);
    });
    document.querySelectorAll(".proof-steps[data-steps]").forEach(setupSteps);
    setupAnchorOpening();

    var landing = document.querySelector("[data-study-landing]");
    if (landing) setupLanding(landing);
  });
})();
