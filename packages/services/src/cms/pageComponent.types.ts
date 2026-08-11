type RollingBanner = {
  type: "rollingBanner";
  message: string;
};

type Dummy = {
  type: "dummyComponent";
  text: string;
};

export type PageComponent = RollingBanner | Dummy;
