export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL;

export async function fetchBackend(path, { body, method, signal } = {}) {
  const options = {
    method: method ?? (body ? "POST" : "GET"),
    headers: {
      // Authorization: getJwtToken(),
    },
    signal,
  };

  if (body instanceof FormData) {
    options.body = body;
  } else if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(SERVER_BASE_URL + path, options);
  const payload = await response.json();
  const { status } = response;

  console.log({
    req: { endpoint: `${method ?? (body ? "POST" : "GET")} ${path}`, body },
    res: { status, text: response.statusText, payload },
  });

  if (status >= 400) {
    if (status === 401) logout();
    const { cause } = payload;
    throw new Error(response.statusText, { cause });
  }

  return payload;
}

function logout() {}
