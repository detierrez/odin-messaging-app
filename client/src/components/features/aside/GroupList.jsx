import s from "@styles/Requests.module.css";
import { useApi, useGroups, useSetChat } from "@hooks";
import { DEFAULT_AVATAR } from "@lib/defaults";

export default function GroupList() {
  const { fetchApi } = useApi();
  const groups = useGroups();
  const { setActiveChatId } = useSetChat();

  return (
    <ul>
      {!groups
        ? "Loading"
        : groups.length === 0
          ? "No groups yet"
          : groups?.map((group) => {
              const { chatId, name, avatarUrl } = group;
              const handleClick = () => setActiveChatId(chatId);
              return (
                <li className={s.entry} key={chatId} onClick={handleClick}>
                  <img
                    className={s.avatar}
                    src={avatarUrl ?? DEFAULT_AVATAR}
                    alt=""
                  />
                  <span className={s.name}>{name}</span>
                  <button
                    className={s.button}
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchApi(`/chats/${chatId}/members/me`, {
                        method: "DELETE",
                      })
                        .then(() =>
                          console.log(`Chat ${chatId} removed successfully`),
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
