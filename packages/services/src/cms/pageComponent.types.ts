type RollingBanner = {
  type: "rollingBanner";
  message: string;
  color: "red" | "blue";
};

type Dummy = {
  type: "dummyComponent";
  text: string;
};

export type PageComponent = RollingBanner | Dummy;
