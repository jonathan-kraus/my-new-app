/*
 * @FilePath: \my-new-app\app\forecast\ForecastWrapper.tsx
 * @LastEditTime: 2026-09-04 00:32:32
 */
"use client";

import ForecastClient from "./ForecastClient";

export default function ForecastWrapper(props: any) {
  return <ForecastClient {...props} />;
}
