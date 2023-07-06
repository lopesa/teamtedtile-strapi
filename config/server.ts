export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  url: env("URL", "http://localhost:1337"),
  port: env.int("PORT", 1337),
  app: {
    keys: env.array("APP_KEYS"),
  },
  webhooks: {
    // Add this to not receive populated relations in webhooks
    populateRelations: false,
  },
});
