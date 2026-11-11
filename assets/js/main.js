/* ============================================================
   Maa Jagadhatri Pooja, Saidapur — main.js
   Nav · Countdown · Cinematic pinned story · Reveals · Lightbox
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) document.documentElement.classList.add("no-motion");

  /* ---------- Nav: solid on scroll + mobile drawer ---------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("navBurger");
  var links = document.getElementById("navLinks");

  function onScroll() { nav.classList.toggle("is-solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A" || e.target.id === "navChatBtn") {
      links.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Countdown to Maha Saptami (17 Nov 2026, IST) ---------- */
  var TARGET = new Date("2026-11-17T00:00:00+05:30").getTime();
  var el = {
    d: document.getElementById("cdD"),
    h: document.getElementById("cdH"),
    m: document.getElementById("cdM"),
    s: document.getElementById("cdS")
  };
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var diff = TARGET - Date.now();
    if (diff <= 0) {
      el.d.textContent = "0"; el.h.textContent = "00";
      el.m.textContent = "00"; el.s.textContent = "00";
      return;
    }
    el.d.textContent = String(Math.floor(diff / 864e5));
    el.h.textContent = pad(Math.floor((diff / 36e5) % 24));
    el.m.textContent = pad(Math.floor((diff / 6e4) % 60));
    el.s.textContent = pad(Math.floor((diff / 1e3) % 60));
    setTimeout(tick, 1000);
  }
  if (el.d) tick();

  /* ---------- Cinematic pinned story (GSAP ScrollTrigger) ---------- */
  var storyPin = document.getElementById("storyPin");
  var chapters = Array.prototype.slice.call(document.querySelectorAll(".chapter"));
  var storyImgs = Array.prototype.slice.call(document.querySelectorAll(".story__img"));
  var isMobile = window.matchMedia("(max-width: 880px)").matches;

  // progress dots
  var dots = document.createElement("div");
  dots.className = "story-progress";
  chapters.forEach(function (_, i) {
    var bar = document.createElement("i");
    if (i === 0) bar.classList.add("on");
    dots.appendChild(bar);
  });
  storyPin.appendChild(dots);

  function activateChapter(idx) {
    chapters.forEach(function (c, i) { c.classList.toggle("is-active", i === idx); });
    storyImgs.forEach(function (img, i) { img.classList.toggle("is-active", i === idx); });
    Array.prototype.forEach.call(dots.children, function (b, i) {
      b.classList.toggle("on", i === idx);
    });
  }

  function storyFromScroll() {
    // Fallback without GSAP: map story section progress to chapter
    var rect = storyPin.getBoundingClientRect();
    var total = rect.height + window.innerHeight;
    var progress = Math.min(1, Math.max(0, -rect.top / total + 0.5));
    activateChapter(Math.min(chapters.length - 1, Math.floor(progress * chapters.length)));
  }

  if (!prefersReduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (isMobile) {
      ScrollTrigger.create({
        trigger: storyPin,
        start: "top 70%",
        end: "bottom 30%",
        scrub: true,
        onUpdate: function (self) {
          activateChapter(Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length)));
        }
      });
      // gentle parallax on the visual
      gsap.to(storyImgs, {
        yPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: storyPin, start: "top bottom", end: "bottom top", scrub: true }
      });
    } else {
      ScrollTrigger.create({
        trigger: storyPin,
        start: "top top",
        end: "+=" + (window.innerHeight * 2),
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: function (self) {
          var idx = Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length));
          activateChapter(idx);
          gsap.to(storyImgs[idx], { scale: 1, duration: 1, ease: "power1.out", overwrite: "auto" });
        }
      });
    }
  } else {
    window.addEventListener("scroll", storyFromScroll, { passive: true });
    storyFromScroll();
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (r) { r.style.opacity = 1; r.style.transform = "none"; });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var t = entry.target;
          var delay = (Array.prototype.indexOf.call(t.parentNode.children, t) % 4) * 90;
          setTimeout(function () { t.classList.add("is-in"); }, delay);
          io.unobserve(t);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (r) {
      r.classList.add("is-in-wait");
      io.observe(r);
    });
  }

  // CSS hook for revealed state
  var style = document.createElement("style");
  style.textContent = ".reveal.is-in{opacity:1;transform:translateY(0);transition:opacity .9s cubic-bezier(.2,.6,.2,1),transform .9s cubic-bezier(.2,.6,.2,1)}";
  document.head.appendChild(style);

  /* ---------- Gallery lightbox ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-label", "Image preview");
  lb.innerHTML = '<button class="lightbox__close" aria-label="Close">✕</button><img alt="">';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img");

  document.querySelectorAll(".gallery__grid .g-item").forEach(function (item) {
    item.addEventListener("click", function (e) {
      if (item.classList.contains("g-item--video")) return; // video link opens YouTube
      var img = item.querySelector("img");
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
  });
  function closeLb() {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  lb.addEventListener("click", closeLb);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });

  /* ---------- Contact form → mailto ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var message = form.message.value.trim();
      if (!name || !message) {
        alert("Please fill in your name and a message.");
        return;
      }
      var body = "Name: " + name + (phone ? "\nPhone: " + phone : "") + "\n\n" + message;
      window.location.href = "mailto:maajagadhatrisaidapur@gmail.com?subject=" +
        encodeURIComponent("Website message from " + name) +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------- Hero: gentle Ken Burns + scroll parallax ---------- */
  if (!prefersReduced && window.gsap) {
    gsap.to(".hero__bg img", {
      scale: 1.02,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero__content", {
      yPercent: -12, opacity: 0.15,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: true }
    });
  } else {
    var heroImg = document.querySelector(".hero__bg img");
    if (heroImg) heroImg.style.transform = "scale(1.02)";
  }
})();
