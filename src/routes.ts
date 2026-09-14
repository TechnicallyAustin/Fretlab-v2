import { createBrowserRouter } from "react-router";
import { Shell } from "./components/Shell";
import { PracticeStudio } from "./pages/PracticeStudio";
import { TabStudio } from "./pages/TabStudio";
import { Library } from "./pages/Library";
import { TheoryStudio } from "./pages/TheoryStudio";
import { Profile } from "./pages/Profile";
import { TunerPage } from "./pages/TunerPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ItemsPage } from "./pages/ItemsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/items",
    Component: Shell,
    children: [
      { index: true, Component: ItemsPage },
    ],
  },
  {
    path: "/",
    Component: Shell,
    children: [
      { index: true, Component: PracticeStudio },
      { path: "tab", Component: TabStudio },
      { path: "library", Component: Library },
      { path: "theory", Component: TheoryStudio },
      { path: "tuner", Component: TunerPage },
      { path: "profile", Component: Profile },
    ],
  },
]);
