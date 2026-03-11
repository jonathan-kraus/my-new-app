import { getPhaseName } from "../../astronomy/getPhaseName";
/*
 * @FilePath     : \my-new-app\lib\ephemeris\__tests__\getPhaseName.test.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-11 20:41:55
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-11 20:46:12
 */
describe("getPhaseName", () => {
  test("covers all illumination ranges", () => {
    expect(getPhaseName(0)).toBe("New Moon");
    expect(getPhaseName(1)).toBe("New Moon");

    expect(getPhaseName(10)).toBe("Waxing Crescent");
    expect(getPhaseName(24)).toBe("Waxing Crescent");

    expect(getPhaseName(25)).toBe("First Quarter");
    expect(getPhaseName(26)).toBe("First Quarter");

    expect(getPhaseName(30)).toBe("Waxing Gibbous");
    expect(getPhaseName(49)).toBe("Waxing Gibbous");

    expect(getPhaseName(50)).toBe("Full Moon");
    expect(getPhaseName(51)).toBe("Full Moon");

    expect(getPhaseName(60)).toBe("Waning Gibbous");
    expect(getPhaseName(74)).toBe("Waning Gibbous");

    expect(getPhaseName(75)).toBe("Last Quarter");
    expect(getPhaseName(76)).toBe("Last Quarter");

    expect(getPhaseName(90)).toBe("Waning Crescent");
  });
});
