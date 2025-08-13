// app/ClientWrapper.jsx
"use client";

import AutoLogoutWatcher from "../../AutoLogoutWatcher";

export default function ClientWrapper({ children }) {
  return (
    <>
      <AutoLogoutWatcher />
      {children}
    </>
  );
}
