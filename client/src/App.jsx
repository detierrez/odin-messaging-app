import s from "@styles/App.module.css";
import Inbox from "./components/layout/Inbox";
import Chat from "./components/layout/Chat";
import WebSocketProvider from "./providers/WebSocketProvider";
import ContactProvider from "./providers/ContactProvider";
import UserProvider from "./providers/UserProvider";

export default function App() {
  return (
    <UserProvider>
      <ContactProvider>
        <WebSocketProvider>
          <div className={s.body}>
            <aside className={s.aside}>
              <Inbox />
            </aside>
            <main className={s.main}>
              <Chat />
            </main>
          </div>
        </WebSocketProvider>
      </ContactProvider>
    </UserProvider>
  );
}
