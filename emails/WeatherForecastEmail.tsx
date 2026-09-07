/*
 * @FilePath: \my-new-app\emails\WeatherForecastEmail.tsx
 * @LastEditTime: 2026-09-06 21:49:34
 */
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from "react-email";

type ForecastRow = {
  date: string; // formatted date string
  max: number;
  min: number;
  icon: string;
};

type WeatherForecastEmailProps = {
  locationName: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  fetchedAt: string;
  source: string;

  sunrise?: string;
  sunset?: string;
  moonrise?: string;
  moonset?: string;
  moonPhaseName?: string;
  moonPhaseEmoji?: string;

  forecastRows: ForecastRow[]; // ⭐ NEW: multi‑day forecast
};

export default function WeatherForecastEmail(props: WeatherForecastEmailProps) {
  const {
    locationName,
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    fetchedAt,
    source,
    sunrise,
    sunset,
    moonrise,
    moonset,
    moonPhaseName,
    moonPhaseEmoji,
    forecastRows,
  } = props;

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>
            Weather Forecast for {locationName}
          </Heading>

          {/* Current Conditions */}
          <Section style={styles.section}>
            <Text style={styles.label}>Current Conditions</Text>
            <Text style={styles.text}>
              Temperature: <strong>{temperature}°</strong> (Feels like{" "}
              {feelsLike}°)
            </Text>
            <Text style={styles.text}>
              Humidity: <strong>{humidity}%</strong>
            </Text>
            <Text style={styles.text}>
              Wind Speed: <strong>{windSpeed} mph</strong>
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Astronomy */}
          <Section style={styles.section}>
            <Text style={styles.label}>Astronomy</Text>
            <Text style={styles.text}>Sunrise: {sunrise}</Text>
            <Text style={styles.text}>Sunset: {sunset}</Text>
            <Text style={styles.text}>Moonrise: {moonrise}</Text>
            <Text style={styles.text}>Moonset: {moonset}</Text>
            <Text style={styles.text}>
              Moon Phase: {moonPhaseName} {moonPhaseEmoji}
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Multi‑Day Forecast Table */}
          <Section style={styles.section}>
            <Text style={styles.label}>Upcoming Forecast</Text>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Day</th>
                  <th style={styles.th}>High</th>
                  <th style={styles.th}>Low</th>
                  <th style={styles.th}>Weather</th>
                </tr>
              </thead>
              <tbody>
                {forecastRows.map((row, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{row.date}</td>
                    <td style={styles.td}>{row.max}°</td>
                    <td style={styles.td}>{row.min}°</td>
                    <td style={styles.td}>{row.icon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section style={styles.section}>
            <Text style={styles.text}>
              Fetched at: {new Date(fetchedAt).toLocaleString()}
            </Text>
            <Text style={styles.text}>Source: {source}</Text>
          </Section>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            Sent by Travel Weather Bot · www.kraus.my.id
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
    padding: "20px",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "600px",
    margin: "0 auto",
    border: "1px solid #e5e7eb",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "16px",
    color: "#111827",
  },
  section: {
    marginBottom: "20px",
  },
  label: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#374151",
  },
  text: {
    fontSize: "14px",
    marginBottom: "4px",
    color: "#4b5563",
  },
  hr: {
    borderColor: "#e5e7eb",
    margin: "20px 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  } as any,
  th: {
    textAlign: "left",
    padding: "8px 4px",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
  } as any,
  td: {
    padding: "8px 4px",
    borderBottom: "1px solid #f3f4f6",
    color: "#4b5563",
  } as any,
  footer: {
    fontSize: "12px",
    color: "#6b7280",
    textAlign: "center",
    marginTop: "20px",
  } as any,
};
