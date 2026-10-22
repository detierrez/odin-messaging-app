import { useLoaderData } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { SelectedChatProvider } from "@providers";
import { Surface } from "./common";
import Aside from "./features/aside/Aside";
import View from "./features/chat/View";
import { SocketIo } from "./SocketIo";
import s from "./App.module.css";

export default function App() {
  const queryClient = useLoaderData();

  return (
    <QueryClientProvider client={queryClient}>
      <SocketIo>
        <SelectedChatProvider>
          <Surface className={s.body}>
            <Aside className={s.aside} />
            <View className={s.main} />
          </Surface>
        </SelectedChatProvider>
      </SocketIo>
    </QueryClientProvider>
  );
}
