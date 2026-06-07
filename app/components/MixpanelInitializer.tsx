"use client";

import { useEffect } from "react";
import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = "41d32bd906197532737d04d4167a0f53";

let isMixpanelInitialized = false;

export default function MixpanelInitializer() {
  useEffect(() => {
    if (isMixpanelInitialized) {
      return;
    }

    mixpanel.init(MIXPANEL_TOKEN, {
      autocapture: true,
      record_sessions_percent: 100,
    });

    isMixpanelInitialized = true;
  }, []);

  return null;
}
