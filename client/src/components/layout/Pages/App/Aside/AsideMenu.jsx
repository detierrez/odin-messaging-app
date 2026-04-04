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
              <h2>
                Chats <button onClick={() => setMenu("friends")}>+</button>
              </h2>
              <Inbox />
            </>
          ),
          friends: (
            <>
              <h2>
                <button onClick={() => setMenu("main")}>&lt;</button>
                Friends
              </h2>
              <ReceivedRequests />
              <h3>
                Friends <button onClick={() => setMenu("addFriend")}>+</button>
              </h3>
              <FriendList />
              <h3>
                Groups <button onClick={() => setMenu("newGroup")}>+</button>
              </h3>
              <GroupList />
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

              <NewGroupFrom onCreate={() => setMenu("friends")} />
            </>
          ),
        }[menu]
      }
    </>
  );
}
