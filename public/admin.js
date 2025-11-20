document.addEventListener("DOMContentLoaded", () => {
  // delegate click events for Promote / Demote / Delete buttons
  document.body.addEventListener("click", async (e) => {
    const el = e.target;
    if (!el.classList) return;

    // helper to post JSON and handle response
    async function postJson(path, payload) {
      try {
        const res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return await res.json();
      } catch (err) {
        console.error("Network error:", err);
        return { ok: false, message: "Network error" };
      }
    }

    // Promote
    if (el.matches(".promote")) {
      const id = el.dataset.id;
      el.disabled = true;
      el.textContent = "Promoting...";
      const json = await postJson("/admin/promote", { id });
      if (json.ok) window.location.reload();
      else { alert(json.message || "Failed to promote"); el.disabled = false; el.textContent = "Promote"; }
    }

    // Demote
    if (el.matches(".demote")) {
      const id = el.dataset.id;
      if (!confirm("Are you sure you want to demote this user?")) return;
      el.disabled = true;
      el.textContent = "Demoting...";
      const json = await postJson("/admin/demote", { id });
      if (json.ok) window.location.reload();
      else { alert(json.message || "Failed to demote"); el.disabled = false; el.textContent = "Demote"; }
    }

    // Delete
    if (el.matches(".delete")) {
      const id = el.dataset.id;
      if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
      el.disabled = true;
      el.textContent = "Deleting...";
      const json = await postJson("/admin/delete", { id });
      if (json.ok) window.location.reload();
      else { alert(json.message || "Failed to delete"); el.disabled = false; el.textContent = "Delete"; }
    }
  });
});
