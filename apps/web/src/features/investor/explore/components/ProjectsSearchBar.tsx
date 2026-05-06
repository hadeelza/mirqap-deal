interface ProjectsSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
  }
  
  export default function ProjectsSearchBar({
    value,
    onChange,
    onClear,
  }: ProjectsSearchBarProps) {
    return (
      <section className="investor-explore-search">
        <div className="investor-explore-search__field">
          <label htmlFor="explore-projects-search">ابحث عن مشروع</label>
          <div className="investor-explore-search__input-wrap">
            <input
              id="explore-projects-search"
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="ابحث بالعنوان أو الشركة أو القطاع أو التقنية"
            />
  
            {value ? (
              <button
                type="button"
                className="investor-explore-search__clear"
                onClick={onClear}
              >
                مسح
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }