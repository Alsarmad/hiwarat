export default {
    getAllPosts: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    createPost: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getPostById: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    updatePost: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    deletePost: (req, res)  => {
        try {
            res.json({
                message: "إستجابة json"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
} 