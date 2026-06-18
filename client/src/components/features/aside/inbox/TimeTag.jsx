import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInMilliseconds,
} from "date-fns";
import { millisecondsInHour, millisecondsInMinute } from "date-fns/constants";
import { useEffect, useReducer } from "react";

export default function TimeTag({ className, date }) {
  const [tick, forceUpdate] = useReducer((x) => x + 1, 0);

  const [tag, refreshTime] = calculateTimeTag(date);

  useEffect(() => {
    if (refreshTime) {
      const timeoutRef = setTimeout(forceUpdate, refreshTime);
      return () => clearTimeout(timeoutRef);
    }
  }, [refreshTime, tick]);

  return <span className={className}>{tag}</span>;
}

function calculateTimeTag(sentAt) {
  const now = new Date();
  const diffInHours = differenceInHours(now, sentAt);

  if (diffInHours >= 24) {
    return [format(sentAt, "MMM d"), null];
  }

  const diffInMs = differenceInMilliseconds(now, sentAt);
  if (diffInHours >= 1) {
    return [
      `${diffInHours} hour${diffInHours === 1 ? "" : "s"}`,
      millisecondsInHour - (diffInMs % millisecondsInHour),
    ];
  }

  const diffInMins = differenceInMinutes(now, sentAt);
  return [
    diffInMins < 1
      ? "Now"
      : `${diffInMins} minute${diffInMins === 1 ? "" : "s"}`,
    millisecondsInMinute - (diffInMs % millisecondsInMinute),
  ];
}
