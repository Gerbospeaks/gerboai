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
  pestcontrol:          "/pestcontrol",
  photography:          "/photography",
  plumbing:             "/plumbing",
  poolservice:          "/poolservices",
  realestate:           "/realestate",
  restaurant:          "/restaurant",
  retail:               "/retail",
  security:             "/security",
  solar:                "/solarinstallation",
  technology:           "/technology",
  towing:               "/towing",
  upholstery:           "/upholstery",
  virtualservice:   "/virtualservices",
  welding:              "/welding",
  windowrepair:         "/windowrepair",
};


export const getDashboardRoute = (dashboardId) => {
  if (!dashboardId) return "/dashboard";
  return dashboardRoutes[dashboardId] ?? "/dashboard";
};