import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() || {};
  console.error(error);
  // Expected output will depend on whether it's a thrown Error or Response

  return (
    <div>
      <h1>Oops! An error occurred.</h1>
      <p>
        <b>{error.message || error.statusText}</b>
      </p>
      <p>{error.stack}</p>
    </div>
  );
}
