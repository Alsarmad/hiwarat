# خريطة API

## الأساسيات

- **المسار الأساسي**: `http://localhost:3000/api/v1/`
- **تحديد اللغة**: يمكن تحديد اللغة باستخدام معامل `lang` في الاستعلام (مثل: `?lang=ar`).

## النقاط النهائية (Endpoints)

### 1. الحصول على جميع المستخدمين

**المسار**: `GET /users`

**وصف**: الحصول على قائمة بجميع المستخدمين مع إمكانية تحديد عدد المستخدمين في الصفحة ورقم الصفحة.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.
- `limit` (اختياري): عدد المستخدمين في كل صفحة (الحد الأقصى 20).
- `page` (اختياري): رقم الصفحة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/users?lang=ar&limit=10&page=1"
```

### 2. إنشاء مستخدم جديد

**المسار**: `POST /create-user`

**وصف**: إنشاء مستخدم جديد مع تحديد بعض الحقول الأساسية.

**المحددات**: يتم تحديد الحد الأقصى لعدد الطلبات إلى 5 طلبات لكل IP خلال 24 ساعة.

**الحقول في الجسم (Body Fields)**:
- `username` (إلزامي): اسم المستخدم.
- `full_name` (إلزامي): الاسم الكامل.
- `email` (إلزامي): البريد الإلكتروني.
- `password` (إلزامي): كلمة المرور.
- `birthdate` (اختياري): تاريخ الميلاد.
- `gender` (اختياري): الجنس.
- `location` (اختياري): الموقع.
- `bio` (اختياري): السيرة الذاتية.
- `phone` (اختياري): رقم الهاتف.
- `profile_picture` (اختياري): صورة الملف الشخصي.

**أمثلة باستخدام `curl`**:

```bash
curl -X POST "http://localhost:3000/api/v1/create-user?lang=ar" -H "Content-Type: application/json" -d '{
  "username": "newuser",
  "full_name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "birthdate": "1990-01-01",
  "gender": "male",
  "location": "Riyadh",
  "bio": "This is my bio",
  "phone": "1234567890",
  "profile_picture": "http://example.com/profile.jpg"
}'
```

### 3. الحصول على مستخدم بواسطة اسم المستخدم

**المسار**: `GET /users/:username`

**وصف**: الحصول على معلومات مستخدم باستخدام اسم المستخدم أو المعرف.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/users/newuser?lang=ar"
```

### 4. تحديث مستخدم بواسطة اسم المستخدم

**المسار**: `PUT /users/:username`

**وصف**: تحديث معلومات مستخدم موجود باستخدام اسم المستخدم.

**الحقول في الجسم (Body Fields)**:
- `username` (اختياري): اسم المستخدم الجديد.
- `full_name` (اختياري): الاسم الكامل.
- `email` (اختياري): البريد الإلكتروني.
- `password` (اختياري): كلمة المرور.
- `birthdate` (اختياري): تاريخ الميلاد.
- `gender` (اختياري): الجنس.
- `location` (اختياري): الموقع.
- `bio` (اختياري): السيرة الذاتية.
- `phone` (اختياري): رقم الهاتف.
- `profile_picture` (اختياري): صورة الملف الشخصي.
- `active` (اختياري): تفعيل المستخدم (مسؤول فقط).
- `is_banned` (اختياري): حظر المستخدم (مسؤول فقط).
- `role` (اختياري): دور المستخدم (مسؤول فقط).

**أمثلة باستخدام `curl`**:

```bash
curl -X PUT "http://localhost:3000/api/v1/users/newuser?lang=ar" -H "Content-Type: application/json" -H "username: admin" -H "password: adminpass" -d '{
  "full_name": "Updated User",
  "email": "updateduser@example.com",
  "bio": "Updated bio"
}'
```

### 5. حذف مستخدم بواسطة اسم المستخدم

**المسار**: `DELETE /users/:username`

**وصف**: حذف مستخدم موجود باستخدام اسم المستخدم.

**أمثلة باستخدام `curl`**:

```bash
curl -X DELETE "http://localhost:3000/api/v1/users/newuser?lang=ar" -H "username: admin" -H "password: adminpass"
```

### 6. الحصول على جميع المنشورات

**المسار**: `GET /posts`

