const Message = require('./models/Message');
const User = require('./models/User');

async function seed() {
    try {
        await Message.deleteMany({});
        await User.deleteMany({});

        await User.insertMany([
            { username: 'Alice' },
            { username: 'Bob' },
            { username: 'Charlie' },
        ]);

        await Message.insertMany([
            { username: 'Alice', content: 'Hello everyone!', room: 'general' },
            { username: 'Bob', content: 'Hi Alice!', room: 'general' },
        ]);
    } catch (err) {
        console.error('Seeding error:', err);
    }
}

seed().then(() => console.log('Seed completed.')).catch((err) => console.error('Seed failed:', err));