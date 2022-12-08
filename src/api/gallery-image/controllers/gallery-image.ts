/**
 * gallery-image controller
 */

import { factories } from "@strapi/strapi";

// export default factories.createCoreController(
//   "api::gallery-image.gallery-image"
// );

export default factories.createCoreController(
  "api::gallery-image.gallery-image",
  ({ strapi }) => ({
    async find(ctx) {
      const entries = await strapi.entityService.findMany(
        "api::gallery-image.gallery-image",
        {
          sort: { createdAt: "ASC" },
          limit: 5,
          populate: "*",
        }
      );

      debugger;

      // 2
      const sanitizedEntries = await this.sanitizeOutput(entries, ctx);

      // 3
      return this.transformResponse(sanitizedEntries);
    },

    // example of a custom controller method
    // taken from here: https://strapi.io/blog/strapi-internals-customizing-the-backend-part-1-models-controllers-and-routes
    // see corresponding route in src/api/gallery-image/routes/gallery-image-test.ts
    async test(ctx) {
      ctx.body = "test";
    },
  })
);
