import axios from "axios";
import { headers, schedulePlannerUrl } from "./secrets"; // you have to create this manually.
import * as fs from "fs/promises";

type Data = {
  registrationBlocks: {
    id: string;
    sectionIds: string[];
  }[];
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

type SectionMap = Record<string, Data["sections"]>;

const sections: SectionMap = {};

const grabSchedules = async () => {
  const classes = [
    "9083052",
    "9083053",
    "9082979",
    "9378697",
    "9082980",
    "9310700",
  ];

  // let prod = (
  //   await Promise.all(
  //     classes.map(async (c) => {
  for (const c of classes) {
    const data = (
      await axios.post(
        schedulePlannerUrl,
        {
          breaks: [],
          cartSections: [],
          courses: [c],
          currentSections: [],
          padding: 0,
        },
        {
          headers,
        }
      )
    ).data as Data;
    data.registrationBlocks.forEach((block) => {
      const subsections = block.sectionIds.map(
        (id) => data.sections.find((sec) => sec.id === id)!
      );
      const section: Data["sections"][number] = {
        id: "whatever",
        course: subsections[0].course,
        subjectId: subsections[0].subjectId,
        meetings: subsections.flatMap((subs) => subs.meetings),
      };
      const key = `${section.subjectId} ${section.course}`;
      if (sections[key] === undefined) sections[key] = [];
      sections[key].push(section);
    });
  }

  fs.writeFile("sectiosn.json", JSON.stringify(sections));
};

grabSchedules();
