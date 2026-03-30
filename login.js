// Hash password using Web Crypto API SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validate password strength (min 8 chars, letters, digits, symbols)
function isStrongPassword(password) {
  const minLength = 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return password.length >= minLength && hasLetter && hasDigit && hasSymbol;
}

// Get users from localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem('aura_users')) || [];
}

// Save users to localStorage
function saveUsers(users) {
  localStorage.setItem('aura_users', JSON.stringify(users));
}

// Register a new user
async function register(username, password) {
  if (!isStrongPassword(password)) {
    alert('Mot de passe invalide. Minimum 8 caractères avec lettres, chiffres et symboles.');
    return false;
  }

  const users = getUsers();
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    alert('This account already exists.');
    return false;
  }
  const hashedPassword = await hashPassword(password);
  const newUser = { username, password: hashedPassword, name: username }; // Added name for main.js compatibility
  users.push(newUser);
  saveUsers(users);
  localStorage.setItem('aura_user', JSON.stringify(newUser)); // Log in immediately
  alert('Registration successful!');
  return true;
}

// Login a user
async function login(username, password) {
  const users = getUsers();
  const hashedPassword = await hashPassword(password);
  const user = users.find(user => user.username === username && user.password === hashedPassword);
  if (user) {
    localStorage.setItem('aura_user', JSON.stringify(user));
    alert('Login successful!');
    return true;
  } else {
    alert('Invalid username or password.');
    return false;
  }
}

// Change password for a user
async function changePassword(username, newPassword) {
  if (!isStrongPassword(newPassword)) {
    alert('Mot de passe invalide. Minimum 8 caractères avec lettres, chiffres et symboles.');
    return false;
  }

  const users = getUsers();
  const userIndex = users.findIndex(user => user.username === username);
  if (userIndex === -1) {
    alert('User not found.');
    return false;
  }
  const hashedPassword = await hashPassword(newPassword);
  users[userIndex].password = hashedPassword;
  saveUsers(users);
  alert('Password changed successfully!');
  return true;
}

// Show change password form (simple implementation)
function showChangePasswordForm(username) {
  const newPassword = prompt('Enter new password:');
  if (newPassword) {
    changePassword(username, newPassword);
  }
}