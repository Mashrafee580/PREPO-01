// header-auth.js — updates the header based on login state
// Include this on every page that has the user-actions header

(function () {
  const user = API.currentUser();
  const loginEl    = document.getElementById("headerLogin");
  const registerEl = document.getElementById("headerRegister");
  const actions    = document.getElementById("userActions");
  if (!actions) return;

  if (user) {
    // Remove login/register links
    if (loginEl)    loginEl.remove();
    if (registerEl) registerEl.remove();

    // User greeting
    const greeting = document.createElement("span");
    greeting.className = "header-username";
    greeting.textContent = "Hi, " + user.name.split(" ")[0];
    actions.insertBefore(greeting, actions.firstChild);

    // Admin link if admin
    if (user.role === "admin") {
      const adminLink = document.createElement("a");
      adminLink.href = "admin.html";
      adminLink.className = "header-admin-link";
      adminLink.textContent = "⚙ Admin";
      actions.insertBefore(adminLink, actions.firstChild);
    }

    // Logout button
    const logoutBtn = document.createElement("a");
    logoutBtn.href = "#";
    logoutBtn.className = "header-logout";
    logoutBtn.textContent = "Logout";
    logoutBtn.onclick = function (e) {
      e.preventDefault();
      API.logout();
      window.location.reload();
    };
    actions.appendChild(logoutBtn);
  }
})();
