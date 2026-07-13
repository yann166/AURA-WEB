async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function isStrongPassword(password) {
  const minLength = 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return password.length >= minLength && hasLetter && hasDigit && hasSymbol;
}

function getUsers() {
  return JSON.parse(localStorage.getItem('aura_users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('aura_users', JSON.stringify(users));
}

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
  const newUser = { username, password: hashedPassword, name: username };
  users.push(newUser);
  saveUsers(users);
  localStorage.setItem('aura_user', JSON.stringify(newUser));
  alert('Registration successful!');
  return true;
}

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

function showChangePasswordForm(username) {
  const newPassword = prompt('Enter new password:');
  if (newPassword) {
    changePassword(username, newPassword);
  }
}
