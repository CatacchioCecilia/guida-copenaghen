document.addEventListener("click", (event) => {
  const summary = event.target.closest(".story summary");
  if (!summary) return;
  const details = summary.parentElement;
  document.querySelectorAll(".story[open]").forEach((open) => {
    if (open !== details) open.removeAttribute("open");
  });
});
