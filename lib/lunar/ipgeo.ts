export interface IPGeoAstronomy {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
  moon_illumination: string;
}

export async function getIPGeoAstronomy(
  latitude: number,
  longitude: number,
  date: Date,
): Promise<IPGeoAstronomy> {
  const apiKey = process.env.IPGEO_API_KEY;
  if (!apiKey) {
    console.error("Missing IPGEO_API_KEY");
    return {
      sunrise: "",
      sunset: "",
      moonrise: "",
      moonset: "",
      moon_phase: "",
      moon_illumination: "",
    };
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const url = `https://api.ipgeolocation.io/astronomy?apiKey=${apiKey}&lat=${latitude}&long=${longitude}&date=${yyyy}-${mm}-${dd}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const body = await res.text();
      console.error("IPGeo non-OK response", { status: res.status, body });
      return {
        sunrise: "",
        sunset: "",
        moonrise: "",
        moonset: "",
        moon_phase: "",
        moon_illumination: "",
      };
    }

    const data = await res.json();

    return {
      sunrise: data.sunrise ?? "",
      sunset: data.sunset ?? "",
      moonrise: data.moonrise ?? "",
      moonset: data.moonset ?? "",
      moon_phase: data.moon_phase ?? "",
      moon_illumination: data.moon_illumination ?? "",
    };
  } catch (err) {
    console.error("IPGeo fetch error", err);
    return {
      sunrise: "",
      sunset: "",
      moonrise: "",
      moonset: "",
      moon_phase: "",
      moon_illumination: "",
    };
  }
}
