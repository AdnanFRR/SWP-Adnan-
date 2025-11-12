// deno run -A seed.ts
import { PrismaClient } from "npm:@prisma/client";
import { faker } from "npm:@faker-js/faker";

const prisma = new PrismaClient();

const ensureAirports = 100;
const ensureFlights = 2000;

// ensure airports
const currentAirportCount = await prisma.airport.count();
const airportsToCreate = ensureAirports - currentAirportCount;

for (let i = 0; i < airportsToCreate; i++) {
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
    console.error(`Error creating airport:`, (e as Error).message);
  }
}

// ensure flights (depends on airports + planes)
const airports = await prisma.airport.findMany({ select: { id: true } });
const airportIds = airports.map((a: { id: number }) => a.id);

const planes = await prisma.plane.findMany({ select: { id: true } });
const planeIds = planes.map((p: { id: number }) => p.id);

const existingFlights = await prisma.flight.count();
const flightsToCreate = ensureFlights - existingFlights;

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

for (let i = 0; i < flightsToCreate; i++) {
  const departureAirport = randomElement(airportIds);
  let arrivalAirport = randomElement(airportIds);

  // ensure start ≠ destination
  while (arrivalAirport === departureAirport) {
    arrivalAirport = randomElement(airportIds);
  }

  const planeId = randomElement(planeIds);
  const departureTime = faker.date.soon({ days: 60 });
  const arrivalTime = new Date(
    departureTime.getTime() + faker.number.int({ min: 1, max: 12 }) * 60 * 60 * 1000
  );

  try {
    await prisma.flight.create({
      data: {
        code: faker.string.alphanumeric({ length: 6 }).toUpperCase(),
        departureAirportId: departureAirport,
        arrivalAirportId: arrivalAirport,
        planeId,
        departureTime,
        arrivalTime,
        price: faker.number.float({
          min: 50,
          max: 2000,
          multipleOf: 0.01, // FIX: precision → multipleOf
        }),
      },
    });
  } catch (e) {
    console.error(`Error creating flight:`, (e as Error).message);
  }
}

console.log("✅ Seeding complete!");
await prisma.$disconnect();