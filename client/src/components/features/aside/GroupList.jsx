import s from "@styles/Requests.module.css";
import { useGroups, useUser } from "@hooks";
import { fetchBackend } from "@lib";

export default function GroupList() {
  const { user } = useUser();
  const groups = useGroups();

  return (
    <ul>
      {groups?.map((group) => {
        const { id: groupId, name, avatarUrl } = group;
        return (
          <li className={s.entry} key={group.id}>
            <img className={s.avatar} src={avatarUrl} alt="" />
            <span className={s.name}>{name}</span>
            <button
              className={s.button}
              onClick={() => {
                fetchBackend(`/groups/${groupId}?id=${user.id}`, {
                  method: "DELETE",
                })
                  .then(() =>
                    console.log(`Group ${groupId} removed successfully`),
                  )
                  .catch((error) =>
                    console.log(`Error removing group: ${error}`),
                  );
              }}
            >
              -
            </button>
          </li>
        );
      })}
    </ul>
  );
}
