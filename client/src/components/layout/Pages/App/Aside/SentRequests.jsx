import { useData, useUser } from "../../../../../hooks";
import { fetchBackend } from "../../../../../router/actions-loaders";

export default function SentRequests() {
  const { user } = useUser();
  const {
    requests: { sentTo },
  } = useData() || {};

  return (
    <ul>
      {sentTo?.map((otherUser) => {
        const { id } = otherUser;
        return (
          <li className="sentRequest" key={id}>
            <b>{id}</b>
            <button
              onClick={() => {
                fetchBackend(`/requests/${id}?id=${user.id}`, {
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
