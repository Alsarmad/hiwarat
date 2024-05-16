export default async (router, config, logger) => {
    const { logError } = logger;
    try {
        // الحصول على كل الفئات
        router.get('/categories', CategoriesController.getAllCategories);

        // إنشاء فئة جديدة
        router.post('/categories', CategoriesController.createCategory);

        // الحصول على فئة بواسطة المعرف
        router.get('/categories/:id', CategoriesController.getCategoryById);

        // تحديث فئة بواسطة المعرف
        router.put('/categories/:id', CategoriesController.updateCategory);

        // حذف فئة بواسطة المعرف
        router.delete('/categories/:id', CategoriesController.deleteCategory);
    } catch (error) {
        logError(error);
    }
}
