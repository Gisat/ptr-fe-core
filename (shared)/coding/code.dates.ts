import { DateTime } from "luxon"

/**
 * Return epoch timestamp
 * @param regime Set if you want milisecond format or second format
 * @returns 
 */
export const nowTimestamp = (regime: "milisecond" | "second" = "milisecond"): number => {
  const timestamp = DateTime.now().toMillis()
  return regime === "second" ? Math.round((timestamp / 1000)) : timestamp
}

/**
 * Convert epoch time value into ISO format
 * @param epochValue Epoch value of the timestamp
 * @returns ISO format of the date
 */
export const epochToIsoFormat = (epochValue: number) => DateTime.fromMillis(epochValue).toISO() as string

/**
 * Return epoch timestamp
 * @param regime Set if you want milisecond format or second format
 * @returns 
 */
export const nowTimestampIso = () => {
  const timestamp = DateTime.now().toISO()
  return timestamp as string
}

/**
 * Check if input date is valid for ISO format
 * @param dateToCheck 
 * @returns 
 */
 export const hasIsoFormat = (dateToCheck: string) => {
  try{
    const toDate = new Date(Date.parse(dateToCheck))
    return toDate.toISOString().includes(dateToCheck) 
  }
  catch{
    return false
  }
}

// /**
//  * Convert string of UTC time information into unix timestamp
//  * @param utcIso Time information in ISO 8601 (UTC time expected)
//  * @returns Unix timestamp value of the time
//  */
// const utcIsoToTimestamp = (utcIso: string): number => {
//   const { year, day, month, hour, minute, second } = DateTime.fromISO(utcIso)
//   const utc = DateTime.utc(year, month, day, hour, minute, second)
//   return utc.toUnixInteger() * 1000
// }

/**
 * Convert date in ISO formtat to milisecond timestamp
 * @param isoDate Date in ISO 8601 format
 * @returns Timestamp representing the date in miliseconds
 */
export const isoDateToTimestamp = (isoDate: string) => DateTime.fromISO(isoDate).toMillis()

/**
 * Format ISO 8601 interval to from-to values
 * @param interval Defined inteval in ISO format (from/to) of the UTC
 * @returns Tuple - from timestamp and to timestamp
 */
export const isoIntervalToTimestamps = (interval: string): [number, number] => {

  const intervals = interval.split("/")

  if (intervals.length < 2) {
    const newIso = `${interval}-01/${interval}-12`
    return isoIntervalToTimestamps(newIso)
  }

  else if (intervals.length > 2)
    throw new Error("Interval can have only two parameters")

  else {
    if (!intervals.every(interval => hasIsoFormat(interval)))
      throw new Error("Parameter utcIntervalIso is not ISO 8601 time interval or year");

    const [int1, int2] = intervals.map(intervalIso => {
      const cleared = intervalIso.replace(" ", "")
      return isoDateToTimestamp(cleared)
    })

    return [int1, int2]
  }
}
