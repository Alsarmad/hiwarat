

async function getAllusers(req, res) {
    try {
        res.json({
            message: "إستجابة getAllusers json"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function createUsers(req, res) {
    try {
        res.json({
            message: "إستجابة createUsers json"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getUsersById(req, res) {
    try {
        res.json({
            message: "إستجابة getUsersById json"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateUsers(req, res) {
    try {
        res.json({
            message: "إستجابة updateUsers json"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function deleteUsers(req, res) {
    try {
        res.json({
            message: "إستجابة deleteUsers json"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default {
    getAllusers,
    createUsers,
    getUsersById,
    updateUsers,
    deleteUsers,
}