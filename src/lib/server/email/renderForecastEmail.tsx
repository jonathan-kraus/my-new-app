/*
 * @FilePath: \my-new-app\lib\server\email\renderForecastEmail.tsx
 * @LastEditTime: 2026-09-06 21:26:26
 */
import WeatherForecastEmail from "@/emails/WeatherForecastEmail";

export function renderForecastEmail(
  data: Omit<React.ComponentProps<typeof WeatherForecastEmail>, "forecastRows">,
  forecastRows: React.ComponentProps<
    typeof WeatherForecastEmail
  >["forecastRows"],
) {
  return <WeatherForecastEmail {...data} forecastRows={forecastRows} />;
}
