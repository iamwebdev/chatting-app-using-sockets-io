const users = []

// Add User
const addUser = ({id, username, room}) => {
    // Clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    // Validate data
    if (!username || !room) {
        return {
            error: 'Username and room is required'
        }
    }
    //Check existing user
    const isUserExists = users.find((user) => {
        return user.username === username && user.room === room
    })
    //Validate username
    if (isUserExists) {
        return {
            error: 'Username already in use'
        }
    }
    //Store user
    const user = {id, username, room}
    users.push(user)
    return user
}

// Remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if (index != -1) {
        return users.splice(index,1)[0]
    }
}

// Get user by id
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// Get users in room
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room = room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}