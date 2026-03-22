import s from "@styles/App.module.css";
import Inbox from "./components/layout/Inbox";
import Chat from "./components/layout/Chat";
import WebSocketProvider from "./providers/WebSocketProvider";
import { UserContext } from "./contexts/contexts";
import ContactProvider from "./providers/ContactProvider";

export default function App() {
  return (
    <UserContext value={{ id: 3 }}>
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
    </UserContext>
  );
}
