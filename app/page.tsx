"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import React from "react";

// Variants موحّد للحركة: صحو صعوداً مع تلاشي
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

// بيانات الحركات (الحملات) لتجنب التكرار
const featuredCampaigns = [
  {
    id: 1,
    title: "حملة دعم الأسر الفقيرة",
    description:
      "جمع التبرعات لدعم الأسر التي تعاني من الفقر في غزة وتوفير المواد الغذائية الأساسية.",
    raised: 4500,
    goal: 10000,
    thumbnail:
      "https://images.gofundme.com/q1UN5SoyPp3cIvyceQwvtCalaRM=/720x405/https://d2g8igdw686xgo.cloudfront.net/90503781_1745377295449134_r.png",
  },
  {
    id: 2,
    title: "حملة تجهيز المدارس",
    description:
      "دعم المدارس المتضررة في غزة بتوفير الأدوات المدرسية اللازمة للطلاب.",
    raised: 7000,
    goal: 15000,
    thumbnail:
      "https://images.gofundme.com/dJonD5Tuc1Nla_L8OJjekBQEsns=/720x405/https://d2g8igdw686xgo.cloudfront.net/90876389_174672033154038_r.jpg",
  },
  {
    id: 3,
    title: "حملة الرعاية الصحية",
    description:
      "تمويل العمليات الجراحية وتوفير الأدوية للمحتاجين في المستشفيات بغزة.",
    raised: 2000,
    goal: 5000,
    thumbnail:
      "https://images.gofundme.com/BmCjuo_8Aln_kDft62cY6bC0C7M=/720x405/https://d2g8igdw686xgo.cloudfront.net/82951687_1745175493238567_r.jpeg",
  },
  {
    id: 4,
    title: "حملة إعادة بناء المنازل",
    description:
      "دعم العائلات التي فقدت منازلها نتيجة القصف وإعادة تأهيل مساكنهم.",
    raised: 8000,
    goal: 20000,
    thumbnail:
      "https://images.gofundme.com/MEaSLyJzUpur4X4xNarEIf_Kuy0=/720x405/https://d2g8igdw686xgo.cloudfront.net/85072821_1736970049861298_r.jpeg",
  },
  {
    id: 5,
    title: "حملة دعم الأيتام",
    description: "جمع تبرعات لتقديم معونات مالية وغذائية لأطفال أيتام غزة.",
    raised: 3000,
    goal: 7000,
    thumbnail:
      "https://images.gofundme.com/dqfQcx3gGkRCAQ6a-0TqgjO-c6c=/720x405/https://d2g8igdw686xgo.cloudfront.net/80464543_1717549763192523_r.jpeg",
  },
  {
    id: 6,
    title: "حملة إحلال الآبار",
    description:
      "تمويل وتنظيف الآبار لضمان وصول الأهالي لمياه نظيفة وصالحة للشرب.",
    raised: 1200,
    goal: 5000,
    thumbnail:
      "https://images.gofundme.com/-BKcGGigZMnRPpX6LFCMYP6z3vA=/720x405/https://d2g8igdw686xgo.cloudfront.net/77255719_1705781230748957_r.jpeg",
  },
];

// بيانات المتبرعين (أعلى المتبرعين وأحدث المتبرعين)
const topDonors = [
  {
    name: "أحمد محمد",
    amount: 500,
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAI4UCINIxZx5nsaBtv_qDcvkU3lkGKDyyAg&s",
  },
  {
    name: "سارة علي",
    amount: 450,
    avatar:
      "https://www.shutterstock.com/image-photo/positive-handsome-arabic-businessman-beard-600nw-2510267591.jpg",
  },
  {
    name: "محمد خالد",
    amount: 400,
    avatar:
      "https://thumbs.dreamstime.com/b/hijab-profile-mockup-woman-studio-islamic-fashion-arabic-culture-modest-clothes-raya-eid-mubarak-hijab-profile-336140301.jpg",
  },
  {
    name: "ليلى حسن",
    amount: 350,
    avatar:
      "https://www.yourtango.com/sites/default/files/image_blog/psychologically-healthy-person.png",
  },
  {
    name: "علي محمود",
    amount: 300,
    avatar:
      "https://www.jamsadr.com/images/neutrals/person-donald-900x1080.jpg",
  },
  {
    name: "مها يوسف",
    amount: 250,
    avatar:
      "https://thumbs.dreamstime.com/b/beautiful-arab-saudi-woman-face-posing-beach-sea-background-43965570.jpg",
  },
];
const recentDonors = [
  {
    name: "يوسف سعيد",
    amount: 50,
    avatar:
      "https://www.youngminds.org.uk/media/3bljel4m/young-person-smiling-with-their-friends.png?quality=55",
  },
  {
    name: "ريما أحمد",
    amount: 45,
    avatar:
      "https://www.georgetown.edu/wp-content/uploads/2022/02/Jkramerheadshot-scaled-e1645036825432-1050x1050-c-default.jpg",
  },
  {
    name: "كريم فؤاد",
    amount: 40,
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR19aUjtXfsvpsjkBgmusLdnZfYQ1mtiLi_VQ&s",
  },
  {
    name: "نهى حسنين",
    amount: 35,
    avatar:
      "https://victoryfund.org/wp-content/uploads/2017/01/Leigh-Finke-1024x576.png",
  },
  {
    name: "سلمان عيسى",
    amount: 30,
    avatar: "https://cdn.nba.com/headshots/nba/latest/1040x760/445.png",
  },
  {
    name: "مريم خالد",
    amount: 25,
    avatar:
      "https://cdn2.psychologytoday.com/assets/styles/manual_crop_4_3_1200x900/public/field_blog_entry_images/2018-09/shutterstock_648907024.jpg?itok=eaVcXTz5",
  },
];

