/**
 * gallery-image controller
 */

import { factories } from "@strapi/strapi";
import { ApiGalleryImageGalleryImage } from "../../../../schemas";

/**
 *
 * @param entries
 * @returns ordered entries
 *
 * incorpoirates the forcedOrder setting
 * ordering is 1st forcedOrder, then ID order
 */
const orderEntries = (
  entries: ApiGalleryImageGalleryImage["attributes"][]
): ApiGalleryImageGalleryImage["attributes"][] => {
  const forceOrderSortedEntries = entries.reduce(
    (acc, entry) => {
      if (entry.forceOrder) {
        acc[0].push(entry);
      } else {
        acc[1].push(entry);
      }
      return acc;
    },
    [[], []] // [0] = forceOrder, [1] = normal (ID order)
  );

  let finalEntries = forceOrderSortedEntries[1];

  forceOrderSortedEntries[0].forEach((entry) => {
    finalEntries.splice(entry.order, 0, entry);
  });
  return finalEntries;
};

export default factories.createCoreController(
  "api::gallery-image.gallery-image",
  ({ strapi }) => ({
    async find(ctx) {
      // 1
      const entries: ApiGalleryImageGalleryImage["attributes"][] =
        await strapi.entityService.findMany(
          "api::gallery-image.gallery-image",
          {
            sort: { createdAt: "ASC" },
            populate: "*",
          }
        );

      let orderedEntries = orderEntries(entries);

      // 2
      const sanitizedEntries = await this.sanitizeOutput(orderedEntries, ctx);

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
