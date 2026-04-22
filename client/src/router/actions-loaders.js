/* -------------------------------------------------------------------------- */
/*                               API & Utilities                              */
/* -------------------------------------------------------------------------- */

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
