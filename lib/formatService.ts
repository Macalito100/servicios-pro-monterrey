export function formatService(service: string) {
  const services: Record<string, string> = {
    carpinteria: "Carpintería",
    plomeria: "Plomería",
    electricidad: "Electricidad",
    pintura: "Pintura",
    jardineria: "Jardinería",
    herreria: "Herrería",
    albanileria: "Albañilería",
    tablaroca: "Tablaroca",
    pisos: "Pisos",
    azulejo: "Azulejo",
    impermeabilizacion: "Impermeabilización",
    techos: "Techos",
    limpieza: "Limpieza",
    mudanzas: "Mudanzas",
    aire_acondicionado: "Aire acondicionado",
    canceleria: "Cancelería",
    vidrieria: "Vidriería",
  };

  const normalizedService = service.trim().toLowerCase();

  return (
    services[normalizedService] ??
    normalizedService.charAt(0).toUpperCase() +
      normalizedService.slice(1)
  );
}