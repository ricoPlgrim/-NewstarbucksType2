import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import AccessibilityHelper from "./components/AccessibilityHelper/AccessibilityHelper";
import "./App.scss";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <AccessibilityHelper isDarkMode={false} setIsDarkMode={() => {}} fontScale="normal" setFontScale={() => {}} />
    </>
  );
}

export default App;

