import s from "@styles/App.module.css";
import Inbox from "./components/layout/Inbox";
import Chat from "./components/layout/Chat";
import WebSocketProvider from "./providers/WebSocketProvider";
import { fetchBackend } from "./router/actions-loaders";

export default function App() {
  return (
    <WebSocketProvider>
      <div className={s.body}>
        <aside className={s.aside}>{/* <Inbox /> */}</aside>
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
  );
}
