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
          return (
            <li className="sentRequest" key={request.id}>
              <b>{request.toId}</b>
              <button
                onClick={() => {
                  fetchBackend(`/requests/${request.id}?id=${user.id}`, {
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
