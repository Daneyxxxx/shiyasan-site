// Shiya-san site settings.
window.SHIYA = {
  widgetGuildId: "1494231666544082966",   // your Discord server ID
  apiUrl: "",                             // not used: the bot puts its data in the data/ folder instead (GitHub or SFTP)
  static: "https://daneyxxxx.github.io/shiyasan-site/data",   // data now read from GitHub Pages
  maxAge: 1500,                           // show Offline if the bot hasn't updated the data for this many seconds
  botName: "Shiya-san",
  // ---- Discord login (Log in button) ----
  clientId: "1524010081409306767",        // your bot's Application ID (same as in the invite link)
  // Optional but makes purchases show up in ~10 s instead of ~2 min: your GitHub repo, like "owner/repo"
  ghRepo: "Daneyxxxx/shiyasan-site",
  ghBranch: "main",
  // Owner Dashboard: your own Discord user ID (Developer Mode > right-click yourself > Copy User ID). Only this account sees the dashboard link.
  // This only hides the link. The bot must also check your Discord login before doing any owner action.
  ownerId: "1334911366993285121",
  // Website visit counting for the Owner Dashboard (the bot counts them).
  trackVisits: true
};
