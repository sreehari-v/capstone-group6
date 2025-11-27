// frontend/src/api/stepsApi.js
export async function getMySteps() {
  const res = await fetch("/api/steps/me", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to load step tracking");
  }

  return res.json();
}

export async function saveMySteps({ steps, isActive }) {
  const res = await fetch("/api/steps/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ steps, isActive }),
  });

  if (!res.ok) {
    throw new Error("Failed to save step tracking");
  }

  return res.json();
}
