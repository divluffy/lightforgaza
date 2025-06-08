import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

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

type SearchParams = { search?: string; sort?: string; type?: string };
type CampaignWithOwner = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
  campaignType: string;
  owner: { name: string | null; email: string };
};

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search, sort, type } = await searchParams;

  // بناء الاستعلام
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (type) params.set("type", type);
  if (sort) params.set("sort", sort);
  const queryString = params.toString();
  const path = queryString ? `/api/campaigns?${queryString}` : `/api/campaigns`;

  // جلب الهيدرز لبناء الـ baseUrl
  const hdrs = await headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host") ?? "";
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
  if (!res.ok) return notFound();

  const { campaigns }: { campaigns: CampaignWithOwner[] } = await res.json();

  return (
    <div className="container mx-auto p-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">جميع الحملات</h1>

      {/* === بحث + فلترة === */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        {/* -- نموذج البحث (يبقى ظاهر دائماً) -- */}
        <form className="flex items-center gap-2 w-full sm:w-auto" method="GET">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="ابحث بعنوان الحملة..."
            className="input input-bordered flex-1"
          />
          <button type="submit" className="btn btn-primary">
            بحث
          </button>
        </form>

        {/* -- الفلترة للجوال: تظهر على الشاشات الصغيرة فقط -- */}
        <form className="flex items-center gap-2 w-full sm:hidden" method="GET">
          <input type="hidden" name="search" value={search || ""} />
          <select
            name="type"
            defaultValue={type || ""}
            className="select select-bordered flex-1"
          >
            {campaignTypes.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={sort || "newest"}
            className="select select-bordered flex-1"
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

        {/* -- الفلترة للعرض العادي: تظهر على الشاشات ≥640px -- */}
        <form className="hidden sm:flex items-center gap-2" method="GET">
          <input type="hidden" name="search" value={search || ""} />
          {/* نخفي الليبل على الموبايل باستخدام hidden sm:block */}
          <label className="hidden sm:block label-text">النوع:</label>
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

          <label className="hidden sm:block label-text">ترتيب:</label>
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

      {/* === عرض النتائج === */}
      {campaigns.length === 0 ? (
        <div className="w-full h-40 flex items-center justify-center">
          <p className="text-gray-400">
            {type ? `لا توجد حملات من نوع "${type}".` : "لا توجد حملات حالياً."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <Link
              href={`/campaigns/${camp.id}`}
              key={camp.id}
              className="card hover:shadow-lg transition-shadow bg-base-100 shadow"
            >
              <div className="card-body">
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
                  <p className="text-sm text-gray-500">
                    النوع:{" "}
                    <span className="font-medium">{camp.campaignType}</span>
                  </p>
                  <div>
                    <div className="text-sm mb-1">
                      {camp.currentAmount} USD من هدف {camp.goalAmount} USD
                    </div>
                    <progress
                      className="progress progress-primary w-full"
                      value={camp.currentAmount}
                      max={camp.goalAmount}
                    />
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
