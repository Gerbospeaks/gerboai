

export const dashboardRoutes = {

  accounting:          "/accounting",
  carpentry:           "/carpentry",
  cleaning:            "/cleaning",
  construction:        "/construction",
  education:           "/education",
  electrical:          "/electrical",
  flooring:            "/flooring",
  health:              "/healthcare",
  hotel:               "/hotel",
  hvac:                "/hvac",
  landscaping:         "/landscaping",
  legal:               "/legal",
  logistics:           "/logistics",
  mechanics:           "/mechanics",
  painting:            "/painting",
  pestcontrol:         "/pest-control",
  photography:         "/photography",
  plumbing:            "/plumbing",
  poolservice:         "/pool-services",
  realestate:          "/realestate",
  restaurants:         "/restaurant",
  retail:              "/retail",
  security:            "/security",
  solar:               "/solar-installation",
  towing:              "/towing",
  welding:             "/welding",
  windowrepair:        "/window-repair",

 
  "pest-control":      "/pest-control",
  "pool-services":     "/pool-services",
  "solar-installation":"/solar-installation",
  "window-repair":     "/window-repair",
  "real-estate":       "/realestate",
};


export const getDashboardRoute = (dashboardId) => {
  if (!dashboardId) return "/dashboard";
  return dashboardRoutes[dashboardId] ?? "/dashboard";
};