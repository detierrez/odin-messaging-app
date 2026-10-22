import { api as originalApi } from "../lib/api";

export const wrappedApi = Object.entries(originalApi).reduce(
  (api, [key, apiFn]) => (
    (api[key] = catchUnauthenticatedErrors(apiFn, () =>
      window.location.replace("logout"),
    )),
    api
  ),
  {},
);

function catchUnauthenticatedErrors(fn, onUnauthenticated) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e.body?.errors[0].type === "UNAUTHENTICATED") {
        onUnauthenticated();
      }
      throw new Error("An api call inside main app failed", { cause: e });
    }
  };
}
