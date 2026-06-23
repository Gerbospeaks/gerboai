export const dashboardRoutes = {

  accounting:           "/accounting",
  carpentry:            "/carpentry",
  cleaning:             "/cleaning",
  construction:         "/construction",
  education:            "/education",
  electrical:           "/electrical",
  flooring:             "/flooring",
  health:               "/healthcare",
  hotel:                "/hotel",
  hvac:                 "/hvac",
  landscaping:          "/landscaping",
  legal:                "/legal",
  logistics:            "/logistics",
  mechanics:            "/mechanics",
  painting:             "/painting",
  pestcontrol:          "/pest-control",
  photography:          "/photography",
  plumbing:             "/plumbing",
  poolservice:          "/pool-services",
  realestate:           "/realestate",
  restaurant:          "/restaurant",
  retail:               "/retail",
  security:             "/security",
  solar:                "/solar-installation",
  technology:           "/technology",
  towing:               "/towing",
  upholstery:           "/upholstery",
  "virtual-services":   "/virtual-services",
  virtualservices:      "/virtual-services",
  welding:              "/welding",
  windowrepair:         "/window-repair",


  "pest-control":       "/pest-control",
  "pool-services":      "/pool-services",
  "solar-installation": "/solar-installation",
  "window-repair":      "/window-repair",
  "real-estate":        "/realestate",
};


export const getDashboardRoute = (dashboardId) => {
  if (!dashboardId) return "/dashboard";
  return dashboardRoutes[dashboardId] ?? "/dashboard";
};