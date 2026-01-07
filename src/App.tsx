import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import AccessibilityHelper from "./components/AccessibilityHelper/AccessibilityHelper";
import { AccessibilityProvider } from "./providers/accessibility";
import "./App.scss";

/*
  나중에 개발시작할떄  접근성 컴포넌트 삭제 예정 
   AccessibilityProvider,
   AccessibilityProvider 삭제 예정
*/
function App() {
  return (
    <AccessibilityProvider>
      <RouterProvider router={router} />
      <AccessibilityHelper />
    </AccessibilityProvider>
  );
}

export default App;