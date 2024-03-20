export default {
    getAllRelationships: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    createRelationship: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getRelationshipById: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    updateRelationship: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    deleteRelationship: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
} 