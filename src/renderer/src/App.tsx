import { AppRouter } from "@/AppRouter";
import { ModalProvider } from "@/contexts/modal-context";
import { Modal } from "@/components/ui/Modal";

function App(): JSX.Element {
  return (
    <ModalProvider>
      <AppRouter />
      <Modal />
    </ModalProvider>
  )
};

export default App;
