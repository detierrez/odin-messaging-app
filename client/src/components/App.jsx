import s from "@styles/App.module.css";
import { useId } from "@hooks";
import ApiProvider from "@providers/ApiProvider";
import DataProvider from "@providers/DataProvider";
import AsideMenu from "./features/aside/AsideMenu";
import ChatWindow from "./features/chat/ChatWindow";
import Debugger from "./common/Debugger";
import { useData } from "@hooks/index";

export default function App() {
  const { setId } = useId();
  return (
    <ApiProvider>
      <DataProvider>
        <div className={s.body}>
          <aside className={s.aside}>
            <h1>Odinbox</h1>
            <div className={s.asideMenu}>
              <AsideMenu />
            </div>
            <div className="n">
              <button onClick={() => setId(1)}>1</button>
              <button onClick={() => setId(2)}>2</button>
              <button onClick={() => setId(3)}>3</button>
              <button onClick={() => setId(4)}>4</button>
              <button onClick={() => setId(5)}>5</button>
              <button onClick={() => setId(7)}>7</button>
            </div>

            {/* <ProfileButtons className={s.menuBar} /> */}
          </aside>
          <main className={s.main}>
            <Main />
          </main>
        </div>
        <Debugger />
      </DataProvider>
    </ApiProvider>
  );
}

function Main() {
  const { id: chatId } = useData().chat || {};
  return <ChatWindow key={chatId} />;
}
