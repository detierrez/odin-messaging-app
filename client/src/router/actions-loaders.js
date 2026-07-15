import { redirect } from "react-router";
import * as api from "@lib/api";
import { ApiError } from "@lib/errors";
import cache from "@lib/cache";

const actions = {};
const loaders = {};

let isLoggedIn = false;
let controllerPromise = null;
const awaitControllerLoader = () => controllerPromise?.catch(() => {});

api.onUnauthenticated(() => {
  if (isLoggedIn) window.location.replace("/login");
});

loaders.controller = async ({ request }) => {
  console.log("Controller loader");
  const { pathname } = new URL(request.url);
  controllerPromise = api.getProfile().then(
    (profile) => {
      isLoggedIn = true;
      cache.set("ownId", profile.id);
    },
    (e) => {
      if (e.body?.errors[0].type === "UNAUTHENTICATED") {
        isLoggedIn = false;
        return pathname === "/login" ? null : redirect("/login");
      }
      throw new Error("Error loading the web app", { cause: e });
    },
  );
  return controllerPromise;
};

loaders.login = async () => {
  await awaitControllerLoader();
  if (isLoggedIn) {
    return redirect("/");
  }
};

actions.login = async ({ request }) => {
  const formData = await request.formData();
  try {
    await api.login(formData.get("username"), formData.get("password"));
    isLoggedIn = true;
    return redirect("/");
  } catch (e) {
    if (e instanceof ApiError) {
      return e;
    }
    throw new Error("Error logging in", { cause: e });
  }
};

loaders.logout = async () => {
  await awaitControllerLoader();
  if (isLoggedIn) {
    await api.logout();
    isLoggedIn = false;
  }
  return redirect("/login");
};

loaders.app = async () => {
  await awaitControllerLoader();
  if (!isLoggedIn) {
    return redirect("/login");
  }
  const [{ chats }, { requests }, { friends }] = await Promise.all([
    api.getInbox(),
    api.getRequests(),
    api.getFriends(),
  ]);

  cache.set("chats", new Map(chats.map(chat)));
  cache.set("requests");
  cache.set("friends", new Set(friends));

  return { chats, requests, friends };
};

export { actions, loaders };
