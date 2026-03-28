import { useState } from "react";
import Inbox from "./Inbox/Inbox";
import ReceivedRequests from "./ReceivedRequests";
import SentRequests from "./SentRequests";
import AddFriendInput from "./AddFriendInput";
import FriendList from "./FriendList";
import NewGroupFrom from "./NewGroupForm";
import GroupList from "./GroupList";

export default function AsideMenu() {
  const [menu, setMenu] = useState("main");

  return (
    <>
      {
        {
          main: (
            <>
              <h2>Chats</h2>
              <button onClick={() => setMenu("friends")}>+</button>
              <Inbox />
            </>
          ),
          friends: (
            <>
              <h2>Friends</h2>
              <button onClick={() => setMenu("main")}>&lt;</button>
              <br />
              <button onClick={() => setMenu("addFriend")}>Add friend</button>
              <br />
              <button onClick={() => setMenu("newGroup")}>New group</button>
              <h3>Friend requests</h3>
              <ReceivedRequests />
              <h3>Groups</h3>
              <GroupList />
              <h3>Friends</h3>
              <FriendList />
            </>
          ),
          addFriend: (
            <>
              <h2>Add friend</h2>
              <button onClick={() => setMenu("friends")}>&lt;</button>
              <br />
              <AddFriendInput />
              <br />
              <h3>Pending requests</h3>
              <SentRequests />
            </>
          ),
          newGroup: (
            <>
              <h2>New group</h2>
              <button onClick={() => setMenu("friends")}>&lt;</button>

              <NewGroupFrom />
            </>
          ),
        }[menu]
      }
    </>
  );
}
