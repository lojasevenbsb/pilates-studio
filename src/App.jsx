import { AppProvider } from "./context/AppContext.jsx";
import AppShell from "./layout/AppShell.jsx";

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
