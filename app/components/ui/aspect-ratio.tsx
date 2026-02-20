/*
 * @FilePath     : \my-new-app\app\components\ui\aspect-ratio.tsx
 * @Author       : Jonathan
 * @Date         : 2026-02-19 19:24:39
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-19 19:24:40
 */
"use client";

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
