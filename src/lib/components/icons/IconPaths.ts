/**
 * SVG path data for ceiling component icons
 * Extracted from Lucide icons - using actual path data (not base64)
 */

export const ICON_PATHS = {
  // Lightbulb icon
  // From: <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
  //       <path d="M9 18h6"/>
  //       <path d="M10 22h4"/>
  light: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5 M9 18h6 M10 22h4",

  // Wind icon (Air Supply)
  // From: <path d="M12.8 19.6A2 2 0 1 0 14 16H2"/>
  //       <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/>
  //       <path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>
  supply: "M12.8 19.6A2 2 0 1 0 14 16H2 M17.5 8a2.5 2.5 0 1 1 2 4H2 M9.8 4.4A2 2 0 1 1 11 8H2",

  // Fan icon (Air Return)
  // From: <path d="M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z"/>
  //       <path d="M12 12v.01"/>
  return: "M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z M12 12v.01",

  // AlarmSmoke icon (Smoke Detector)
  // From: <path d="M11 21c0-2.5 2-2.5 2-5"/>
  //       <path d="M16 21c0-2.5 2-2.5 2-5"/>
  //       <path d="m19 8-.8 3a1.25 1.25 0 0 1-1.2 1H7a1.25 1.25 0 0 1-1.2-1L5 8"/>
  //       <path d="M21 3a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1z"/>
  //       <path d="M6 21c0-2.5 2-2.5 2-5"/>
  smoke: "M11 21c0-2.5 2-2.5 2-5 M16 21c0-2.5 2-2.5 2-5 M19 8l-.8 3a1.25 1.25 0 0 1-1.2 1H7a1.25 1.25 0 0 1-1.2-1L5 8 M21 3a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1z M6 21c0-2.5 2-2.5 2-5",

  // CircleSlash2 icon (Invalid)
  // From: <path d="M22 2 2 22"/>
  //       <circle cx="12" cy="12" r="10"/>
  // Circle converted to path: M12,2 a10,10 0 1,0 0,20 a10,10 0 1,0 0,-20
  invalid: "M22 2 2 22 M12,2 a10,10 0 1,0 0,20 a10,10 0 1,0 0,-20",

  // X icon (Delete)
  // From: <path d="M18 6 6 18"/>
  //       <path d="m6 6 12 12"/>
  delete: "M18 6 6 18 M6 6 12 12",
} as const;

export type IconType = keyof typeof ICON_PATHS;
