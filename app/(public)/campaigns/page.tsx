// app/campaigns/page.tsx

import { PrismaClient, Campaign } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useSearchParams } from "next/navigation";

// نُعرّف قائمة أنواع الحملة كما في صفحة الإنشاء
const campaignTypes = [
  { label: "جميع الأنواع", value: "" },
  { label: "Family", value: "Family" },
  { label: "Community", value: "Community" },
  { label: "Education", value: "Education" },
  { label: "Emergencies", value: "Emergencies" },
  { label: "Events", value: "Events" },
  { label: "Medical", value: "Medical" },
  { label: "Volunteer", value: "Volunteer" },
  { label: "Other", value: "Other" },
];

const prisma = new PrismaClient();

type CampaignWithOwner = Campaign & {
  owner: { name: string | null; email: string };
};

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: { search?: string; sort?: string; type?: string };
}) {
  const { search, sort, type } = searchParams;

  // بناء شرط الـ where بناءً على قيمة البحث والنوع
  let whereClause: any = {};
  if (search) {
    whereClause.title = { contains: search, mode: "insensitive" };
  }
  if (type) {
    whereClause.campaignType = type;
  }

  // بناء ترتيب النتائج بناءً على قيمة الفرز
  let orderByClause: any = { createdAt: "desc" }; // الافتراضي: الأحدث أولاً
  switch (sort) {
    case "oldest":
      orderByClause = { createdAt: "asc" };
      break;
    case "mostDonations":
      orderByClause = { currentAmount: "desc" };
      break;
    case "leastDonations":
      orderByClause = { currentAmount: "asc" };
      break;
    case "newest":
    default:
      orderByClause = { createdAt: "desc" };
  }

  // جلب الحملات من قاعدة البيانات حسب الشروط والفرز
  const campaigns: CampaignWithOwner[] = await prisma.campaign.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      owner: {
        select: { name: true, email: true },
      },
    },
  });

  if (!campaigns) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">جميع الحملات</h1>

      {/* صندوق البحث والفرز والفلترة بحسب النوع */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        {/* فلترة البحث بالكلمة المفتاحية */}
        <form className="flex items-center gap-2" method="GET">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="ابحث بعنوان الحملة..."
            className="input input-bordered"
          />
          <button type="submit" className="btn btn-primary">
            بحث
          </button>
        </form>

        {/* فلترة النوع وفلترة الفرز */}
        <form className="flex items-center gap-2" method="GET">
          {/* نحتفظ بقيمة البحث في مخفي حتى لا نخسرها عند تغيير الفلترة */}
          <input type="hidden" name="search" value={search || ""} />

          {/* اختيار نوع الحملة */}
          <label className="label-text">النوع:</label>
          <select
            name="type"
            defaultValue={type || ""}
            className="select select-bordered"
          >
            {campaignTypes.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>

          {/* ترتيب النتائج */}
          <label className="label-text">ترتيب:</label>
          <select
            name="sort"
            defaultValue={sort || "newest"}
            className="select select-bordered"
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="oldest">الأقدم أولاً</option>
            <option value="mostDonations">الأكثر دعمًا</option>
            <option value="leastDonations">الأقل دعمًا</option>
          </select>

          <button type="submit" className="btn btn-outline">
            تطبيق
          </button>
        </form>
      </div>

      {/* إذا لا توجد حملات بعد */}
      {campaigns.length === 0 ? (
        <p className="text-gray-600">
          {type ? `لا توجد حملات من نوع "${type}".` : "لا توجد حملات حالياً."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <Link
              href={`/campaigns/${camp.id}`}
              key={camp.id}
              className="card hover:shadow-lg transition-shadow bg-base-100 shadow"
            >
              <div className="card-body">
                {/* نستعرض الصورة كصورة غلاف صغيرة */}
                <img
                  src={camp.imageUrl}
                  alt="Cover"
                  className="h-40 w-full object-cover rounded-lg mb-2"
                />

                <h2 className="card-title line-clamp-2">{camp.title}</h2>
                <p className="text-gray-600 line-clamp-3">
                  {camp.description
                    .replace(/<[^>]+>/g, "")
                    .substring(0, 80)
                    .trim()}
                  ...
                </p>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    أنشأها:{" "}
                    <span className="font-medium">
                      {camp.owner.name || camp.owner.email}
                    </span>
                  </p>

                  {/* نوع الحملة */}
                  <p className="text-sm text-gray-500">
                    النوع:{" "}
                    <span className="font-medium">{camp.campaignType}</span>
                  </p>

                  {/* نسبة التقدم */}
                  <div>
                    <div className="text-sm mb-1">
                      {camp.currentAmount} USD من هدف {camp.goalAmount} USD
                    </div>
                    <progress
                      className="progress progress-primary w-full"
                      value={camp.currentAmount}
                      max={camp.goalAmount}
                    ></progress>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
