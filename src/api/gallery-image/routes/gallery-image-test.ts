/**
 * gallery-image router
 */

//  import { factories } from '@strapi/strapi';

//  export default factories.createCoreRouter('api::gallery-image.gallery-image');
export default {
  routes: [
    {
      method: "GET",
      path: "/gallery-images/test",
      handler: "gallery-image.test",
    },
  ],
};
