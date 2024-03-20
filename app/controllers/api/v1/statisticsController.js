export default {
    getAllStatistics: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    createStatistic: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getStatisticById: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    updateStatistic: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    deleteStatistic: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
} 