**وصف**: جلب المنشورات مع دعم تقسيم الصفحات وعرض المنشورات المثبتة في جميع الصفحات.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.
- `limit` (اختياري): عدد المنشورات في كل صفحة (الحد الأقصى 20).
- `page` (اختياري): رقم الصفحة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/posts?lang=ar&limit=10&page=1"
```

### 7. إنشاء منشور جديد

**المسار**: `POST /create-posts`

**وصف**: إنشاء منشور جديد.

**المحددات**: يتم تحديد الحد الأقصى لعدد الطلبات إلى 20 طلب لكل IP خلال 24 ساعة.

**الحقول في الجسم (Body Fields)**:
- `post_title` (إلزامي): عنوان المنشور.
- `post_content` (إلزامي): محتوى المنشور.
- `hashtags` (إلزامي): قائمة بالهاشتاجات.
- `is_pinned` (اختياري): تثبيت المنشور.

**أمثلة باستخدام `curl`**:

```bash
curl -X POST "http://localhost:3000/api/v1/create-posts?lang=ar" -H "Content-Type: application/json" -H "username: user" -H "password: userpass" -d '{
  "post_title": "My New Post",
  "post_content": "This is the content of my new post",
  "hashtags": ["new", "post"],
  "is_pinned": true
}'
```

### 8. الحصول على منشور بواسطة المعرف

**المسار**: `GET /posts/:post_id`

**وصف**: الحصول على منشور باستخدام معرف المنشور.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/posts/12345?lang=ar"
```

### 9. الحصول على التعليقات الخاصة بالمنشور بواسطة معرف المنشور

**المسار**: `GET /posts/:post_id/comments`

**وصف**: الحصول على التعليقات الخاصة بمنشور باستخدام معرف المنشور.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/posts/12345/comments?lang=ar"
```

### 10. تحديث منشور بواسطة المعرف

**المسار**: `PUT /posts/:post_id`

**وصف**: تحديث منشور موجود باستخدام معرف المنشور.

**الحقول في الجسم (Body Fields)**:
- `post_title` (اختياري): عنوان المنشور.
- `post_content` (اختياري): محتوى المنشور.
- `hashtags` (اختياري): قائمة بالهاشتاجات.
- `is_pinned` (اختياري): تثبيت المنشور.

**أمثلة باستخدام `curl`**:

```bash
curl -X PUT "http://localhost:3000/api/v1/posts/12345?lang=ar" -H "Content-Type: application/json" -H "username: user" -H "password: userpass" -d '{
  "post_title": "Updated Post Title",
  "post_content": "Updated content of the post",
  "hashtags": ["updated", "post"],
  "is_pinned": false
}'
```

### 11. حذف منشور بواسطة المعرف

**المسار**: `DELETE /posts/:post_id`

**وصف**: حذف منشور موجود باستخدام معرف المنشور.

**أمثلة باستخدام `curl`**:

```bash
curl -X DELETE "http://localhost:3000/api/v1/posts/12345?lang=ar" -H "username: user" -H "password: userpass"
```

## شرح النقاط النهائية

- **GET /users**: هذه النقطة النهائية تستخدم للحصول على قائمة من المستخدمين مع تحديد عدد المستخدمين في كل صفحة ورقم الصفحة المطلوبة. يمكن استخدام المعامل `lang` لتحديد اللغة.
- **POST /create-user**: تستخدم لإنشاء مستخدم جديد مع التحقق من الحقول الأساسية المطلوبة. يتم تطبيق محدد للطلبات لتجنب الإسراف في إنشاء الحسابات.
- **GET /users/:username**: تستخدم للحصول على معلومات مستخدم بواسطة اسم المستخدم أو المعرف. يمكن استخدام المعامل `lang` لتحديد اللغة.
- **PUT

 /users/:username**: تستخدم لتحديث معلومات مستخدم موجود. يتطلب التحقق من صلاحيات المستخدم قبل السماح بالتحديث.
- **DELETE /users/:username**: تستخدم لحذف مستخدم موجود. يتطلب التحقق من صلاحيات المستخدم قبل السماح بالحذف.
- **GET /posts**: تستخدم لجلب قائمة بالمنشورات مع دعم تقسيم الصفحات وعرض المنشورات المثبتة في جميع الصفحات. يمكن استخدام المعامل `lang` لتحديد اللغة.
- **POST /create-posts**: تستخدم لإنشاء منشور جديد مع التحقق من الحقول الأساسية المطلوبة. يتم تطبيق محدد للطلبات لتجنب الإسراف في إنشاء المنشورات.
- **GET /posts/:post_id**: تستخدم للحصول على تفاصيل منشور بواسطة معرف المنشور. يمكن استخدام المعامل `lang` لتحديد اللغة.
- **GET /posts/:post_id/comments**: تستخدم للحصول على قائمة بالتعليقات الخاصة بمنشور معين بواسطة معرف المنشور. يمكن استخدام المعامل `lang` لتحديد اللغة.
- **PUT /posts/:post_id**: تستخدم لتحديث تفاصيل منشور موجود. يتطلب التحقق من صلاحيات المستخدم قبل السماح بالتحديث.
- **DELETE /posts/:post_id**: تستخدم لحذف منشور موجود. يتطلب التحقق من صلاحيات المستخدم قبل السماح بالحذف.

## إدارة التعليقات

فيما يلي تفاصيل نقاط النهاية الخاصة بإدارة التعليقات في الـ API:

### 1. الحصول على كل التعليقات

**المسار**: `GET /comments`

**وصف**: جلب قائمة بالتعليقات مع دعم تقسيم الصفحات.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.
- `limit` (اختياري): عدد التعليقات في كل صفحة (الحد الأقصى 20).
- `page` (اختياري): رقم الصفحة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/comments?lang=ar&limit=10&page=1"
```

