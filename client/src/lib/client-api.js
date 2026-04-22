export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL;

export async function fetchBackend(path, { body, method, signal } = {}) {
  method = method ?? (body ? "POST" : "GET");
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
