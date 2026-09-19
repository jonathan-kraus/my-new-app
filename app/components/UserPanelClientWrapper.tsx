"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const UserPanelClient = dynamic(() => import("./UserPanelClient"), {
  ssr: false,
});

export default function UserPanelClientWrapper(
  props: ComponentProps<typeof UserPanelClient>,
) {
  return <UserPanelClient {...props} />;
}
