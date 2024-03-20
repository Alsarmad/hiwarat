export default {
    getAllCategories: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    createCategory: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getCategoryById: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    updateCategory: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    deleteCategory: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
} 