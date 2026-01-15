"use client";

import dynamic from "next/dynamic";

const UserPanelClient = dynamic(() => import("./UserPanelClient"), {
  ssr: false,
});

export default function UserPanelClientWrapper(props: { user: any }) {
  return <UserPanelClient {...props} />;
}
