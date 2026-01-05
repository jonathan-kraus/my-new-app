"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";

type SunriseCountdownProps = {
   sunrise: string;
   timezone: string;
};

export function SunriseCountdown({ sunrise, timezone }: SunriseCountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const lastHourRef = useRef<number | null>(null);
  const eventFiredRef = useRef(false);

  useEffect(() => {
    if (!sunrise) return;

    const target = new Date(sunrise).getTime();

    const tick = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        if (!eventFiredRef.current) {
          toast.success("🌇 Sunrise is happening now");
          eventFiredRef.current = true;
        }
        setRemaining(0);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));

      // Hour-change toast
      if (lastHourRef.current !== hours) {
        if (lastHourRef.current !== null) {
          toast(`⏳ Sunrise in ${hours} hour${hours === 1 ? "" : "s"}`);
        }
        lastHourRef.current = hours;
      }

      setRemaining(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [sunrise, timezone]);

  if (remaining == null) return null;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return (
    <div className="text-sky-200 text-sm">
      Sunrise in {hours}h {minutes}m {seconds}s
    </div>
  );
}

type SunsetCountdownProps = {
   sunset: string;
   timezone: string;
};
export function SunsetCountdown({ sunset, timezone }: SunsetCountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  const lastHourRef = useRef<number | null>(null);
  const eventFiredRef = useRef(false);

  useEffect(() => {
    if (!sunset) return;

    const target = new Date(sunset).getTime();

    const tick = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        if (!eventFiredRef.current) {
          toast.success("🌇 Sunset is happening now");
          eventFiredRef.current = true;
        }
        setRemaining(0);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));

      // Hour-change toast
      if (lastHourRef.current !== hours) {
        if (lastHourRef.current !== null) {
          toast(`⏳ Sunset in ${hours} hour${hours === 1 ? "" : "s"}`);
        }
        lastHourRef.current = hours;
      }

      setRemaining(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [sunset, timezone]);

  if (remaining == null) return null;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return (
    <div className="text-sky-200 text-sm">
      Sunset in {hours}h {minutes}m {seconds}s
    </div>
  );
}


type MoonsetCountdownProps = {
  moonset: string;     // ISO timestamp
  timezone: string;
};

export function MoonsetCountdown({ moonset, timezone }: MoonsetCountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  const lastHourRef = useRef<number | null>(null);
  const eventFiredRef = useRef(false);

  useEffect(() => {
    if (!moonset) return;

    const target = new Date(moonset).getTime();

    const tick = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        if (!eventFiredRef.current) {
          toast.success("🌕 Moonset is happening now");
          eventFiredRef.current = true;
        }
        setRemaining(0);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));

      if (lastHourRef.current !== hours) {
        if (lastHourRef.current !== null) {
          toast(`⏳ Moonset in ${hours} hour${hours === 1 ? "" : "s"}`);
        }
        lastHourRef.current = hours;
      }

      setRemaining(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [moonset, timezone]);

  if (remaining == null) return null;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return (
    <div className="text-sky-200 text-sm">
      Moonset in {hours}h {minutes}m {seconds}s
    </div>
  );
}

type MoonriseCountdownProps = {
  moonrise: string;     // ISO timestamp
  timezone: string;
};

export function MoonriseCountdown({ moonrise, timezone }: MoonriseCountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  const lastHourRef = useRef<number | null>(null);
  const eventFiredRef = useRef(false);

  useEffect(() => {
    if (!moonrise) return;

    const target = new Date(moonrise).getTime();

    const tick = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        if (!eventFiredRef.current) {
          toast.success("🌕 Moonrise is happening now");
          eventFiredRef.current = true;
        }
        setRemaining(0);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));

      if (lastHourRef.current !== hours) {
        if (lastHourRef.current !== null) {
          toast(`⏳ Moonrise in ${hours} hour${hours === 1 ? "" : "s"}`);
        }
        lastHourRef.current = hours;
      }

      setRemaining(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [moonrise, timezone]);

  if (remaining == null) return null;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return (
    <div className="text-sky-200 text-sm">
      Moonrise in {hours}h {minutes}m {seconds}s
    </div>
  );
}

