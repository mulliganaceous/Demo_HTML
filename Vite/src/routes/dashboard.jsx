import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { redirect } from "react-router-dom";
import { getUser } from "../demoauth.js";

export async function loader() {
  let user = await getUser();
  if (!user?.user) {
    console.info("User logged out: " + user.user);
    return redirect("/contacts/");
  }
  return user;
}

export default function Dashboard() {
  const user = useLoaderData().user;
  useEffect(() => {
    const handleLoad = () => {
      console.info("User logged in: " + user);
    };
    window.addEventListener('load', handleLoad);
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <div>Welcome to Cadena! {user ? user : "-"}</div>
  );
}