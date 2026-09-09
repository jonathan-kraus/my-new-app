/*
 * @FilePath: \my-new-app\emails\TopTablesEmail.tsx
 * @LastEditTime: 2026-09-07 22:32:45
 */
import { Html, Body, Container, Text } from "react-email";
interface TopTablesEmailProps {
  first_name: string;
  weatherSnapshot: {
    temperature: number;
    feelsLike: number | null;
    humidity: number | null;
    windSpeed: number | null;
    windDirection: number | null;
    pressure: number | null;
    visibility: number | null;
    weatherCode: number | null;
    fetchedAt: string;
  } | null;
  db1: string;
  ct1: number;
  db2: string;
  ct2: number;
  db3: string;
  ct3: number;
  db4: string;
  ct4: number;
  db5: string;
  ct5: number;
}

export default function TopTablesEmail({
  first_name,
  weatherSnapshot,
  db1,
  ct1,
  db2,
  ct2,
  db3,
  ct3,
  db4,
  ct4,
  db5,
  ct5,
}: TopTablesEmailProps) {
  {
    return (
      <Html>
        <Body>
          <Container>
            <Text>Hi {first_name},</Text>

            <Text>Latest weather snapshot</Text>
            {weatherSnapshot ? (
              <>
                <Text>Temperature: {weatherSnapshot.temperature}°</Text>
                <Text>Feels like: {weatherSnapshot.feelsLike ?? "N/A"}°</Text>
                <Text>Humidity: {weatherSnapshot.humidity ?? "N/A"}%</Text>
                <Text>Wind: {weatherSnapshot.windSpeed ?? "N/A"} mph</Text>
                <Text>
                  Wind direction: {weatherSnapshot.windDirection ?? "N/A"}°
                </Text>
                <Text>Pressure: {weatherSnapshot.pressure ?? "N/A"}</Text>
                <Text>
                  Visibility: {weatherSnapshot.visibility ?? "N/A"} mi
                </Text>
                <Text>
                  Weather code: {weatherSnapshot.weatherCode ?? "N/A"}
                </Text>
                <Text>
                  Fetched at:{" "}
                  {new Date(weatherSnapshot.fetchedAt).toLocaleString()}
                </Text>
              </>
            ) : (
              <Text>No weather snapshot available.</Text>
            )}

            <Text>
              {db1} — {ct1}
            </Text>
            <Text>
              {db2} — {ct2}
            </Text>
            <Text>
              {db3} — {ct3}
            </Text>
            <Text>
              {db4} — {ct4}
            </Text>
            <Text>
              {db5} — {ct5}
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }
}
