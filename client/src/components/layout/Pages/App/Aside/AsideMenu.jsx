import { useState } from "react";
import Inbox from "./Inbox/Inbox";
import IncomingRequests from "./IncomingRequests";
import OutgoingRequests from "./OutgoingRequests";

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
              <IncomingRequests />
            </>
          ),
          addFriend: (
            <>
              <h2>Add friend</h2>
              <button onClick={() => setMenu("friends")}>&lt;</button>
              <br />
              <input type="text" placeholder="Enter username..." />
              <button>Send request</button>
              <br />
              <h3>Pending requests</h3>
              <OutgoingRequests />
            </>
          ),
          newGroup: (
            <>
              <h2>New group</h2>
              <button onClick={() => setMenu("friends")}>&lt;</button>
              <br />
              <button>Upload group picture</button>
              <br />
              <input type="text" placeholder="Group name..." />
              <button>Send request</button>
              <br />
              <h3>Select members</h3>
            </>
          ),
        }[menu]
      }
    </>
  );
}
