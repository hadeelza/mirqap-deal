export function Placeholder() { return null; }
import InterestedProjectCard, { type InterestedProjectItem } from "./InterestedProjectCard";

type InterestedProjectsListProps = {
  items: InterestedProjectItem[];
  removingId: string | null;
  onRemove: (interestId: string) => void;
};

export default function InterestedProjectsList({
  items,
  removingId,
  onRemove,
}: InterestedProjectsListProps) {
  return (
    <div className="interests-grid">
      {items.map((item) => (
        <InterestedProjectCard
          key={item.interestId}
          item={item}
          removingId={removingId}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}