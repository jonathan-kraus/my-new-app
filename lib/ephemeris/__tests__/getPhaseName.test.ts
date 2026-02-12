import { getPhaseName } from '../../astronomy/getPhaseName';
/*
 * @FilePath     : \my-new-app\lib\ephemeris\__tests__\getPhaseName.test.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-11 20:41:55
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-11 20:41:55
 */
describe("getPhaseName", () => {
  test("covers major moon phases", () => {
    expect(getPhaseName(0.0)).toBe("New Moon")
    expect(getPhaseName(0.1)).toBe("Waxing Crescent")
    expect(getPhaseName(0.25)).toBe("First Quarter")
    expect(getPhaseName(0.4)).toBe("Waxing Gibbous")
    expect(getPhaseName(0.5)).toBe("Full Moon")
    expect(getPhaseName(0.6)).toBe("Waning Gibbous")
    expect(getPhaseName(0.75)).toBe("Last Quarter")
    expect(getPhaseName(0.9)).toBe("Waning Crescent")
  })
})
