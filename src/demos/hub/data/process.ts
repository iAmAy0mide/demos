export type ProcessStep = {
  number: string;
  title: string;
  whatWeDo: string;
  whatWeNeed: string;
  whatYouGet: string;
};

export const processSteps: readonly ProcessStep[] = [
  {
    number: "01",
    title: "Discover",
    whatWeDo: "We map the offer, the audience and the decision the page or tool has to support.",
    whatWeNeed: "Straight answers about the business, the people using it and what must change.",
    whatYouGet: "A clear problem frame and a route through the work before design starts.",
  },
  {
    number: "02",
    title: "Design",
    whatWeDo:
      "We turn the strategy into hierarchy, interaction and a visual system with a point of view.",
    whatWeNeed: "Useful feedback on the decisions, not a committee around every pixel.",
    whatYouGet: "A page or product direction that explains itself through the way it works.",
  },
  {
    number: "03",
    title: "Build",
    whatWeDo:
      "We build the real interface, connect the journeys and test the moments people rely on.",
    whatWeNeed: "The source material, access and decisions that let the build keep moving.",
    whatYouGet: "A responsive, accessible product that is ready to use rather than merely present.",
  },
  {
    number: "04",
    title: "Launch",
    whatWeDo:
      "We check the important paths, prepare handover and make the live version feel intentional.",
    whatWeNeed: "A final owner for content, approvals and the people who will carry it forward.",
    whatYouGet: "A confident release and a clear foundation for the next useful improvement.",
  },
];
