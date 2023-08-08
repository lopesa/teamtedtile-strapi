export default ({ env }) => ({
  email: {
    config: {
      provider: env("EMAIL_PROVIDER"),
      providerOptions: {
        apiKey: env("EMAIL_API_KEY"),
      },
      settings: {
        defaultFrom: env("EMAIL_ADDRESS_FROM"),
        defaultReplyTo: env("EMAIL_ADDRESS_REPLY"),
      },
    },
  },
  upload: {
    config: {
      breakpoints: {
        xxlarge: 4000,
        xlarge: 2000,
        large: 1000,
        medium: 750,
        small: 500,
        // xsmall: 64
      },
    },
  },
  "upload-plugin-cache": {
    enabled: true,
    config: {
      maxAge: 86_400_000,
    },
  },
  "vercel-deploy": {
    enabled: true,
    config: {
      deployHook: env("VERCEL_DEPLOY_HOOK"),
      apiToken: env("VERCEL_TOKEN"),
      appFilter: "teamtedtile",
      // teamFilter: "your-team-id-on-vercel",
      roles: ["strapi-super-admin", "strapi-editor", "strapi-author"],
    },
  },
});