### 2. إنشاء تعليق جديد

**المسار**: `POST /create-comments`

**وصف**: إنشاء تعليق جديد على منشور محدد.

**المحددات**: يتم تحديد الحد الأقصى لعدد الطلبات إلى 300 طلب لكل IP خلال 24 ساعة.

**الحقول في الجسم (Body Fields)**:
- `post_id` (إلزامي): معرف المنشور.
- `comment_content` (إلزامي): محتوى التعليق.

**أمثلة باستخدام `curl`**:

```bash
curl -X POST "http://localhost:3000/api/v1/create-comments?lang=ar" -H "Content-Type: application/json" -H "username: user" -H "password: userpass" -d '{
  "post_id": "12345",
  "comment_content": "This is a comment."
}'
```

### 3. الحصول على تعليق بواسطة المعرف

**المسار**: `GET /comments/:comment_id`

**وصف**: الحصول على تفاصيل تعليق باستخدام معرف التعليق.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/comments/67890?lang=ar"
```

### 4. تحديث تعليق بواسطة المعرف

**المسار**: `PUT /comments/:comment_id`

**وصف**: تحديث تفاصيل تعليق موجود باستخدام معرف التعليق.

**الحقول في الجسم (Body Fields)**:
- `comment_content` (اختياري): محتوى التعليق.

**أمثلة باستخدام `curl`**:

```bash
curl -X PUT "http://localhost:3000/api/v1/comments/67890?lang=ar" -H "Content-Type: application/json" -H "username: user" -H "password: userpass" -d '{
  "comment_content": "Updated comment content."
}'
```

### 5. حذف تعليق بواسطة المعرف

**المسار**: `DELETE /comments/:comment_id`

**وصف**: حذف تعليق موجود باستخدام معرف التعليق.

**أمثلة باستخدام `curl`**:

```bash
curl -X DELETE "http://localhost:3000/api/v1/comments/67890?lang=ar" -H "username: user" -H "password: userpass"
```

## شرح النقاط النهائية لإدارة التعليقات

- **GET /comments**: تستخدم لجلب قائمة بالتعليقات مع دعم تقسيم الصفحات. يمكن استخدام المعامل `lang` لتحديد اللغة، والمعامل `limit` لتحديد عدد التعليقات في كل صفحة، والمعامل `page` لتحديد رقم الصفحة المطلوبة.
- **POST /create-comments**: تستخدم لإنشاء تعليق جديد على منشور محدد. يتطلب تحديد معرف المنشور (`post_id`) ومحتوى التعليق (`comment_content`). يتم تطبيق محدد للطلبات لتجنب الإسراف في إنشاء التعليقات.
- **GET /comments/:comment_id**: تستخدم للحصول على تفاصيل تعليق باستخدام معرف التعليق. يمكن استخدام المعامل `lang` لتحديد اللغة.
- **PUT /comments/:comment_id**: تستخدم لتحديث تفاصيل تعليق موجود باستخدام معرف التعليق. يتطلب التحقق من صلاحيات المستخدم قبل السماح بالتحديث.
- **DELETE /comments/:comment_id**: تستخدم لحذف تعليق موجود باستخدام معرف التعليق. يتطلب التحقق من صلاحيات المستخدم قبل السماح بالحذف.


## إدارة الهاشتاجات

فيما يلي تفاصيل نقاط النهاية الخاصة بإدارة الهاشتاجات في الـ API:

### 1. الحصول على كل الهاشتاجات بدون تكرارات

**المسار**: `GET /hashtags`

**وصف**: جلب قائمة بالهاشتاجات مع دعم تقسيم الصفحات بدون تكرار.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.
- `limit` (اختياري): عدد الهاشتاجات في كل صفحة (الحد الأقصى 20).
- `page` (اختياري): رقم الصفحة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/hashtags?lang=ar&limit=10&page=1"
```

