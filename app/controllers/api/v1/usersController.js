

async function getAllUsers(req, res) {
    try {
        res.json({
            message: "إستجابة getAllusers json"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function createUser(req, res) {
    try {
        res.json({
            message: "إستجابة createUsers json"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getUserById(req, res) {
    try {
        res.json({
            message: "إستجابة getUsersById json"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateUser(req, res) {
    try {
        res.json({
            message: "إستجابة updateUsers json"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function deleteUser(req, res) {
    try {
        res.json({
            message: "إستجابة deleteUsers json"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
}