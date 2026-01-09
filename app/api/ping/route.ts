// app/api/ping/route.ts - SIMPLE TEST
import { logit } from "@/lib/log/client";
import { NextResponse } from "next/server";

console.log("PING route loaded");
//


 import { getIPGeoAstronomy } from "@/lib/lunar/ipgeo";
  async function fetchIPGeoAstronomy(lat: number, lon: number, date: Date) {
  const request = require('request');
  const options = {
    method: 'GET',
    url: 'https://api.ipgeolocation.io/v2/astronomy?apiKey=API_KEY&location=New%20York%2C%20US&elevation=10',
    headers: {

    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
 return response.body
})
  }

export function Log() {
  //fetch("/api/ping");
  const level = 1;
  logit({
    level: "info",
    message: "ping",
    page: "Ping API",
    file: "app/api/ping/route.ts",
    line: 16,
  });
  return level;
}
