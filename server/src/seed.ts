import { databasePath } from './infrastructure/config/config';
import { initializeSchema, openDatabase } from './infrastructure/database/sqlite';

const FIRST_NAMES = [
  'Aaliyah', 'Abigail', 'Adrian', 'Aisha', 'Akira', 'Amara', 'Anika', 'Arjun', 'Ava', 'Benjamin',
  'Bianca', 'Caleb', 'Camila', 'Chloe', 'Daniel', 'Diego', 'Elena', 'Elias', 'Emma', 'Fatima',
  'Felix', 'Gabriel', 'Grace', 'Hana', 'Hiro', 'Ibrahim', 'Isabella', 'Jamal', 'Jasper', 'Kai',
  'Keiko', 'Laila', 'Leo', 'Liam', 'Lucia', 'Maya', 'Mateo', 'Mia', 'Mila', 'Nadia',
  'Noah', 'Nora', 'Oliver', 'Olivia', 'Omar', 'Priya', 'Rafael', 'Rina', 'Samir', 'Sara',
  'Sofia', 'Theo', 'Valentina', 'Victor', 'Yara', 'Yuki', 'Zara', 'Zoe', 'Marek', 'Leila'
];

const LAST_NAMES = [
  'Ahmed', 'Andersen', 'Baker', 'Bianchi', 'Brown', 'Chen', 'Costa', 'Davis', 'Dubois', 'Fernandez',
  'Garcia', 'Gonzalez', 'Green', 'Haddad', 'Hansen', 'Ivanov', 'Johnson', 'Jones', 'Kaur', 'Kim',
  'Kowalski', 'Kumar', 'Lee', 'Lopez', 'Martinez', 'Miller', 'Mori', 'Muller', 'Nakamura', 'Nguyen',
  'Novak', 'Okafor', 'Patel', 'Petrov', 'Popescu', 'Rossi', 'Santos', 'Schmidt', 'Silva', 'Singh',
  'Smith', 'Taylor', 'Thomas', 'Thompson', 'Tremblay', 'Walker', 'Wang', 'Williams', 'Wilson', 'Yamamoto',
  'Young', 'Zhang', 'Khan', 'Ali', 'Nowak', 'Moreau', 'Sato', 'Murphy', 'Olsen', 'Pereira'
];

const NATIONALITIES = [
  'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Denmark', 'Egypt',
  'France', 'Germany', 'Ghana', 'India', 'Indonesia', 'Ireland', 'Italy', 'Japan', 'Kenya',
  'Mexico', 'Morocco', 'Netherlands', 'Nigeria', 'Norway', 'Philippines', 'Poland', 'Portugal',
  'Romania', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Turkey', 'United Kingdom',
  'United States', 'Vietnam'
];

const HOBBIES = [
  'Archery', 'Astronomy', 'Baking', 'Birdwatching', 'Board games', 'Bouldering', 'Calligraphy',
  'Camping', 'Chess', 'Coding', 'Collecting vinyl', 'Cooking', 'Cycling', 'Dancing', 'Digital art',
  'Drawing', 'Fishing', 'Gardening', 'Geocaching', 'Guitar', 'Hiking', 'Kayaking', 'Knitting',
  'Language learning', 'Meditation', 'Mountain biking', 'Origami', 'Painting', 'Photography',
  'Pilates', 'Podcasting', 'Pottery', 'Reading', 'Robotics', 'Rock climbing', 'Running', 'Sailing',
  'Scuba diving', 'Sewing', 'Skiing', 'Soccer', 'Surfing', 'Swimming', 'Table tennis', 'Tennis',
  'Theater', 'Travel', 'Trivia', 'Video games', 'Volunteering', 'Woodworking', 'Writing', 'Yoga',
  'Urban sketching', 'Film photography', 'Coffee tasting', 'Stand-up comedy', 'Trail running',
  'Home brewing', 'Flower arranging'
];

function createRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

function parseCount(): number {
  const raw = process.argv[2] ?? process.env.SEED_USER_COUNT ?? '3000';
  const count = Number.parseInt(raw, 10);
  if (!Number.isInteger(count) || count < 1000 || count > 5000) {
    throw new Error('Seed user count must be an integer between 1000 and 5000');
  }
  return count;
}

function makeAvatarSeed(firstName: string, lastName: string, id: number): string {
  return encodeURIComponent(`${firstName}-${lastName}-${id}`);
}

const count = parseCount();
const db = openDatabase();
initializeSchema(db);

const seed = db.transaction((userCount: number) => {
  db.exec('DELETE FROM user_hobbies; DELETE FROM hobbies; DELETE FROM users; DELETE FROM sqlite_sequence WHERE name IN (\'users\', \'hobbies\');');

  const insertHobby = db.prepare('INSERT INTO hobbies (name) VALUES (?)');
  for (const hobby of HOBBIES) {
    insertHobby.run(hobby);
  }

  const hobbyIds = db.prepare('SELECT id, name FROM hobbies').all() as Array<{ id: number; name: string }>;
  const insertUser = db.prepare(`
    INSERT INTO users (avatar, first_name, last_name, age, nationality)
    VALUES (@avatar, @first_name, @last_name, @age, @nationality)
  `);
  const insertUserHobby = db.prepare('INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)');
  const random = createRandom(20260707);

  for (let index = 0; index < userCount; index += 1) {
    const firstName = pick(FIRST_NAMES, random);
    const lastName = pick(LAST_NAMES, random);
    const age = 18 + Math.floor(random() * 68);
    const nationality = pick(NATIONALITIES, random);
    const avatarSeed = makeAvatarSeed(firstName, lastName, index + 1);

    const result = insertUser.run({
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${avatarSeed}`,
      first_name: firstName,
      last_name: lastName,
      age,
      nationality
    });

    const selectedHobbies = new Set<number>();
    const hobbyCount = Math.floor(random() * 11);
    while (selectedHobbies.size < hobbyCount) {
      selectedHobbies.add(pick(hobbyIds, random).id);
    }

    for (const hobbyId of selectedHobbies) {
      insertUserHobby.run(result.lastInsertRowid, hobbyId);
    }
  }
});

seed(count);
console.log(`Seeded ${count} users in ${databasePath}`);
