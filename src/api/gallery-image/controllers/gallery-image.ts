/**
 * gallery-image controller
 */

import { factories, MediaAttribute } from "@strapi/strapi";
import { ApiGalleryImageGalleryImage } from "../../../../schemas";

interface GalleryImageApiReplyObject {
  title: string;
  image: MediaAttribute;
  copyright?: string;
  tedheadText?: string;
  previous?: string;
  next?: string;
}

/**
 *
 * @param entries
 * @returns ordered entries
 *
 * incorporates the forcedOrder setting
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

/**
 * create an api return object from each GalleryItem.
 * Only return select fields (strip out many fields),
 * and add the next and previous fields
 * @param entries
 */
const parseEntriesForReturn = (
  entries: ApiGalleryImageGalleryImage["attributes"][]
): GalleryImageApiReplyObject[] => {
  let returnArr = [];
  entries.forEach((entry, index) => {
    const newObj = {};
    newObj["title"] = entry.title;
    newObj["image"] = entry.image;
    newObj["copyright"] = entry.copyright;
    newObj["tedheadText"] = entry.tedheadText;
    newObj["previous"] = entries[index - 1]?.title;
    newObj["next"] = entries[index + 1]?.title;
    returnArr.push(newObj);
  });
  return returnArr;
};

export default factories.createCoreController(
  "api::gallery-image.gallery-image",
  ({ strapi }) => ({
    async find(ctx) {
      // 1 - find all entries and order by forceOrder then ID
      const entries: ApiGalleryImageGalleryImage["attributes"][] =
        await strapi.entityService.findMany(
          "api::gallery-image.gallery-image",
          {
            sort: { createdAt: "ASC" },
            populate: "*",
          }
        );

      // @TODO orderEntries can probably be replaced with dql or strapi multiple field ordering
      const orderedEntries = orderEntries(entries);

      // parse entries for return (only send select props. add next/previous)
      let entriesParsedForReturn = parseEntriesForReturn(orderedEntries);

      // if a title filter is passed, only return that entry
      // because I want to fetch individual entries by title
      // api is based on ID
      if (ctx.query.filters?.title) {
        entriesParsedForReturn = [
          entriesParsedForReturn.find(
            (entry) => entry.title === ctx.query.filters.title.$eq
          ),
        ];
      }

      // 2
      const sanitizedEntries = await this.sanitizeOutput(
        entriesParsedForReturn,
        ctx
      );

      // 3
      return this.transformResponse(sanitizedEntries);
    },

    // example of a custom controller method
    // taken from here: https://strapi.io/blog/strapi-internals-customizing-the-backend-part-1-models-controllers-and-routes
    // see corresponding route in src/api/gallery-image/routes/gallery-image-test.ts
    // (cannot comment this out without removing that file or build will fail)
    async test(ctx) {
      ctx.body = "test";
    },
  })
);
