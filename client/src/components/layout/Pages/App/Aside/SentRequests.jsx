import { useData, useUser } from "../../../../../hooks";
import { fetchBackend } from "../../../../../router/actions-loaders";

export default function SentRequests() {
  const { user } = useUser();
  const {
    requests: { sent: sentRequests },
  } = useData();

  return (
    <ul>
      {sentRequests &&
        sentRequests.map((request) => {
          const { toId } = request;
          return (
            <li className="sentRequest" key={toId}>
              <b>{toId}</b>
              <button
                onClick={() => {
                  fetchBackend(`/requests/${toId}?id=${user.id}`, {
                    method: "DELETE",
                  });
                }}
              >
                Cancel
              </button>
            </li>
          );
        })}
    </ul>
  );
}
