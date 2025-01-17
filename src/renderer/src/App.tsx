import MainMenu from "@/ui/MainMenu"

function App(): JSX.Element {
  const ipcHandle = (): void => window.Electron.ipcRenderer.send('ping')

  return (
    <>
      <MainMenu />
    </>
  )
}

export default App
