import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LeagueSummaryComponent from "./pages/Home";
import "./App.css";
import Navbar from "./components/NavBar";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LeagueSummaryComponent />,
    },
  ]);

  return (
    <>
      <Navbar />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
