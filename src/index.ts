import * as fs from "fs/promises";

type Data = {
  sections: {
    id: string;
    subjectId: string;
    course: string;
    meetings: {
      days: string;
      daysRaw: string;
      startTime: number;
      endTime: number;
      location: string;
    }[];
  }[];
  schedules: {
    id: string;
    combination: string[];
  }[];
};

type ClassSchedule = {
  course: string;
  days: string;
  daysRaw: string;
  startTime: number;
  endTime: number;
  location: string;
};

type DaySchedule = {
  day: "M" | "T" | "W" | "R" | "F";
  classes: ClassSchedule[];
};

type Schedule = {
  id: string;
  combination: string[];
  days: DaySchedule[];
};

// Only show one warning so we don't spam the console.
let warned = false;

const warn = (s: string) => {
  if (!warned) {
    console.log(s);
    warned = true;
  }
};

const analyzeSchedules = async () => {
  const data = (await fs
    .readFile("src/data.json")
    .then((it) => it.toString())
    .then((it) => JSON.parse(it))) as Data;

  const getSections = (sectionFullId: string): Data["sections"] | undefined => {
    const semicolonsIndex = sectionFullId.indexOf(";;");
    const atIndex = sectionFullId.indexOf("@");
    const subjectId = sectionFullId.slice(0, semicolonsIndex);
    const courseId = sectionFullId.slice(semicolonsIndex + 2, atIndex);
    const sectionIds = sectionFullId
      .slice(atIndex + 1, sectionFullId.length)
      .split("-");
    const sections = data.sections.filter(
      (s) =>
        sectionIds.includes(s.id) &&
        s.course === courseId &&
        subjectId == s.subjectId
    );
    return sections;
  };

  const fixedTime = (time: number): number => {
    return Math.floor(time / 100) * 60 + (time % 100);
  };

  const buildSchedule = (s: Data["schedules"][number], i: number): Schedule => {
    const monday: DaySchedule = {
      day: "M",
      classes: [],
    };
    const tuesday: DaySchedule = {
      day: "T",
      classes: [],
    };
    const wednesday: DaySchedule = {
      day: "W",
      classes: [],
    };
    const thursday: DaySchedule = {
      day: "R",
      classes: [],
    };
    const friday: DaySchedule = {
      day: "F",
      classes: [],
    };
    for (const sectionFullId of s.combination) {
      const sections = getSections(sectionFullId);
      if (sections === undefined) {
        warn("A section was not found.");
      } else
        for (const section of sections) {
          for (const meeting of section.meetings) {
            const modifiedMeeting = { ...meeting, course: section.course };
            for (const day of meeting.daysRaw.split("")) {
              ({
                M: monday,
                T: tuesday,
                W: wednesday,
                R: thursday,
                F: friday,
              }[day]!.classes.push(modifiedMeeting));
            }
          }
        }
    }
    let days = [monday, tuesday, wednesday, thursday, friday];
    days = days.map((d) => ({
      ...d,
      classes: d.classes.map((c) => ({
        ...c,
        startTime: fixedTime(c.startTime),
        endTime: fixedTime(c.endTime),
      })),
    }));
    days.forEach((d) => {
      d.classes.sort((c1, c2) => c1.startTime - c2.startTime);
    });
    return {
      id: i.toString(),
      combination: s.combination,
      days,
    };
  };

  const scheduleGaps = (s: Schedule): number[] => {
    const gaps: number[] = [];
    for (const d of s.days) {
      for (let i = 0; i < d.classes.length - 1; i++) {
        const gap = d.classes[i + 1].startTime - d.classes[i].endTime;
        gaps.push(gap);
      }
    }
    return gaps;
  };

  const scheduleGapTimeMax = (s: Schedule): number => {
    return scheduleGaps(s).reduce((p, x) => (x > p ? x : p));
  };

  const scheduleGapTimeTotal = (s: Schedule): number => {
    return scheduleGaps(s).reduce((p, x) => p + x);
  };

  const scheduleGapTimeAverage = (s: Schedule): number => {
    const gaps = scheduleGaps(s);
    return gaps.reduce((p, x) => p + x) / gaps.length;
  };

  const scheduleLastTimeAverage = (s: Schedule): number => {
    const lasts = s.days.map((day) =>
      Math.max(...day.classes.map((clas) => clas.endTime))
    );
    return lasts.reduce((p, x) => p + x) / lasts.length;
  };

  const scheduleLastTimeMax = (s: Schedule): number => {
    return s.days
      .map((day) => Math.max(...day.classes.map((clas) => clas.endTime)))
      .reduce((p, x) => (x > p ? x : p));
  };

  const schedules = data.schedules.map((s, i) => buildSchedule(s, i + 1));

  const uniqueSchedules = (schedules: Schedule[]) => {
    const newSchedules: Schedule[] = [];
    schedules.forEach((s) => {
      if (
        newSchedules.find((other) =>
          other.days.every((d, i) =>
            d.classes.every((c, j) => {
              const correspondingClass: ClassSchedule | undefined =
                s.days[i]?.classes[j];
              if (correspondingClass == undefined) return false;
              return (
                correspondingClass.startTime == c.startTime &&
                correspondingClass.endTime == c.endTime &&
                correspondingClass.daysRaw == c.daysRaw &&
                correspondingClass.course == c.course
              );
            })
          )
        ) === undefined
      )
        newSchedules.push(s);
    });
    return newSchedules;
  };

  const heuristics = {
    GapAverage: scheduleGapTimeAverage,
    GapMax: scheduleGapTimeMax,
    GapTotal: scheduleGapTimeTotal,
    LastTimeMax: scheduleLastTimeMax,
    LastTimeAverage: scheduleLastTimeAverage,
  };

  Object.entries(heuristics).forEach(([name, f]) => {
    schedules.sort((a, b) => f(a) - f(b));
    const candidates = uniqueSchedules(
      schedules.filter((s) => f(s) == f(schedules[0]))
    );
    console.log(`${name}: ${candidates.map((s) => s.id)}`);
  });

  const fitTo = (s: string, n: number) => {
    return " ".repeat(n - s.length) + s;
  };

  schedules.sort((a, b) => scheduleGapTimeMax(a) - scheduleGapTimeMax(b));
  schedules.sort((a, b) => scheduleGapTimeTotal(a) - scheduleGapTimeTotal(b));
  schedules.sort(
    (a, b) => scheduleLastTimeAverage(a) - scheduleLastTimeAverage(b)
  );

  console.log(
    `${fitTo("ID", 3)} ${fitTo("Gap Average", 12)} ${fitTo("Gap Max", 12)}`
  );
  uniqueSchedules(schedules).forEach((s) => {
    console.log(
      `${fitTo(s.id.toString(), 3)} ${fitTo(
        Math.round(scheduleGapTimeAverage(s)).toString(),
        12
      )} ${fitTo(Math.round(scheduleGapTimeMax(s)).toString(), 12)}`
    );
  });
};

analyzeSchedules();
