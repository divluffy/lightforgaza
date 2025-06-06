// app/terms/page.tsx
import React from "react";

export default function TermsPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="card bg-base-100 shadow-lg max-w-3xl mx-auto">
        <div className="card-body space-y-6">
          <h1 className="text-3xl font-bold mb-4">الشروط والأحكام</h1>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. المقدمة</h2>
            <p className="text-gray-700 leading-relaxed">
              تُبيّن هذه الشروط والأحكام أحكام استخدام منصة LightForGaza. باستخدامك
              للموقع، فإنك توافق على الالتزام بهذه الشروط وكل الضوابط المنبثقة عنها.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. استخدام المنصة</h2>
            <p className="text-gray-700 leading-relaxed">
              يُمنع نشر محتوى مخالف للقوانين، أو استخدام المنصة لأغراض غير قانونية. يجب
              على الجميع احترام حقوق الآخرين والالتزام بقواعد السلوك.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. تعريفات الحساب</h2>
            <p className="text-gray-700 leading-relaxed">
              عند إنشاء حساب، يجب تقديم بيانات صحيحة وحقيقية. المستخدم مسؤول عن الحفاظ
              على سرية كلمة المرور وتحمّل أي نشاط غير مصرح به من خلال حسابه.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. حقوق الملكية الفكرية</h2>
            <p className="text-gray-700 leading-relaxed">
              جميع الحقوق محفوظة لـ LightForGaza. لا يُسمح بنسخ أو إعادة توزيع أيّ محتوى
              بدون إذن صريح من الإدارة.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. الإنهاء</h2>
            <p className="text-gray-700 leading-relaxed">
              يحق لإدارة المنصة تعليق أو إلغاء حساب المستخدم في حال مخالفة هذه الشروط أو
              نشر محتوى غير لائق.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. تحديث الشروط</h2>
            <p className="text-gray-700 leading-relaxed">
              تحتفظ إدارة LightForGaza بالحق في تعديل هذه الشروط في أيّ وقت. سيتم الإعلان عن
              أيّ تحديث عبر الموقع، ويصبح السريان فور نشره.
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
