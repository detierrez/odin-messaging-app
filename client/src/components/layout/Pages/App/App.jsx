import s from "@styles/App.module.css";
import Inbox from "./Inbox/Inbox";
import ProfileButtons from "./Inbox/ProfileButtons";
import { useData, useUser } from "../../../../hooks";
import { useState } from "react";
import ChatWindow from "./Chat/ChatWindow";

export default function App() {
  const { inbox, chat } = useData();
  const [menu, setMenu] = useState("main");
  const { setUser } = useUser();

  return (
    <div className={s.body}>
      <aside className={s.aside}>
        <h1>Odinbox</h1>
        <div className={s.asideMenu}>
          {
            {
              main: (
                <>
                  <h2>Chats</h2>
                  <button onClick={() => setMenu("contacts")}>+</button>
                  <Inbox inbox={inbox} />
                </>
              ),
              contacts: (
                <>
                  <h2>Contacts</h2>
                  <button onClick={() => setMenu("main")}>&lt;</button>
                  <br />
                  <button onClick={() => setMenu("addContact")}>
                    Add contact
                  </button>
                  <br />
                  <button onClick={() => setMenu("newGroup")}>New group</button>
                  <h3>Friend requests</h3>
                </>
              ),
              addContact: (
                <>
                  <h2>Add contact</h2>
                  <button onClick={() => setMenu("contacts")}>&lt;</button>
                  <br />
                  <input type="text" placeholder="Enter username..." />
                  <button>Send request</button>
                  <br />
                  <h3>Pending requests</h3>
                </>
              ),
              newGroup: (
                <>
                  <h2>New group</h2>
                  <button onClick={() => setMenu("contacts")}>&lt;</button>
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
        </div>

        <div className="n">
          {" "}
          <button>I</button>
          <button>C</button>
          <button>F</button>
          <button onClick={() => setUser({ id: 1 })}>1</button>
          <button onClick={() => setUser({ id: 2 })}>2</button>
          <button onClick={() => setUser({ id: 3 })}>3</button>
          <button onClick={() => setUser({ id: 4 })}>4</button>
          <button onClick={() => setUser({ id: 5 })}>5</button>
        </div>

        <ProfileButtons className={s.menuBar} />
      </aside>
      <main className={s.main}>{<ChatWindow chat={chat} />}</main>
    </div>
  );
}
