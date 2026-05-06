import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { getRouter } from "./src/router";

export default createStartHandler({
  createRouter: getRouter,
  getRouterManifest: ({ router }) => {
    return {
      ...router.getManifest(),
    };
  },
})(defaultStreamHandler);
