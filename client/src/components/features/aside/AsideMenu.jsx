import { useState } from "react";
import Inbox from "./inbox/Inbox";
import FriendList from "./FriendList";
import NewGroupFrom from "./NewGroupForm";
import GroupList from "./GroupList";
import ReceivedRequests from "../requests/ReceivedRequests";
import SentRequests from "../requests/SentRequests";
import AddFriendInput from "../requests/AddFriendInput";

export default function AsideMenu() {
  const [menu, setMenu] = useState("main");

  const menus = {
    main: (
      <>
        <h2>
          Inbox <button onClick={() => setMenu("chats")}>+</button>
        </h2>
        <Inbox />
      </>
    ),
    chats: (
      <>
        <h2>
          <button onClick={() => setMenu("main")}>&lt;</button>
          Chats
        </h2>
        <ReceivedRequests />
        <h3>
          Friends <button onClick={() => setMenu("addFriend")}>+</button>
        </h3>
        <FriendList />
        <h3>
          Groups <button onClick={() => setMenu("addGroup")}>+</button>
        </h3>
        <GroupList />
      </>
    ),
    addFriend: (
      <>
        <h2>
          {" "}
          <button onClick={() => setMenu("chats")}>&lt;</button>Add friend
        </h2>

        <br />
        <AddFriendInput />
        <br />
        <SentRequests />
      </>
    ),
    addGroup: (
      <>
        <h2>
          <button onClick={() => setMenu("chats")}>&lt;</button>New group
        </h2>

        <NewGroupFrom onCreate={() => setMenu("chats")} />
      </>
    ),
  };
  return <>{menus[menu]}</>;
}
