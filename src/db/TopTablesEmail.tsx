/*
 * @FilePath: \my-new-app\src\db\TopTablesEmail.tsx
 * @LastEditTime: 2026-09-07 22:17:41
 */
import { Html, Body, Container, Text } from "react-email";
interface TopTablesEmailProps {
  first_name: string;
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
