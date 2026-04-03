import s from "@styles/Requests.module.css";
import { useGroups } from "../../../../../hooks";

export default function GroupList() {
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
                console.log(groupId);
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
