// Types du domaine — miroir des fichiers content/*.json (édités via Pages CMS)

export type Settings = {
  name: string;
  city: string;
  shortName: string;
  tagline: string;
  description: string;
  url: string;
  contactEmail: string;
  phone: string;
  whatsapp: string;
  address: {
    venue: string;
    street: string;
    postalCode: string;
    city: string;
    mapUrl: string;
  };
  social: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  youtube: { handle: string; channelUrl: string; channelId: string };
  helloasso: { url: string; widgetUrl: string };
  hero: { videoUrl: string; posterImage: string };
};

export type PageHero = { kicker: string; title: string; subtitle: string };

export type TeamMember = {
  name: string;
  role: string;
  photo: string;
  bio: string;
};

export type Testimony = {
  name: string;
  age: string;
  title: string;
  text: string;
  photo: string;
  videoUrl: string;
};

export type Meeting = {
  title: string;
  day: string;
  time: string;
  duration: string;
  description: string;
  audience: string;
  highlight: boolean;
};

export type Video = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  duration?: string;
};