export default function PublicHome() {
  const t = useTranslations();
  const locale = useLocale(); // يستخرج اللغة الحالية (مثلا "ar" أو "en")
  const dir = locale === "ar" ? "rtl" : "ltr"; // إذا كانت "ar" اعتبرها RTL، وإلا LTR
  const isRTL = dir === "rtl";

  // لتحكم ديناميكي بمحاذاة النصوص والأزرار

  const sectionRowClass = isRTL ? "lg:flex-row-reverse" : "lg:flex-row";

  return (
    // نضع dir على العنصر الجذري لضبط اتجاه الكتابة
    <div dir={dir} className={`flex flex-col text-start`}>
      {/* =========== قسم الهيرو (Hero) =========== */}
      <section
        className="relative bg-cover bg-center group"
        style={{
          backgroundImage:
            "url('https://firebasestorage.googleapis.com/v0/b/ultra-gizmo.firebasestorage.app/o/gaza%2Fassets%2F2.png?alt=media&token=312e933d-6c37-4166-a407-da26e9e5c8a5')",
        }}
      >
        {/* طبقة تدرج داكنة */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70 transition-all duration-300 group-hover:from-black/30 group-hover:to-black/30"></div>

        <div
          className={`container relative z-10 mx-auto px-6 py-20 flex items-center justify-start h-screen`}
        >
          <motion.div
            className={`w-full lg:w-1/2 space-y-6 text-start text-white`}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold">
              {t("navbar.key.lightForGaza")}
            </h1>
            <p className="text-lg lg:text-xl text-gray-200 leading-relaxed">
              منصة شاملة لدعم أهلنا في غزة عبر حملات خيرية موثوقة وتبرعات مباشرة
              بشفافية كاملة. معًا نبني مستقبل أفضل ونصنع الفرق.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/campaigns"
                className="btn btn-primary btn-lg transition-transform duration-300 ease-in-out hover:scale-105"
              >
                عرض الحملات
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========== قسم “من نحن” =========== */}
      <section className="relative group">
        {/* خلفية من الصورة */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://firebasestorage.googleapis.com/v0/b/ultra-gizmo.firebasestorage.app/o/gaza%2Fassets%2F77.png?alt=media&token=b2b7a691-340a-4845-bbff-56b160b8692f')",
          }}
        ></div>
        {/* طبقة تدرج معاكس */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-transparent to-black/70 transition-all duration-300 group-hover:from-black/30 group-hover:to-black/30"></div>

        <div
          className={`container relative z-10 mx-auto px-6 py-20 flex flex-col-reverse ${sectionRowClass} items-center`}
        >
          <motion.div
            className={`w-full lg:w-1/2 text-start text-white space-y-6`}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold">من نحن</h2>
            <p className="text-gray-200 leading-relaxed">
              نحن فريق متكامل نؤمن بقوة التضامن مع أهلنا في غزة. هدفنا هو تقديم
              منصة آمنة وموثوقة لإطلاق الحملات الخيرية وجمع التبرعات بشفافية
              كاملة. نضمن لك تتبع الأموال وتوزيعها مباشرةً حيث الحاجة أكبر.
            </p>
            <p className="text-gray-200 leading-relaxed">
              انضم إلينا اليوم وأطلق حملتك أو شارك بتبرع بسيط؛ فكل مساهمة هي
              خطوة نحو تطوير حياة الناس وتقديم الأمل. نحن هنا لدعمك طول الطريق
              وضمان وصول دعمك إلى مستحقيه دون أي تعقيدات.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =========== قسم “ما نقدّم” =========== */}
      <section className="bg-base-200">
        <div className="container mx-auto px-6 py-16">
          <motion.h2
            className="text-3xl lg:text-4xl font-bold text-center mb-12"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            ما نقدّم
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m4-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ), // أيقونة حملة
                title: "إنشاء الحملات",
                description:
                  "أطلق حملتك الخيرية الخاصة لدعم أهل غزة وتابعها بسهولة تامة مع تقارير دورية وشفافية كاملة.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 1.343-3 3v4h6v-4c0-1.657-1.343-3-3-3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 20h12v-2H6v2z"
                    />
                  </svg>
                ), // أيقونة الدفع
                title: "التبرع بعدة طرق",
                description:
                  "اختر الطريقة الأنسب لك: بطاقات إلكترونية، دفع بالعملات الرقمية، أو أي وسيلة أخرى. ندعم جميع الخيارات لتسهيل مساهمتك.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ), // أيقونة دعم مباشر
                title: "الدعم المباشر",
                description:
                  "قدم تبرعاتك مباشرةً للمشاريع الإنسانية في غزة، وشاهد أثر مساهمتك ينعكس فورًا على أرض الواقع.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8V4m0 0a4 4 0 110 8m0-8v4m0 4v4m0 0a4 4 0 110-8m0 8v-4"
                    />
                  </svg>
                ), // أيقونة سحب الأموال
                title: "سحب الأموال",
                description:
                  "نضمن سحب أموال الحملات بشكل منتظم لتوفير استمرارية الدعم وعدم تأخير المساعدات في الوقت المناسب.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow transition-transform duration-300 ease-in-out hover:scale-105"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              >
                <div className="card-body text-center space-y-4">
                  <div>{item.icon}</div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========== قسم “الحملات المميزة” =========== */}
      <section className="bg-base-100">
        <div className="container mx-auto px-6 py-16">
          <motion.h2
            className="text-3xl lg:text-4xl font-bold text-center mb-12"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            حملات مميزة
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign, idx) => (
              <motion.div
                key={campaign.id}
                className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow transition-transform duration-300 ease-in-out hover:scale-105"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              >
                <figure>
                  <img
                    src={campaign.thumbnail}
                    alt={campaign.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </figure>
                <div className="card-body">
                  <h3 className="card-title">{campaign.title}</h3>
                  <p className="text-gray-600 line-clamp-3">
                    {campaign.description}
                  </p>
                  <div className="mt-4">
                    <progress
                      className="progress progress-primary w-full"
                      value={campaign.raised}
                      max={campaign.goal}
                    ></progress>
                    <p className="mt-2 text-sm text-gray-500">
                      {campaign.raised} USD من {campaign.goal} USD
                    </p>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="btn btn-primary btn-sm transition-transform duration-300 ease-in-out hover:scale-105"
                    >
                      عرض المزيد
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========== قسم “أعلى وأحدث المتبرعين” =========== */}
      <section className="bg-base-200">
        <div className="container mx-auto px-6 py-16">
          {/* أعلى المتبرعين */}
          <div className="mb-12">
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-center mb-8"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8 }}
            >
              أعلى المتبرعين
            </motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {topDonors.map((donor, idx) => (
                <motion.div
                  key={idx}
                  className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow transition-transform duration-300 ease-in-out hover:scale-105 text-center p-4"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                >
                  <div className="avatar mx-auto mb-2">
                    <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                      <img src={donor.avatar} alt={donor.name} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">{donor.name}</h3>
                  <p className="text-gray-600 text-sm">
                    تبرّع بـ {donor.amount} USD
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* أحدث المتبرعين */}
          <div>
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-center mb-8"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8 }}
            >
              أحدث المتبرعين
            </motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {recentDonors.map((donor, idx) => (
                <motion.div
                  key={idx}
                  className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow transition-transform duration-300 ease-in-out hover:scale-105 text-center p-4"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                >
                  <div className="avatar mx-auto mb-2">
                    <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                      <img src={donor.avatar} alt={donor.name} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">{donor.name}</h3>
                  <p className="text-gray-600 text-sm">
                    تبرّع بـ {donor.amount} USD
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========== قسم الدعوة للمشاركة (Call to Action) =========== */}
      <section
        className="relative bg-base-100"
        style={{
          backgroundImage:
            "url('https://firebasestorage.googleapis.com/v0/b/ultra-gizmo.firebasestorage.app/o/gaza%2Fassets%2FChatGPT%20Image%20Jun%205%2C%202025%2C%2011_59_36%20AM.png?alt=media&token=7dc45e58-f87f-4ef9-8920-258d1f9bc666')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="container mx-auto px-6 py-16 text-center space-y-6">
          <motion.h2
            className="text-3xl lg:text-4xl font-bold"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            كن جزءًا من التغيير
          </motion.h2>
          <motion.p
            className="text-gray-200 max-w-2xl mx-auto leading-relaxed"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            انضم اليوم إلى LightForGaza وأطلق حملتك الخاصة أو ساهم في دعم واحدة
            من حملاتنا الموثوقة. نضمن لك الشفافية الكاملة وتتبع التبرعات، مما
            يكسبك ثقة تامة ويضمن وصول دعمك إلى من هم بأمسّ الحاجة.
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              href="/auth/register"
              className="btn btn-primary btn-lg transition-transform duration-300 ease-in-out hover:scale-105"
            >
              انضم الآن
            </Link>
            <Link
              href="/donate"
              className="btn btn-secondary btn-lg transition-transform duration-300 ease-in-out hover:scale-105"
            >
              تبرع الآن
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
