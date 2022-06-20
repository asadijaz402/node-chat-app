const users = [];
const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  if (!room || !username) {
    return {
      error: "username and room required!",
    };
  }
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );
  if (existingUser) {
    return {
      error: "username already exist!",
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.slice(index, index+1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getRoomUsers = (room) => {
  room = room.trim().toLowerCase();
  const user = users.filter((user) => user.room === room);
  return user;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getRoomUsers,
};
