import { useData, useUser } from "../../../../../hooks";
import { fetchBackend } from "../../../../../router/actions-loaders";

export default function ReceivedRequests() {
  const { user } = useUser();
  const {
    requests: { received: receivedRequests },
  } = useData();

  return (
    <ul>
      {receivedRequests &&
        receivedRequests.map((request) => {
          return (
            <li className="receivedRequest" key={request.id}>
              <b>{request.fromId}</b>
              <button
                onClick={() => {
                  fetchBackend(`/requests/${request.id}/accept?id=${user.id}`, {
                    method: "POST",
                  });
                }}
              >
                Accept
              </button>{" "}
              <button
                onClick={() => {
                  fetchBackend(`/requests/${request.id}/reject?id=${user.id}`, {
                    method: "POST",
                  });
                }}
              >
                Decline
              </button>
            </li>
          );
        })}
    </ul>
  );
}
