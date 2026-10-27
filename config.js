// Every business setting for Catch the AI lives in this file.
// Change values here. Never hard-code any of these anywhere else in the app.
// After any change, open the app with ?test=1 and check that every test passes.

export const CONFIG = {
  version: "1.0.0",

  // The live address, with no slash at the end, for example "https://catchtheai.vercel.app/".
  // Set in Phase 6. While empty, the app uses the address it was opened from.
  siteUrl: "https://catchtheai.vercel.app/",

  // The game
  roundSize: 8,
  secondsPerSnippet: 30,
  packsOnHome: ["b", "d"],

  // Course and sales
  courseName: "Certification Program in AI-Powered Software Engineering & DSA",
  // Sales WhatsApp number: country code then number, digits only, for example "919000000000".
  // While empty, the WhatsApp sales button is hidden and "See the program" shows instead.
  salesWhatsApp: "917550077725",
  website: "https://wrench-wise.com/",
  utm: { source: "catch-the-ai", medium: "web-app", campaign: "catch-the-ai-2026" },

  // Free live session card on the home and result screens. Turn on when a session is coming up.
  session: {
    enabled: false,
    title: "",
    when: "", // plain text, for example "Sunday 9 November, 8:30 PM IST"
    url: ""
  },

  // Analytics. An empty ID switches that tracker off.
  analytics: {
    ga4Id: "",
    metaPixelId: "1504538090837971"
  },

  // Optional features. false hides the feature completely, with no errors.
  features: {
    sound: true,
    darkTheme: true,
    lineNotes: true,
    challengeLinks: true,
    shareImage: true,
    presenterMode: true,
    dailyEight: false
  }
};
