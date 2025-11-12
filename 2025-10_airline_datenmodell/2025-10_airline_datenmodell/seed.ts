import { PrismaClient } from "prisma";
import { faker } from "@faker-js/faker";
const prisma = new PrismaClient();
// ensure airports
const airports_to_create = ensureAirports - (await prisma.airport.count());
for (let i = 0; i < airports_to_create; i++) {
  const fakeAirport = faker.airline.airport();
  try {
    await prisma.airport.create({
      data: {
        name: fakeAirport.name,
        iataCode: fakeAirport.iataCode,
        city: faker.location.city(),
      },
    });
  } catch (e) {
    console.error(`Error creating airport`, (e as Error).message);
  }
}

// ensure flights (depends on airport + plane)
const airportIds = (await prisma.airport.findMany({ select: { id: true } })).map(
  (a) => a.id
);
const planeIds = (await prisma.plane.findMany({ select: { id: true } })).map(
  (p) => p.id
);

// Anzahl gewünschter Flüge (z.B. 2000)
const ensureFlights = 2000;
const existingFlights = await prisma.flight.count();
const flightsToCreate = ensureFlights - existingFlights;

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

for (let i = 0; i < flightsToCreate; i++) {
  const departureAirport = randomElement(airportIds);
  let arrivalAirport = randomElement(airportIds);
  // sicherstellen, dass Start und Ziel unterschiedlich sind
  while (arrivalAirport === departureAirport) {
    arrivalAirport = randomElement(airportIds);
  }

  const planeId = randomElement(planeIds);

  const departureTime = faker.date.soon({ days: 60 });
  const arrivalTime = new Date(departureTime.getTime() + faker.number.int({ min: 1, max: 12 }) * 60 * 60 * 1000);

  try {
    await prisma.flight.create({
      data: {
        code: faker.string.alphanumeric({ length: 6 }).toUpperCase(),
        departureAirportId: departureAirport,
        arrivalAirportId: arrivalAirport,
        planeId,
        departureTime,
        arrivalTime,
        price: faker.number.float({ min: 50, max: 2000, precision: 0.01 }),
      },
    });
  } catch (e) {
    console.error(`Error creating flight`, (e as Error).message);
  }
}

console.log("✅ Seeding complete!");
await prisma.$disconnect();