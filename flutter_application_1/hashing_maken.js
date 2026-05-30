const argon2 = require('argon2');

async function run() {
    const password = process.argv[2];
    if (!password) {
        console.log("Please enter a password: node test_hash.js [password]");
        return;
    }
    const hash = await argon2.hash(password);
    console.log("The generated hash is:");
    console.log(hash);
}

run();