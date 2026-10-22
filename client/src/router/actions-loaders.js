import { redirect } from "react-router";
import { MutationCache, QueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { ApiError, isUnauthenticatedError } from "@lib/errors";
import { queries } from "@lib/queries";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isUnauthenticatedError(error)) {
        window.location.replace("/logout");
      }
    },
  }),
});

const checkLoggedIn = async () => {
  try {
    await queryClient.fetchQuery(queries.ownId());
    return true;
  } catch (e) {
    if (isUnauthenticatedError(e)) {
      return false;
    }
    throw new Error("Error getting profile", { cause: e });
  }
};

const actions = {};
const loaders = {};

loaders.login = async () => {
  if (await checkLoggedIn()) {
    return redirect("/");
  }
};

actions.login = async ({ request }) => {
  const formData = await request.formData();
  try {
    await api.login(formData.get("username"), formData.get("password"));
    queryClient.clear();
    return redirect("/");
  } catch (e) {
    if (e instanceof ApiError) {
      return e;
    }
    throw new Error("Error logging in", { cause: e });
  }
};

loaders.logout = async () => {
  if (await checkLoggedIn()) {
    await api.logout();
    queryClient.clear();
  }
  return redirect("/login");
};

loaders.app = async () => {
  if (!(await checkLoggedIn())) {
    return redirect("/login");
  }

  return queryClient;
};

export { actions, loaders };
