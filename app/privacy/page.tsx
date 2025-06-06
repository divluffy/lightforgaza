// app/privacy/page.tsx
import React from "react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="card bg-base-100 shadow-lg max-w-3xl mx-auto">
        <div className="card-body space-y-6">
          <h1 className="text-3xl font-bold mb-4">سياسة الخصوصية</h1>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. جمع المعلومات</h2>
            <p className="text-gray-700 leading-relaxed">
              نقوم بجمع المعلومات الشخصيّة التي تقدّمها طواعيةً عند التسجيل أو
              التواصل، مثل الاسم والبريد الإلكتروني. تُستخدم هذه المعلومات
              لتحسين الخدمات والتواصل مع المستخدمين.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. استخدام البيانات</h2>
            <p className="text-gray-700 leading-relaxed">
              تُستخدم البيانات لتحليل احتياجات المستخدمين، وإرسال التحديثات،
              وتحسين تجربة المنصة. لا نقوم ببيع أو مشاركة البيانات الشخصية مع
              أطراف ثالثة إلا عند حصول موافقة صريحة أو في الحالات المطلوبة
              قانونيًا.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              3. ملفات تعريف الارتباط (Cookies)
            </h2>
            <p className="text-gray-700 leading-relaxed">
              نستخدم ملفات تعريف الارتباط لتحسين أداء الموقع وتحليل الاستخدام.
              يمكنك تعطيل خاصية حفظ الكوكيز من إعدادات المتصفح، لكن ذلك قد يؤثر
              على وظائف معينة من المنصة.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. أمن المعلومات</h2>
            <p className="text-gray-700 leading-relaxed">
              نتخذ إجراءات تقنية وإدارية لحماية معلوماتك من الوصول غير المصرح به
              أو السرقة. ومع ذلك، لا يمكن ضمان الأمن بنسبة 100%، لذا ننصحك
              باتخاذ الاحتياطات الشخصية عند مشاركة أي بيانات.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. حقوق المستخدم</h2>
            <p className="text-gray-700 leading-relaxed">
              يحق لك الوصول إلى بياناتك الفردية وتصحيحها أو طلب حذفها في أي وقت.
              يرجى التواصل معنا عبر نموذج “التواصل معنا” لإرسال طلباتك.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. التحديثات</h2>
            <p className="text-gray-700 leading-relaxed">
              قد نقوم بتحديث هذه السياسة من وقت لآخر. سنعلن عن أي تغيير بواسطة
              نشر النسخة الجديدة على الموقع، وتصبح سارية فور نشرها.
            </p>
          </section>

          <div className="card-actions justify-end">
            <a href="/" className="btn btn-outline">
              ← العودة إلى الصفحة الرئيسية
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
