export type Contractor = {
  id: string;
  name: string;
  service: string;
  location: string;
  rating: number;
  image: string;
  description: string;
  customerType: "Hogares" | "Negocios" | "Hogares y negocios";
};


export const contractors: Contractor[] = [
  {
    id: "electricistas-monterrey",
    name: "Electricistas Monterrey",
    service: "Electricista",
    location: "Monterrey, Nuevo León",
    rating: 5,
    image: "/images/electrician.jpg",
    description:
      "Instalaciones y reparaciones eléctricas residenciales y comerciales.",
    customerType: "Hogares y negocios",
  },
  {
    id: "plomeria-san-nicolas",
    name: "Plomería San Nicolás",
    service: "Plomería",
    location: "San Nicolás de los Garza, Nuevo León",
    rating: 4,
    image: "/images/plomero.jpg",
    description:
      "Servicios de plomería para casas, oficinas y locales comerciales.",
    customerType: "Hogares y negocios",
  },
  {
    id: "climas-guadalupe",
    name: "Climas Guadalupe",
    service: "Aire acondicionado",
    location: "Guadalupe, Nuevo León",
    rating: 5,
    image: "/images/hvac.jpg",
    description:
      "Instalación y mantenimiento de minisplits y sistemas de climatización.",
    customerType: "Hogares y negocios",
  },
];