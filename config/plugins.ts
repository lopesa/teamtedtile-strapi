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
        xlarge: 2000,
        large: 1000,
        medium: 750,
        small: 500,
        // xsmall: 64
      },
    },
  },
});
