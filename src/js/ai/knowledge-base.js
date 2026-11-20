export function createKnowledgeBase(config) {
  const services = config.services.filter(
    (s) => s.enabled && (config.demoMode || s.verified || s.educational),
  );
  return {
    name: config.name,
    demoMode: config.demoMode,
    services,
    allServices: config.services,
    phone: config.phone,
    address: config.address,
    mapsUrl: config.mapsUrl,
    email: config.email,
    whatsapp: config.whatsapp,
    openingHours: config.openingHours,
    bookingUrl: config.bookingUrl,
    accessibility: config.accessibility || [],
    onSiteServices: Boolean(config.onSiteServices),
    paymentMethods: config.paymentMethods || [],
    appointmentPolicy: config.appointmentPolicy || [],
  };
}
