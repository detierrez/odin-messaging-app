import s from "@styles/App.module.css";
import Inbox from "./components/layout/Inbox";
import Chat from "./components/layout/Chat";
import WebSocketProvider from "./providers/WebSocketProvider";
import { fetchBackend } from "./router/actions-loaders";
import { UserContext } from "./contexts/contexts";

export default function App() {
  return (
    <UserContext value={{ id: 3 }}>
      <WebSocketProvider>
        <div className={s.body}>
          <aside className={s.aside}>
            <Inbox />
          </aside>
          <main className={s.main}>
            <Chat />

            <button
              onClick={() => {
                fetchBackend;
              }}
            ></button>
          </main>
        </div>
      </WebSocketProvider>
    </UserContext>
  );
}