### 2. الحصول على هاشتاج بواسطة نص الهاشتاج مع دعم الفلترة والترتيب

**المسار**: `GET /hashtags/:hashtag_text`

**وصف**: الحصول على تفاصيل هاشتاج ومنشوراته المرتبطة باستخدام نص الهاشتاج مع دعم الفلترة والترتيب.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.
- `limit` (اختياري): عدد النتائج في كل صفحة (الحد الأقصى 20).
- `page` (اختياري): رقم الصفحة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/hashtags/example?lang=ar&limit=10&page=1"
```

### 3. حذف هاشتاج بواسطة نص الهاشتاج

**المسار**: `DELETE /hashtags/:hashtag_text`

**وصف**: حذف هاشتاج معين وجميع المنشورات والتعليقات المرتبطة به باستخدام نص الهاشتاج.

**أمثلة باستخدام `curl`**:

```bash
curl -X DELETE "http://localhost:3000/api/v1/hashtags/example?lang=ar" -H "username: admin" -H "password: adminpass"
```

## شرح النقاط النهائية لإدارة الهاشتاجات

- **GET /hashtags**: تستخدم لجلب قائمة بالهاشتاجات مع دعم تقسيم الصفحات بدون تكرار. يمكن استخدام المعامل `lang` لتحديد اللغة، والمعامل `limit` لتحديد عدد الهاشتاجات في كل صفحة، والمعامل `page` لتحديد رقم الصفحة المطلوبة.
- **GET /hashtags/:hashtag_text**: تستخدم للحصول على تفاصيل هاشتاج ومنشوراته المرتبطة باستخدام نص الهاشتاج مع دعم الفلترة والترتيب. يمكن استخدام المعامل `lang` لتحديد اللغة، والمعامل `limit` لتحديد عدد النتائج في كل صفحة، والمعامل `page` لتحديد رقم الصفحة المطلوبة.
- **DELETE /hashtags/:hashtag_text**: تستخدم لحذف هاشتاج معين وجميع المنشورات والتعليقات المرتبطة به باستخدام نص الهاشتاج. يتطلب التحقق من صلاحيات المستخدم قبل السماح بالحذف.


### 4. إنشاء إعجاب جديد

**المسار**: `POST /create-likes`

**وصف**: إنشاء إعجاب جديد لمنشور معين.

**معاملات الجسم (Request Body)**:
- `post_id`: معرف المنشور الذي يتم إعجابه.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X POST "http://localhost:3000/api/v1/create-likes?lang=ar" -H "Content-Type: application/json" -H "username: user" -H "password: userpass" -d '{"post_id": "1234567890"}'
```

### 5. الحصول على إعجاب بواسطة المعرف

**المسار**: `GET /likes/:like_id`

**وصف**: الحصول على تفاصيل إعجاب معين باستخدام معرف الإعجاب.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/likes/1234567890?lang=ar"
```

### 6. الحصول على إعجاب بواسطة معرف المنشور

**المسار**: `GET /likes/by-post/:post_id`

**وصف**: الحصول على قائمة بجميع الإعجابات المرتبطة بمنشور معين.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/likes/by-post/1234567890?lang=ar"
```

### 7. حذف إعجاب بواسطة المعرف

**المسار**: `DELETE /likes/:like_id`

**وصف**: حذف إعجاب معين باستخدام معرف الإعجاب.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X DELETE "http://localhost:3000/api/v1/likes/1234567890?lang=ar" -H "username: user" -H "password: userpass"
```

هذه هي النقاط النهائية لإدارة الإعجابات في الـ API.



### 8. تحديث بلاغ معين

**المسار**: `PUT /reports/:report_id`

**وصف**: تحديث بيانات بلاغ معين باستخدام معرف البلاغ.

**معاملات الجسم (Request Body)**:
- `report_type` (اختياري): نوع البلاغ (مثل "abuse", "spam", إلخ).
- `report_description`: وصف مفصل للبلاغ.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X PUT "http://localhost:3000/api/v1/reports/1234567890?lang=ar" -H "Content-Type: application/json" -H "username: user" -H "password: userpass" -d '{"report_type": "abuse", "report_description": "This content is abusive and violates community guidelines."}'
```

### 9. إعادة تقديم بلاغ معين

**المسار**: `PATCH /reports/:report_id/resubmit`

