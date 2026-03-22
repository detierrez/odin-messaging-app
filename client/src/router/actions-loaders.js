/* -------------------------------------------------------------------------- */
/*                               API & Utilities                              */
/* -------------------------------------------------------------------------- */
export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL;

export async function fetchBackend(path, { body, method, signal } = {}) {
  method = method ? method : body ? "POST" : "GET";
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      // Authorization: getJwtToken(),
    },
    body: body && JSON.stringify(body),
    signal,
  };

  const response = await fetch(SERVER_BASE_URL + path, options);
  const data = await response.json();
  const { status } = response;

  console.log({
    a: method,
    b: path,
    c: body,

    d: status,
    e: response.statusText,
    f: data,
  });

  if (status >= 400) {
    // if (status === 401) logout();
    const { cause } = data;
    throw new Error(response.statusText, { cause });
  }

  return data;
}

// function getJwtToken() {
//   return localStorage.getItem("Authorization");
// }

// function login(token) {
//   localStorage.setItem("Authorization", `Bearer ${token}`);
// }

// function logout() {
//   localStorage.removeItem("Authorization");
// }

// function parseJwt(token) {
//   const base64Url = token.split(".")[1];
//   const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//   const jsonPayload = decodeURIComponent(
//     window
//       .atob(base64)
//       .split("")
//       .map(function (c) {
//         return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//       })
//       .join(""),
//   );

//   return JSON.parse(jsonPayload);
// }

// export function redirectLoggedIn() {
//   if (getJwtToken()) return redirect("/posts");
// }

// export function redirectLoggedOut() {
//   if (!getJwtToken()) return redirect("/login");
// }

// function authenticate() {
//   try {
//     const token = getJwtToken();
//     if (token) {
//       const user = parseJwt(token);
//       return user;
//     }
//     return null;
//   } catch (e) {
//     console.log(e)
//     return null;
//   }
// }

/* -------------------------------------------------------------------------- */
/*                                   Loaders                                  */
/* -------------------------------------------------------------------------- */

// export async function rootLoader() {
//   return authenticate();
// }

// export async function rocksLoader() {
//   const rocks = await fetchBackend("/rocks");
//   return rocks;
// }

// export async function rockLoader({ params }) {
//   const { rockId } = params;
//   const rock = await fetchBackend(`/rock/${rockId}`);
//   return rock;
// }

/* -------------------------------------------------------------------------- */
/*                                   Actions                                  */
/* -------------------------------------------------------------------------- */

// export async function rockAction({ request, params }) {
//   const formData = await request.formData();
//   const { rockId } = params;
//   try {
//     await fetchBackend({
//       path: `/rocks/${rockId}`,
//       body: {
//         size: formData.get("size") || undefined,
//       },
//       method: formData.get("_method_override"),
//     });
//   } catch (error) {
//     console.log(error);
//   }
//   return redirect(formData.get("_redirect"));
// }
