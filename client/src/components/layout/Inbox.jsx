import { useEffect } from "react";
import { fetchBackend } from "../../router/actions-loaders";
import { useState } from "react";

export default function Inbox() {
  //   const [inbox, setInbox] = useState({});

  //   useEffect(() => {
  //     const controller = new AbortController();
  //     const abortError = new Error("Request aborted");
  //     fetchBackend("/inbox", { signal: controller.signal })
  //       .then((data) => setInbox(data))
  //       .catch((error) => {
  //         if (error !== abortError) throw error;
  //       });
  //     return () => controller.abort(abortError);
  //   }, []);

  return <>Mah messages</>;
}