**وصف**: إعادة تقديم بلاغ معين بعد معالجته.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X PATCH "http://localhost:3000/api/v1/reports/1234567890/resubmit?lang=ar" -H "Content-Type: application/json" -H "username: user" -H "password: userpass"
```

### 10. رفض بلاغ معين

**المسار**: `PATCH /reports/:report_id/reject`

**وصف**: رفض بلاغ معين بعد مراجعته.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X PATCH "http://localhost:3000/api/v1/reports/1234567890/reject?lang=ar" -H "Content-Type: application/json" -H "username: user" -H "password: userpass"
```

### 11. قبول بلاغ معين

**المسار**: `PATCH /reports/:report_id/accept`

**وصف**: قبول بلاغ معين بعد مراجعته واتخاذ الإجراء المناسب.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X PATCH "http://localhost:3000/api/v1/reports/1234567890/accept?lang=ar" -H "Content-Type: application/json" -H "username: user" -H "password: userpass"
```

### 12. الحصول على البلاغات المقدمة من قبل مستخدم معين

**المسار**: `GET /reports/by-user/:user_id`

**وصف**: الحصول على قائمة بالبلاغات التي قدمها مستخدم معين باستخدام معرف المستخدم.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/reports/by-user/1234567890?lang=ar"
```

هذه الدوال تكمل مجموعة الوظائف لإدارة البلاغات في API الخاص بك. يمكنك استخدام هذه الأمثلة مع `curl` أو أي أداة لاختبار API لاختبار وظائ


### 13. الحصول على إحصائيات مستخدم معين

**المسار**: `GET /statistics/user/:user_id`

**وصف**: الحصول على إحصائيات محددة لمستخدم باستخدام معرف المستخدم.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/statistics/user/1234567890?lang=ar"
```

### 14. الحصول على إحصائيات بلاغ معين

**المسار**: `GET /statistics/report/:report_id`

**وصف**: الحصول على إحصائيات محددة لبلاغ باستخدام معرف البلاغ.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/statistics/report/1234567890?lang=ar"
```

### 15. الحصول على إحصائيات تعليق معين

**المسار**: `GET /statistics/comment/:comment_id`

**وصف**: الحصول على إحصائيات محددة لتعليق باستخدام معرف التعليق.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/statistics/comment/1234567890?lang=ar"
```

### 16. الحصول على إحصائيات بلاغ معين

**المسار**: `GET /statistics/report/:report_id`

**وصف**: الحصول على إحصائيات محددة لبلاغ باستخدام معرف البلاغ.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/statistics/report/1234567890?lang=ar"
```

### 17. الحصول على إحصائيات هاشتاج معين

**المسار**: `GET /statistics/hashtag/:hashtag_id`

**وصف**: الحصول على إحصائيات محددة لهاشتاج باستخدام معرف الهاشتاج.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/statistics/hashtag/1234567890?lang=ar"
```

### 18. الحصول على إحصائيات إعجاب معين

**المسار**: `GET /statistics/like/:like_id`

**وصف**: الحصول على إحصائيات محددة لإعجاب باستخدام معرف الإعجاب.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/statistics/like/1234567890?lang=ar"
```

### 19. الحصول على إحصائيات عرض معين

**المسار**: `GET /statistics/view/:view_id`

**وصف**: الحصول على إحصائيات محددة لعرض باستخدام معرف العرض.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/statistics/view/1234567890?lang=ar"
```

### 20. الحصول على إحصائيات مستخدم بالبريد الإلكتروني

**المسار**: `GET /statistics/user-by-email/:email`

**وصف**: الحصول على إحصائيات لمستخدم باستخدام عنوان بريد إلكتروني.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/statistics/user-by-email/example@example.com?lang=ar"
```

### 21. الحصول على إحصائيات مستخدم بالاسم المستخدم

**المسار**: `GET /statistics/user-by-username/:username`

**وصف**: الحصول على إحصائيات لمستخدم باستخدام اسم المستخدم.

**معاملات الاستعلام (Query Parameters)**:
- `lang` (اختياري): اللغة.

**أمثلة باستخدام `curl`**:

```bash
curl -X GET "http://localhost:3000/api/v1/statistics/user-by-username/exampleuser?lang=ar"
```

هذه الدوال تكمل مجموعة الوظائف لإحصائيات متنوعة يمكن استخدامها لمراقبة وتحليل أداء مختلف العناصر في نظامك. يمكنك استخدام هذه الأمثلة مع `curl` أو أي أداة لاختبار API لاختبار وظائف الإحصائيات المختلفة.