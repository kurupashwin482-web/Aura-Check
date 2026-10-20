(() => {
  "use strict";

  // Keep this endpoint unchanged: the FastAPI server runs locally on port 8000.
  const API_BASE = "https://aura-check-0a7s.onrender.com";

  const form = document.getElementById("predict-form");
  const submitBtn = document.getElementById("submit-btn");
  const resetBtn = document.getElementById("reset-btn");
  const errorRetryBtn = document.getElementById("error-retry-btn");
  const stateIdle = document.getElementById("state-idle");
  const stateLoading = document.getElementById("state-loading");
  const stateResult = document.getElementById("state-result");
  const stateError = document.getElementById("state-error");
  const scoreNumberEl = document.getElementById("score-number");
  const scoreBandEl = document.getElementById("score-band");
  const scoreContextEl = document.getElementById("score-context");
  const gaugeFill = document.getElementById("gauge-fill");
  const errorLabelEl = document.getElementById("error-label");
  const errorCopyEl = document.getElementById("error-copy");
  const segGroup = document.getElementById("stress_level_group");
  const stressHiddenInput = document.getElementById("stress_level");

  const GAUGE_ARC_LENGTH = 314;

  // ---------------------------------------------------------
  // Atmospheric particle background. It is decorative only and
  // respects the operating system's reduced-motion preference.
  // ---------------------------------------------------------
  function initParticleBackground() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let frameId = 0;
    let lastFrame = 0;
    const pointer = { x: -1000, y: -1000, active: false };
    const palette = ["113, 243, 204", "112, 217, 255", "159, 139, 255"];

    function makeParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: 0.65 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.45,
        color: palette[Math.floor(Math.random() * palette.length)],
        phase: Math.random() * Math.PI * 2,
      };
    }

    function resize() {
      const previousWidth = width || window.innerWidth;
      const previousHeight = height || window.innerHeight;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(94, Math.max(34, Math.floor((width * height) / 15000)));
      if (particles.length === 0 || Math.abs(width - previousWidth) > 120 || Math.abs(height - previousHeight) > 180) {
        particles = Array.from({ length: count }, makeParticle);
      } else if (particles.length < count) {
        while (particles.length < count) particles.push(makeParticle());
      } else if (particles.length > count) {
        particles.length = count;
      }
      draw(0, false);
    }

    function draw(timestamp, animate = true) {
      ctx.clearRect(0, 0, width, height);
      const motion = animate && !reduceMotion;
      const linkDistance = width < 600 ? 92 : 128;
      const linkDistanceSq = linkDistance * linkDistance;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        if (motion) {
          p.x += p.vx;
          p.y += p.vy;
          p.phase += 0.009;
          if (p.x < -15) p.x = width + 15;
          if (p.x > width + 15) p.x = -15;
          if (p.y < -15) p.y = height + 15;
          if (p.y > height + 15) p.y = -15;
        }

        const shimmer = motion ? 0.78 + 0.22 * Math.sin(p.phase) : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha * shimmer})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distanceSq = dx * dx + dy * dy;
          if (distanceSq < linkDistanceSq) {
            const strength = (1 - Math.sqrt(distanceSq) / linkDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(118, 198, 211, ${strength})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distanceSq = dx * dx + dy * dy;
          if (distanceSq < 150 * 150) {
            const strength = (1 - Math.sqrt(distanceSq) / 150) * 0.18;
            ctx.beginPath();
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(113, 243, 204, ${strength})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

    }

    function animate(timestamp) {
      if (reduceMotion) return;
      // Avoid burning CPU in background tabs and cap the visual update rate.
      if (document.hidden) {
        frameId = window.requestAnimationFrame(animate);
        return;
      }
      if (timestamp - lastFrame >= 32) {
        lastFrame = timestamp;
        draw(timestamp, true);
      } else {
        frameId = window.requestAnimationFrame(animate);
        return;
      }
      frameId = window.requestAnimationFrame(animate);
    }

    // Listen on window because the canvas itself is intentionally click-through.
    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }, { passive: true });
    window.addEventListener("blur", () => { pointer.active = false; });
    document.documentElement.addEventListener("pointerleave", () => { pointer.active = false; }, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !reduceMotion) {
        window.cancelAnimationFrame(frameId);
        frameId = window.requestAnimationFrame(animate);
      }
    });

    resize();
    if (!reduceMotion) frameId = window.requestAnimationFrame(animate);
  }

  // ---------------------------------------------------------
  // Draw the gauge's 0, 2, 4, 6, 8, 10 index marks.
  // ---------------------------------------------------------
  function drawTicks() {
    document.querySelectorAll(".gauge-ticks").forEach((group) => {
      group.replaceChildren();
      const cx = 120;
      const cy = 140;
      const rOuter = 100;
      const rInner = 90;

      for (let value = 0; value <= 10; value += 2) {
        const angle = Math.PI - (value / 10) * Math.PI;
        const x1 = cx + rOuter * Math.cos(angle);
        const y1 = cy - rOuter * Math.sin(angle);
        const x2 = cx + rInner * Math.cos(angle);
        const y2 = cy - rInner * Math.sin(angle);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1.toFixed(1));
        line.setAttribute("y1", y1.toFixed(1));
        line.setAttribute("x2", x2.toFixed(1));
        line.setAttribute("y2", y2.toFixed(1));
        group.appendChild(line);
      }
    });
  }

  // ---------------------------------------------------------
  // Shared form error helpers.
  // ---------------------------------------------------------
  function fieldWrapper(input) {
    return input ? input.closest(".field") : null;
  }

  function setFieldError(input, message) {
    const wrapper = fieldWrapper(input);
    if (!wrapper) return;
    wrapper.classList.add("field-error");
    const messageElement = wrapper.querySelector(".error-msg");
    if (messageElement) messageElement.textContent = message;
  }

  function clearFieldError(input) {
    const wrapper = fieldWrapper(input);
    if (!wrapper) return;
    wrapper.classList.remove("field-error");
    const messageElement = wrapper.querySelector(".error-msg");
    if (messageElement) messageElement.textContent = "";
  }

  function clearAllErrors() {
    form.querySelectorAll(".field").forEach((field) => field.classList.remove("field-error"));
    form.querySelectorAll(".error-msg").forEach((message) => { message.textContent = ""; });
  }

  // ---------------------------------------------------------
  // Keep the same stress options and hidden payload field.
  // ---------------------------------------------------------
  segGroup.querySelectorAll(".seg-btn").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      segGroup.querySelectorAll(".seg-btn").forEach((otherButton) => {
        otherButton.classList.remove("active");
        otherButton.setAttribute("aria-pressed", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      stressHiddenInput.value = button.dataset.value || "";
      clearFieldError(stressHiddenInput);
    });
  });

  // ---------------------------------------------------------
  // Client-side validation, using the original form fields.
  // ---------------------------------------------------------
  function validate(payload) {
    const errors = [];
    const numericChecks = [
      ["age", 10, 100, true],
      ["avg_daily_usage_hours", 0, 24, false],
      ["daily_unlocks", 0, Infinity, true],
      ["study_hours", 0, 24, false],
      ["physical_activity_hours", 0, 24, false],
      ["sleep_hours_per_night", 0, 24, false],
    ];

    numericChecks.forEach(([key, min, max, mustBeInteger]) => {
      const input = document.getElementById(key);
      const value = payload[key];
      if (!Number.isFinite(value)) {
        errors.push([input, "This field is required."]);
      } else if (value < min || value > max) {
        errors.push([input, `Must be between ${min} and ${max === Infinity ? "0+" : max}.`]);
      } else if (mustBeInteger && !Number.isInteger(value)) {
        errors.push([input, "Enter a whole number."]);
      }
    });

    ["gender", "country", "academic_level", "most_used_platform", "purpose_of_use"].forEach((key) => {
      const input = document.getElementById(key);
      if (!payload[key] || String(payload[key]).trim() === "") {
        errors.push([input, "This field is required."]);
      }
    });

    if (!payload.stress_level) errors.push([stressHiddenInput, "Pick a stress level."]);
    return errors;
  }

  // Preserve the exact property names expected by the FastAPI StudentData model.
  function collectPayload() {
    const formData = new FormData(form);
    const numberValue = (key) => {
      const value = formData.get(key);
      return value === null || String(value).trim() === "" ? NaN : Number(value);
    };

    return {
      age: numberValue("age"),
      gender: formData.get("gender") || "",
      country: (formData.get("country") || "").trim(),
      academic_level: formData.get("academic_level") || "",
      most_used_platform: formData.get("most_used_platform") || "",
      purpose_of_use: formData.get("purpose_of_use") || "",
      avg_daily_usage_hours: numberValue("avg_daily_usage_hours"),
      daily_unlocks: numberValue("daily_unlocks"),
      study_hours: numberValue("study_hours"),
      physical_activity_hours: numberValue("physical_activity_hours"),
      sleep_hours_per_night: numberValue("sleep_hours_per_night"),
      stress_level: formData.get("stress_level") || "",
    };
  }

  // ---------------------------------------------------------
  // Result panel state and score-index rendering.
  // ---------------------------------------------------------
  function showState(name) {
    const states = { idle: stateIdle, loading: stateLoading, result: stateResult, error: stateError };
    Object.values(states).forEach((element) => { element.hidden = true; });
    if (states[name]) states[name].hidden = false;
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.classList.toggle("loading", isSubmitting);
    submitBtn.setAttribute("aria-busy", String(isSubmitting));
  }

  function bandFor(score) {
    if (score < 4) {
      return {
        key: "strained",
        label: "Signal: strained",
        context: "Your responses suggest elevated strain right now. Small shifts in sleep or screen time can go a long way.",
      };
    }
    if (score < 7) {
      return {
        key: "balanced",
        label: "Signal: balanced",
        context: "Your rhythm looks fairly steady, with some room to recover and reset.",
      };
    }
    return {
      key: "strong",
      label: "Signal: strong",
      context: "Your habits point to a well-supported, resilient baseline. Keep it up.",
    };
  }

  function renderResult(score) {
    if (!Number.isFinite(score)) {
      renderError("Unexpected response", "The API returned a score that is not a valid number.");
      return;
    }

    const clamped = Math.max(0, Math.min(10, score));
    const band = bandFor(clamped);
    scoreNumberEl.textContent = clamped.toFixed(2);
    scoreBandEl.textContent = band.label;
    scoreContextEl.textContent = band.context;
    stateResult.dataset.band = band.key;

    gaugeFill.style.transition = "none";
    gaugeFill.style.strokeDashoffset = String(GAUGE_ARC_LENGTH);
    requestAnimationFrame(() => {
      gaugeFill.style.transition = "";
      gaugeFill.style.strokeDashoffset = String(GAUGE_ARC_LENGTH * (1 - clamped / 10));
    });

    showState("result");
  }

  function renderError(label, message) {
    errorLabelEl.textContent = label;
    errorCopyEl.textContent = message;
    showState("error");
  }

  // ---------------------------------------------------------
  // Translate FastAPI / Pydantic validation errors into form hints.
  // ---------------------------------------------------------
  function applyServerValidationErrors(detail) {
    if (!Array.isArray(detail)) return false;
    let matched = false;

    detail.forEach((error) => {
      const fieldName = Array.isArray(error.loc) ? error.loc[error.loc.length - 1] : null;
      const input = fieldName ? document.getElementById(fieldName) : null;
      const target = fieldName === "stress_level" ? stressHiddenInput : input;
      if (target) {
        setFieldError(target, error.msg || "Invalid value.");
        matched = true;
      }
    });
    return matched;
  }

  // ---------------------------------------------------------
  // Prediction request — same host, port, route, and response key.
  // ---------------------------------------------------------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAllErrors();

    const payload = collectPayload();
    const clientErrors = validate(payload);
    if (clientErrors.length > 0) {
      clientErrors.forEach(([input, message]) => { if (input) setFieldError(input, message); });
      const firstInput = clientErrors[0][0];
      if (firstInput && typeof firstInput.focus === "function" && firstInput.type !== "hidden") firstInput.focus();
      return;
    }

    setSubmitting(true);
    showState("loading");

    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 422) {
        const body = await response.json().catch(() => null);
        const matched = body && applyServerValidationErrors(body.detail);
        renderError(
          "Check your inputs",
          matched
            ? "The API rejected a few fields — details are marked on the form."
            : "The API rejected this submission. Please review your inputs and try again."
        );
        return;
      }

      if (!response.ok) {
        let detailMessage = `The API responded with status ${response.status}.`;
        const body = await response.json().catch(() => null);
        if (body && typeof body.detail === "string") detailMessage = body.detail;
        renderError("Prediction failed", detailMessage);
        return;
      }

      const data = await response.json();
      if (typeof data.predicted_mental_health_score !== "number") {
        renderError("Unexpected response", "The API responded, but the score was missing or malformed.");
        return;
      }

      renderResult(data.predicted_mental_health_score);
    } catch (error) {
      renderError(
        "Can't reach the server",
        `Couldn't connect to ${API_BASE}. Make sure the FastAPI backend is running with: python -m uvicorn main:app --reload.`
      );
    } finally {
      setSubmitting(false);
    }
  });

  // Clear inline errors as the person edits a field.
  form.querySelectorAll("input, select").forEach((element) => {
    element.addEventListener("input", () => clearFieldError(element));
    element.addEventListener("change", () => clearFieldError(element));
  });

  function resetReadout() {
    showState("idle");
    stateResult.removeAttribute("data-band");
    gaugeFill.style.strokeDashoffset = String(GAUGE_ARC_LENGTH);
  }

  resetBtn.addEventListener("click", resetReadout);
  errorRetryBtn.addEventListener("click", resetReadout);

  initParticleBackground();
  drawTicks();
})();
