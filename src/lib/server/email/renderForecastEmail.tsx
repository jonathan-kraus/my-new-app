/*
 * @FilePath: \my-new-app\lib\server\email\renderForecastEmail.tsx
 * @LastEditTime: 2026-09-06 21:26:26
 */
import WeatherForecastEmail from "@/emails/WeatherForecastEmail";

export function renderForecastEmail(data: any, forecastRows: any[]) {
  return <WeatherForecastEmail {...data} forecastRows={forecastRows} />;
}
