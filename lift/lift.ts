// Richtungs-Enum: zeigt an, ob der Aufzug hoch, runter oder still steht
enum Direction {
  UP = "Oben",
  DOWN = "Unten",
  IDLE = "Still",
}

// Hilfsfunktion für Zeitverzögerung (Async/Await)
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Lift {
  id: number; // eindeutige Lift-ID
  currentFloor = 0; // aktueller Standort
  direction = Direction.IDLE; // aktuelle Richtung
  doorsOpen = false; // Türstatus
  requests: number[] = []; // Liste der Zielstockwerke

  constructor(id: number) {
    this.id = id;
  }

  pressButton(floor: number) {
    if (!this.requests.includes(floor)) {
      this.requests.push(floor); // Ziel hinzufügen
      console.log(`Lift ${this.id}: Taste ${floor} gedrückt.`);
    }
  }

  async openDoors() {
    if (this.doorsOpen) {
      console.log(`Lift ${this.id}: Türen sind schon offen.`);
      return;
    }
    console.log(`Lift ${this.id}: Türen öffnen...`);
    await wait(1000); // 1 Sekunde warten
    this.doorsOpen = true; // Türen offen setzen
    console.log(`Lift ${this.id}: Türen geöffnet.`);
  }

  async closeDoors() {
    if (!this.doorsOpen) {
      console.log(`Lift ${this.id}: Türen sind schon geschlossen.`);
      return;
    }
    console.log(`Lift ${this.id}: Türen schließen...`);
    await wait(1000); // 1 Sekunde warten
    this.doorsOpen = false; // Türen geschlossen setzen
    console.log(`Lift ${this.id}: Türen geschlossen.`);
  }

  async move() {
    if (this.doorsOpen) {
      console.log(`Lift ${this.id}: Türen sind offen — kann nicht fahren!`);
      return;
    }
    if (this.requests.length === 0) {
      this.direction = Direction.IDLE; // keine Anfragen = Leerlauf
      console.log(
        `Lift ${this.id} steht still auf Etage ${this.currentFloor}.`
      );
      return;
    }

    const target = this.requests[0]; // erstes Ziel aus Liste
    this.direction =
      target > this.currentFloor ? Direction.UP : Direction.DOWN; // Richtung bestimmen

    console.log(
      `Lift ${this.id} startet Richtung ${this.direction}. Ziel: Etage ${target}.`
    );

    while (this.currentFloor !== target) {
      await wait(3000); // 3 Sekunden pro Etage
      this.currentFloor += this.direction === Direction.UP ? 1 : -1; // Etage ändern
      console.log(`Lift ${this.id} ist jetzt auf Etage ${this.currentFloor}.`);
    }

    console.log(`Lift ${this.id} hat Ziel Etage ${target} erreicht!`);
    await this.openDoors(); // Türen öffnen
    this.requests.shift(); // erledigtes Ziel entfernen
  }

  async run() {
    while (this.requests.length > 0) {
      await this.closeDoors(); // Türen schließen
      await this.move(); // Lift bewegen
      await wait(2000); // kurz warten bevor weiter
    }
    console.log(`Lift ${this.id}: alle Fahrten abgeschlossen.`);
    this.direction = Direction.IDLE; // wieder Leerlauf
  }
}
// Beispielnutzung
const lift = new Lift(1); // Lift mit ID 1
lift.pressButton(6); // Ziel: Etage 6
lift.run(); // Lift starten