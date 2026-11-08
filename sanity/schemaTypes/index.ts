import { contentBlockType } from "./contentBlock";
import { articleType } from "./article";
import { videoType } from "./video";
import { juniorPlayerType } from "./juniorPlayer";
import { siteSettingsType } from "./siteSettings";
import { tournamentType } from "./tournament";
import { commentType } from "./comment";
import { pageType } from "./page";
import { playerType } from "./player";

export const schemaTypes = [
  articleType,
  commentType,
  tournamentType,
  playerType,
  videoType,
  pageType,
  siteSettingsType,
  juniorPlayerType,
  // legacy block type kept so older documents still open in Studio
  contentBlockType,
];
