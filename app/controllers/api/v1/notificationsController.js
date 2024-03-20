export default {
    getAllNotifications: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    createNotification: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getNotificationById: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    updateNotification: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    deleteNotification: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
} 