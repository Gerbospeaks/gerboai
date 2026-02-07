// Map business types to their dashboard routes
export const dashboardRoutes = {
  towing: '/towing',
  security: '/security',
  electrical: '/electrical',
  restaurant: '/restaurant',
  construction: '/construction',
  cleaning: '/cleaning',
  education: '/education',
  hotel: '/hotel',
  legal: '/legal',
  plumbing: '/plumbing',
  retail: '/retail',
  landscaping: '/landscaping',
  logistics: '/logistics',
  photography: '/photography',
  realestate: '/realestate',
  flooring: '/flooring',
  hvac: '/hvac',
  accounting: '/accounting',
  painting: '/painting',
  'pest-control': '/pest-control',
  'pool-services': '/pool-services',
  'solar-installation': '/solar-installation',
  welding: '/welding',
  carpentry: '/carpentry',
  'window-repair': '/window-repair'
};

// Helper function to get dashboard route for a business type
export const getDashboardRoute = (dashboardId) => {
  return dashboardRoutes[dashboardId] || '/towing'; // fallback to towing
};