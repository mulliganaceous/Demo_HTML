import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Root, { loader as rootLoader, action as rootAction } from "./routes/root";
import Contact, {loader as contactLoader, action as contactAction, } from "./routes/contact";
import EditContact, { action as editAction } from "./routes/edit";
import { action as destroyAction } from "./routes/destroy";
import Index, { loader as homeLoader } from "./routes/index";
import Dashboard, { loader as redirectLoader} from "./routes/dashboard";
import Contacts from "./routes/contacts";
import ErrorPage from "./error-page";
import './index.css'

/* Create router */
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    action: rootAction,
    children: [
      { 
        index: true, 
        element: <Index />,
        loader: homeLoader,
      },
      { 
        path: "dashboard",
        element: <Dashboard />,
        loader: redirectLoader,
      },
      {
        path: "contacts/",
        element: <Contacts />,
      },
      {
        path: "contacts/:contactId",
        element: <Contact />,
        loader: contactLoader,
        action: contactAction,
      },
      {
        path: "contacts/:contactId/edit",
        element: <EditContact />,
        loader: contactLoader,
        action: editAction,
      },
      {
        path: "contacts/:contactId/destroy",
        action: destroyAction,
        errorElement: <div>Oops! There was an error (destroy).</div>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
