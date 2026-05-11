type InvestorFiltersPanelProps = {
  search: string;
  investorType: string;
  discoverability: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onInvestorTypeChange: (value: string) => void;
  onDiscoverabilityChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

export default function InvestorFiltersPanel({
  search,
  investorType,
  discoverability,
  sortBy,
  onSearchChange,
  onInvestorTypeChange,
  onDiscoverabilityChange,
  onSortChange,
}: InvestorFiltersPanelProps) {
  return (
    <section className="entrepreneur-toolbar entrepreneur-investors-toolbar">
      <div className="entrepreneur-toolbar__search">
        <label htmlFor="investor-search">البحث</label>
        <input
          id="investor-search"
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ابحث باسم المستثمر أو الجهة أو النبذة"
        />
      </div>

      <div className="entrepreneur-toolbar__filters">
        <div>
          <label htmlFor="investor-type-filter">نوع المستثمر</label>
          <select
            id="investor-type-filter"
            value={investorType}
            onChange={(event) => onInvestorTypeChange(event.target.value)}
          >
            <option value="all">الكل</option>
            <option value="angel">ملاك</option>
            <option value="individual">فردي</option>
            <option value="institution">مؤسسة</option>
            <option value="incubator">حاضنة</option>
            <option value="accelerator">مسرعة</option>
          </select>
        </div>

        <div>
          <label htmlFor="discoverability-filter">قابلية الظهور</label>
          <select
            id="discoverability-filter"
            value={discoverability}
            onChange={(event) => onDiscoverabilityChange(event.target.value)}
          >
            <option value="all">الكل</option>
            <option value="discoverable">القابلون للاكتشاف</option>
            <option value="hidden">غير القابلين للاكتشاف</option>
          </select>
        </div>

        <div>
          <label htmlFor="investor-sort-filter">الترتيب</label>
          <select
            id="investor-sort-filter"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <option value="best_match">الأعلى ملاءمة</option>
            <option value="discoverable_first">القابلون للاكتشاف أولًا</option>
            <option value="name">الاسم</option>
          </select>
        </div>
      </div>
    </section>
  );
}